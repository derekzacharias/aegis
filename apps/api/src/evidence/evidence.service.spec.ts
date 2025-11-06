import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EvidenceIngestionStatus,
  EvidenceStatus,
  EvidenceUploadStatus,
  EvidenceScanStatus,
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
    findUnique: jest.fn(),
    update: jest.fn()
  },
  evidenceScan: {
    create: jest.fn(),
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
  getObjectMetadata: jest.fn(),
  createUploadToken: jest.fn(),
  createDownloadStream: jest.fn(),
  resolveLocalPath: jest.fn((key: string) => `/tmp/evidence/${key}`)
} as unknown as jest.Mocked<EvidenceStorageService>;

const queue = createJobQueue();

const configGetMock = jest.fn();
const configService = {
  get: configGetMock
} as unknown as ConfigService;

let service: EvidenceService;

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
    statusHistory: {
      include: {
        changedBy: true;
      };
    };
  };
}>;

beforeEach(() => {
  jest.clearAllMocks();
  queue.reset();
  configGetMock.mockImplementation((key: string) => {
    switch (key) {
      case 'antivirus.enabled':
        return true;
      case 'antivirus.engineName':
        return 'ClamAV';
      default:
        return undefined;
    }
  });

  service = new EvidenceService(
    prismaMock as unknown as PrismaService,
    storageService,
    configService,
    queue
  );
});

describe('EvidenceService.createSimple', () => {
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
      reviewer: null,
      statusHistory: []
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

describe('EvidenceService.confirmUpload', () => {
  const uploadRequest = {
    id: 'upload-1',
    organizationId: 'org-1',
    status: EvidenceUploadStatus.UPLOADED,
    storageProvider: 'LOCAL' as const,
    storageKey: 'organizations/org-1/evidence/sample.pdf',
    fileName: 'sample.pdf',
    contentType: 'application/pdf',
    sizeInBytes: 2048,
    checksum: 'sha256:abcd',
    uploadAuthToken: 'token-123',
    uploadedAt: new Date(),
    requestedById: user.id,
    uploadUrl: 'file:///tmp/evidence/sample.pdf'
  };

  const createdEvidence = {
    id: 'evidence-1',
    organizationId: 'org-1',
    name: 'Policy',
    storageUri: 'file:///tmp/evidence/sample.pdf',
    storageKey: uploadRequest.storageKey,
    storageProvider: 'LOCAL',
    originalFilename: 'sample.pdf',
    contentType: 'application/pdf',
    fileSize: 2048,
    checksum: 'sha256:abcd',
    fileType: 'pdf',
    sizeInKb: 2,
    metadata: {},
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
    uploadedAt: new Date(),
    nextAction: 'Pending analyst review',
    displayControlIds: [],
    displayFrameworkIds: [],
    frameworks: [],
    controls: [],
    reviewer: null,
    uploadedBy: null
  } as unknown as Prisma.EvidenceItemGetPayload<{
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

  beforeEach(() => {
    prismaMock.evidenceUploadRequest.findUnique.mockResolvedValue({ ...uploadRequest });
    prismaMock.framework.findMany.mockResolvedValue([{ id: 'framework-1' }]);
    prismaMock.assessmentControl.findMany.mockResolvedValue([]);
    prismaMock.evidenceItem.create.mockResolvedValue({ ...createdEvidence });
    prismaMock.evidenceScan.create.mockResolvedValue({ id: 'scan-job-1' });
    storageService.getObjectMetadata.mockResolvedValue({
      size: 2048,
      checksum: 'sha256:abcd',
      contentType: 'application/pdf'
    });
  });

  it('creates scan metadata and enqueues ingestion job', async () => {
    const enqueueSpy = jest.spyOn(queue, 'enqueue');

    await service.confirmUpload(user, uploadRequest.id, {
      name: 'Policy',
      frameworkIds: ['framework-1'],
      controlIds: [],
      assessmentControlIds: [],
      categories: [],
      tags: []
    });

    expect(prismaMock.evidenceScan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        evidenceId: 'evidence-1',
        engine: 'ClamAV',
        status: EvidenceScanStatus.PENDING
      })
    });

    expect(enqueueSpy).toHaveBeenCalledWith('evidence.ingest', {
      evidenceId: 'evidence-1',
      scanId: 'scan-job-1',
      storageUri: 'file:///tmp/evidence/sample.pdf',
      storageKey: uploadRequest.storageKey,
      storageProvider: 'LOCAL',
      checksum: 'sha256:abcd',
      requestedBy: user.email
    });
  });

  it('skips queueing when antivirus is disabled', async () => {
    configGetMock.mockImplementation((key: string) => {
      switch (key) {
        case 'antivirus.enabled':
          return false;
        case 'antivirus.engineName':
          return 'ClamAV';
        default:
          return undefined;
      }
    });

    const updatedRecord = {
      ...createdEvidence,
      ingestionStatus: EvidenceIngestionStatus.COMPLETED,
      ingestionNotes: 'Scan skipped: antivirus disabled in this environment'
    };

    prismaMock.evidenceItem.update.mockResolvedValueOnce(updatedRecord);
    const enqueueSpy = jest.spyOn(queue, 'enqueue');

    const result = await service.confirmUpload(user, uploadRequest.id, {
      name: 'Policy',
      frameworkIds: ['framework-1'],
      controlIds: [],
      assessmentControlIds: [],
      categories: [],
      tags: []
    });

    expect(enqueueSpy).not.toHaveBeenCalled();
    expect(prismaMock.evidenceScan.update).toHaveBeenCalledWith({
      where: { id: 'scan-job-1' },
      data: expect.objectContaining({
        status: EvidenceScanStatus.CLEAN,
        findings: expect.any(Object)
      })
    });
    expect(result.ingestionStatus).toBe(EvidenceIngestionStatus.COMPLETED);
  });
});

