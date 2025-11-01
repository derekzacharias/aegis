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
    $transaction: MockFn;
  };
  let storage: PolicyStorageService;
  let tx: {
    policyVersion: {
      update: MockFn;
      updateMany: MockFn;
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
        update: jest.fn(),
        updateMany: jest.fn()
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
