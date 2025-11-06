import { FrameworkProcessor } from './framework.processor';
import {
  createJobQueue,
  FRAMEWORK_PUBLISH_JOB,
  FRAMEWORK_PUBLISH_REPORT_JOB,
  FrameworkPublishJobPayload,
  FrameworkPublishReportPayload
} from '@compliance/shared';
import { FrameworkPublishReporter } from './framework.publish.reporter';

describe('FrameworkProcessor', () => {
  const prismaMock: any = {
    framework: {
      findUnique: jest.fn()
    },
    frameworkWarmupCache: {
      upsert: jest.fn()
    },
    assessmentFramework: {
      findMany: jest.fn()
    }
  };

  const metricsMock: any = {
    incrementCounter: jest.fn()
  };

  const frameworkServiceMock: any = {
    listControls: jest.fn()
  };

  const crosswalkServiceMock: any = {
    generateCrosswalk: jest.fn()
  };

  const queue = createJobQueue();

  let processor: FrameworkProcessor;

  const buildJob = (payload: FrameworkPublishJobPayload) => ({
    id: 'job-1',
    name: FRAMEWORK_PUBLISH_JOB,
    payload,
    status: 'queued' as const,
    enqueuedAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    result: null,
    error: null
  });

  const invoke = async (payload: FrameworkPublishJobPayload) => {
    const job = buildJob(payload);
    return (processor as unknown as { handle: (jobRecord: typeof job) => Promise<unknown> }).handle(job);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queue.reset();
    prismaMock.framework.findUnique.mockResolvedValue({
      id: 'framework-1',
      name: 'Test',
      version: '1.0'
    });
    frameworkServiceMock.listControls.mockResolvedValue({
      frameworkId: 'framework-1',
      framework: {
        id: 'framework-1',
        slug: 'fw',
        name: 'Test',
        version: '1.0',
        description: 'desc',
        family: 'CUSTOM',
        status: 'PUBLISHED',
        isCustom: true,
        controlCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      },
      total: 1,
      page: 1,
      pageSize: 25,
      hasNextPage: false,
      items: [],
      facets: {
        families: [],
        priorities: [],
        kinds: [],
        statuses: []
      }
    });

    crosswalkServiceMock.generateCrosswalk.mockResolvedValue({
      frameworkId: 'framework-1',
      generatedAt: new Date().toISOString(),
      total: 0,
      matches: [],
      filters: {}
    });

    prismaMock.assessmentFramework.findMany.mockResolvedValue([]);

    new FrameworkPublishReporter(prismaMock, metricsMock, queue);

    processor = new FrameworkProcessor(
      prismaMock,
      metricsMock,
      queue,
      frameworkServiceMock,
      crosswalkServiceMock
    );
  });

  it('generates and stores warmup cache', async () => {
    const payload: FrameworkPublishJobPayload = {
      frameworkId: 'framework-1',
      organizationId: 'org-1',
      frameworkName: 'Custom Framework',
      frameworkVersion: '1.0',
      publishedAt: new Date('2024-05-02T00:00:00.000Z').toISOString(),
      actor: { userId: 'user-1', email: 'analyst@example.com', name: 'Analyst' },
      attempt: 1
    };

    const result = (await invoke(payload)) as {
      crosswalkMatches: number;
      controlCount: number;
      warmedAt: string;
      attempts: number;
      organizationId: string;
      frameworkId: string;
    };

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.crosswalkMatches).toBe(0);
    expect(result.controlCount).toBe(1);
    expect(result.warmedAt).toBeDefined();
    expect(result.organizationId).toBe('org-1');
    expect(result.frameworkId).toBe('framework-1');
    expect(result.attempts).toBe(1);
    expect(prismaMock.frameworkWarmupCache.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { frameworkId: 'framework-1' },
        create: expect.objectContaining({
          frameworkId: 'framework-1',
          organizationId: 'org-1',
          generatedById: 'user-1'
        })
      })
    );
    expect(metricsMock.incrementCounter).toHaveBeenCalledWith(
      'framework.publish.warmup.completed',
      1,
      expect.objectContaining({ frameworkId: 'framework-1', attempt: '1' })
    );
    expect(metricsMock.incrementCounter).toHaveBeenCalledWith(
      'framework.publish.report.enqueued',
      1,
      expect.objectContaining({ frameworkId: 'framework-1' })
    );
    const reportJobs = queue.list<FrameworkPublishReportPayload>(
      FRAMEWORK_PUBLISH_REPORT_JOB
    );
    expect(reportJobs).toHaveLength(1);
    expect(reportJobs[0].status).toBe('completed');
  });

  it('re-enqueues on failure and surfaces error', async () => {
    crosswalkServiceMock.generateCrosswalk.mockRejectedValue(new Error('boom'));

    const payload: FrameworkPublishJobPayload = {
      frameworkId: 'framework-1',
      organizationId: 'org-1',
      frameworkName: 'Custom Framework',
      frameworkVersion: '1.0',
      publishedAt: new Date('2024-05-02T00:00:00.000Z').toISOString(),
      actor: { userId: 'user-1', email: 'analyst@example.com', name: 'Analyst' },
      attempt: 1
    };

    await expect(invoke(payload)).rejects.toThrow('boom');

    expect(metricsMock.incrementCounter).toHaveBeenCalledWith(
      'framework.publish.warmup.failed',
      1,
      expect.objectContaining({ frameworkId: 'framework-1', attempt: '1' })
    );

    const queued = queue.list<FrameworkPublishJobPayload>(FRAMEWORK_PUBLISH_JOB);
    expect(queued).toHaveLength(1);
    expect(queued[0].payload.attempt).toBe(2);
    const reportJobs = queue.list(FRAMEWORK_PUBLISH_REPORT_JOB);
    expect(reportJobs).toHaveLength(0);
  });
});
