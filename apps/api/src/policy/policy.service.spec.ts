import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  PolicyApprovalStatus,
  PolicyVersionStatus,
  UserRole
} from '@prisma/client';
import { PolicyService } from './policy.service';
import { PolicyStorageService } from './policy.storage';
import { PolicyActor } from './policy.types';
import { PrismaService } from '../prisma/prisma.service';

type MockFn = jest.Mock;

const buildUser = (id: string, role: UserRole = UserRole.ANALYST) => ({
  id,
  email: `${id}@example.com`,
  firstName: id,
  lastName: 'User',
  role
});

const buildVersion = (overrides: Record<string, unknown> = {}) => ({
  id: 'version-1',
  policyId: 'policy-1',
  documentId: 'policy-1',
  versionNumber: 1,
  label: null,
  status: PolicyVersionStatus.DRAFT,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  createdBy: buildUser('author'),
  submittedAt: null,
  submittedBy: null,
  approvedAt: null,
  approvedBy: null,
  effectiveAt: null,
  notes: null,
  storagePath: 'policies/org/policy/file.pdf',
  originalName: 'file.pdf',
  mimeType: 'application/pdf',
  fileSizeBytes: 1024,
  checksum: 'sha256:abc',
  isCurrent: false,
  supersedesId: null,
  approvals: [],
  document: {
    id: 'policy-1',
    organizationId: 'org-1',
    ownerId: 'author'
  },
  submittedById: null,
  approvedById: null,
  createdById: 'author',
  ...overrides
});

