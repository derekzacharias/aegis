import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  AssessmentStatus as PrismaAssessmentStatus,
  ControlStatus as PrismaControlStatus,
  FrameworkStatus as PrismaFrameworkStatus,
  Prisma,
  TaskPriority as PrismaTaskPriority,
  TaskStatus as PrismaTaskStatus,
  UserRole
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { AssessmentService, AssessmentSummary } from './assessment.service';

type AssessmentSummaryPayload = Prisma.AssessmentProjectGetPayload<{
  include: { frameworks: true; owner: true };
}>;

const createMockAssessment = (
  overrides: Partial<AssessmentSummaryPayload> = {}
) => {
  const now = new Date();
  return {
    id: 'assessment-1',
    name: 'Mock Assessment',
    status: PrismaAssessmentStatus.DRAFT,
    organizationId: 'org-1',
    ownerId: 'user-1',
    ownerEmail: 'owner@example.com',
    targetMaturity: null,
    createdAt: now,
    updatedAt: now,
    progressSatisfied: 10,
    progressPartial: 5,
    progressUnsatisfied: 3,
    progressTotal: 18,
    frameworks: [
      {
        id: 'af-1',
        assessmentId: 'assessment-1',
        frameworkId: 'framework-1'
      }
    ],
    owner: {
      id: 'user-1',
      email: 'owner@example.com',
      firstName: 'Owner',
      lastName: 'User',
      role: UserRole.ANALYST,
      passwordHash: 'hash',
      refreshTokenHash: null,
      organizationId: 'org-1',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    },
    reports: [],
    controls: [],
    tasks: [],
    ...overrides
  } as Prisma.AssessmentProjectGetPayload<{ include: { frameworks: true; owner: true } }>;
};

const mockPrisma = {
  assessmentProject: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  assessmentControl: {
    createMany: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
    groupBy: jest.fn()
  },
  task: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn()
  },
  framework: {
    findMany: jest.fn()
  },
  control: {
    findMany: jest.fn()
  },
  user: {
    findFirst: jest.fn()
  },
  assessmentFramework: {
    deleteMany: jest.fn(),
    createMany: jest.fn()
  },
  assessmentAuditLog: {
    create: jest.fn()
  }
};

const service = new AssessmentService(mockPrisma as unknown as PrismaService);
const actor: AuthenticatedUser = {
  id: 'actor-1',
  email: 'actor@example.com',
  role: 'ANALYST',
  organizationId: 'org-1'
};

