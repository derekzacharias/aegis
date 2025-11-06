import {
  ASSESSMENT_AUTOMATION_JOB,
  ASSESSMENT_AUTOMATION_RESULT_JOB,
  AssessmentAutomationJobPayload,
  createJobQueue
} from '@compliance/shared';
import { AssessmentAutomationProcessor } from './assessment.automation.processor';

describe('AssessmentAutomationProcessor', () => {
  const metricsMock = {
    incrementCounter: jest.fn(),
    recordDuration: jest.fn()
  };

  const queue = createJobQueue();
  let processor: AssessmentAutomationProcessor;

  const enqueue = (payload: AssessmentAutomationJobPayload) =>
    queue.enqueue(ASSESSMENT_AUTOMATION_JOB, payload);

  beforeEach(async () => {
    jest.clearAllMocks();
    queue.reset();
    processor = new AssessmentAutomationProcessor(metricsMock as any, queue);
    await processor.onModuleInit();
  });

  afterEach(() => {
    processor.onModuleDestroy();
  });

  it('accepts automation job and enqueues result placeholder', async () => {
    await enqueue({
      assessmentId: 'assessment-1',
      frameworkIds: ['nist-800-53'],
      executionMode: 'ssh',
      tooling: ['inspec'],
      targets: [
        {
          id: 'target-1',
          hostname: 'server-1.example.com',
          credentialAlias: 'ssh-prod'
        }
      ],
      requestedBy: {
        actorId: 'user-1',
        actorType: 'user',
        organizationId: 'org-1'
      },
      options: {
        dryRun: true,
        concurrency: 2
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(metricsMock.incrementCounter).toHaveBeenCalledWith(
      'assessment.automation.jobs.accepted',
      1,
      expect.objectContaining({
        executionMode: 'ssh',
        dry_run: true,
        tooling: 'inspec'
      })
    );

    const resultJobs = queue.list(ASSESSMENT_AUTOMATION_RESULT_JOB);
    expect(resultJobs).toHaveLength(1);
    const [resultJob] = resultJobs;
    expect(resultJob.payload).toMatchObject({
      assessmentId: 'assessment-1',
      frameworkIds: ['nist-800-53'],
      executionMode: 'ssh',
      success: true,
      targetsProcessed: 1
    });
  });

  it('fails jobs that are missing targets', async () => {
    await enqueue({
      assessmentId: 'assessment-1',
      frameworkIds: ['nist-800-53'],
      executionMode: 'ssh',
      tooling: ['inspec'],
      targets: [],
      requestedBy: {
        actorId: 'user-1',
        actorType: 'user',
        organizationId: 'org-1'
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const jobRecords = queue.list(ASSESSMENT_AUTOMATION_JOB);
    expect(jobRecords[0].status).toBe('failed');
    expect(jobRecords[0].error).toMatch(/require at least one target/i);
  });
});
