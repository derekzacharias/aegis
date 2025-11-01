import {
  AssessmentStore,
  ReportStore,
  createJobQueue
} from '@compliance/shared';
import { ReportingService } from './reporting.service';

describe('ReportingService', () => {
  let assessments: AssessmentStore;
  let reports: ReportStore;
  const queue = createJobQueue();
  let service: ReportingService;

  beforeEach(() => {
    assessments = new AssessmentStore();
    reports = new ReportStore();
    queue.reset();
    service = new ReportingService(queue, assessments, reports);
  });

  it('queues report jobs for known assessments', async () => {
    const [assessment] = assessments.list();
    const job = await service.queueReport(assessment.id, ['pdf'], 'qa@example.com');

    expect(job.status).toBe('queued');
    expect(job.assessmentId).toBe(assessment.id);

    const jobs = await service.list();
    expect(jobs).toHaveLength(1);
  });

  it('throws when assessment cannot be found', async () => {
    await expect(
      service.queueReport('missing-assessment', ['html'], 'qa@example.com')
    ).rejects.toThrow('Assessment missing-assessment not found');
  });
});
