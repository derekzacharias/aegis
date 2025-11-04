import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EvidenceIngestionJobPayload,
  JobQueue,
  JobRecord,
  jobQueue
} from '@compliance/shared';
import type { AntivirusAutoReleaseStrategy } from '@compliance/shared';
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
import {
  EvidenceNotificationContact,
  NotificationService
} from '../notifications/notification.service';

const JOB_NAME = 'evidence.ingest';
const CONTACT_STALE_DAYS = 90;
const CONTACT_METRIC_PREFIX = 'notifications.contact';

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
  private readonly autoReleaseStrategy: AntivirusAutoReleaseStrategy;

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
    this.autoReleaseStrategy = this.resolveAutoReleaseStrategy(
      this.config.get<string>('antivirus.autoReleaseStrategy')
    );
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

    const requestedByContact = await this.resolveContact(requestedBy ?? null, record.organizationId);

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
        findings: Prisma.JsonNull
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
        await this.handleInfected(record, scanId, outcome, requestedByContact);
        return { quarantined: true };
      }

      this.metrics.incrementCounter(`${METRIC_PREFIX}.clean`, 1, {
        engine: this.engineName
      });
      await this.handleClean(record, scanId, outcome, requestedByContact);
      return { quarantined: false };
    } catch (error) {
      return this.handleFailure(record, scanId, error as Error, requestedByContact);
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
    outcome: AntivirusScanOutcome,
    requestedBy: EvidenceNotificationContact | null
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

    let releasePlan: Awaited<ReturnType<typeof this.determineAutoRelease>> = null;

    if (record.status === EvidenceStatus.QUARANTINED) {
      releasePlan = await this.determineAutoRelease(record);
      if (releasePlan) {
        updateData.status = releasePlan.toStatus;
        updateData.nextAction = releasePlan.nextAction;

        await this.prisma.evidenceStatusHistory.create({
          data: {
            evidenceId: record.id,
            fromStatus: EvidenceStatus.QUARANTINED,
            toStatus: releasePlan.toStatus,
            note: releasePlan.note,
            changedById: null
          }
        });

        this.metrics.incrementCounter(`${METRIC_PREFIX}.auto_released`, 1, {
          strategy: releasePlan.strategy,
          target: releasePlan.toStatus
        });
      }
    }

    await this.prisma.evidenceItem.update({
      where: { id: record.id },
      data: updateData
    });

    if (releasePlan) {
      await this.notifications.notifyEvidence({
        evidenceId: record.id,
        organizationId: record.organizationId,
        scanId,
        status: 'released',
        reason: releasePlan.note,
        findings: outcome.findings ?? undefined,
        requestedBy: requestedBy ?? undefined
      });
    }

    this.logger.log(
      JSON.stringify({
        event: 'ingestion.clean',
        evidenceId: record.id,
        scanId,
        notes: outcome.notes
      })
    );
  }

  private resolveAutoReleaseStrategy(value: string | undefined): AntivirusAutoReleaseStrategy {
    const normalized = (value ?? 'pending').toLowerCase().trim();
    if (normalized === 'manual' || normalized === 'previous' || normalized === 'pending') {
      return normalized;
    }
    return 'pending';
  }

  private async determineAutoRelease(
    record: EvidenceSummary
  ): Promise<
    {
      toStatus: EvidenceStatus;
      nextAction: string;
      note: string;
      strategy: AntivirusAutoReleaseStrategy;
    } | null
  > {
    const orgSettings = await this.prisma.organizationSettings.findUnique({
      where: { organizationId: record.organizationId },
      select: { antivirusAutoReleaseStrategy: true }
    });

    const strategy = orgSettings?.antivirusAutoReleaseStrategy
      ? this.resolveAutoReleaseStrategy(orgSettings.antivirusAutoReleaseStrategy)
      : this.autoReleaseStrategy;

    if (strategy === 'manual') {
      return null;
    }

    if (strategy === 'pending') {
      return {
        toStatus: EvidenceStatus.PENDING,
        nextAction: 'Auto-released after clean scan – awaiting analyst review',
        note: 'Evidence auto-released to pending after clean antivirus scan',
        strategy
      };
    }

    const recentQuarantine = await this.prisma.evidenceStatusHistory.findFirst({
      where: {
        evidenceId: record.id,
        toStatus: EvidenceStatus.QUARANTINED
      },
      orderBy: {
        changedAt: 'desc'
      },
      select: {
        fromStatus: true
      }
    });

    const fallback = {
      toStatus: EvidenceStatus.PENDING,
      nextAction: 'Auto-released after clean scan – awaiting analyst review',
      note: 'Evidence auto-released to pending after clean antivirus scan (previous status unavailable)'
    };

    if (!recentQuarantine || !recentQuarantine.fromStatus || recentQuarantine.fromStatus === EvidenceStatus.QUARANTINED) {
      return {
        ...fallback,
        strategy
      };
    }

    return {
      toStatus: recentQuarantine.fromStatus,
      nextAction: 'Auto-released to previous status after clean antivirus scan',
      note: `Evidence auto-released to ${recentQuarantine.fromStatus.toLowerCase()} after clean antivirus scan`,
      strategy
    };
  }

  private async handleInfected(
    record: EvidenceSummary,
    scanId: string,
    outcome: AntivirusScanOutcome,
    requestedBy: EvidenceNotificationContact | null
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
    requestedBy: EvidenceNotificationContact | null
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

  private async resolveContact(
    email: string | null,
    organizationId: string
  ): Promise<EvidenceNotificationContact | null> {
    if (!email) {
      return null;
    }

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        email: normalized,
        organizationId
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        phoneNumber: true,
        timezone: true,
        updatedAt: true
      }
    });

    if (!user) {
      this.logger.warn(
        JSON.stringify({
          event: 'contact.missing',
          email: normalized,
          organizationId
        })
      );
      this.metrics.incrementCounter(`${CONTACT_METRIC_PREFIX}.missing_profile`, 1, {
        organizationId
      });
      return {
        id: null,
        email: normalized,
        name: null,
        jobTitle: null,
        phoneNumber: null,
        timezone: null,
        lastUpdated: null,
        isStale: false,
        missingFields: ['profile']
      };
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
    const missingFields: string[] = [];
    if (!user.phoneNumber) {
      missingFields.push('phoneNumber');
    }
    if (!user.timezone) {
      missingFields.push('timezone');
    }

    const updatedAt = user.updatedAt ?? new Date();
    const ageMs = Date.now() - updatedAt.getTime();
    const ageDays = Math.floor(ageMs / 86_400_000);
    const isStale = ageDays >= CONTACT_STALE_DAYS;

    if (missingFields.length > 0) {
      this.metrics.incrementCounter(`${CONTACT_METRIC_PREFIX}.missing_fields`, 1, {
        fields: missingFields.join(','),
        organizationId
      });
      this.logger.warn(
        JSON.stringify({
          event: 'contact.incomplete',
          email: user.email,
          organizationId,
          missingFields
        })
      );
    }

    if (isStale) {
      this.metrics.incrementCounter(`${CONTACT_METRIC_PREFIX}.stale`, 1, {
        organizationId
      });
      this.logger.warn(
        JSON.stringify({
          event: 'contact.stale',
          email: user.email,
          organizationId,
          updatedAt: updatedAt.toISOString(),
          ageDays
        })
      );
    }

    return {
      id: user.id,
      email: user.email,
      name,
      jobTitle: user.jobTitle ?? null,
      phoneNumber: user.phoneNumber ?? null,
      timezone: user.timezone ?? null,
      lastUpdated: updatedAt.toISOString(),
      isStale,
      missingFields
    };
  }
}
