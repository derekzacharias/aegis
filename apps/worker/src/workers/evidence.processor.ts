import { Injectable, Logger } from '@nestjs/common';
import {
  EvidenceIngestionJobPayload,
  JobQueue,
  JobRecord,
  jobQueue
} from '@compliance/shared';

const JOB_NAME = 'evidence.ingest';

@Injectable()
export class EvidenceProcessor {
  private readonly logger = new Logger(EvidenceProcessor.name);

  constructor(private readonly queue: JobQueue = jobQueue) {
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

    // Placeholder for AV scanning, metadata extraction, etc.
    await new Promise((resolve) => setTimeout(resolve, 250));

    this.logger.log(`Evidence ${evidenceId} ingestion completed`);
    return { quarantined: false };
  }
}
