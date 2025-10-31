import { Injectable, Logger } from '@nestjs/common';

export type ReportFormat = 'html' | 'pdf';

export interface ReportRequestResult {
  jobId: string;
  assessmentId: string;
  formats: ReportFormat[];
  status: 'queued' | 'completed';
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  async queueReport(assessmentId: string, formats: ReportFormat[]): Promise<ReportRequestResult> {
    const jobId = `report-${assessmentId}-${Date.now()}`;
    this.logger.log(`Queued report generation ${jobId} for assessment ${assessmentId}`);
    // Placeholder: would enqueue message for worker via Redis/SQS.
    return {
      jobId,
      assessmentId,
      formats,
      status: 'queued'
    };
  }
}
