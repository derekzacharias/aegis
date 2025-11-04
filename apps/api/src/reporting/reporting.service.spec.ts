import { ReportStore, createJobQueue } from '@compliance/shared';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportingService', () => {
  let reports: ReportStore;
  const queue = createJobQueue();
  let service: ReportingService;
  const mockPrisma = {
    assessmentProject: {
      findUnique: jest.fn()
    }
  };

  beforeEach(() => {
    reports = new ReportStore();
    queue.reset();
    jest.clearAllMocks();
    service = new ReportingService(mockPrisma as unknown as PrismaService, queue, reports);
  });

  it('queues report jobs for known assessments', async () => {
    mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce({
      id: 'assessment-1',
      organizationId: 'org-1'
    });

    const job = await service.queueReport('org-1', 'assessment-1', ['pdf'], 'qa@example.com');

    expect(job.status).toBe('queued');
    expect(job.assessmentId).toBe('assessment-1');
    expect(job.artifacts).toEqual([]);
    expect(mockPrisma.assessmentProject.findUnique).toHaveBeenCalledWith({
      where: { id: 'assessment-1' },
      select: { id: true, organizationId: true }
    });

    const jobs = await service.list();
    expect(jobs).toHaveLength(1);
  });

  it('includes artifact summaries when reports are available', async () => {
    mockPrisma.assessmentProject.findUnique.mockResolvedValue({
      id: 'assessment-2',
      organizationId: 'org-1'
    });

    const queued = await service.queueReport('org-1', 'assessment-2', ['pdf', 'html'], 'ops@example.com');

    reports.save({
      jobId: queued.jobId,
      assessmentId: 'assessment-2',
      format: 'pdf',
      storageUri: 'file:///tmp/report.pdf',
      filename: 'assessment-2.pdf',
      requestedBy: 'ops@example.com',
      metadata: {
        version: '2024.11',
        assessmentId: 'assessment-2',
        generatedAt: new Date().toISOString(),
        mediaType: 'application/pdf',
        byteLength: 1024,
        bucket: 'local-reports'
      }
    });

    const fetched = await service.get(queued.jobId);

    expect(fetched.artifacts).toHaveLength(1);
    const artifact = fetched.artifacts[0];
    expect(artifact.filename).toBe('assessment-2.pdf');
    expect(artifact.metadata.mediaType).toBe('application/pdf');
    expect(fetched.artifactIds).toEqual([artifact.id]);
  });

  it('throws when assessment cannot be found', async () => {
    mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.queueReport('org-1', 'missing-assessment', ['html'], 'qa@example.com')
    ).rejects.toThrow('Assessment missing-assessment not found');
  });

  it('throws when assessment belongs to a different organization', async () => {
    mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce({
      id: 'assessment-1',
      organizationId: 'other-org'
    });

    await expect(
      service.queueReport('org-1', 'assessment-1', ['html'], 'qa@example.com')
    ).rejects.toThrow('Assessment assessment-1 not found');
  });
});
