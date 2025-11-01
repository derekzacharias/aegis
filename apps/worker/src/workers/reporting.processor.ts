import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { pathToFileURL } from 'url';
import path from 'path';
import {
  assessmentStore,
  AssessmentStoreType,
  JobQueue,
  jobQueue,
  JobRecord,
  reportStore,
  ReportArtifactRecord,
  ReportJobPayload,
  ReportJobResult,
  ReportStoreType
} from '@compliance/shared';
import puppeteer, { Browser } from 'puppeteer';
import { renderAssessmentReport } from '../reporting/report-template';

const REPORT_JOB_NAME = 'report.generate';
const OUTPUT_ROOT = path.resolve(process.cwd(), 'tmp/reports');

type BrowserHandle = Pick<Browser, 'newPage' | 'close'>;

export interface BrowserFactory {
  launch(): Promise<BrowserHandle>;
}

class PuppeteerBrowserFactory implements BrowserFactory {
  async launch(): Promise<Browser> {
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
}

@Injectable()
export class ReportingProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReportingProcessor.name);
  private readonly browserFactory: BrowserFactory;

  constructor(
    private readonly config: ConfigService,
    private readonly queue: JobQueue = jobQueue,
    private readonly reports: ReportStoreType = reportStore,
    private readonly assessments: AssessmentStoreType = assessmentStore,
    browserFactory?: BrowserFactory
  ) {
    this.browserFactory = browserFactory ?? new PuppeteerBrowserFactory();
  }

  async onModuleInit() {
    this.queue.registerProcessor<ReportJobPayload, ReportJobResult>(REPORT_JOB_NAME, (job) =>
      this.process(job as JobRecord<ReportJobPayload, ReportJobResult>)
    );
    this.logger.log('Reporting processor ready');
  }

  onModuleDestroy() {
    this.queue.unregisterProcessor(REPORT_JOB_NAME);
  }

  private async process(job: JobRecord<ReportJobPayload>): Promise<ReportJobResult> {
    const { assessmentId, formats, requestedBy } = job.payload;
    const assessment = this.assessments.get(assessmentId);

    if (!assessment) {
      this.logger.error(`Assessment ${assessmentId} not found for job ${job.id}`);
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    this.logger.log(`Rendering report ${job.id} for assessment ${assessmentId}`);
    const generatedAt = new Date().toISOString();
    const bucket = this.config.get<string>('reportBucket', 'local-reports');
    const html = await renderAssessmentReport({
      assessment,
      generatedAt,
      generatedBy: requestedBy,
      bucket
    });

    const jobDir = path.join(OUTPUT_ROOT, job.id);
    await fs.mkdir(jobDir, { recursive: true });
    const baseFilename = `assessment-${assessmentId}`;
    const htmlPath = path.join(jobDir, `${baseFilename}.html`);
    await fs.writeFile(htmlPath, html, 'utf-8');

    const artifacts: ReportArtifactRecord[] = [];

    if (formats.includes('html')) {
      artifacts.push(
        this.reports.save({
          jobId: job.id,
          assessmentId,
          format: 'html',
          storageUri: pathToFileURL(htmlPath).toString(),
          filename: `${baseFilename}.html`,
          requestedBy
        })
      );
    }

    if (formats.includes('pdf')) {
      const pdfFilename = `${baseFilename}.pdf`;
      const pdfPath = path.join(jobDir, pdfFilename);
      const browser = await this.browserFactory.launch();
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
        await page.close();
      } finally {
        await browser.close();
      }

      artifacts.push(
        this.reports.save({
          jobId: job.id,
          assessmentId,
          format: 'pdf',
          storageUri: pathToFileURL(pdfPath).toString(),
          filename: pdfFilename,
          requestedBy
        })
      );
    }

    this.logger.log(`Report ${job.id} for assessment ${assessmentId} completed`);

    return {
      artifacts,
      notes: {
        bucket,
        generatedAt
      }
    };
  }
}