describe('EvidenceService.reprocess', () => {
  const evidenceRecord = ({
    id: 'evidence-1',
    organizationId: 'org-1',
    storageUri: 'file:///tmp/evidence/sample.pdf',
    storageKey: 'organizations/org-1/evidence/sample.pdf',
    storageProvider: 'LOCAL',
    checksum: 'sha256:abcd',
    fileSize: 2048,
    ingestionStatus: EvidenceIngestionStatus.QUARANTINED,
    ingestionNotes: 'Previous scan failed',
    status: EvidenceStatus.QUARANTINED,
    name: 'Policy',
    originalFilename: 'sample.pdf',
    contentType: 'application/pdf',
    fileType: 'pdf',
    sizeInKb: 2,
    metadata: {},
    uploadedById: user.id,
    uploadedByEmail: user.email,
    reviewerId: null,
    reviewDue: null,
    retentionPeriodDays: null,
    retentionReason: null,
    retentionExpiresAt: null,
    uploadedAt: new Date(),
    nextAction: 'Investigate',
    displayControlIds: [],
    displayFrameworkIds: [],
    frameworks: [],
    controls: [],
    reviewer: null,
    uploadedBy: null
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

  beforeEach(() => {
    prismaMock.evidenceItem.findUnique.mockResolvedValue({ ...evidenceRecord });
    prismaMock.evidenceScan.create.mockResolvedValue({ id: 'scan-55' });
  });

  it('queues a re-scan job and updates ingestion metadata', async () => {
    const updatedRecord = {
      ...evidenceRecord,
      ingestionStatus: EvidenceIngestionStatus.PENDING,
      ingestionNotes: 'Re-scan queued: please verify',
      lastScanStatus: EvidenceScanStatus.PENDING
    };

    prismaMock.evidenceItem.update.mockResolvedValueOnce(updatedRecord);
    const enqueueSpy = jest.spyOn(queue, 'enqueue');

    const result = await service.reprocess(user, evidenceRecord.id, {
      reason: 'please verify'
    });

    expect(prismaMock.evidenceScan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        evidenceId: evidenceRecord.id,
        status: EvidenceScanStatus.PENDING
      })
    });
    expect(prismaMock.evidenceItem.update).toHaveBeenCalledWith({
      where: { id: evidenceRecord.id },
      data: expect.objectContaining({
        ingestionStatus: EvidenceIngestionStatus.PENDING,
        lastScanStatus: EvidenceScanStatus.PENDING
      }),
      include: expect.any(Object)
    });
    expect(enqueueSpy).toHaveBeenCalledWith('evidence.ingest', expect.objectContaining({
      evidenceId: evidenceRecord.id,
      scanId: 'scan-55',
      storageProvider: 'LOCAL'
    }));
    expect(result.ingestionStatus).toBe(EvidenceIngestionStatus.PENDING);
  });

  it('completes immediately when antivirus is disabled', async () => {
    configGetMock.mockImplementation((key: string) => {
      switch (key) {
        case 'antivirus.enabled':
          return false;
        case 'antivirus.engineName':
          return 'ClamAV';
        default:
          return undefined;
      }
    });

    prismaMock.evidenceItem.update.mockResolvedValueOnce({
      ...evidenceRecord,
      ingestionStatus: EvidenceIngestionStatus.COMPLETED,
      ingestionNotes: 'Re-scan skipped: antivirus disabled in this environment'
    });

    const enqueueSpy = jest.spyOn(queue, 'enqueue');

    const record = await service.reprocess(user, evidenceRecord.id, {});

    expect(enqueueSpy).not.toHaveBeenCalled();
    expect(prismaMock.evidenceScan.update).toHaveBeenCalledWith({
      where: { id: 'scan-55' },
      data: expect.objectContaining({ status: EvidenceScanStatus.CLEAN })
    });
    expect(record.ingestionStatus).toBe(EvidenceIngestionStatus.COMPLETED);
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
