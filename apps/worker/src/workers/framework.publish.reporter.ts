import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  FRAMEWORK_PUBLISH_REPORT_JOB,
  FrameworkPublishReportPayload,
  FrameworkPublishReportResult,
  ReportJobPayload,
  jobQueue,
  JobQueue,
  JobRecord
} from '@compliance/shared';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../prisma.service';

const MAX_ATTEMPTS = 3;

@Injectable()
export class FrameworkPublishReporter {
  private readonly logger = new Logger(FrameworkPublishReporter.name);
  private readonly queue: JobQueue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    @Optional() queue?: JobQueue
  ) {
    this.queue = queue ?? jobQueue;
    this.queue.registerProcessor<FrameworkPublishReportPayload, FrameworkPublishReportResult>(
      FRAMEWORK_PUBLISH_REPORT_JOB,
      (job) => this.handle(job)
    );
  }

  private async handle(
    job: JobRecord<FrameworkPublishReportPayload>
  ): Promise<FrameworkPublishReportResult> {
    const attempt = job.payload.attempt ?? 1;
    const { frameworkId, organizationId, frameworkName, frameworkVersion, publishedAt, actor } =
      job.payload;

    try {
      const links = await this.prisma.assessmentFramework.findMany({
        where: { frameworkId },
        select: {
          assessmentId: true,
          assessment: {
            select: {
              organizationId: true,
              status: true
            }
          }
        }
      });

      const relevant = links.filter(
        (link) =>
          link.assessment &&
          link.assessment.organizationId === organizationId &&
          link.assessment.status === 'COMPLETE'
      );

      const assessmentIds = Array.from(new Set(relevant.map((link) => link.assessmentId)));
      const requestedBy = actor?.email ?? 'framework.publish@aegis.local';

      if (assessmentIds.length > 0) {
        await Promise.all(
          assessmentIds.map((assessmentId) =>
            this.queue.enqueue<ReportJobPayload>('report.generate', {
              assessmentId,
              formats: ['pdf'],
              requestedBy
            })
          )
        );

        this.metrics.incrementCounter('framework.publish.report.dispatched', assessmentIds.length, {
          frameworkId
        });
      } else {
        this.metrics.incrementCounter('framework.publish.report.no-op', 1, {
          frameworkId
        });
      }

      const notifiedAt = new Date().toISOString();
      this.logger.log(
        JSON.stringify({
          event: 'framework.publish.report.dispatched',
          frameworkId,
          organizationId,
          frameworkName,
          frameworkVersion,
          publishedAt,
          actor,
          assessmentsNotified: assessmentIds.length,
          attempt,
          notifiedAt
        })
      );

      return {
        frameworkId,
        organizationId,
        notifiedAt,
        attempts: attempt,
        assessmentsNotified: assessmentIds.length
      };
    } catch (error) {
      this.metrics.incrementCounter('framework.publish.report.failed', 1, {
        frameworkId,
        attempt: attempt.toString()
      });

      this.logger.error(
        `Framework publish report notification failed for ${frameworkId} (attempt ${attempt}): ${(error as Error).message}`,
        (error as Error).stack
      );

      if (attempt < MAX_ATTEMPTS) {
        await this.queue.enqueue<FrameworkPublishReportPayload>(FRAMEWORK_PUBLISH_REPORT_JOB, {
          ...job.payload,
          attempt: attempt + 1
        });

        this.logger.warn(
          `Re-queued framework publish report notification for ${frameworkId} with attempt ${attempt + 1}`
        );
      }

      throw error;
    }
  }
}
