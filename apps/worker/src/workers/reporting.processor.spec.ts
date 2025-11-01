import { promises as fs } from 'fs';
import { ConfigService } from '@nestjs/config';
import { AssessmentStatus as PrismaAssessmentStatus } from '@prisma/client';
import { jobQueue, reportStore, ReportJobPayload } from '@compliance/shared';
import { ReportingProcessor, BrowserFactory } from './reporting.processor';
import { Page } from 'puppeteer';
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

    for (const artifact of artifacts) {
      const filePath = decodeURIComponent(new URL(artifact.storageUri).pathname);
      await fs.access(filePath);
      const stat = await fs.stat(filePath);
      expect(stat.size).toBeGreaterThan(0);
    }
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
