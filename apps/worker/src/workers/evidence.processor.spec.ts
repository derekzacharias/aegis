import { EvidenceProcessor } from './evidence.processor';
import { createJobQueue, EvidenceIngestionJobPayload } from '@compliance/shared';
import {
  EvidenceIngestionStatus,
  EvidenceScanStatus,
  EvidenceStatus
} from '@prisma/client';
import { Readable } from 'stream';
import { AntivirusUnavailableError } from '../antivirus/antivirus.errors';

describe('EvidenceProcessor', () => {
  const prismaMock: any = {
    evidenceItem: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    evidenceScan: {
      update: jest.fn()
    },
    evidenceStatusHistory: {
      create: jest.fn(),
      findFirst: jest.fn()
    },
    organizationSettings: {
      findUnique: jest.fn()
    }
  };

  const fetcherMock: any = {
    fetch: jest.fn()
  };

  const antivirusMock: any = {
    scan: jest.fn()
  };

  const notificationsMock: any = {
    notifyEvidence: jest.fn()
  };

  const metricsMock: any = {
    incrementCounter: jest.fn(),
    recordDuration: jest.fn()
  };

  const defaultConfigImpl = (key: string) => {
    switch (key) {
      case 'antivirus.engineName':
        return 'ClamAV';
      case 'antivirus.enabled':
        return true;
      case 'antivirus.quarantineOnError':
        return true;
      case 'antivirus.autoReleaseStrategy':
        return 'pending';
      default:
        return undefined;
    }
  };

  const configMock: any = {
    get: jest.fn(defaultConfigImpl)
  };

  const queue = createJobQueue();

  let processor: EvidenceProcessor;

  const buildJob = (payload: EvidenceIngestionJobPayload) => ({
    id: 'job-1',
    name: 'evidence.ingest',
    payload,
    status: 'queued',
    enqueuedAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null
  });

  const invoke = async (payload: EvidenceIngestionJobPayload) =>
    (processor as unknown as { handle: (job: ReturnType<typeof buildJob>) => Promise<{ quarantined: boolean }> }).handle(
      buildJob(payload)
    );

  beforeEach(() => {
    jest.clearAllMocks();
    configMock.get.mockImplementation(defaultConfigImpl);
    prismaMock.evidenceStatusHistory.findFirst.mockResolvedValue(null);
    prismaMock.organizationSettings.findUnique.mockResolvedValue(null);
    queue.reset();
    processor = new EvidenceProcessor(
      prismaMock,
      fetcherMock,
      antivirusMock,
      notificationsMock,
      metricsMock,
      configMock,
      queue
    );

    prismaMock.evidenceItem.findUnique.mockResolvedValue({
      id: 'evidence-1',
      status: EvidenceStatus.PENDING,
      organizationId: 'org-1',
      fileSize: 2048,
      originalFilename: 'artifact.pdf'
    });

    fetcherMock.fetch.mockResolvedValue({
      stream: Readable.from(['dummy']),
      size: 2048,
      cleanup: jest.fn().mockResolvedValue(undefined)
    });
  });

  it('marks evidence clean and updates ingestion metadata', async () => {
    antivirusMock.scan.mockResolvedValue({
      status: EvidenceScanStatus.CLEAN,
      durationMs: 1250,
      bytesScanned: 2048,
      engineVersion: 'ClamAV 1.0',
      signatureVersion: '27123',
      notes: 'Scan completed successfully',
      findings: { engine: 'ClamAV' },
      signature: null
    });

    const result = await invoke({
      evidenceId: 'evidence-1',
      scanId: 'scan-1',
      storageUri: 'file:///tmp/evidence/artifact.pdf',
      storageKey: 'artifact.pdf',
      storageProvider: 'LOCAL',
      checksum: 'sha256:1234',
      requestedBy: 'analyst@example.com'
    });

    expect(result.quarantined).toBe(false);
    expect(prismaMock.evidenceScan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'scan-1' },
        data: expect.objectContaining({ status: EvidenceScanStatus.CLEAN })
      })
    );
    expect(prismaMock.evidenceItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evidence-1' },
        data: expect.objectContaining({
          ingestionStatus: EvidenceIngestionStatus.COMPLETED,
          lastScanStatus: EvidenceScanStatus.CLEAN
        })
      })
    );
    expect(notificationsMock.notifyEvidence).not.toHaveBeenCalled();
  });

  it('quarantines evidence when malware is detected', async () => {
    antivirusMock.scan.mockResolvedValue({
      status: EvidenceScanStatus.INFECTED,
      durationMs: 980,
      bytesScanned: 2048,
      engineVersion: 'ClamAV 1.0',
      signatureVersion: '27123',
      notes: 'Detected EICAR-Test-Signature',
      findings: { signature: 'EICAR-Test-Signature' },
      signature: 'EICAR-Test-Signature'
    });

    prismaMock.evidenceStatusHistory.create.mockResolvedValue(undefined);

    const result = await invoke({
      evidenceId: 'evidence-1',
      scanId: 'scan-2',
      storageUri: 'file:///tmp/evidence/malware.pdf',
      storageKey: 'malware.pdf',
      storageProvider: 'LOCAL',
      checksum: 'sha256:malware'
    });

    expect(result.quarantined).toBe(true);
    expect(prismaMock.evidenceItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: EvidenceStatus.QUARANTINED,
          ingestionStatus: EvidenceIngestionStatus.QUARANTINED
        })
      })
    );
    expect(prismaMock.evidenceStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          evidenceId: 'evidence-1',
          toStatus: EvidenceStatus.QUARANTINED
        })
      })
    );
    expect(notificationsMock.notifyEvidence).toHaveBeenCalledWith(
      expect.objectContaining({
        evidenceId: 'evidence-1',
        status: 'quarantined',
        reason: 'Detected EICAR-Test-Signature'
      })
    );
  });

  it('auto-releases quarantined evidence to pending when configured', async () => {
    prismaMock.organizationSettings.findUnique.mockResolvedValue({
      antivirusAutoReleaseStrategy: 'pending'
    });

    prismaMock.evidenceItem.findUnique.mockResolvedValueOnce({
      id: 'evidence-4',
      status: EvidenceStatus.QUARANTINED,
      organizationId: 'org-2',
      fileSize: 1024,
      originalFilename: 'artifact.pdf'
    });

    antivirusMock.scan.mockResolvedValue({
      status: EvidenceScanStatus.CLEAN,
      durationMs: 700,
      bytesScanned: 1024,
      engineVersion: 'ClamAV 1.0',
      signatureVersion: '27123',
      notes: 'Clean re-scan',
      findings: {}
    });

    prismaMock.evidenceStatusHistory.create.mockResolvedValue(undefined);

    await invoke({
      evidenceId: 'evidence-4',
      scanId: 'scan-clean-pending',
      storageUri: 'file:///tmp/evidence/artifact.pdf',
      storageKey: 'artifact.pdf',
      storageProvider: 'LOCAL'
    });

    expect(prismaMock.evidenceStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          toStatus: EvidenceStatus.PENDING
        })
      })
    );
    expect(prismaMock.evidenceItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: EvidenceStatus.PENDING,
          nextAction: expect.stringContaining('Auto-released')
        })
      })
    );
    expect(notificationsMock.notifyEvidence).toHaveBeenCalledWith(
      expect.objectContaining({
        evidenceId: 'evidence-4',
        status: 'released'
      })
    );
    expect(metricsMock.incrementCounter).toHaveBeenCalledWith(
      expect.stringContaining('auto_released'),
      1,
      expect.objectContaining({ strategy: 'pending', target: EvidenceStatus.PENDING })
    );
  });

  it('quarantines evidence and records failure when scanner is unavailable', async () => {
    antivirusMock.scan.mockRejectedValue(new AntivirusUnavailableError('Engine offline'));

    const result = await invoke({
      evidenceId: 'evidence-1',
      scanId: 'scan-3',
      storageUri: 's3://bucket/artifact.pdf',
      storageKey: 'artifact.pdf',
      storageProvider: 'S3'
    });

    expect(result.quarantined).toBe(true);
    expect(prismaMock.evidenceScan.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'scan-3' },
        data: expect.objectContaining({
          status: EvidenceScanStatus.FAILED,
          failureReason: 'Engine offline'
        })
      })
    );
    expect(notificationsMock.notifyEvidence).toHaveBeenCalled();
  });
});

  it('keeps quarantined evidence when auto-release strategy is manual', async () => {
    configMock.get.mockImplementation((key: string) => {
      switch (key) {
        case 'antivirus.engineName':
          return 'ClamAV';
        case 'antivirus.enabled':
          return true;
        case 'antivirus.quarantineOnError':
          return true;
        case 'antivirus.autoReleaseStrategy':
          return 'manual';
        default:
          return undefined;
      }
    });

    prismaMock.organizationSettings.findUnique.mockResolvedValue(null);

    processor = new EvidenceProcessor(
      prismaMock,
      fetcherMock,
      antivirusMock,
      notificationsMock,
      metricsMock,
      configMock,
      queue
    );

    metricsMock.incrementCounter.mockClear();

    prismaMock.evidenceItem.findUnique.mockResolvedValue({
      id: 'evidence-2',
      status: EvidenceStatus.QUARANTINED,
      organizationId: 'org-1',
      fileSize: 4096,
      originalFilename: 'artifact.pdf'
    });

    antivirusMock.scan.mockResolvedValue({
      status: EvidenceScanStatus.CLEAN,
      durationMs: 900,
      bytesScanned: 4096,
      engineVersion: 'ClamAV 1.0',
      signatureVersion: '27123',
      notes: 'Re-scan clean',
      findings: {},
      signature: null
    });

    prismaMock.evidenceStatusHistory.findFirst.mockResolvedValue({
      fromStatus: EvidenceStatus.APPROVED
    });

    await invoke({
      evidenceId: 'evidence-2',
      scanId: 'scan-clean',
      storageUri: 'file:///tmp/evidence/artifact.pdf',
      storageKey: 'artifact.pdf',
      storageProvider: 'LOCAL'
    });

    expect(prismaMock.evidenceItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evidence-2' },
        data: expect.not.objectContaining({
          status: expect.anything()
        })
      })
    );
    expect(prismaMock.evidenceStatusHistory.create).not.toHaveBeenCalled();
    expect(notificationsMock.notifyEvidence).not.toHaveBeenCalledWith(
      expect.objectContaining({ evidenceId: 'evidence-2', status: 'released' })
    );
    expect(metricsMock.incrementCounter).not.toHaveBeenCalledWith(
      expect.stringContaining('auto_released'),
      expect.anything(),
      expect.anything()
    );
  });

  it('auto-releases quarantined evidence to previous status when configured', async () => {
    prismaMock.organizationSettings.findUnique.mockResolvedValue({
      antivirusAutoReleaseStrategy: 'previous'
    });

    prismaMock.evidenceItem.findUnique.mockResolvedValue({
      id: 'evidence-3',
      status: EvidenceStatus.QUARANTINED,
      organizationId: 'org-1',
      fileSize: 4096,
      originalFilename: 'artifact.pdf'
    });

    antivirusMock.scan.mockResolvedValue({
      status: EvidenceScanStatus.CLEAN,
      durationMs: 1200,
      bytesScanned: 4096,
      engineVersion: 'ClamAV 1.0',
      signatureVersion: '27123',
      notes: 'Re-scan clean',
      findings: {},
      signature: null
    });

    prismaMock.evidenceStatusHistory.findFirst.mockResolvedValue({
      fromStatus: EvidenceStatus.APPROVED
    });

    prismaMock.evidenceStatusHistory.create.mockResolvedValue(undefined);

    await invoke({
      evidenceId: 'evidence-3',
      scanId: 'scan-clean-2',
      storageUri: 'file:///tmp/evidence/artifact.pdf',
      storageKey: 'artifact.pdf',
      storageProvider: 'LOCAL'
    });

    expect(prismaMock.evidenceItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: EvidenceStatus.APPROVED
        })
      })
    );
    expect(prismaMock.evidenceStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          toStatus: EvidenceStatus.APPROVED
        })
      })
    );
    expect(metricsMock.incrementCounter).toHaveBeenCalledWith(
      expect.stringContaining('auto_released'),
      1,
      expect.objectContaining({
        strategy: 'previous',
        target: EvidenceStatus.APPROVED
      })
    );
    expect(notificationsMock.notifyEvidence).toHaveBeenCalledWith(
      expect.objectContaining({
        evidenceId: 'evidence-3',
        status: 'released'
      })
    );
  });