describe('PolicyService', () => {
  let service: PolicyService;
  let prisma: {
    policyDocument: {
      findMany: MockFn;
      findFirst: MockFn;
      create: MockFn;
      update: MockFn;
    };
    policyVersion: {
      findFirst: MockFn;
      create: MockFn;
      update: MockFn;
      updateMany: MockFn;
    };
    policyVersionFramework: {
      deleteMany: MockFn;
      createMany: MockFn;
    };
    policyApproval: {
      deleteMany: MockFn;
      upsert: MockFn;
      update: MockFn;
      updateMany: MockFn;
      findMany: MockFn;
    };
    user: {
      findMany: MockFn;
      findFirst: MockFn;
    };
    framework: {
      findMany: MockFn;
    };
    policyAuditLog: {
      create: MockFn;
    };
    $transaction: MockFn;
  };
  let storage: PolicyStorageService;
  let tx: {
    policyVersion: {
      create: MockFn;
      update: MockFn;
      updateMany: MockFn;
    };
    policyVersionFramework: {
      deleteMany: MockFn;
      createMany: MockFn;
    };
    policyApproval: {
      deleteMany: MockFn;
      upsert: MockFn;
      update: MockFn;
      updateMany: MockFn;
      findMany: MockFn;
    };
    policyDocument: {
      update: MockFn;
    };
    policyAuditLog: {
      create: MockFn;
    };
  };

  const author: PolicyActor = {
    id: 'author',
    email: 'author@example.com',
    firstName: 'Alex',
    lastName: 'Mercier',
    role: UserRole.ANALYST,
    organizationId: 'org-1'
  };

  const approverActor: PolicyActor = {
    id: 'approver-1',
    email: 'approver-1@example.com',
    firstName: 'Owen',
    lastName: 'Grant',
    role: UserRole.AUDITOR,
    organizationId: 'org-1'
  };

  beforeEach(() => {
    tx = {
      policyVersion: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn()
      },
      policyVersionFramework: {
        deleteMany: jest.fn(),
        createMany: jest.fn()
      },
      policyApproval: {
        deleteMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn()
      },
      policyDocument: {
        update: jest.fn()
      },
      policyAuditLog: {
        create: jest.fn()
      }
    };

    prisma = {
      policyDocument: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
      },
      policyVersion: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn()
      },
      policyVersionFramework: {
        deleteMany: jest.fn(),
        createMany: jest.fn()
      },
      policyApproval: {
        deleteMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn()
      },
      user: {
        findMany: jest.fn(),
        findFirst: jest.fn()
      },
      framework: {
        findMany: jest.fn()
      },
      policyAuditLog: {
        create: jest.fn()
      },
      $transaction: jest.fn(async (callback: (client: typeof tx) => Promise<void> | void) => {
        await callback(tx);
      })
    };

    storage = {
      persist: jest.fn(),
      buildUri: jest.fn((key: string) => `s3://bucket/${key}`),
      getAbsolutePath: jest.fn()
    } as unknown as PolicyStorageService;

    service = new PolicyService(prisma as unknown as PrismaService, storage);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('submits a draft version for approval and assigns approvers', async () => {
    const draftVersion = buildVersion();
    const reviewVersion = buildVersion({
      status: PolicyVersionStatus.IN_REVIEW,
      submittedAt: new Date('2024-01-15T00:00:00.000Z'),
      submittedBy: buildUser('author'),
      approvals: [
        {
          id: 'approval-1',
          policyVersionId: 'version-1',
          approverId: 'approver-1',
          status: PolicyApprovalStatus.PENDING,
          decidedAt: null,
          decisionComment: null,
          approver: buildUser('approver-1', UserRole.AUDITOR)
        }
      ]
    });

    prisma.policyVersion.findFirst
      .mockResolvedValueOnce(draftVersion)
      .mockResolvedValueOnce(reviewVersion);
    prisma.user.findMany.mockResolvedValueOnce([
      buildUser('approver-1', UserRole.AUDITOR)
    ]);

    const result = await service.submitForApproval('policy-1', 'version-1', author, {
      approverIds: ['approver-1']
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.policyVersion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'version-1' },
        data: expect.objectContaining({
          status: PolicyVersionStatus.IN_REVIEW,
          submittedById: author.id
        })
      })
    );
    expect(tx.policyApproval.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          policyVersionId_approverId: {
            policyVersionId: 'version-1',
            approverId: 'approver-1'
          }
        }
      })
    );
    expect(result.status).toBe(PolicyVersionStatus.IN_REVIEW);
    expect(result.approvals).toHaveLength(1);
    expect(result.approvals[0].status).toBe(PolicyApprovalStatus.PENDING);
  });

  it('creates a new version with framework mappings and records an audit event', async () => {
    prisma.policyDocument.findFirst.mockResolvedValueOnce({
      id: 'policy-1',
      organizationId: author.organizationId,
      ownerId: author.id,
      title: 'Access Control Policy',
      category: null,
      tags: [],
      description: null,
      reviewCadenceDays: null,
      retentionPeriodDays: null,
      retentionReason: null,
      retentionExpiresAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      owner: buildUser('author'),
      currentVersion: null,
      versions: [],
      auditTrail: []
    });
    prisma.policyVersion.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'version-new',
        policyId: 'policy-1',
        document: {
          id: 'policy-1',
          ownerId: author.id,
          organizationId: author.organizationId
        },
        versionNumber: 1,
        label: null,
        status: PolicyVersionStatus.DRAFT,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        createdBy: buildUser('author'),
        submittedBy: null,
        approvedBy: null,
        submittedAt: null,
        approvedAt: null,
        effectiveAt: null,
        notes: null,
        isCurrent: false,
        supersedesId: null,
        storagePath: 'policies/org-1/policy-1/v1.pdf',
        originalName: 'policy.pdf',
        mimeType: 'application/pdf',
        fileSizeBytes: 1024,
        checksum: 'sha256:abc',
        approvals: [],
        frameworkMappings: [
          {
            id: 'map-1',
            policyVersionId: 'version-new',
            frameworkId: 'framework-1',
            controlFamilies: ['ID'],
            controlIds: ['ID.AM-1'],
            framework: {
              id: 'framework-1',
              name: 'NIST CSF'
            }
          }
        ]
      });

    prisma.framework.findMany.mockResolvedValueOnce([{ id: 'framework-1' }]);
    storage.persist = jest.fn().mockResolvedValue({
      storagePath: 'policies/org-1/policy-1/v1.pdf',
      checksum: 'sha256:abc'
    });
    tx.policyVersion.create.mockResolvedValueOnce({
      id: 'version-new',
      versionNumber: 1,
      label: null,
      supersedesId: null
    });

    await service.createVersion(
      'policy-1',
      author,
      {
        label: 'Q1 Update',
        frameworkMappings: JSON.stringify([
          {
            frameworkId: 'framework-1',
            controlFamilies: ['ID'],
            controlIds: ['ID.AM-1']
          }
        ])
      },
      {
        buffer: Buffer.from('policy'),
        originalname: 'policy.pdf',
        mimetype: 'application/pdf',
        size: 1024
      }
    );

    expect(tx.policyVersionFramework.deleteMany).toHaveBeenCalledWith({
      where: { policyVersionId: 'version-new' }
    });
    expect(tx.policyVersionFramework.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          frameworkId: 'framework-1',
          controlFamilies: ['ID'],
          controlIds: ['ID.AM-1']
        })
      ]
    });
    expect(tx.policyAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'VERSION_CREATED' })
      })
    );
  });

  it('updates retention settings and records an audit entry', async () => {
    const basePolicy = {
      id: 'policy-1',
      organizationId: author.organizationId,
      ownerId: author.id,
      title: 'Access Policy',
      category: null,
      tags: [],
      description: null,
      reviewCadenceDays: null,
      retentionPeriodDays: null,
      retentionReason: null,
      retentionExpiresAt: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      owner: buildUser('author'),
      currentVersion: null,
      versions: [],
      auditTrail: []
    };

    prisma.policyDocument.findFirst
      .mockResolvedValueOnce(basePolicy)
      .mockResolvedValueOnce({
        ...basePolicy,
        retentionPeriodDays: 730,
        retentionReason: 'Extended for audit requirements',
        retentionExpiresAt: new Date('2024-12-31T00:00:00.000Z')
      });

    prisma.policyDocument.update.mockResolvedValue({});

    await service.updatePolicy('policy-1', author, {
      retentionPeriodDays: 730,
      retentionReason: 'Extended for audit requirements',
      retentionExpiresAt: '2024-12-31'
    });

    expect(prisma.policyDocument.update).toHaveBeenCalledWith({
      where: { id: 'policy-1' },
      data: expect.objectContaining({
        retentionPeriodDays: 730,
        retentionReason: 'Extended for audit requirements',
        retentionExpiresAt: new Date('2024-12-31T00:00:00.000Z')
      })
    });
    expect(prisma.policyAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'RETENTION_UPDATED' })
      })
    );
  });

  it('promotes a version when final approval is recorded', async () => {
    const inReviewVersion = buildVersion({
      status: PolicyVersionStatus.IN_REVIEW,
      approvals: [
        {
          id: 'approval-1',
          policyVersionId: 'version-1',
          approverId: 'approver-1',
          status: PolicyApprovalStatus.PENDING,
          decidedAt: null,
          decisionComment: null,
          approver: buildUser('approver-1', UserRole.AUDITOR)
        }
      ]
    });

    const approvedVersion = buildVersion({
      status: PolicyVersionStatus.APPROVED,
      approvedAt: new Date('2024-02-01T00:00:00.000Z'),
      approvedBy: buildUser('approver-1', UserRole.AUDITOR),
      isCurrent: true,
      approvals: [
        {
          id: 'approval-1',
          policyVersionId: 'version-1',
          approverId: 'approver-1',
          status: PolicyApprovalStatus.APPROVED,
          decidedAt: new Date('2024-02-01T00:00:00.000Z'),
          decisionComment: 'Looks good',
          approver: buildUser('approver-1', UserRole.AUDITOR)
        }
      ]
    });

    prisma.policyVersion.findFirst
      .mockResolvedValueOnce(inReviewVersion)
      .mockResolvedValueOnce(approvedVersion);

    tx.policyApproval.findMany.mockResolvedValueOnce([
      { status: PolicyApprovalStatus.APPROVED }
    ]);

    const result = await service.recordDecision(
      'policy-1',
      'version-1',
      approverActor,
      {
        decision: 'approve'
      }
    );

    expect(tx.policyApproval.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          policyVersionId_approverId: {
            policyVersionId: 'version-1',
            approverId: approverActor.id
          }
        },
        data: expect.objectContaining({
          status: PolicyApprovalStatus.APPROVED
        })
      })
    );
    expect(tx.policyVersion.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          policyId: 'policy-1'
        })
      })
    );
    expect(tx.policyDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { currentVersionId: 'version-1' }
      })
    );
    expect(result.status).toBe(PolicyVersionStatus.APPROVED);
    expect(result.isCurrent).toBe(true);
  });

  it('prevents decisions from users who are not assigned approvers', async () => {
    const inReviewVersion = buildVersion({
      status: PolicyVersionStatus.IN_REVIEW,
      approvals: [
        {
          id: 'approval-1',
          policyVersionId: 'version-1',
          approverId: 'another-approver',
          status: PolicyApprovalStatus.PENDING,
          decidedAt: null,
          decisionComment: null,
          approver: buildUser('another-approver', UserRole.AUDITOR)
        }
      ]
    });

    prisma.policyVersion.findFirst.mockResolvedValueOnce(inReviewVersion);

    await expect(
      service.recordDecision('policy-1', 'version-1', approverActor, {
        decision: 'approve'
      })
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(tx.policyApproval.update).not.toHaveBeenCalled();
  });

  it('rejects submitting a non-draft version for approval', async () => {
    const inReviewVersion = buildVersion({
      status: PolicyVersionStatus.IN_REVIEW
    });

    prisma.policyVersion.findFirst.mockResolvedValueOnce(inReviewVersion);

    await expect(
      service.submitForApproval('policy-1', 'version-1', author, {
        approverIds: ['approver-1']
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
