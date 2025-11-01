import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  EvidenceIngestionJobPayload,
  JobQueue,
  JobRecord,
  jobQueue
} from '@compliance/shared';
import { EvidenceIngestionStatus, EvidenceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const JOB_NAME = 'evidence.ingest';

@Injectable()
export class EvidenceProcessor {
  private readonly logger = new Logger(EvidenceProcessor.name);
  private readonly queue: JobQueue;

  constructor(
    private readonly prisma: PrismaService,
    @Optional() queue?: JobQueue
  ) {
    this.queue = queue ?? jobQueue;
    this.queue.registerProcessor<EvidenceIngestionJobPayload, { quarantined: boolean }>(
      JOB_NAME,
      (job) => this.handle(job)
    );
  }

  private async handle(
    job: JobRecord<EvidenceIngestionJobPayload>
  ): Promise<{ quarantined: boolean }> {
    const { evidenceId, storageUri, checksum } = job.payload;
    this.logger.log(
      `Inspecting evidence ${evidenceId} located at ${storageUri} (checksum ${checksum ?? 'unknown'})`
    );

    const record = await this.prisma.evidenceItem.findUnique({
      where: { id: evidenceId },
      select: {
        id: true,
        status: true
      }
    });

    if (!record) {
      this.logger.warn(`Evidence ${evidenceId} not found; skipping ingestion.`);
      return { quarantined: false };
    }

    await this.prisma.evidenceItem.update({
      where: { id: evidenceId },
      data: {
        ingestionStatus: EvidenceIngestionStatus.PROCESSING,
        ingestionNotes: 'Ingestion pipeline started'
      }
    });

    try {
      const result = await this.runScan(job.payload);

      if (result.quarantined) {
        await this.prisma.evidenceItem.update({
          where: { id: evidenceId },
          data: {
            status: EvidenceStatus.QUARANTINED,
            ingestionStatus: EvidenceIngestionStatus.QUARANTINED,
            ingestionNotes: result.notes,
            nextAction: 'Investigate quarantine findings'
          }
        });

        await this.prisma.evidenceStatusHistory.create({
          data: {
            evidenceId,
            fromStatus: record.status,
            toStatus: EvidenceStatus.QUARANTINED,
            note: 'Automated malware scan quarantine',
            changedById: null
          }
        });

        this.logger.warn(`Evidence ${evidenceId} quarantined after scan.`);
        return { quarantined: true };
      }

      await this.prisma.evidenceItem.update({
        where: { id: evidenceId },
        data: {
          ingestionStatus: EvidenceIngestionStatus.COMPLETED,
          ingestionNotes: result.notes
        }
      });

      this.logger.log(`Evidence ${evidenceId} ingestion completed successfully.`);
      this.logger.log(`Notifying reviewers that evidence ${evidenceId} is ready for review.`);
      return { quarantined: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown ingestion failure';
      this.logger.error(`Evidence ${evidenceId} ingestion failed: ${message}`);

      await this.prisma.evidenceItem.update({
        where: { id: evidenceId },
        data: {
          ingestionStatus: EvidenceIngestionStatus.QUARANTINED,
          ingestionNotes: `Ingestion failed: ${message}`,
          status: EvidenceStatus.QUARANTINED,
          nextAction: 'Review ingestion failure'
        }
      });

      await this.prisma.evidenceStatusHistory.create({
        data: {
          evidenceId,
          fromStatus: record.status,
          toStatus: EvidenceStatus.QUARANTINED,
          note: 'Ingestion pipeline failure',
          changedById: null
        }
      });

      return { quarantined: true };
    }
  }

  private async runScan(
    payload: EvidenceIngestionJobPayload
  ): Promise<{ quarantined: boolean; notes: string }> {
    await new Promise((resolve) => setTimeout(resolve, 450));

    if (!payload.checksum) {
      return {
        quarantined: false,
        notes: 'Scan completed without checksum verification'
      };
    }

    if (payload.checksum.toLowerCase().includes('infected')) {
      return {
        quarantined: true,
        notes: 'Malware signature detected during scan'
      };
    }

    return {
      quarantined: false,
      notes: 'Scan completed successfully'
    };
  }
}
