import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  StreamableFile
} from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { URL } from 'url';
import path from 'path';
import {
  jobQueue,
  JobQueue,
  JobRecord,
  reportStore,
  ReportArtifactRecord,
  ReportFormat,
  ReportJobPayload,
  ReportJobResult,
  ReportJobView,
  ReportStoreType
} from '@compliance/shared';
import { PrismaService } from '../prisma/prisma.service';

const REPORT_JOB_NAME = 'report.generate';
const API_PREFIX = '/api';

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);
  private readonly queue: JobQueue;
  private readonly reports: ReportStoreType;

  constructor(
    private readonly prisma: PrismaService,
    @Optional() queue?: JobQueue,
    @Optional() reports?: ReportStoreType
  ) {
    this.queue = queue ?? jobQueue;
    this.reports = reports ?? reportStore;
  }

  async queueReport(
    organizationId: string,
    assessmentId: string,
    formats: ReportFormat[],
    requestedBy: string
  ): Promise<ReportJobView> {
    const assessment = await this.prisma.assessmentProject.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        organizationId: true
      }
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }

    const job = await this.queue.enqueue<ReportJobPayload>(REPORT_JOB_NAME, {
      assessmentId,
      formats,
      requestedBy
    });

    this.logger.log(
      `Queued report generation ${job.id} for assessment ${assessmentId} by ${requestedBy}`
    );

    return this.toView(
      job as JobRecord<ReportJobPayload, ReportJobResult>
    );
  }

  async list(): Promise<ReportJobView[]> {
    return this.queue.list<ReportJobPayload, ReportJobResult>(REPORT_JOB_NAME).map((job) => this.toView(job));
  }

  async get(jobId: string): Promise<ReportJobView> {
    const job = this.queue.get<ReportJobPayload, ReportJobResult>(jobId);

    if (!job || job.name !== REPORT_JOB_NAME) {
      throw new NotFoundException(`Report job ${jobId} not found`);
    }

    return this.toView(job);
  }

  async getArtifact(jobId: string, preferredFormat: ReportFormat = 'pdf'): Promise<ReportArtifactRecord> {
    const job = this.queue.get<ReportJobPayload, ReportJobResult>(jobId);

    if (!job || job.name !== REPORT_JOB_NAME) {
      throw new NotFoundException(`Report job ${jobId} not found`);
    }

    const [primary, ...rest] = this.reports.findByJob(jobId);
    if (!primary) {
      throw new NotFoundException(`Report ${jobId} is not ready yet`);
    }

    const artifact = [primary, ...rest].find((item) => item.format === preferredFormat) ?? primary;

    return artifact;
  }

  streamArtifact(artifact: ReportArtifactRecord): StreamableFile {
    const filePath = this.resolveFilePath(artifact.storageUri);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`Report artifact ${artifact.id} not found on disk`);
    }

    const stream = createReadStream(filePath);
    return new StreamableFile(stream, {
      type: artifact.metadata.mediaType,
      disposition: `attachment; filename="${artifact.filename}"`
    });
  }

  private toView(job: JobRecord<ReportJobPayload, ReportJobResult>): ReportJobView {
    const artifacts = this.reports.findByJob(job.id);
    const pdfArtifact = artifacts.find((artifact) => artifact.format === 'pdf');

    return {
      jobId: job.id,
      assessmentId: job.payload.assessmentId,
      formats: job.payload.formats,
      status: job.status,
      createdAt: job.enqueuedAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      requestedBy: job.payload.requestedBy,
      artifactIds: artifacts.map((artifact) => artifact.id),
      downloadUrl: pdfArtifact ? `${API_PREFIX}/reports/${job.id}/download` : null,
      error: job.error,
      artifacts: artifacts.map((artifact) => ({
        id: artifact.id,
        format: artifact.format,
        filename: artifact.filename,
        createdAt: artifact.createdAt,
        metadata: artifact.metadata
      }))
    };
  }

  private resolveFilePath(storageUri: string): string {
    if (storageUri.startsWith('file://')) {
      return decodeURIComponent(new URL(storageUri).pathname);
    }

    if (path.isAbsolute(storageUri)) {
      return storageUri;
    }

    return path.join(process.cwd(), storageUri);
  }
}
