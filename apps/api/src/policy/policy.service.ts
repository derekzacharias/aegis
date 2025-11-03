import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  Framework,
  PolicyApproval,
  PolicyApprovalStatus,
  PolicyAuditAction,
  PolicyDocument,
  PolicyVersion,
  PolicyVersionFramework,
  PolicyVersionStatus,
  Prisma,
  User,
  UserRole
} from '@prisma/client';

type UploadedFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};
import { PrismaService } from '../prisma/prisma.service';
import { PolicyStorageService } from './policy.storage';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { CreatePolicyVersionDto } from './dto/create-policy-version.dto';
import { SubmitPolicyVersionDto } from './dto/submit-policy-version.dto';
import { ApprovalDecisionDto } from './dto/approval-decision.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import {
  PolicyActor,
  PolicyApprovalView,
  PolicyAuditEntry,
  PolicyDetail,
  PolicyFrameworkMapping,
  PolicyParticipantGroups,
  PolicyRetentionView,
  PolicySummary,
  PolicyUserSummary,
  PolicyVersionSummary,
  PolicyVersionView
} from './policy.types';

type PolicyVersionApprovalRow = PolicyApproval & {
  approver: User;
};

type PolicyVersionFrameworkRow = PolicyVersionFramework & {
  framework: Framework;
};

type PolicyVersionWithApprovals = PolicyVersion & {
  approvals: PolicyVersionApprovalRow[];
  createdBy: User;
  submittedBy: User | null;
  approvedBy: User | null;
  frameworkMappings: PolicyVersionFrameworkRow[];
};

type PolicyVersionForView = PolicyVersionWithApprovals & {
  document?: {
    id: string;
    organizationId: string;
    ownerId: string;
  };
};

type PolicyVersionWithRelations = PolicyVersionForView & {
  document: {
    id: string;
    organizationId: string;
    ownerId: string;
  };
};

type PolicyWithRelations = PolicyDocument & {
  owner: User;
  currentVersion: (PolicyVersion & {
    approvals: PolicyApproval[];
    frameworkMappings: PolicyVersionFrameworkRow[];
  }) | null;
  versions: PolicyVersionWithApprovals[];
  auditTrail: Array<
    Prisma.PolicyAuditLogGetPayload<{
      include: { actor: true };
    }>
  >;
};

const AUTHOR_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.ANALYST]);
const APPROVER_ROLES = new Set<UserRole>([UserRole.ADMIN, UserRole.AUDITOR]);

type RawFrameworkMapping = {
  frameworkId: string;
  controlFamilies?: string[];
  controlIds?: string[];
};

type NormalizedFrameworkMapping = {
  frameworkId: string;
  controlFamilies: string[];
  controlIds: string[];
};

