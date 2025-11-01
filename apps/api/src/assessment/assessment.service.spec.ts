import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssessmentStatus as PrismaAssessmentStatus, Prisma, UserRole } from '@prisma/client';
import { AssessmentService, AssessmentSummary } from './assessment.service';
import { PrismaService } from '../prisma/prisma.service';

const createMockAssessment = (
  overrides: Partial<Prisma.AssessmentProjectGetPayload<{ include: { frameworks: true; owner: true } }>> = {}
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
    update: jest.fn()
  },
  framework: {
    findMany: jest.fn()
  },
  user: {
    findFirst: jest.fn()
  }
};

const service = new AssessmentService(mockPrisma as unknown as PrismaService);

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
      mockPrisma.user.findFirst.mockResolvedValueOnce({ id: 'user-1' });

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

      const result = await service.create('org-1', {
        name: 'New Assessment',
        frameworkIds: ['framework-1'],
        owner: 'owner@example.com'
      });

      expect(mockPrisma.framework.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['framework-1'] } },
        select: { id: true }
      });
      expect(mockPrisma.assessmentProject.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Assessment',
          organizationId: 'org-1',
          ownerEmail: 'owner@example.com'
        }),
        include: {
          frameworks: true,
          owner: true
        }
      });

      expect(result.frameworkIds).toEqual(['framework-1']);
      expect(result.status).toBe('draft');
    });

    it('throws if any frameworks are invalid', async () => {
      mockPrisma.framework.findMany.mockResolvedValueOnce([]);

      await expect(
        service.create('org-1', {
          name: 'Invalid Assessment',
          frameworkIds: ['missing-framework'],
          owner: 'owner@example.com'
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('throws when assessment cannot be found', async () => {
      mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateStatus('org-1', 'missing', 'complete')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throws when assessment belongs to a different organization', async () => {
      const record = createMockAssessment({ organizationId: 'other-org' });
      mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce(record);

      await expect(service.updateStatus('org-1', record.id, 'in-progress')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('updates assessment status when valid', async () => {
      const record = createMockAssessment();
      const updated = createMockAssessment({ status: PrismaAssessmentStatus.COMPLETE });

      mockPrisma.assessmentProject.findUnique.mockResolvedValueOnce(record);
      mockPrisma.assessmentProject.update.mockResolvedValueOnce(updated);

      const result = await service.updateStatus('org-1', record.id, 'complete');

      expect(mockPrisma.assessmentProject.update).toHaveBeenCalledWith({
        where: { id: record.id },
        data: { status: PrismaAssessmentStatus.COMPLETE },
        include: {
          frameworks: true,
          owner: true
        }
      });
      expect(result.status).toBe('complete');
    });
  });
});
