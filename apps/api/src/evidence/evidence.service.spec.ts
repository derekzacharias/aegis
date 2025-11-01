import { BadRequestException } from '@nestjs/common';
import {
  EvidenceIngestionStatus,
  EvidenceStatus,
  FrameworkFamily,
  Prisma
} from '@prisma/client';
import { EvidenceService } from './evidence.service';
import { PrismaService } from '../prisma/prisma.service';
import { EvidenceStorageService } from './evidence-storage.service';
import { createJobQueue } from '@compliance/shared';
import { AuthenticatedUser } from '../auth/types/auth.types';

const mockPrisma = {
  evidenceItem: {
    findMany: jest.fn(),
    create: jest.fn()
  },
  evidenceStatusHistory: {
    create: jest.fn()
  },
  framework: {
    findMany: jest.fn()
  }
};

const storageService = {
  getMode: jest.fn().mockReturnValue('local'),
  getBucket: jest.fn().mockReturnValue('local-evidence'),
  getLocalDirectory: jest.fn().mockReturnValue('/tmp/evidence'),
  createUploadToken: jest.fn()
} as unknown as EvidenceStorageService;

const queue = createJobQueue();

const service = new EvidenceService(
  mockPrisma as unknown as PrismaService,
  storageService,
  queue
);

const user: AuthenticatedUser = {
  id: 'user-1',
  email: 'analyst@example.com',
  firstName: 'Analyst',
  lastName: 'Example',
  role: 'ANALYST',
  organizationId: 'org-1'
};

type EvidenceWithRelations = Prisma.EvidenceItemGetPayload<{
  include: {
    reviewer: true;
    uploadedBy: true;
    frameworks: {
      include: {
        framework: true;
      };
    };
  };
}>;

describe('EvidenceService.createSimple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates evidence records with derived metadata', async () => {
    const now = new Date();
    mockPrisma.framework.findMany.mockResolvedValueOnce([{ id: 'framework-1' }]);

    const createdRecord = ({
      id: 'evidence-1',
      name: 'Policy Document',
      organizationId: 'org-1',
      storageUri: 'file:///tmp/evidence/organizations/org-1/evidence/test.pdf',
      storageKey: 'organizations/org-1/evidence/test.pdf',
      storageProvider: 'LOCAL',
      originalFilename: 'policy-document.pdf',
      contentType: 'application/pdf',
      fileSize: 2048,
      fileType: 'pdf',
      sizeInKb: 2,
      checksum: null,
      metadata: {
        controlIds: ['ac-2'],
        nextAction: 'Pending analyst review',
        origin: 'quick-create',
        uploadedByLabel: 'analyst@example.com'
      },
      uploadedById: user.id,
      uploadedByEmail: user.email,
      uploadedAt: now,
      reviewerId: null,
      reviewDue: null,
      retentionPeriodDays: null,
      retentionReason: null,
      retentionExpiresAt: null,
      status: EvidenceStatus.PENDING,
      ingestionStatus: EvidenceIngestionStatus.PENDING,
      ingestionNotes: null,
      nextAction: 'Pending analyst review',
      lastStatusChangeAt: now,
      lastReviewed: null,
      displayFrameworkIds: ['framework-1'],
      displayControlIds: ['ac-2'],
      frameworks: [
        {
          id: 'link-1',
          evidenceId: 'evidence-1',
          frameworkId: 'framework-1',
          framework: {
            id: 'framework-1',
            name: 'Framework 1',
            organizationId: 'org-1',
            version: '1.0',
            description: 'Seeded framework',
            family: FrameworkFamily.CUSTOM,
            controlCount: 1
          }
        }
      ],
      uploadedBy: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'ANALYST',
        passwordHash: 'hash',
        refreshTokenHash: null,
        organizationId: user.organizationId,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
      },
      reviewer: null
    } as unknown) as EvidenceWithRelations;

    mockPrisma.evidenceItem.create.mockResolvedValueOnce(createdRecord);

    const result = await service.createSimple(user, {
      name: 'Policy Document',
      controlIds: ['ac-2'],
      frameworkIds: ['framework-1'],
      uploadedBy: user.email,
      status: 'pending',
      fileType: 'pdf',
      sizeInKb: 2
    });

    expect(mockPrisma.framework.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['framework-1'] } },
      select: { id: true }
    });

    expect(mockPrisma.evidenceItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Policy Document',
        organizationId: 'org-1',
        fileType: 'pdf',
        sizeInKb: 2,
        displayControlIds: ['ac-2'],
        displayFrameworkIds: ['framework-1'],
        nextAction: 'Pending analyst review'
      }),
      include: {
        reviewer: true,
        uploadedBy: true,
        frameworks: {
          include: {
            framework: true
          }
        }
      }
    });

    expect(mockPrisma.evidenceStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        evidenceId: 'evidence-1',
        toStatus: EvidenceStatus.PENDING
      })
    });

    expect(result.frameworks[0].id).toBe('framework-1');
  });

  it('throws when frameworks are missing', async () => {
    mockPrisma.framework.findMany.mockResolvedValueOnce([]);

    await expect(
      service.createSimple(user, {
        name: 'Incomplete Evidence',
        controlIds: [],
        frameworkIds: ['invalid'],
        uploadedBy: user.email,
        status: 'pending',
        fileType: 'pdf',
        sizeInKb: 1
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
