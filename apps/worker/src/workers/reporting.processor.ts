import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import {
  AssessmentSummary,
  JobQueue,
  JobRecord,
  jobQueue,
  reportStore,
  ReportArtifactMetadata,
  ReportArtifactRecord,
  ReportJobPayload,
  ReportJobResult,
  ReportStoreType
} from '@compliance/shared';
import { AssessmentStatus as PrismaAssessmentStatus } from '@prisma/client';
import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { renderAssessmentReport } from '../reporting/report-template';
import { PrismaService } from '../prisma.service';

const REPORT_JOB_NAME = 'report.generate';
const OUTPUT_ROOT = path.resolve(process.cwd(), 'tmp/reports');
const REPORT_ARTIFACT_VERSION = '2024.10.1';
const HTML_MEDIA_TYPE = 'text/html; charset=utf-8';
const PDF_MEDIA_TYPE = 'application/pdf';

type BrowserHandle = Pick<Browser, 'newPage' | 'close'>;

export interface BrowserFactory {
  launch(): Promise<BrowserHandle>;
}

interface RendererConfig {
  bucket: string;
  templatePath?: string;
  maxAttempts: number;
  renderTimeoutMs: number;
  retryBackoffMs: number;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const isTransientError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /timeout|Target closed|Execution context was destroyed|navigation failed|ECONNRESET|ENOTFOUND/i.test(
    message
  );
};

export class PuppeteerBrowserFactory implements BrowserFactory {
  constructor(private readonly config: ConfigService) {}

  async launch(): Promise<BrowserHandle> {
    const options = this.buildLaunchOptions();
    return puppeteer.launch(options);
  }

  private buildLaunchOptions(): PuppeteerLaunchOptions {
    const mode = (this.config.get<string>('reportRenderer.mode', 'ci') ?? 'ci').toLowerCase();
    const sandboxEnabled = this.config.get<boolean>('reportRenderer.sandbox', true);
    const maxMemoryMb = this.config.get<number>('reportRenderer.maxMemoryMb', 512);
    const launchTimeoutMs = this.config.get<number>('reportRenderer.launchTimeoutMs', 45_000);
    const disableDevShmUsage = this.config.get<boolean>('reportRenderer.disableDevShmUsage', true);
    const extraArgs = this.config.get<string[]>('reportRenderer.extraArgs', []);
    const fontConfigPath = this.config.get<string | null>('reportRenderer.fontConfigPath', null);
    const chromiumExecutable = this.config.get<string | null>('reportRenderer.chromiumExecutable', null);
    const headlessOverride = this.config.get<string | null>('reportRenderer.headless', null);

    const args = [
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-component-update',
      '--disable-sync',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--disable-background-timer-throttling',
      '--force-color-profile=srgb',
      '--font-render-hinting=none'
    ];

    if (!sandboxEnabled) {
      args.push('--no-sandbox', '--disable-setuid-sandbox');
    }

    if (disableDevShmUsage) {
      args.push('--disable-dev-shm-usage');
    }

    if (maxMemoryMb > 0) {
      args.push(`--js-flags=--max_old_space_size=${maxMemoryMb}`);
    }

    if (Array.isArray(extraArgs) && extraArgs.length > 0) {
      args.push(...extraArgs);
    }

    const headless = this.resolveHeadless(mode, headlessOverride);

    const options: PuppeteerLaunchOptions = {
      headless,
      args,
      devtools: mode === 'local',
      timeout: launchTimeoutMs,
      executablePath: chromiumExecutable ?? undefined,
      env: {
        ...process.env,
        PUPPETEER_DISABLE_HEADLESS_WARNING: 'true',
        ...(fontConfigPath ? { FONTCONFIG_PATH: fontConfigPath } : {})
      }
    };

    return options;
  }

  private resolveHeadless(mode: string, override: string | null): PuppeteerLaunchOptions['headless'] {
    if (override) {
      const normalized = override.trim().toLowerCase();
      if (normalized === 'shell') {
        return 'shell';
      }
      if (['true', 'new', '1', 'yes', 'y', 'on'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'n', 'off'].includes(normalized)) {
        return false;
      }
    }

    return mode === 'local' ? false : true;
  }
}

