import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  FRAMEWORK_PUBLISH_JOB,
  FrameworkPublishJobPayload,
  FRAMEWORK_PUBLISH_REPORT_JOB,
  FrameworkPublishReportPayload,
  jobQueue,
  JobQueue,
  JobRecord
} from '@compliance/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import {
  FrameworkService,
  ControlCatalogFilters,
  ControlCatalogResponse
} from '@compliance/api/framework/framework.service';
import { CrosswalkService } from '@compliance/api/framework/crosswalk.service';
import { CrosswalkResponse } from '@compliance/api/framework/framework.types';
import { PrismaService as ApiPrismaService } from '@compliance/api/prisma/prisma.service';

const MAX_ATTEMPTS = 3;

type FrameworkWarmupResult = {
  frameworkId: string;
  organizationId: string;
  crosswalkMatches: number;
  controlCount: number;
  warmedAt: string;
  attempts: number;
};

@Injectable()
export class FrameworkProcessor {
  private readonly logger = new Logger(FrameworkProcessor.name);
  private readonly queue: JobQueue;
  private readonly frameworkService: FrameworkService;
  private readonly crosswalkService: CrosswalkService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    @Optional() queue?: JobQueue,
    @Optional() frameworkService?: FrameworkService,
    @Optional() crosswalkService?: CrosswalkService
  ) {
    this.queue = queue ?? jobQueue;
    const apiPrisma = this.prisma as unknown as ApiPrismaService;
    this.frameworkService = frameworkService ?? new FrameworkService(apiPrisma, this.queue);
    this.crosswalkService = crosswalkService ?? new CrosswalkService(apiPrisma);

    this.queue.registerProcessor<FrameworkPublishJobPayload, FrameworkWarmupResult>(
      FRAMEWORK_PUBLISH_JOB,
      (job) => this.handle(job)
    );
  }

  private async handle(
    job: JobRecord<FrameworkPublishJobPayload>
  ): Promise<FrameworkWarmupResult> {
    const {
      frameworkId,
      organizationId,
      frameworkName,
      frameworkVersion,
      publishedAt,
      actor,
      attempt = 1
    } = job.payload;

    try {
      const [{ crosswalk, catalog }, framework] = await Promise.all([
        this.generateWarmupPayloads(frameworkId, organizationId),
        this.prisma.framework.findUnique({
          where: { id: frameworkId },
          select: {
            id: true,
            name: true,
            version: true
          }
        })
      ]);

      if (!framework) {
        throw new Error(`Framework ${frameworkId} not found during warmup`);
      }

      await this.prisma.frameworkWarmupCache.upsert({
        where: { frameworkId },
        create: {
          frameworkId,
          organizationId,
          crosswalkPayload: this.toJsonValue(crosswalk),
          controlCatalogPayload: this.toJsonValue(catalog),
          generatedById: actor?.userId ?? null
        },
        update: {
          crosswalkPayload: this.toJsonValue(crosswalk),
          controlCatalogPayload: this.toJsonValue(catalog),
          generatedAt: new Date(),
          generatedById: actor?.userId ?? null
        }
      });

      this.metrics.incrementCounter('framework.publish.warmup.completed', 1, {
        frameworkId,
        attempt: attempt.toString()
      });

      this.logger.log(
        JSON.stringify({
          event: 'framework.warmup.completed',
          frameworkId,
          organizationId,
          matches: crosswalk.total,
          controlCount: catalog.total,
          attempt,
          frameworkName,
          frameworkVersion,
          publishedAt
        })
      );

      await this.notifyReportQueue({
        organizationId,
        frameworkId,
        frameworkName,
        frameworkVersion,
        publishedAt,
        actor
      });

      const warmedAt = new Date().toISOString();

      return {
        frameworkId,
        organizationId,
        crosswalkMatches: crosswalk.total,
        controlCount: catalog.total,
        warmedAt,
        attempts: attempt
      };
    } catch (error) {
      this.metrics.incrementCounter('framework.publish.warmup.failed', 1, {
        frameworkId,
        attempt: attempt.toString()
      });

      this.logger.error(
        `Framework warmup failed for ${frameworkId} (attempt ${attempt}): ${(error as Error).message}`,
        (error as Error).stack
      );

      if (attempt < MAX_ATTEMPTS) {
        await this.queue.enqueue<FrameworkPublishJobPayload>(FRAMEWORK_PUBLISH_JOB, {
          ...job.payload,
          attempt: attempt + 1
        });
        this.logger.warn(
          `Re-queued framework warmup for ${frameworkId} with attempt ${attempt + 1}`
        );
      }

      throw error;
    }
  }

  private async notifyReportQueue(payload: FrameworkPublishReportPayload): Promise<void> {
    try {
      const attempt = payload.attempt ?? 1;
      await this.queue.enqueue<FrameworkPublishReportPayload>(
        FRAMEWORK_PUBLISH_REPORT_JOB,
        {
          ...payload,
          attempt
        }
      );
      this.metrics.incrementCounter('framework.publish.report.enqueued', 1, {
        frameworkId: payload.frameworkId
      });
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue framework publish report notification for ${payload.frameworkId}: ${(error as Error).message}`
      );
    }
  }

  private async generateWarmupPayloads(
    frameworkId: string,
    organizationId: string
  ): Promise<{ crosswalk: CrosswalkResponse; catalog: ControlCatalogResponse }> {
    const crosswalk = await this.crosswalkService.generateCrosswalk(frameworkId, {});
    const defaultFilters: ControlCatalogFilters = {
      page: 1,
      pageSize: 25
    };

    const catalog = await this.frameworkService.listControls(
      organizationId,
      frameworkId,
      defaultFilters
    );

    return { crosswalk, catalog };
  }

  private toJsonValue<T>(value: T): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
