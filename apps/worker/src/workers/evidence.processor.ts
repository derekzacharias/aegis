import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EvidenceIngestionJobPayload,
  JobQueue,
  JobRecord,
  jobQueue
} from '@compliance/shared';
import {
  EvidenceIngestionStatus,
  EvidenceScanStatus,
  EvidenceStatus,
  EvidenceStorageProvider,
  Prisma
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ArtifactFetcher } from '../storage/artifact-fetcher';
import {
  AntivirusService,
  AntivirusScanOutcome
} from '../antivirus/antivirus.service';
import {
  AntivirusUnavailableError,
  AntivirusScanFailureError
} from '../antivirus/antivirus.errors';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationService } from '../notifications/notification.service';

const JOB_NAME = 'evidence.ingest';

type EvidenceSummary = {
  id: string;
  status: EvidenceStatus;
  organizationId: string;
  fileSize: number;
  originalFilename: string | null;
};

const METRIC_PREFIX = 'evidence.scan';

@Injectable()
export class EvidenceProcessor {
  private readonly logger = new Logger(EvidenceProcessor.name);
  private readonly queue: JobQueue;
  private readonly engineName: string;
  private readonly enabled: boolean;
  private readonly quarantineOnError: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fetcher: ArtifactFetcher,
    private readonly antivirus: AntivirusService,
    private readonly notifications: NotificationService,
    private readonly metrics: MetricsService,
    private readonly config: ConfigService,
    @Optional() queue?: JobQueue
  ) {
    this.queue = queue ?? jobQueue;
    this.queue.registerProcessor<EvidenceIngestionJobPayload, { quarantined: boolean }>(
      JOB_NAME,
      (job) => this.handle(job)
    );

    this.engineName = this.config.get<string>('antivirus.engineName') ?? 'ClamAV';
    this.enabled = this.config.get<boolean>('antivirus.enabled') ?? true;
    this.quarantineOnError = this.config.get<boolean>('antivirus.quarantineOnError') ?? true;
  }

  private async handle(
    job: JobRecord<EvidenceIngestionJobPayload>
  ): Promise<{ quarantined: boolean }> {
    const { evidenceId, scanId, storageUri, storageKey, storageProvider, checksum, requestedBy } =
      job.payload;

    this.logger.log(
      JSON.stringify({
        event: 'ingestion.start',
        jobId: job.id,
        evidenceId,
        scanId,
        storageUri,
        storageProvider,
        checksum: checksum ?? null
      })
    );

    const record = await this.findEvidence(evidenceId);

    if (!record) {
      this.logger.warn(`Evidence ${evidenceId} not found; marking scan as failed.`);
      await this.prisma.evidenceScan.update({
        where: { id: scanId },
        data: {
          status: EvidenceScanStatus.FAILED,
          failureReason: 'Evidence record not found',
          completedAt: new Date(),
          findings: {
            reason: 'missing_evidence',
            evidenceId
          } as Prisma.JsonObject
        }
      });
      return { quarantined: false };
    }

    await this.prisma.evidenceItem.update({
      where: { id: evidenceId },
      data: {
        ingestionStatus: EvidenceIngestionStatus.PROCESSING,
        ingestionNotes: 'Antivirus scan in progress'
      }
    });

    await this.prisma.evidenceScan.update({
      where: { id: scanId },
      data: {
        status: EvidenceScanStatus.RUNNING,
        startedAt: new Date(),
        failureReason: null,
        findings: null
      }
    });

    this.metrics.incrementCounter(`${METRIC_PREFIX}.started`, 1, {
      engine: this.engineName
    });

    if (!this.enabled) {
      this.logger.log('Antivirus disabled; marking scan as skipped.');
      await this.handleDisabledScan(record, scanId);
      return { quarantined: false };
    }

    try {
      const artifact = await this.fetcher.fetch(
        storageProvider as EvidenceStorageProvider,
        storageKey,
        storageUri
      );

      const outcome = await this.antivirus.scan(artifact, {
        evidenceId,
        scanId,
        checksum,
        originalFilename: record.originalFilename ?? undefined
      });

      this.metrics.recordDuration(`${METRIC_PREFIX}.duration`, outcome.durationMs, {
        status: outcome.status,
        engine: this.engineName
      });

      if (outcome.status === EvidenceScanStatus.INFECTED) {
        this.metrics.incrementCounter(`${METRIC_PREFIX}.quarantined`, 1, {
          engine: this.engineName
        });
        await this.handleInfected(record, scanId, outcome, requestedBy ?? null);
        return { quarantined: true };
      }

      this.metrics.incrementCounter(`${METRIC_PREFIX}.clean`, 1, {
        engine: this.engineName
      });
      await this.handleClean(record, scanId, outcome);
      return { quarantined: false };
    } catch (error) {
      return this.handleFailure(record, scanId, error as Error, requestedBy ?? null);
    }
  }

  private async handleDisabledScan(record: EvidenceSummary, scanId: string): Promise<void> {
    const completedAt = new Date();
    const notes = 'Scan skipped: antivirus disabled in worker configuration';
    await this.prisma.evidenceScan.update({
      where: { id: scanId },
      data: {
        status: EvidenceScanStatus.CLEAN,
        completedAt,
        durationMs: 0,
        bytesScanned: record.fileSize,
        findings: {
          skipped: true,
          reason: 'disabled'
        } as Prisma.JsonObject,
        failureReason: null,
        quarantined: false,
        engineVersion: this.engineName
      }
    });

    await this.prisma.evidenceItem.update({
      where: { id: record.id },
      data: {
        ingestionStatus: EvidenceIngestionStatus.COMPLETED,
        ingestionNotes: notes,
        lastScanStatus: EvidenceScanStatus.CLEAN,
        lastScanAt: completedAt,
        lastScanEngine: this.engineName,
        lastScanNotes: notes,
        lastScanSignatureVersion: null,
        lastScanDurationMs: 0,
        lastScanBytes: record.fileSize
      }
    });
  }

  private async handleClean(
    record: EvidenceSummary,
    scanId: string,
    outcome: AntivirusScanOutcome
  ): Promise<void> {
    const completedAt = new Date();

    await this.prisma.evidenceScan.update({
      where: { id: scanId },
      data: {
        status: EvidenceScanStatus.CLEAN,
        completedAt,
        durationMs: outcome.durationMs,
        bytesScanned: outcome.bytesScanned,
        findings: outcome.findings as Prisma.JsonObject,
        failureReason: null,
        quarantined: false,
        engineVersion: outcome.engineVersion,
        signatureVersion: outcome.signatureVersion
      }
    });

    const updateData: Prisma.EvidenceItemUpdateInput = {
      ingestionStatus: EvidenceIngestionStatus.COMPLETED,
      ingestionNotes: outcome.notes,
      lastScanStatus: EvidenceScanStatus.CLEAN,
      lastScanAt: completedAt,
      lastScanEngine: outcome.engineVersion ?? this.engineName,
      lastScanSignatureVersion: outcome.signatureVersion,
      lastScanNotes: outcome.notes,
      lastScanDurationMs: outcome.durationMs,
      lastScanBytes: outcome.bytesScanned
    };

    if (record.status === EvidenceStatus.QUARANTINED) {
      updateData.status = EvidenceStatus.PENDING;
      updateData.nextAction = 'Awaiting analyst review after clean scan';
      await this.prisma.evidenceStatusHistory.create({
        data: {
          evidenceId: record.id,
          fromStatus: EvidenceStatus.QUARANTINED,
          toStatus: EvidenceStatus.PENDING,
          note: 'Evidence released after clean antivirus scan',
          changedById: null
        }
      });
    }

    await this.prisma.evidenceItem.update({
      where: { id: record.id },
      data: updateData
    });

    this.logger.log(
      JSON.stringify({
        event: 'ingestion.clean',
        evidenceId: record.id,
        scanId,
        notes: outcome.notes
      })
    );
  }

  private async handleInfected(
    record: EvidenceSummary,
    scanId: string,
    outcome: AntivirusScanOutcome,
    requestedBy: string | null
  ): Promise<void> {
    const completedAt = new Date();

    await this.prisma.evidenceScan.update({
      where: { id: scanId },
      data: {
        status: EvidenceScanStatus.INFECTED,
        completedAt,
        durationMs: outcome.durationMs,
        bytesScanned: outcome.bytesScanned,
        findings: outcome.findings as Prisma.JsonObject,
        failureReason: null,
        quarantined: true,
        engineVersion: outcome.engineVersion,
        signatureVersion: outcome.signatureVersion
      }
    });

    await this.prisma.evidenceItem.update({
      where: { id: record.id },
      data: {
        status: EvidenceStatus.QUARANTINED,
        ingestionStatus: EvidenceIngestionStatus.QUARANTINED,
        ingestionNotes: outcome.notes,
        nextAction: 'Investigate quarantine findings',
        lastScanStatus: EvidenceScanStatus.INFECTED,
        lastScanAt: completedAt,
        lastScanEngine: outcome.engineVersion ?? this.engineName,
        lastScanSignatureVersion: outcome.signatureVersion,
        lastScanNotes: outcome.notes,
        lastScanDurationMs: outcome.durationMs,
        lastScanBytes: outcome.bytesScanned
      }
    });

    await this.prisma.evidenceStatusHistory.create({
      data: {
        evidenceId: record.id,
        fromStatus: record.status,
        toStatus: EvidenceStatus.QUARANTINED,
        note: 'Evidence quarantined after antivirus detection',
        changedById: null
      }
    });

    await this.notifications.notifyEvidence({
      evidenceId: record.id,
      organizationId: record.organizationId,
      scanId,
      status: 'quarantined',
      reason: outcome.notes,
      findings: outcome.findings,
      requestedBy: requestedBy ?? undefined
    });

    this.logger.warn(
      JSON.stringify({
        event: 'ingestion.quarantined',
        evidenceId: record.id,
        scanId,
        notes: outcome.notes,
        signature: outcome.signature
      })
    );
  }

  private async handleFailure(
    record: EvidenceSummary,
    scanId: string,
    error: Error,
    requestedBy: string | null
  ): Promise<{ quarantined: boolean }> {
    const failureReason = error.message;
    const completedAt = new Date();
    const findings: Record<string, unknown> = {
      failure: true,
      engine: this.engineName,
      error: failureReason
    };

    let failureStatus = EvidenceScanStatus.FAILED;
    if (error instanceof AntivirusScanFailureError) {
      findings['category'] = 'scan_failure';
    } else if (error instanceof AntivirusUnavailableError) {
      findings['category'] = 'engine_unavailable';
    } else {
      findings['category'] = 'unknown_error';
    }

    await this.prisma.evidenceScan.update({
      where: { id: scanId },
      data: {
        status: failureStatus,
        completedAt,
        durationMs: null,
        bytesScanned: null,
        findings: findings as Prisma.JsonObject,
        failureReason,
        quarantined: this.quarantineOnError,
        engineVersion: this.engineName
      }
    });

    const itemUpdate: Prisma.EvidenceItemUpdateInput = {
      ingestionStatus: EvidenceIngestionStatus.QUARANTINED,
      ingestionNotes: `Antivirus scan failed: ${failureReason}`,
      lastScanStatus: EvidenceScanStatus.FAILED,
      lastScanAt: completedAt,
      lastScanEngine: this.engineName,
      lastScanSignatureVersion: null,
      lastScanNotes: failureReason,
      lastScanDurationMs: null,
      lastScanBytes: null,
      nextAction: 'Review antivirus failure'
    };

    let quarantined = false;
    if (this.quarantineOnError) {
      itemUpdate.status = EvidenceStatus.QUARANTINED;
      quarantined = true;
      await this.prisma.evidenceStatusHistory.create({
        data: {
          evidenceId: record.id,
          fromStatus: record.status,
          toStatus: EvidenceStatus.QUARANTINED,
          note: 'Evidence quarantined due to antivirus scan failure',
          changedById: null
        }
      });

      await this.notifications.notifyEvidence({
        evidenceId: record.id,
        organizationId: record.organizationId,
        scanId,
        status: 'quarantined',
        reason: failureReason,
        findings,
        requestedBy: requestedBy ?? undefined
      });
    }

    await this.prisma.evidenceItem.update({
      where: { id: record.id },
      data: itemUpdate
    });

    this.metrics.incrementCounter(`${METRIC_PREFIX}.failed`, 1, {
      engine: this.engineName,
      category: findings['category'] as string
    });

    this.logger.error(
      JSON.stringify({
        event: 'ingestion.failed',
        evidenceId: record.id,
        scanId,
        message: failureReason
      })
    );

    return { quarantined };
  }

  private async findEvidence(evidenceId: string): Promise<EvidenceSummary | null> {
    return this.prisma.evidenceItem.findUnique({
      where: { id: evidenceId },
      select: {
        id: true,
        status: true,
        organizationId: true,
        fileSize: true,
        originalFilename: true
      }
    });
  }
}
