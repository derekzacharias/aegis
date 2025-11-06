import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  ASSESSMENT_AUTOMATION_JOB,
  ASSESSMENT_AUTOMATION_RESULT_JOB,
  AssessmentAutomationJobPayload,
  AssessmentAutomationJobResult,
  JobQueue,
  JobRecord,
  jobQueue
} from '@compliance/shared';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class AssessmentAutomationProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AssessmentAutomationProcessor.name);

  constructor(
    private readonly metrics: MetricsService,
    private readonly queue: JobQueue = jobQueue
  ) {}

  async onModuleInit(): Promise<void> {
    this.queue.registerProcessor<AssessmentAutomationJobPayload, AssessmentAutomationJobResult>(
      ASSESSMENT_AUTOMATION_JOB,
      (job) => this.handleAutomationJob(job as JobRecord<AssessmentAutomationJobPayload>)
    );
    this.logger.log('Assessment automation processor ready');
  }

  onModuleDestroy(): void {
    this.queue.unregisterProcessor(ASSESSMENT_AUTOMATION_JOB);
  }

  private async handleAutomationJob(
    job: JobRecord<AssessmentAutomationJobPayload>
  ): Promise<AssessmentAutomationJobResult> {
    const { assessmentId, frameworkIds, executionMode, targets, tooling, requestedBy, options } =
      job.payload;

    if (!frameworkIds?.length) {
      throw new Error('automation jobs require at least one framework identifier');
    }

    if (!targets?.length) {
      throw new Error('automation jobs require at least one target');
    }

    const startedAt = new Date().toISOString();
    const runId = job.payload.correlationId ?? job.id;

    this.logger.log(
      JSON.stringify({
        message: 'Received automation job',
        jobId: job.id,
        runId,
        assessmentId,
        frameworkIds,
        executionMode,
        targetCount: targets.length,
        tooling,
        dryRun: Boolean(options?.dryRun),
        requestedBy
      })
    );

    this.metrics.incrementCounter('assessment.automation.jobs.accepted', 1, {
      executionMode,
      dry_run: Boolean(options?.dryRun),
      tooling: tooling.join(',') || 'unspecified'
    });

    if (options?.dryRun) {
      this.logger.log(
        JSON.stringify({
          message: 'Skipping execution because dryRun=true',
          runId,
          assessmentId
        })
      );
    } else {
      this.logger.log(
        JSON.stringify({
          message: 'POC automation job executing in planning mode',
          runId,
          action: 'plan-only'
        })
      );
      // In the POC phase we only emit telemetry; integration with actual runners happens next.
    }

    const completedAt = new Date().toISOString();

    const result: AssessmentAutomationJobResult = {
      assessmentId,
      frameworkIds,
      executionMode,
      startedAt,
      completedAt,
      runId,
      success: true,
      targetsProcessed: targets.length,
      metadata: {
        tooling,
        dryRun: Boolean(options?.dryRun)
      }
    };

    try {
      await this.queue.enqueue(ASSESSMENT_AUTOMATION_RESULT_JOB, result);
      this.metrics.incrementCounter('assessment.automation.result.enqueued', 1, {
        runId,
        assessmentId
      });
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue ${ASSESSMENT_AUTOMATION_RESULT_JOB} job for run ${runId}: ${
          (error as Error).message
        }`
      );
    }

    return result;
  }
}
