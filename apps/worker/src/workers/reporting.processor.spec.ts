import { promises as fs } from 'fs';
import { ConfigService } from '@nestjs/config';
import { AssessmentStatus as PrismaAssessmentStatus } from '@prisma/client';
import { jobQueue, reportStore, ReportArtifactRecord, ReportJobPayload } from '@compliance/shared';
import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { ReportingProcessor, BrowserFactory, PuppeteerBrowserFactory } from './reporting.processor';
import { PrismaService } from '../prisma.service';

class InMemoryBrowserFactory implements BrowserFactory {
  async launch() {
    return new InMemoryBrowser();
  }
}

class InMemoryBrowser {
  async newPage(): Promise<Page> {
    return new InMemoryPage() as unknown as Page;
  }

  async close() {
    // no-op
  }
}

class InMemoryPage {
  private html = '';
  private timeout = 0;

  async setDefaultTimeout(timeout: number) {
    this.timeout = timeout;
    return undefined;
  }

  async setContent(html: string) {
    this.html = html;
  }

  async pdf(options: { path?: string }) {
    if (options.path) {
      await fs.writeFile(options.path, this.html || '%PDF-1.4');
    }
  }

  async close() {
    // no-op
  }
}

describe('ReportingProcessor', () => {
  const browserFactory = new InMemoryBrowserFactory();
  const configService = {
    get: <T>(_key: string, defaultValue?: T) => defaultValue ?? (undefined as T)
  } as unknown as ConfigService;
  const mockPrisma = {
    assessmentProject: {
      findUnique: jest.fn()
    }
  };

  let processor: ReportingProcessor;

  beforeEach(async () => {
    jobQueue.reset();
    reportStore.clear();
    jest.clearAllMocks();

    processor = new ReportingProcessor(
      configService,
      mockPrisma as unknown as PrismaService,
      jobQueue,
      reportStore,
      browserFactory
    );

    await processor.onModuleInit();
  });

  afterEach(() => {
    processor.onModuleDestroy();
    jobQueue.reset();
    reportStore.clear();
  });

  it('renders artifacts for queued report jobs', async () => {
    const now = new Date();
    mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce({
      id: 'assessment-1',
      name: 'FedRAMP Moderate Baseline Readiness',
      status: PrismaAssessmentStatus.DRAFT,
      ownerEmail: 'compliance-team@example.com',
      owner: { email: 'compliance-team@example.com' },
      organizationId: 'org-1',
      createdAt: now,
      updatedAt: now,
      progressSatisfied: 142,
      progressPartial: 98,
      progressUnsatisfied: 34,
      progressTotal: 310,
      frameworks: [
        {
          id: 'af-1',
          assessmentId: 'assessment-1',
          frameworkId: 'nist-800-53-rev5'
        }
      ]
    });

    const job = await jobQueue.enqueue<ReportJobPayload>('report.generate', {
      assessmentId: 'assessment-1',
      formats: ['html', 'pdf'],
      requestedBy: 'qa@example.com'
    });

    const completedJob = await waitForCompletion(job.id);

    expect(completedJob.status).toBe('completed');
    expect(mockPrisma.assessmentProject.findUnique).toHaveBeenCalledWith({
      where: { id: 'assessment-1' },
      include: {
        frameworks: true,
        owner: true
      }
    });
    const artifacts = reportStore.findByJob(job.id);
    expect(artifacts).toHaveLength(2);

    const pdfArtifact = artifacts.find((artifact) => artifact.format === 'pdf');
    const htmlArtifact = artifacts.find((artifact) => artifact.format === 'html');

    for (const artifact of artifacts) {
      const filePath = decodeURIComponent(new URL(artifact.storageUri).pathname);
      await fs.access(filePath);
      const stat = await fs.stat(filePath);
      expect(stat.size).toBeGreaterThan(0);
      expectArtifactMetadata(artifact);
    }

    expect(pdfArtifact?.metadata.mediaType).toBe('application/pdf');
    expect(htmlArtifact?.metadata.mediaType).toContain('text/html');
  });

  it('retries transient PDF rendering failures', async () => {
    processor.onModuleDestroy();
    jobQueue.reset();
    reportStore.clear();

    const flakyBrowserFactory = new FlakyBrowserFactory(1);
    const flakyProcessor = new ReportingProcessor(
      configService,
      mockPrisma as unknown as PrismaService,
      jobQueue,
      reportStore,
      flakyBrowserFactory
    );

    await flakyProcessor.onModuleInit();
    const now = new Date();

    mockPrisma.assessmentProject.findUnique.mockResolvedValue({
      id: 'assessment-2',
      name: 'Transient Failure',
      status: PrismaAssessmentStatus.DRAFT,
      ownerEmail: 'owner@example.com',
      owner: { email: 'owner@example.com' },
      organizationId: 'org-1',
      createdAt: now,
      updatedAt: now,
      progressSatisfied: 10,
      progressPartial: 5,
      progressUnsatisfied: 3,
      progressTotal: 18,
      frameworks: []
    });

    const job = await jobQueue.enqueue<ReportJobPayload>('report.generate', {
      assessmentId: 'assessment-2',
      formats: ['pdf'],
      requestedBy: 'qa@example.com'
    });

    const completed = await waitForCompletion(job.id);
    expect(completed.status).toBe('completed');
    expect(flakyBrowserFactory.launchCount).toBeGreaterThanOrEqual(2);
    expect(reportStore.findByJob(job.id)).toHaveLength(1);

    flakyProcessor.onModuleDestroy();
  });
});