describe('AssessmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns mapped assessment summaries for an organization', async () => {
      const record = createMockAssessment();

      mockPrisma.assessmentProject.findMany.mockResolvedValueOnce([record]);

      const results = await service.list('org-1');

      expect(results).toHaveLength(1);
      const summary = results[0];
      expect(summary).toMatchObject<Partial<AssessmentSummary>>({
        id: record.id,
        name: record.name,
        status: 'draft',
        frameworkIds: ['framework-1'],
        owner: 'owner@example.com'
      });
      expect(summary.progress.total).toBe(record.progressTotal);
      expect(mockPrisma.assessmentProject.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        orderBy: { updatedAt: 'desc' },
        include: {
          frameworks: true,
          owner: true
        }
      });
    });
  });

  describe('create', () => {
    it('validates frameworks and creates a draft assessment', async () => {
      mockPrisma.framework.findMany.mockResolvedValueOnce([{ id: 'framework-1' }]);
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-1', email: 'owner@example.com' });
      mockPrisma.control.findMany.mockResolvedValueOnce([{ id: 'control-1' }]);
      mockPrisma.assessmentControl.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.assessmentAuditLog.create.mockResolvedValueOnce({});

      const createdRecord = createMockAssessment({
        status: PrismaAssessmentStatus.DRAFT,
        frameworks: [
          {
            id: 'af-1',
            assessmentId: 'assessment-1',
            frameworkId: 'framework-1'
          }
        ]
      });

      mockPrisma.assessmentProject.create.mockResolvedValueOnce(createdRecord);

      const result = await service.create(
        'org-1',
        actor,
        {
          name: 'New Assessment',
          frameworkIds: ['framework-1'],
          owner: 'owner@example.com'
        }
      );

      expect(mockPrisma.framework.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['framework-1'] },
          organizationId: 'org-1',
          status: PrismaFrameworkStatus.PUBLISHED
        },
        select: { id: true }
      });
      expect(mockPrisma.control.findMany).toHaveBeenCalledWith({
        where: {
          frameworkId: {
            in: ['framework-1']
          },
          framework: { organizationId: 'org-1' }
        },
        select: {
          id: true
        }
      });
      expect(mockPrisma.assessmentProject.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Assessment',
          organizationId: 'org-1',
          ownerEmail: 'owner@example.com',
          progressTotal: 1
        }),
        include: {
          frameworks: true,
          owner: true
        }
      });
      expect(mockPrisma.assessmentControl.createMany).toHaveBeenCalledWith({
        data: [
          {
            assessmentId: createdRecord.id,
            controlId: 'control-1',
            status: PrismaControlStatus.UNASSESSED
          }
        ]
      });
      expect(mockPrisma.assessmentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assessmentId: createdRecord.id,
          organizationId: 'org-1',
          action: 'assessment.created'
        })
      });

      expect(result.frameworkIds).toEqual(['framework-1']);
      expect(result.status).toBe('draft');
    });

    it('throws if any frameworks are invalid', async () => {
      mockPrisma.framework.findMany.mockResolvedValueOnce([]);

      await expect(
        service.create(
          'org-1',
          actor,
          {
            name: 'Invalid Assessment',
            frameworkIds: ['missing-framework'],
            owner: 'owner@example.com'
          }
        )
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('throws when assessment cannot be found', async () => {
      mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateStatus('org-1', 'missing', actor, 'complete')
      ).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws when assessment belongs to a different organization', async () => {
      const record = createMockAssessment({ organizationId: 'other-org' });
      mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce(record);

      await expect(
        service.updateStatus('org-1', record.id, actor, 'in-progress')
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updates assessment status when valid', async () => {
      const record = createMockAssessment();
      const updated = createMockAssessment({ status: PrismaAssessmentStatus.COMPLETE });

      mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce(record);
      mockPrisma.assessmentProject.update.mockResolvedValueOnce(updated);
      mockPrisma.assessmentAuditLog.create.mockResolvedValueOnce({});

      const result = await service.updateStatus('org-1', record.id, actor, 'complete');

      expect(mockPrisma.assessmentProject.update).toHaveBeenCalledWith({
        where: { id: record.id },
        data: { status: PrismaAssessmentStatus.COMPLETE },
        include: {
          frameworks: true,
          owner: true
        }
      });
      expect(result.status).toBe('complete');
      expect(mockPrisma.assessmentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assessmentId: record.id,
          organizationId: 'org-1',
          action: 'assessment.statusChanged',
          metadata: {
            from: 'draft',
            to: 'complete'
          }
        })
      });
    });
  });

  describe('updateControl', () => {
    it('updates control status and recalculates progress', async () => {
      const now = new Date();
      const controlRecord = {
        id: 'control-assign-1',
        assessmentId: 'assessment-1',
        assessment: {
          id: 'assessment-1',
          organizationId: 'org-1'
        },
        controlId: 'control-1',
        control: {
          id: 'control-1',
          title: 'AC-1',
          frameworkId: 'framework-1',
          framework: {
            id: 'framework-1',
            name: 'NIST 800-53',
            version: 'Rev 5',
            description: '',
            family: 'AC',
            controlCount: 100
          }
        },
        owner: null,
        dueDate: null,
        comments: null,
        status: PrismaControlStatus.UNASSESSED,
        tasks: [],
        updatedAt: now
      };

      const updatedRecord = {
        ...controlRecord,
        status: PrismaControlStatus.SATISFIED
      };

      mockPrisma.assessmentControl.findUnique
        .mockResolvedValueOnce(controlRecord as unknown)
        .mockResolvedValueOnce(updatedRecord as unknown);

      mockPrisma.assessmentControl.update.mockResolvedValueOnce(updatedRecord);
      mockPrisma.assessmentControl.groupBy.mockResolvedValueOnce([
        {
          status: PrismaControlStatus.SATISFIED,
          _count: { _all: 1 }
        }
      ]);
      mockPrisma.assessmentProject.update.mockResolvedValueOnce({});
      mockPrisma.assessmentAuditLog.create.mockResolvedValueOnce({});

      const result = await service.updateControl('org-1', 'assessment-1', 'control-assign-1', actor, {
        status: 'satisfied'
      });

      expect(mockPrisma.assessmentControl.update).toHaveBeenCalledWith({
        where: { id: 'control-assign-1' },
        data: { status: PrismaControlStatus.SATISFIED }
      });
      expect(mockPrisma.assessmentControl.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: { assessmentId: 'assessment-1' },
        _count: { _all: true }
      });
      expect(mockPrisma.assessmentProject.update).toHaveBeenCalledWith({
        where: { id: 'assessment-1' },
        data: {
          progressSatisfied: 1,
          progressPartial: 0,
          progressUnsatisfied: 0,
          progressTotal: 1
        }
      });
      expect(mockPrisma.assessmentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assessmentId: 'assessment-1',
          organizationId: 'org-1',
          action: 'assessment.controlUpdated',
          metadata: expect.objectContaining({
            controlId: 'control-assign-1',
            status: {
              previous: 'unassessed',
              next: 'satisfied'
            }
          })
        })
      });

      expect(result.status).toBe('satisfied');
    });
  });

  describe('createTask', () => {
    it('creates a task linked to an assessment', async () => {
      mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce({
        id: 'assessment-1',
        organizationId: 'org-1'
      });
      mockPrisma.task.create.mockResolvedValueOnce({
        id: 'task-1',
        title: 'Remediate control gap',
        description: 'Close findings',
        status: PrismaTaskStatus.OPEN,
        priority: PrismaTaskPriority.MEDIUM,
        owner: null,
        ownerId: null,
        assessmentId: 'assessment-1',
        assessmentControlId: null,
        organizationId: 'org-1',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockPrisma.assessmentAuditLog.create.mockResolvedValueOnce({});

      const task = await service.createTask(
        'org-1',
        'assessment-1',
        actor,
        {
          title: 'Remediate control gap'
        }
      );

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assessmentId: 'assessment-1',
          organizationId: 'org-1',
          title: 'Remediate control gap'
        }),
        include: {
          owner: true
        }
      });
      expect(mockPrisma.assessmentAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assessmentId: 'assessment-1',
          action: 'assessment.taskCreated'
        })
      });
      expect(task.title).toBe('Remediate control gap');
      expect(task.status).toBe('open');
    });
  });
});
