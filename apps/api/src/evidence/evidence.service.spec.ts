import { BadRequestException } from '@nestjs/common';
import {
  EvidenceIngestionStatus,
  EvidenceStatus,
  ControlStatus,
  FrameworkFamily,
  Prisma
} from '@prisma/client';
import { EvidenceService } from './evidence.service';
import { PrismaService } from '../prisma/prisma.service';
import { EvidenceStorageService } from './evidence-storage.service';
import { createJobQueue } from '@compliance/shared';
import { AuthenticatedUser } from '../auth/types/auth.types';

const prismaMock: any = {
  evidenceItem: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  evidenceStatusHistory: {
    create: jest.fn()
  },
  evidenceUploadRequest: {
    update: jest.fn()
  },
  framework: {
    findMany: jest.fn()
  },
  assessmentControl: {
    findMany: jest.fn()
  },
  assessmentEvidence: {
    deleteMany: jest.fn(),
    createMany: jest.fn()
  }
};

prismaMock.$transaction = jest.fn(async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
  callback(prismaMock)
);

const storageService = {
  getMode: jest.fn().mockReturnValue('local'),
  getBucket: jest.fn().mockReturnValue('local-evidence'),
  getLocalDirectory: jest.fn().mockReturnValue('/tmp/evidence'),
  createUploadToken: jest.fn(),
  resolveLocalPath: jest.fn((key: string) => `/tmp/evidence/${key}`)
} as unknown as EvidenceStorageService;

const queue = createJobQueue();