async function waitForCompletion(jobId: string, timeoutMs = 2000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const current = jobQueue.get<ReportJobPayload>(jobId);
    if (current && current.status === 'completed') {
      return current;
    }
    if (current && current.status === 'failed') {
      throw new Error(`Job ${jobId} failed: ${current.error ?? 'unknown error'}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`Timed out waiting for job ${jobId} completion`);
}

class FlakyBrowserFactory implements BrowserFactory {
  private failuresRemaining: number;
  public launchCount = 0;

  constructor(private readonly failAttempts = 1) {
    this.failuresRemaining = failAttempts;
  }

  async launch(): Promise<Browser> {
    this.launchCount += 1;
    return new FlakyBrowser(() => {
      if (this.failuresRemaining > 0) {
        this.failuresRemaining -= 1;
        throw new Error('Execution context was destroyed');
      }
    }) as unknown as Browser;
  }
}

class FlakyBrowser {
  constructor(private readonly maybeFail: () => void) {}

  async newPage(): Promise<Page> {
    return new FlakyPage(this.maybeFail) as unknown as Page;
  }

  async close() {
    // no-op
  }
}

class FlakyPage extends InMemoryPage {
  constructor(private readonly maybeFail: () => void) {
    super();
  }

  override async pdf(options: { path?: string }) {
    this.maybeFail();
    return super.pdf(options);
  }
}

function expectArtifactMetadata(artifact: ReportArtifactRecord) {
  expect(artifact.metadata.version).toBeDefined();
  expect(artifact.metadata.assessmentId).toBe(artifact.assessmentId);
  expect(typeof artifact.metadata.byteLength).toBe('number');
  expect(artifact.metadata.byteLength ?? 0).toBeGreaterThan(0);
  expect(artifact.metadata.generatedAt).toBeDefined();
  expect(artifact.metadata.bucket).toBe('local-reports');
}

describe('PuppeteerBrowserFactory', () => {
  const noopBrowser = {
    newPage: jest.fn(),
    close: jest.fn()
  } as unknown as Browser;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('configures sandboxed headless mode for CI environments', async () => {
    const launchSpy = jest.spyOn(puppeteer, 'launch').mockResolvedValue(noopBrowser);
    const config = createConfigService({
      'reportRenderer.mode': 'ci',
      'reportRenderer.sandbox': true,
      'reportRenderer.disableDevShmUsage': true
    });

    const factory = new PuppeteerBrowserFactory(config);
    await factory.launch();

    expect(launchSpy).toHaveBeenCalled();
    const options = launchSpy.mock.calls[0][0] as PuppeteerLaunchOptions;
    expect(options.headless).toBe(true);
    expect(options.devtools).toBe(false);
    expect(options.args).not.toContain('--no-sandbox');
    expect(options.args).toContain('--disable-dev-shm-usage');
  });

  it('configures developer-friendly settings for local mode', async () => {
    const launchSpy = jest.spyOn(puppeteer, 'launch').mockResolvedValue(noopBrowser);
    const config = createConfigService({
      'reportRenderer.mode': 'local',
      'reportRenderer.sandbox': false,
      'reportRenderer.maxMemoryMb': 1024,
      'reportRenderer.extraArgs': ['--remote-debugging-port=9222']
    });

    const factory = new PuppeteerBrowserFactory(config);
    await factory.launch();

    const options = launchSpy.mock.calls[0][0] as PuppeteerLaunchOptions;
    expect(options.headless).toBe(false);
    expect(options.devtools).toBe(true);
    expect(options.args).toEqual(expect.arrayContaining(['--no-sandbox', '--remote-debugging-port=9222']));
  });
});

function createConfigService(overrides: Record<string, unknown>): ConfigService {
  return {
    get: <T>(key: string, defaultValue?: T) =>
      (overrides[key] as T | undefined) ?? (defaultValue as T)
  } as unknown as ConfigService;
}
