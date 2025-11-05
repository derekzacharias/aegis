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
      create: jest.fn()
    },
    user: {
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
    notifyEvidence: jest.fn(),
    isEnabled: jest.fn(() => true)
  };

  const metricsMock: any = {
    incrementCounter: jest.fn(),
    recordDuration: jest.fn()
  };

  const configMock: any = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'antivirus.engineName':
          return 'ClamAV';
        case 'antivirus.enabled':
          return true;
        case 'antivirus.quarantineOnError':
          return true;
        default:
          return undefined;
      }
    })
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
    queue.reset();
    notificationsMock.isEnabled.mockReturnValue(true);
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

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'analyst@example.com',
      firstName: 'Cyra',
      lastName: 'Analyst',
      phoneNumber: '+1 555-0100',
      timezone: 'America/New_York'
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
      requestedByEmail: 'analyst@example.com'
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
        reason: 'Detected EICAR-Test-Signature',
        requestedBy: {
          id: 'user-1',
          email: 'analyst@example.com',
          name: 'Cyra Analyst',
          phoneNumber: '+1 555-0100',
          timezone: 'America/New_York'
        }
      })
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

  it('avoids profile lookups when notifications are disabled', async () => {
    notificationsMock.isEnabled.mockReturnValue(false);
    antivirusMock.scan.mockRejectedValue(new AntivirusUnavailableError('Engine offline'));

    await invoke({
      evidenceId: 'evidence-1',
      scanId: 'scan-4',
      storageUri: 's3://bucket/artifact.pdf',
      storageKey: 'artifact.pdf',
      storageProvider: 'S3',
      requestedByEmail: 'disabled@example.com'
    });

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(notificationsMock.notifyEvidence).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedBy: {
          id: null,
          email: 'disabled@example.com',
          name: null,
          phoneNumber: null,
          timezone: null
        }
      })
    );
  });
});