const service = new EvidenceService(prismaMock as unknown as PrismaService, storageService, queue);

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
    prismaMock.framework.findMany.mockResolvedValueOnce([{ id: 'framework-1' }]);

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
      controls: [],
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

    prismaMock.evidenceItem.create.mockResolvedValueOnce(createdRecord);

    const result = await service.createSimple(user, {
      name: 'Policy Document',
      controlIds: ['ac-2'],
      frameworkIds: ['framework-1'],
      uploadedBy: user.email,
      status: 'pending',
      fileType: 'pdf',
      sizeInKb: 2
    });

    expect(prismaMock.framework.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['framework-1'] },
        organizationId: user.organizationId
      },
      select: { id: true }
    });

    expect(prismaMock.evidenceItem.create).toHaveBeenCalledWith({
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
        },
        controls: {
          include: {
            assessmentControl: {
              include: {
                assessment: true,
                control: true
              }
            }
          }
        }
      }
    });

    expect(prismaMock.evidenceStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        evidenceId: 'evidence-1',
        toStatus: EvidenceStatus.PENDING
      })
    });

    expect(result.frameworks[0].id).toBe('framework-1');
  });

  it('throws when frameworks are missing', async () => {
    prismaMock.framework.findMany.mockResolvedValueOnce([]);

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

describe('EvidenceService.updateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('merges manual control identifiers and updates metadata fields', async () => {
    const now = new Date();

    const existingRecord = ({
      id: 'evidence-1',
      organizationId: 'org-1',
      name: 'Baseline Policy',
      storageUri: 's3://seed/policy.pdf',
      storageKey: 'seed/policy.pdf',
      storageProvider: 'S3',
      originalFilename: 'policy.pdf',
      contentType: 'application/pdf',
      fileSize: 2048,
      fileType: 'pdf',
      sizeInKb: 2,
      checksum: null,
      metadata: {
        manualControlIds: ['ac-1'],
        controlIds: ['ac-1'],
        tags: ['baseline']
      },
      uploadedById: user.id,
      uploadedByEmail: user.email,
      reviewerId: null,
      reviewDue: null,
      retentionPeriodDays: null,
      retentionReason: null,
      retentionExpiresAt: null,
      status: EvidenceStatus.PENDING,
      ingestionStatus: EvidenceIngestionStatus.PENDING,
      ingestionNotes: null,
      nextAction: null,
      lastReviewed: null,
      displayControlIds: ['ac-1'],
      displayFrameworkIds: ['framework-1'],
      controls: [],
      frameworks: [
        {
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
      reviewer: null,
      uploadedBy: null,
      uploadedAt: now
    } as unknown) as Prisma.EvidenceItemGetPayload<{
      include: {
        reviewer: true;
        uploadedBy: true;
        frameworks: {
          include: {
            framework: true;
          };
        };
        controls: {
          include: {
            assessmentControl: {
              include: {
                assessment: true;
                control: true;
              };
            };
          };
        };
      };
    }>;

    const updatedRecord = ({
      ...existingRecord,
      name: 'Renamed Evidence',
      metadata: {
        manualControlIds: ['ac-1', 'ac-7'],
        controlIds: ['ac-1', 'ac-7'],
        tags: ['baseline', 'quarterly'],
        categories: ['policy'],
        notes: 'updated note',
        source: 'manual-test'
      },
      nextAction: 'Assign reviewer',
      displayControlIds: ['ac-1', 'ac-7']
    } as unknown) as typeof existingRecord;

    prismaMock.evidenceItem.findUnique.mockResolvedValueOnce(existingRecord);
    prismaMock.framework.findMany.mockResolvedValueOnce([{ id: 'framework-1' }]);
    prismaMock.evidenceItem.update.mockResolvedValueOnce(updatedRecord);

    const result = await service.updateMetadata(user, 'evidence-1', {
      name: 'Renamed Evidence',
      controlIds: ['ac-1', 'ac-7'],
      tags: ['baseline', 'quarterly'],
      categories: ['policy'],
      notes: 'updated note',
      nextAction: 'Assign reviewer',
      source: 'manual-test'
    });

    expect(prismaMock.evidenceItem.update).toHaveBeenCalledWith({
      where: { id: 'evidence-1' },
      data: expect.objectContaining({
        displayControlIds: ['ac-1', 'ac-7'],
        metadata: expect.any(Object)
      }),
      include: expect.any(Object)
    });

    expect(result.metadata.tags).toEqual(['baseline', 'quarterly']);
    expect(result.metadata.manualControlIds).toEqual(['ac-1', 'ac-7']);
  });
});

describe('EvidenceService.updateAssessmentLinks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reconciles attachments across assessment controls', async () => {
    const now = new Date();

    const evidenceRecord = ({
      id: 'evidence-1',
      organizationId: 'org-1',
      name: 'Attachment Test',
      storageUri: 's3://seed/attachment.pdf',
      storageKey: 'seed/attachment.pdf',
      storageProvider: 'S3',
      originalFilename: 'attachment.pdf',
      contentType: 'application/pdf',
      fileSize: 1024,
      fileType: 'pdf',
      sizeInKb: 1,
      checksum: null,
      metadata: {
        manualControlIds: [],
        controlIds: [],
        assessmentControlIds: ['assessment-control-1']
      },
      uploadedById: user.id,
      uploadedByEmail: user.email,
      reviewerId: null,
      reviewDue: null,
      retentionPeriodDays: null,
      retentionReason: null,
      retentionExpiresAt: null,
      status: EvidenceStatus.PENDING,
      ingestionStatus: EvidenceIngestionStatus.PENDING,
      ingestionNotes: null,
      nextAction: null,
      lastReviewed: null,
      displayControlIds: ['ac-1'],
      displayFrameworkIds: ['framework-1'],
      frameworks: [
        {
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
      controls: [
        {
          assessmentControlId: 'assessment-control-1',
          assessmentControl: {
            id: 'assessment-control-1',
            assessmentId: 'assessment-1',
            assessment: {
              id: 'assessment-1',
              name: 'FedRAMP Readiness',
              status: 'IN_PROGRESS'
            },
            controlId: 'ac-1',
            control: {
              id: 'ac-1',
              title: 'Account Management',
              family: 'AC',
              frameworkId: 'framework-1'
            }
          }
        }
      ],
      reviewer: null,
      uploadedBy: null,
      uploadedAt: now
    } as unknown) as Prisma.EvidenceItemGetPayload<{
      include: {
        reviewer: true;
        uploadedBy: true;
        frameworks: {
          include: {
            framework: true;
          };
        };
        controls: {
          include: {
            assessmentControl: {
              include: {
                assessment: true;
                control: true;
              };
            };
          };
        };
      };
    }>;

    const updatedRecord = ({
      ...evidenceRecord,
      metadata: {
        manualControlIds: [],
        controlIds: ['ac-2'],
        assessmentControlIds: ['assessment-control-2']
      },
      displayControlIds: ['ac-2'],
      controls: [
        {
          assessmentControlId: 'assessment-control-2',
          assessmentControl: {
            id: 'assessment-control-2',
            assessmentId: 'assessment-1',
            assessment: {
              id: 'assessment-1',
              name: 'FedRAMP Readiness',
              status: 'IN_PROGRESS'
            },
            controlId: 'ac-2',
            control: {
              id: 'ac-2',
              title: 'Account Review',
              family: 'AC',
              frameworkId: 'framework-1'
            }
          }
        }
      ]
    } as unknown) as typeof evidenceRecord;

    prismaMock.evidenceItem.findUnique.mockResolvedValueOnce(evidenceRecord);
    prismaMock.evidenceItem.findUnique.mockResolvedValueOnce(updatedRecord);
    prismaMock.assessmentControl.findMany.mockResolvedValueOnce([
      {
        id: 'assessment-control-2',
        assessmentId: 'assessment-1',
        controlId: 'ac-2',
        status: ControlStatus.UNASSESSED,
        ownerId: null,
        dueDate: null,
        comments: null,
        updatedAt: now,
        control: {
          id: 'ac-2',
          title: 'Account Review',
          frameworkId: 'framework-1',
          family: 'AC'
        },
        assessment: {
          id: 'assessment-1',
          name: 'FedRAMP Readiness',
          status: 'IN_PROGRESS'
        }
      }
    ] as unknown as Prisma.AssessmentControlGetPayload<{
      include: {
        control: {
          include: {
            framework: true;
          };
        };
        owner: true;
        assessment: true;
      };
    }>);
    prismaMock.framework.findMany.mockResolvedValueOnce([{ id: 'framework-1' }]);
    prismaMock.assessmentEvidence.deleteMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.assessmentEvidence.createMany.mockResolvedValueOnce({ count: 1 });
    prismaMock.evidenceItem.update.mockResolvedValueOnce(updatedRecord);

    const result = await service.updateAssessmentLinks(user, 'evidence-1', {
      assessmentControlIds: ['assessment-control-2']
    });

    expect(prismaMock.assessmentEvidence.deleteMany).toHaveBeenCalledWith({
      where: {
        evidenceId: 'evidence-1',
        assessmentControlId: {
          notIn: ['assessment-control-2']
        }
      }
    });

    expect(prismaMock.assessmentEvidence.createMany).toHaveBeenCalledWith({
      data: [
        {
          evidenceId: 'evidence-1',
          assessmentControlId: 'assessment-control-2'
        }
      ],
      skipDuplicates: true
    });

    expect(result.assessmentLinks).toHaveLength(1);
    expect(result.assessmentLinks[0].controlId).toBe('ac-2');
  });
});
