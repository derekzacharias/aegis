import { Injectable, Logger } from '@nestjs/common';

export type ReportFormat = 'html' | 'pdf';

export interface ReportJob {
  jobId: string;
  assessmentId: string;
  formats: ReportFormat[];
  status: 'queued' | 'processing' | 'completed';
  createdAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);
  private readonly jobs: Map<string, ReportJob> = new Map();

  async queueReport(assessmentId: string, formats: ReportFormat[]): Promise<ReportJob> {
    const jobId = `report-${assessmentId}-${Date.now()}`;
    const createdAt = new Date().toISOString();
    this.logger.log(`Queued report generation ${jobId} for assessment ${assessmentId}`);

    const job: ReportJob = {
      jobId,
      assessmentId,
      formats,
      status: 'queued',
      createdAt,
      completedAt: null,
      downloadUrl: null
    };

    this.jobs.set(jobId, job);
    return job;
  }

  async list(): Promise<ReportJob[]> {
    const now = Date.now();

    // Simulate jobs progressing to completion after ~10 seconds.
    this.jobs.forEach((job, key) => {
      if (job.status === 'queued' && now - new Date(job.createdAt).getTime() > 5000) {
        this.jobs.set(key, {
          ...job,
          status: 'processing'
        });
      }

      if (job.status === 'processing' && now - new Date(job.createdAt).getTime() > 10000) {
        this.jobs.set(key, {
          ...job,
          status: 'completed',
          completedAt: new Date().toISOString(),
          downloadUrl: `https://files.local/reports/${job.jobId}.zip`
        });
      }
    });

    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