@Injectable()
export class ReportingProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReportingProcessor.name);
  private readonly browserFactory: BrowserFactory;
  private readonly rendererConfig: RendererConfig;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly queue: JobQueue = jobQueue,
    private readonly reports: ReportStoreType = reportStore,
    browserFactory?: BrowserFactory
  ) {
    this.rendererConfig = this.buildRendererConfig();
    this.browserFactory = browserFactory ?? new PuppeteerBrowserFactory(this.config);
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

  private buildRendererConfig(): RendererConfig {
    return {
      bucket: this.config.get<string>('reportBucket', 'local-reports'),
      templatePath: this.config.get<string | null>('reportRenderer.templatePath', null) ?? undefined,
      maxAttempts: this.config.get<number>('reportRenderer.maxAttempts', 3),
      renderTimeoutMs: this.config.get<number>('reportRenderer.renderTimeoutMs', 90_000),
      retryBackoffMs: this.config.get<number>('reportRenderer.retryBackoffMs', 750)
    };
  }

  private async process(job: JobRecord<ReportJobPayload>): Promise<ReportJobResult> {
    const { assessmentId, formats, requestedBy } = job.payload;
    const assessment = await this.fetchAssessmentSummary(assessmentId);

    const requestedFormats = new Set(formats);
    this.logger.log(`Rendering report ${job.id} for assessment ${assessmentId}`);
    const generatedAt = new Date().toISOString();
    const html = await renderAssessmentReport(
      {
        assessment,
        generatedAt,
        generatedBy: requestedBy,
        bucket: this.rendererConfig.bucket
      },
      { templatePath: this.rendererConfig.templatePath }
    );

    const jobDir = path.join(OUTPUT_ROOT, job.id);
    await fs.mkdir(jobDir, { recursive: true });
    const baseFilename = `assessment-${assessmentId}`;
    const htmlPath = path.join(jobDir, `${baseFilename}.html`);
    await fs.writeFile(htmlPath, html, 'utf-8');

    const artifacts: ReportArtifactRecord[] = [];

    if (requestedFormats.has('html')) {
      const htmlMetadata: ReportArtifactMetadata = {
        version: REPORT_ARTIFACT_VERSION,
        assessmentId,
        generatedAt,
        mediaType: HTML_MEDIA_TYPE,
        byteLength: Buffer.byteLength(html, 'utf-8'),
        bucket: this.rendererConfig.bucket
      };

      artifacts.push(
        this.reports.save({
          jobId: job.id,
          assessmentId,
          format: 'html',
          storageUri: pathToFileURL(htmlPath).toString(),
          filename: `${baseFilename}.html`,
          requestedBy,
          metadata: htmlMetadata
        })
      );
    }

    if (requestedFormats.has('pdf')) {
      const pdfFilename = `${baseFilename}.pdf`;
      const pdfPath = path.join(jobDir, pdfFilename);
      const pdfSize = await this.renderPdfWithRetry({
        html,
        pdfPath,
        jobId: job.id
      });

      const pdfMetadata: ReportArtifactMetadata = {
        version: REPORT_ARTIFACT_VERSION,
        assessmentId,
        generatedAt,
        mediaType: PDF_MEDIA_TYPE,
        byteLength: pdfSize,
        bucket: this.rendererConfig.bucket
      };

      artifacts.push(
        this.reports.save({
          jobId: job.id,
          assessmentId,
          format: 'pdf',
          storageUri: pathToFileURL(pdfPath).toString(),
          filename: pdfFilename,
          requestedBy,
          metadata: pdfMetadata
        })
      );
    }

    this.logger.log(`Report ${job.id} for assessment ${assessmentId} completed`);

    return {
      artifacts,
      notes: {
        bucket: this.rendererConfig.bucket,
        generatedAt,
        version: REPORT_ARTIFACT_VERSION
      }
    };
  }

  private async renderPdfWithRetry(params: { html: string; pdfPath: string; jobId: string }): Promise<number> {
    const { maxAttempts, retryBackoffMs } = this.rendererConfig;
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        return await this.renderPdfOnce(params);
      } catch (error) {
        lastError = error;
        const transient = isTransientError(error);
        if (!transient || attempt >= maxAttempts) {
          this.logger.error(
            `Failed to render PDF for job ${params.jobId} after attempt ${attempt}: ${
              error instanceof Error ? error.message : error
            }`
          );
          throw error instanceof Error ? error : new Error(String(error));
        }

        const backoff = retryBackoffMs * attempt;
        this.logger.warn(
          `Transient rendering error for job ${params.jobId} on attempt ${attempt}. Retrying after ${backoff}ms.`
        );
        await delay(backoff);
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(`Unable to render PDF for job ${params.jobId}`);
  }

  private async renderPdfOnce({
    html,
    pdfPath,
    jobId
  }: {
    html: string;
    pdfPath: string;
    jobId: string;
  }): Promise<number> {
    let browser: BrowserHandle | null = null;
    let page: Page | null = null;

    try {
      await fs.rm(pdfPath, { force: true });
    } catch {
      // no-op if the file does not exist yet
    }

    try {
      browser = await this.browserFactory.launch();
      page = await browser.newPage();
      page.setDefaultTimeout(this.rendererConfig.renderTimeoutMs);

      await this.withTimeout(
        page.setContent(html, { waitUntil: 'networkidle0' }),
        this.rendererConfig.renderTimeoutMs,
        `Timed out while rendering HTML content for job ${jobId}`
      );

      await this.withTimeout(
        page.pdf({
          path: pdfPath,
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true
        }),
        this.rendererConfig.renderTimeoutMs,
        `Timed out while writing PDF for job ${jobId}`
      );

      const stat = await fs.stat(pdfPath);
      return stat.size;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (error) {
          this.logger.warn(`Failed to close page for job ${jobId}: ${error}`);
        }
      }
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          this.logger.warn(`Failed to close browser for job ${jobId}: ${error}`);
        }
      }
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    if (!timeoutMs || timeoutMs <= 0) {
      return promise;
    }

    let timeout: NodeJS.Timeout | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
        })
      ]);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  private async fetchAssessmentSummary(assessmentId: string): Promise<AssessmentSummary> {
    const record = await this.prisma.assessmentProject.findUnique({
      where: { id: assessmentId },
      include: {
        frameworks: true,
        owner: true
      }
    });

    if (!record) {
      this.logger.error(`Assessment ${assessmentId} not found`);
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    return {
      id: record.id,
      name: record.name,
      frameworkIds: record.frameworks.map((framework) => framework.frameworkId),
      status: statusFromPrisma[record.status],
      owner: record.owner?.email ?? record.ownerEmail ?? 'unassigned',
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      progress: {
        satisfied: record.progressSatisfied,
        partial: record.progressPartial,
        unsatisfied: record.progressUnsatisfied,
        total: record.progressTotal
      }
    };
  }
}

const statusFromPrisma: Record<PrismaAssessmentStatus, AssessmentSummary['status']> = {
  [PrismaAssessmentStatus.DRAFT]: 'draft',
  [PrismaAssessmentStatus.IN_PROGRESS]: 'in-progress',
  [PrismaAssessmentStatus.COMPLETE]: 'complete'
};