type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: PolicyStorageService
  ) {}

  async listParticipants(actor: PolicyActor): Promise<PolicyParticipantGroups> {
    const [authors, approvers] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          organizationId: actor.organizationId,
          role: {
            in: [UserRole.ADMIN, UserRole.ANALYST]
          }
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
      }),
      this.prisma.user.findMany({
        where: {
          organizationId: actor.organizationId,
          role: {
            in: [UserRole.ADMIN, UserRole.AUDITOR]
          }
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
      })
    ]);

    return {
      authors: authors.map((user) => this.toUserSummary(user)),
      approvers: approvers.map((user) => this.toUserSummary(user))
    };
  }

  async listPolicies(actor: PolicyActor): Promise<PolicySummary[]> {
    const policies = await this.prisma.policyDocument.findMany({
      where: { organizationId: actor.organizationId },
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: true,
        currentVersion: {
          include: {
            approvals: true,
            frameworkMappings: {
              include: {
                framework: true
              }
            }
          }
        },
        versions: {
          where: {
            status: {
              in: [PolicyVersionStatus.IN_REVIEW]
            }
          },
          select: {
            id: true,
            approvals: {
              where: {
                status: PolicyApprovalStatus.PENDING
              },
              select: { id: true }
            }
          }
        }
      }
    });

    return policies.map((policy) => {
      const pendingReviewCount = policy.versions.reduce(
        (count, version) => count + version.approvals.length,
        0
      );

      return {
        id: policy.id,
        title: policy.title,
        category: policy.category,
        tags: policy.tags ?? [],
        owner: this.toUserSummary(policy.owner),
        currentVersion: policy.currentVersion
          ? this.toVersionSummary(policy.currentVersion)
          : null,
        pendingReviewCount,
        lastUpdated: policy.updatedAt.toISOString(),
        frameworks: policy.currentVersion
          ? this.toFrameworkMappings(policy.currentVersion.frameworkMappings)
          : []
      };
    });
  }

  async getPolicy(policyId: string, actor: PolicyActor): Promise<PolicyDetail> {
    const policy = await this.findPolicyOrThrow(policyId, actor.organizationId);
    return this.toPolicyDetail(policy);
  }

  async createPolicy(
    actor: PolicyActor,
    dto: CreatePolicyDto
  ): Promise<PolicyDetail> {
    this.ensureAuthorRole(actor);

    const ownerId =
      dto.ownerId && dto.ownerId !== actor.id
        ? await this.resolveOwnerId(actor, dto.ownerId)
        : actor.id;

    const policy = await this.prisma.policyDocument.create({
      data: {
        organizationId: actor.organizationId,
        ownerId,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        category: dto.category?.trim(),
        tags: dto.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
        reviewCadenceDays: dto.reviewCadenceDays ?? null
      },
      include: {
        owner: true,
        currentVersion: {
          include: {
            approvals: true,
            frameworkMappings: {
              include: { framework: true }
            }
          }
        },
        versions: {
          include: {
            approvals: {
              include: {
                approver: true
              }
            },
            frameworkMappings: {
              include: { framework: true }
            },
            createdBy: true,
            submittedBy: true,
            approvedBy: true
          },
          orderBy: [{ versionNumber: 'desc' }]
        },
        auditTrail: {
          include: {
            actor: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return this.toPolicyDetail(policy);
  }

  async createVersion(
    policyId: string,
    actor: PolicyActor,
    dto: CreatePolicyVersionDto,
    file: UploadedFile
  ): Promise<PolicyVersionView> {
    if (!file) {
      throw new BadRequestException('Policy version upload must include a file.');
    }

    const policy = await this.prisma.policyDocument.findFirst({
      where: { id: policyId, organizationId: actor.organizationId },
      include: {
        owner: true,
        currentVersion: true,
        organization: {
          select: { slug: true }
        }
      }
    });

    if (!policy) {
      throw new NotFoundException('Policy not found for organization.');
    }

    this.ensureCanAuthorPolicy(actor, {
      ownerId: policy.ownerId,
      organizationId: policy.organizationId
    });

    const latestVersion = await this.prisma.policyVersion.findFirst({
      where: { policyId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true, id: true }
    });

    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;
    const storageResult = await this.storage.persist(
      policy.organization.slug,
      policy.id,
      nextVersionNumber,
      file
    );

    const supersedesId =
      dto.supersedesVersionId ??
      policy.currentVersion?.id ??
      latestVersion?.id ??
      null;

    if (supersedesId) {
      const supersedes = await this.prisma.policyVersion.findFirst({
        where: { id: supersedesId, policyId }
      });

      if (!supersedes) {
        throw new BadRequestException(
          'Superseded version must belong to the same policy.'
        );
      }
    }

    const effectiveAt = dto.effectiveAt ? new Date(dto.effectiveAt) : null;

    const createdVersion = await this.prisma.policyVersion.create({
      data: {
        policyId,
        versionNumber: nextVersionNumber,
        label: dto.label?.trim() ?? null,
        notes: dto.notes?.trim() ?? null,
        createdById: actor.id,
        status: PolicyVersionStatus.DRAFT,
        storagePath: storageResult.storagePath,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
        checksum: storageResult.checksum,
        supersedesId,
        effectiveAt,
        isCurrent: false
      },
      include: {
        document: {
          select: {
            id: true,
            ownerId: true,
            organizationId: true
          }
        },
        approvals: {
          include: {
            approver: true
          }
        },
        createdBy: true,
        submittedBy: true,
        approvedBy: true
      }
    });

    return this.toPolicyVersionView(createdVersion);
  }

  async submitForApproval(
    policyId: string,
    versionId: string,
    actor: PolicyActor,
    dto: SubmitPolicyVersionDto
  ): Promise<PolicyVersionView> {
    if (dto.approverIds.length === 0) {
      throw new BadRequestException('At least one approver is required.');
    }

    const version = await this.loadVersionForActor(versionId, actor);

    if (version.policyId !== policyId) {
      throw new ForbiddenException('Version does not belong to the requested policy.');
    }

    this.ensureAuthorRole(actor);

    if (version.document.organizationId !== actor.organizationId) {
      throw new ForbiddenException('Unable to access policy within another tenant.');
    }

    this.ensureCanAuthorPolicy(actor, {
      ownerId: version.document.ownerId,
      organizationId: version.document.organizationId
    });

    if (version.status !== PolicyVersionStatus.DRAFT) {
      throw new BadRequestException('Only draft versions can be submitted for approval.');
    }

    const uniqueApprovers = Array.from(new Set(dto.approverIds));

    const approvers = await this.prisma.user.findMany({
      where: {
        id: { in: uniqueApprovers },
        organizationId: actor.organizationId
      }
    });

    if (approvers.length !== uniqueApprovers.length) {
      throw new BadRequestException('All approvers must belong to the same organization.');
    }

    const invalidRoles = approvers.filter(
      (user) => !APPROVER_ROLES.has(user.role)
    );

    if (invalidRoles.length > 0) {
      throw new BadRequestException(
        `Approvers must have approver privileges. Invalid users: ${invalidRoles
          .map((user) => user.email)
          .join(', ')}`
      );
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.policyVersion.update({
        where: { id: versionId },
        data: {
          status: PolicyVersionStatus.IN_REVIEW,
          submittedAt: now,
          submittedById: actor.id
        }
      });

      await tx.policyApproval.deleteMany({
        where: {
          policyVersionId: versionId,
          approverId: {
            notIn: uniqueApprovers
          }
        }
      });

      for (const approver of approvers) {
        await tx.policyApproval.upsert({
          where: {
            policyVersionId_approverId: {
              policyVersionId: versionId,
              approverId: approver.id
            }
          },
          update: {
            status: PolicyApprovalStatus.PENDING,
            decidedAt: null,
            decisionComment: null
          },
          create: {
            policyVersionId: versionId,
            approverId: approver.id,
            status: PolicyApprovalStatus.PENDING
          }
        });
      }
    });

    const reloaded = await this.loadVersionForActor(versionId, actor);
    return this.toPolicyVersionView(reloaded);
  }

  async recordDecision(
    policyId: string,
    versionId: string,
    actor: PolicyActor,
    dto: ApprovalDecisionDto
  ): Promise<PolicyVersionView> {
    const version = await this.loadVersionForActor(versionId, actor);

    if (
      version.document.organizationId !== actor.organizationId ||
      version.policyId !== policyId
    ) {
      throw new ForbiddenException('Unable to access policy within another tenant.');
    }

    if (version.status !== PolicyVersionStatus.IN_REVIEW) {
      throw new BadRequestException('Only versions in review can be decided.');
    }

    const approval = version.approvals.find(
      (item) => item.approverId === actor.id
    );

    if (!approval) {
      throw new ForbiddenException('You are not assigned as an approver for this version.');
    }

    if (approval.status !== PolicyApprovalStatus.PENDING) {
      throw new BadRequestException('This approval has already been decided.');
    }

    this.ensureApproverRole(actor);

    const decision =
      dto.decision === 'approve'
        ? PolicyApprovalStatus.APPROVED
        : PolicyApprovalStatus.REJECTED;

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.policyApproval.update({
        where: {
          policyVersionId_approverId: {
            policyVersionId: versionId,
            approverId: actor.id
          }
        },
        data: {
          status: decision,
          decidedAt: now,
          decisionComment: dto.comment ?? null
        }
      });

      if (decision === PolicyApprovalStatus.REJECTED) {
        await tx.policyVersion.update({
          where: { id: versionId },
          data: {
            status: PolicyVersionStatus.REJECTED,
            approvedAt: null,
            approvedById: null,
            isCurrent: false
          }
        });

        await tx.policyApproval.updateMany({
          where: {
            policyVersionId: versionId,
            approverId: {
              not: actor.id
            },
            status: PolicyApprovalStatus.PENDING
          },
          data: {
            status: PolicyApprovalStatus.REJECTED,
            decidedAt: now,
            decisionComment:
              'Automatically rejected because another approver rejected the version.'
          }
        });

        return;
      }

      const approvals = await tx.policyApproval.findMany({
        where: { policyVersionId: versionId },
        select: { status: true }
      });

      const allApproved = approvals.every(
        (item) => item.status === PolicyApprovalStatus.APPROVED
      );

      if (allApproved) {
        await tx.policyVersion.updateMany({
          where: {
            policyId,
            id: {
              not: versionId
            }
          },
          data: {
            isCurrent: false
          }
        });

        await tx.policyVersion.update({
          where: { id: versionId },
          data: {
            status: PolicyVersionStatus.APPROVED,
            approvedAt: now,
            approvedById: actor.id,
            isCurrent: true,
            effectiveAt: dto.effectiveAt ? new Date(dto.effectiveAt) : version.effectiveAt
          }
        });

        await tx.policyDocument.update({
          where: { id: policyId },
          data: { currentVersionId: versionId }
        });
      }
    });

    const reloaded = await this.loadVersionForActor(versionId, actor);
    return this.toPolicyVersionView(reloaded);
  }

  async getVersionArtifact(
    policyId: string,
    versionId: string,
    actor: PolicyActor
  ): Promise<{
    path: string;
    filename: string;
    mimeType: string;
  }> {
    const version = await this.loadVersionForActor(versionId, actor);

    if (version.policyId !== policyId) {
      throw new ForbiddenException('Version does not belong to the requested policy.');
    }

    const absolutePath = this.storage.getAbsolutePath(version.storagePath);

    return {
      path: absolutePath,
      filename: version.originalName,
      mimeType: version.mimeType
    };
  }

  private async findPolicyOrThrow(
    policyId: string,
    organizationId: string
  ): Promise<PolicyWithRelations> {
    const policy = await this.prisma.policyDocument.findFirst({
      where: { id: policyId, organizationId },
      include: {
        owner: true,
        currentVersion: {
          include: {
            approvals: true
          }
        },
        versions: {
          include: {
            approvals: {
              include: {
                approver: true
              }
            },
            createdBy: true,
            submittedBy: true,
            approvedBy: true
          },
          orderBy: [{ versionNumber: 'desc' }]
        }
      }
    });

    if (!policy) {
      throw new NotFoundException('Policy not found.');
    }

    return policy;
  }

  private async loadVersionForActor(
    versionId: string,
    actor: PolicyActor
  ): Promise<PolicyVersionWithRelations> {
    const version = await this.prisma.policyVersion.findFirst({
      where: {
        id: versionId,
        document: {
          organizationId: actor.organizationId
        }
      },
      include: {
        document: {
          select: {
            id: true,
            organizationId: true,
            ownerId: true
          }
        },
        approvals: {
          include: {
            approver: true
          }
        },
        frameworkMappings: {
          include: {
            framework: true
          }
        },
        createdBy: true,
        submittedBy: true,
        approvedBy: true
      }
    });

    if (!version) {
      throw new NotFoundException('Policy version not found.');
    }

    return version;
  }

  private toPolicyDetail(policy: PolicyWithRelations): PolicyDetail {
    return {
      id: policy.id,
      title: policy.title,
      category: policy.category,
      tags: policy.tags ?? [],
      owner: this.toUserSummary(policy.owner),
      currentVersion: policy.currentVersion
        ? this.toVersionSummary(policy.currentVersion)
        : null,
      pendingReviewCount: policy.versions
        .filter((version) => version.status === PolicyVersionStatus.IN_REVIEW)
        .reduce(
          (count, version) =>
            count +
            version.approvals.filter(
              (approval) => approval.status === PolicyApprovalStatus.PENDING
            ).length,
          0
        ),
      lastUpdated: policy.updatedAt.toISOString(),
      description: policy.description,
      reviewCadenceDays: policy.reviewCadenceDays,
      versions: policy.versions.map((version) =>
        this.toPolicyVersionView(version)
      )
    };
  }

  private toPolicyVersionView(
    version: PolicyVersionForView
  ): PolicyVersionView {
    return {
      id: version.id,
      versionNumber: version.versionNumber,
      label: version.label,
      status: version.status,
      createdAt: version.createdAt.toISOString(),
      createdBy: this.toUserSummary(version.createdBy),
      submittedAt: version.submittedAt?.toISOString() ?? null,
      submittedBy: version.submittedBy
        ? this.toUserSummary(version.submittedBy)
        : null,
      approvedAt: version.approvedAt?.toISOString() ?? null,
      approvedBy: version.approvedBy
        ? this.toUserSummary(version.approvedBy)
        : null,
      effectiveAt: version.effectiveAt?.toISOString() ?? null,
      notes: version.notes,
      isCurrent: version.isCurrent,
      supersedesId: version.supersedesId,
      artifact: {
        storagePath: version.storagePath,
        uri: this.storage.buildUri(version.storagePath),
        originalName: version.originalName,
        mimeType: version.mimeType,
        fileSizeBytes: version.fileSizeBytes,
        checksum: version.checksum ?? null
      },
      approvals: version.approvals.map((approval) =>
        this.toApprovalView(approval)
      )
    };
  }

  private toVersionSummary(
    version: PolicyVersion & { approvals: PolicyApproval[] }
  ): PolicyVersionSummary {
    return {
      id: version.id,
      versionNumber: version.versionNumber,
      label: version.label,
      status: version.status,
      submittedAt: version.submittedAt?.toISOString() ?? null,
      approvedAt: version.approvedAt?.toISOString() ?? null,
      isCurrent: version.isCurrent
    };
  }

  private toApprovalView(
    approval: Prisma.PolicyApprovalGetPayload<{
      include: { approver: true };
    }>
  ): PolicyApprovalView {
    return {
      id: approval.id,
      status: approval.status,
      decidedAt: approval.decidedAt?.toISOString() ?? null,
      decisionComment: approval.decisionComment ?? null,
      approver: this.toUserSummary(approval.approver)
    };
  }

  private toUserSummary(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
  }): PolicyUserSummary {
    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    const name =
      first && last
        ? `${first} ${last}`
        : first ?? last ?? user.email;

    return {
      id: user.id,
      email: user.email,
      name,
      role: user.role
    };
  }

  private ensureAuthorRole(actor: PolicyActor): void {
    if (!AUTHOR_ROLES.has(actor.role)) {
      throw new ForbiddenException('Only policy authors may perform this action.');
    }
  }

  private ensureApproverRole(actor: PolicyActor): void {
    if (!APPROVER_ROLES.has(actor.role)) {
      throw new ForbiddenException('Only designated approvers may perform this action.');
    }
  }

  private ensureCanAuthorPolicy(
    actor: PolicyActor,
    policy: { ownerId: string; organizationId: string }
  ): void {
    if (policy.organizationId !== actor.organizationId) {
      throw new ForbiddenException('Unable to access policy within another tenant.');
    }

    if (policy.ownerId !== actor.id && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only the policy owner or an administrator can manage versions.'
      );
    }

    if (!AUTHOR_ROLES.has(actor.role)) {
      throw new ForbiddenException('Only policy authors may perform this action.');
    }
  }

  private async resolveOwnerId(actor: PolicyActor, ownerId: string): Promise<string> {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can assign a different owner.');
    }

    const owner = await this.prisma.user.findFirst({
      where: {
        id: ownerId,
        organizationId: actor.organizationId
      }
    });

    if (!owner) {
      throw new BadRequestException('Owner must belong to the same organization.');
    }

    return owner.id;
  }
}
