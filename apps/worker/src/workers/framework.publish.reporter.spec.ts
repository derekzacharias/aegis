import {
  createJobQueue,
  FRAMEWORK_PUBLISH_REPORT_JOB,
  FrameworkPublishReportPayload
} from '@compliance/shared';
import { FrameworkPublishReporter } from './framework.publish.reporter';

describe('FrameworkPublishReporter', () => {
  const prismaMock: any = {
    assessmentFramework: {
      findMany: jest.fn()
    }
  };

  const metricsMock: any = {
    incrementCounter: jest.fn()
  };

  const queue = createJobQueue();

  beforeEach(() => {
    jest.clearAllMocks();
    queue.reset();
    prismaMock.assessmentFramework.findMany.mockResolvedValue([]);
    new FrameworkPublishReporter(prismaMock, metricsMock, queue);
  });

  it('queues report generation jobs for completed assessments', async () => {
    prismaMock.assessmentFramework.findMany.mockResolvedValue([
      {
        assessmentId: 'assessment-1',
        assessment: {
          organizationId: 'org-1',
          status: 'COMPLETE'
        }
      },
      {
        assessmentId: 'assessment-2',
        assessment: {
          organizationId: 'org-1',
          status: 'IN_PROGRESS'
        }
      },
      {
        assessmentId: 'assessment-1',
        assessment: {
          organizationId: 'org-1',
          status: 'COMPLETE'
        }
      }
    ]);

    const payload: FrameworkPublishReportPayload = {
      organizationId: 'org-1',
      frameworkId: 'framework-1',
      frameworkName: 'Custom Framework',
      frameworkVersion: '1.0',
      publishedAt: new Date('2024-05-02T00:00:00.000Z').toISOString(),
      actor: { userId: 'user-1', email: 'analyst@example.com', name: 'Ana Lyst' }
    };

    const queuedJob = await queue.enqueue<FrameworkPublishReportPayload>(
      FRAMEWORK_PUBLISH_REPORT_JOB,
      payload
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    const processed = queue.get<
      FrameworkPublishReportPayload,
      { notifiedAt: string; attempts: number; assessmentsNotified: number }
    >(queuedJob.id);

    const reportJobs = queue.list<unknown>('report.generate');

    expect(metricsMock.incrementCounter).toHaveBeenCalledWith(
      'framework.publish.report.dispatched',
      1,
      expect.objectContaining({ frameworkId: 'framework-1' })
    );
    expect(reportJobs).toHaveLength(1);
    expect(reportJobs[0].payload).toMatchObject({
      assessmentId: 'assessment-1',
      formats: ['pdf'],
      requestedBy: 'analyst@example.com'
    });
    expect(processed?.status).toBe('completed');
    expect(processed?.result?.notifiedAt).toBeDefined();
    expect(processed?.result?.assessmentsNotified).toBe(1);
    expect(processed?.result?.attempts).toBe(1);
  });

  it('re-enqueues on failure', async () => {
    prismaMock.assessmentFramework.findMany.mockRejectedValue(new Error('boom'));

    const payload: FrameworkPublishReportPayload = {
      organizationId: 'org-1',
      frameworkId: 'framework-1',
      frameworkName: 'Custom Framework',
      frameworkVersion: '1.0',
      publishedAt: new Date('2024-05-02T00:00:00.000Z').toISOString(),
      actor: { userId: 'user-1', email: 'analyst@example.com', name: 'Ana Lyst' },
      attempt: 1
    };

    const queuedJob = await queue.enqueue<FrameworkPublishReportPayload>(
      FRAMEWORK_PUBLISH_REPORT_JOB,
      payload
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    const processed = queue.get<FrameworkPublishReportPayload>(queuedJob.id);
    const requeued = queue
      .list<FrameworkPublishReportPayload>(FRAMEWORK_PUBLISH_REPORT_JOB)
      .filter((job) => job.id !== queuedJob.id);

    expect(processed?.status).toBe('failed');
    expect(metricsMock.incrementCounter).toHaveBeenCalledWith(
      'framework.publish.report.failed',
      1,
      expect.objectContaining({ frameworkId: 'framework-1', attempt: '1' })
    );
    expect(requeued).toHaveLength(2);
    expect(new Set(requeued.map((job) => job.payload.attempt))).toEqual(new Set([2, 3]));
  });
});
