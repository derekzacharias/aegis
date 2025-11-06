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
import { UpdatePolicyVersionDto } from './dto/update-policy-version.dto';
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
type AuditLogExecutor =
  | Pick<PrismaService, 'policyAuditLog'>
  | Pick<TransactionClient, 'policyAuditLog'>;

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

  async updatePolicy(
    policyId: string,
    actor: PolicyActor,
    dto: UpdatePolicyDto
  ): Promise<PolicyDetail> {
    const policy = await this.findPolicyOrThrow(policyId, actor.organizationId);

    this.ensureCanAuthorPolicy(actor, {
      ownerId: policy.ownerId,
      organizationId: policy.organizationId
    });

    const payload = dto as Partial<CreatePolicyDto>;
    const updateData: Prisma.PolicyDocumentUpdateInput = {};
    let retentionChanged = false;
    let nextRetentionPeriodDays = policy.retentionPeriodDays ?? null;
    let nextRetentionReason = policy.retentionReason ?? null;
    let nextRetentionExpiresAt = policy.retentionExpiresAt ?? null;

    if (typeof payload.title !== 'undefined') {
      const trimmed = payload.title?.trim() ?? '';
      if (!trimmed) {
        throw new BadRequestException('Title cannot be empty.');
      }
      updateData.title = trimmed;
    }

    if (typeof payload.description !== 'undefined') {
      updateData.description = payload.description?.trim() || null;
    }

    if (typeof payload.category !== 'undefined') {
      const trimmed = payload.category?.trim() || '';
      updateData.category = trimmed.length > 0 ? trimmed : null;
    }

    if (Array.isArray(payload.tags)) {
      updateData.tags = payload.tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    if (typeof payload.reviewCadenceDays !== 'undefined') {
      updateData.reviewCadenceDays = payload.reviewCadenceDays ?? null;
    }

    if (
      typeof payload.ownerId === 'string' &&
      payload.ownerId.length > 0 &&
      payload.ownerId !== policy.ownerId
    ) {
      const newOwnerId = await this.resolveOwnerId(actor, payload.ownerId);
      updateData.owner = {
        connect: { id: newOwnerId }
      };
    }

    if (typeof payload.retentionPeriodDays !== 'undefined') {
      const value = payload.retentionPeriodDays ?? null;
      updateData.retentionPeriodDays = value;
      nextRetentionPeriodDays = value;
      retentionChanged = true;
    }

    if (typeof payload.retentionReason !== 'undefined') {
      const trimmedReason = payload.retentionReason?.trim() || '';
      const reasonValue = trimmedReason.length > 0 ? trimmedReason : null;
      updateData.retentionReason = reasonValue;
      nextRetentionReason = reasonValue;
      retentionChanged = true;
    }

    if (typeof payload.retentionExpiresAt !== 'undefined') {
      const expiresValue = payload.retentionExpiresAt
        ? new Date(payload.retentionExpiresAt)
        : null;
      updateData.retentionExpiresAt = expiresValue;
      nextRetentionExpiresAt = expiresValue;
      retentionChanged = true;
    }

    if (Object.keys(updateData).length === 0) {
      return this.toPolicyDetail(policy);
    }

    await this.prisma.policyDocument.update({
      where: { id: policyId },
      data: updateData
    });

    if (retentionChanged) {
      await this.recordAudit(this.prisma, {
        policyId,
        actorId: actor.id,
        action: PolicyAuditAction.RETENTION_UPDATED,
        metadata: {
          retentionPeriodDays: nextRetentionPeriodDays,
          retentionReason: nextRetentionReason,
          retentionExpiresAt: nextRetentionExpiresAt
            ? nextRetentionExpiresAt.toISOString()
            : null
        }
      });
    }

    const refreshed = await this.findPolicyOrThrow(policyId, actor.organizationId);
    return this.toPolicyDetail(refreshed);
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

    const trimmedReason =
      typeof dto.retentionReason === 'string'
        ? dto.retentionReason.trim() || null
        : null;
    const retentionExpiresAt = dto.retentionExpiresAt
      ? new Date(dto.retentionExpiresAt)
      : null;
    const tags =
      dto.tags?.map((tag) => tag.trim()).filter((tag) => tag.length > 0) ?? [];

    const policyId = await this.prisma.$transaction(async (tx) => {
      const created = await tx.policyDocument.create({
        data: {
          organizationId: actor.organizationId,
          ownerId,
          title: dto.title.trim(),
          description: dto.description?.trim(),
          category: dto.category?.trim(),
          tags,
          reviewCadenceDays: dto.reviewCadenceDays ?? null,
          retentionPeriodDays: dto.retentionPeriodDays ?? null,
          retentionReason: trimmedReason,
          retentionExpiresAt
        }
      });

      await this.recordAudit(tx, {
        policyId: created.id,
        actorId: actor.id,
        action: PolicyAuditAction.POLICY_CREATED,
        metadata: {
          title: created.title
        }
      });

      return created.id;
    });

    const policy = await this.findPolicyOrThrow(policyId, actor.organizationId);
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
    const organizationSlug = policy.organization?.slug ?? actor.organizationId;
    const storageResult = await this.storage.persist(
      organizationSlug,
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

    const frameworkMappings = await this.normalizeFrameworkMappings(
      actor,
      dto.frameworkMappings
    );

    let versionId: string | null = null;

    await this.prisma.$transaction(async (tx) => {
      const created = await tx.policyVersion.create({
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
        select: {
          id: true,
          versionNumber: true
        }
      });

      versionId = created.id;

      await tx.policyVersionFramework.deleteMany({
        where: { policyVersionId: created.id }
      });

      if (frameworkMappings.length > 0) {
        await tx.policyVersionFramework.createMany({
          data: frameworkMappings.map((mapping) => ({
            policyVersionId: created.id,
            frameworkId: mapping.frameworkId,
            controlFamilies: mapping.controlFamilies,
            controlIds: mapping.controlIds
          }))
        });
      }

      await this.recordAudit(tx, {
        policyId,
        policyVersionId: created.id,
        actorId: actor.id,
        action: PolicyAuditAction.VERSION_CREATED,
        metadata:
          frameworkMappings.length > 0
            ? {
                frameworks: frameworkMappings.map((mapping) => ({
                  frameworkId: mapping.frameworkId,
                  controlFamilies: mapping.controlFamilies,
                  controlIds: mapping.controlIds
                }))
              }
            : null
      });
    });

    if (!versionId) {
      throw new BadRequestException('Failed to persist policy version.');
    }

    const reloaded = await this.loadVersionForActor(versionId, actor);
    return this.toPolicyVersionView(reloaded);
  }

  async updateVersion(
    policyId: string,
    versionId: string,
    actor: PolicyActor,
    dto: UpdatePolicyVersionDto
  ): Promise<PolicyVersionView> {
    const version = await this.loadVersionForActor(versionId, actor);

    if (version.policyId !== policyId) {
      throw new ForbiddenException('Version does not belong to the requested policy.');
    }

    this.ensureCanAuthorPolicy(actor, {
      ownerId: version.document.ownerId,
      organizationId: version.document.organizationId
    });

    if (version.status !== PolicyVersionStatus.DRAFT) {
      throw new BadRequestException('Only draft versions can be edited.');
    }

    const updateData: Prisma.PolicyVersionUncheckedUpdateInput = {};

    if (dto.label !== undefined) {
      const trimmedLabel = dto.label?.trim() ?? '';
      updateData.label = trimmedLabel.length > 0 ? trimmedLabel : null;
    }

    if (dto.notes !== undefined) {
      const trimmedNotes = dto.notes?.trim() ?? '';
      updateData.notes = trimmedNotes.length > 0 ? trimmedNotes : null;
    }

    if (dto.effectiveAt !== undefined) {
      updateData.effectiveAt = dto.effectiveAt ? new Date(dto.effectiveAt) : null;
    }

    if (dto.supersedesVersionId !== undefined) {
      const trimmedSupersedes = dto.supersedesVersionId?.trim() ?? '';

      if (trimmedSupersedes.length === 0) {
        updateData.supersedesId = null;
      } else {
        if (trimmedSupersedes === versionId) {
          throw new BadRequestException('A version cannot supersede itself.');
        }

        const supersedes = await this.prisma.policyVersion.findFirst({
          where: {
            id: trimmedSupersedes,
            policyId
          }
        });

        if (!supersedes) {
          throw new BadRequestException(
            'Superseded version must belong to the same policy.'
          );
        }

        updateData.supersedesId = trimmedSupersedes;
      }
    }

    let frameworkMappings: NormalizedFrameworkMapping[] | null = null;
    if (dto.frameworkMappings !== undefined) {
      frameworkMappings = await this.normalizeFrameworkMappings(
        actor,
        dto.frameworkMappings ?? ''
      );
    }

    const hasVersionUpdates = Object.keys(updateData).length > 0;
    const shouldUpdateFrameworks = frameworkMappings !== null;

    if (!hasVersionUpdates && !shouldUpdateFrameworks) {
      return this.toPolicyVersionView(version);
    }

    await this.prisma.$transaction(async (tx) => {
      if (hasVersionUpdates) {
        await tx.policyVersion.update({
          where: { id: versionId },
          data: updateData
        });
      }

      if (shouldUpdateFrameworks) {
        await tx.policyVersionFramework.deleteMany({
          where: { policyVersionId: versionId }
        });

        const mappings = frameworkMappings ?? [];
        if (mappings.length > 0) {
          await tx.policyVersionFramework.createMany({
            data: mappings.map((mapping) => ({
              policyVersionId: versionId,
              frameworkId: mapping.frameworkId,
              controlFamilies: mapping.controlFamilies,
              controlIds: mapping.controlIds
            }))
          });
        }
      }
    });

    const refreshed = await this.loadVersionForActor(versionId, actor);
    return this.toPolicyVersionView(refreshed);
  }

  async deleteVersion(
    policyId: string,
    versionId: string,
    actor: PolicyActor
  ): Promise<PolicyDetail> {
    const version = await this.loadVersionForActor(versionId, actor);

    if (version.policyId !== policyId) {
      throw new ForbiddenException('Version does not belong to the requested policy.');
    }

    this.ensureCanAuthorPolicy(actor, {
      ownerId: version.document.ownerId,
      organizationId: version.document.organizationId
    });

    if (
      version.status !== PolicyVersionStatus.DRAFT &&
      version.status !== PolicyVersionStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Only draft or rejected versions can be deleted.'
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.policyApproval.deleteMany({
        where: { policyVersionId: versionId }
      });

      await tx.policyVersionFramework.deleteMany({
        where: { policyVersionId: versionId }
      });

      await tx.policyVersion.delete({
        where: { id: versionId }
      });

      await this.recordAudit(tx, {
        policyId,
        actorId: actor.id,
        action: PolicyAuditAction.VERSION_ARCHIVED,
        metadata: {
          reason: 'Version deleted by author',
          versionId
        }
      });
    });

    const policy = await this.findPolicyOrThrow(policyId, actor.organizationId);
    return this.toPolicyDetail(policy);
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
    const submissionMessage = dto.message?.trim() || null;

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

      await this.recordAudit(tx, {
        policyId,
        policyVersionId: versionId,
        actorId: actor.id,
        action: PolicyAuditAction.VERSION_SUBMITTED,
        message: submissionMessage,
        metadata: {
          approverIds: uniqueApprovers
        }
      });
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
    const decisionMessage = dto.comment?.trim() || null;

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
          decisionComment: decisionMessage
        }
      });

      await this.recordAudit(tx, {
        policyId,
        policyVersionId: versionId,
        actorId: actor.id,
        action: PolicyAuditAction.APPROVAL_RECORDED,
        message: decisionMessage,
        metadata: {
          decision: dto.decision
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

        await this.recordAudit(tx, {
          policyId,
          policyVersionId: versionId,
          actorId: actor.id,
          action: PolicyAuditAction.VERSION_ARCHIVED,
          metadata: {
            reason: 'Rejected by approver'
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

        await this.recordAudit(tx, {
          policyId,
          policyVersionId: versionId,
          actorId: actor.id,
          action: PolicyAuditAction.VERSION_PUBLISHED,
          metadata: {
            effectiveAt: dto.effectiveAt
              ? new Date(dto.effectiveAt).toISOString()
              : version.effectiveAt
              ? version.effectiveAt.toISOString()
              : null
          }
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

    await this.recordAudit(this.prisma, {
      policyId,
      policyVersionId: versionId,
      actorId: actor.id,
      action: PolicyAuditAction.DOCUMENT_DOWNLOADED,
      metadata: {
        filename: version.originalName
      }
    });

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
            approvals: true,
            frameworkMappings: {
              include: {
                framework: true
              }
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
              include: {
                framework: true
              }
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
      frameworks: policy.currentVersion
        ? this.toFrameworkMappings(policy.currentVersion.frameworkMappings)
        : [],
      description: policy.description,
      reviewCadenceDays: policy.reviewCadenceDays,
      versions: policy.versions.map((version) =>
        this.toPolicyVersionView(version)
      ),
      retention: this.toRetentionView(policy),
      auditTrail: policy.auditTrail.map((entry) => this.toAuditEntry(entry))
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
      ),
      frameworks: this.toFrameworkMappings(version.frameworkMappings)
    };
  }

  private toFrameworkMappings(
    mappings?: PolicyVersionFrameworkRow[] | null
  ): PolicyFrameworkMapping[] {
    if (!mappings || mappings.length === 0) {
      return [];
    }

    return mappings.map((mapping) => ({
      frameworkId: mapping.frameworkId,
      frameworkName: mapping.framework?.name ?? 'Framework',
      controlFamilies: [...(mapping.controlFamilies ?? [])],
      controlIds: [...(mapping.controlIds ?? [])]
    }));
  }

  private toRetentionView(policy: {
    retentionPeriodDays: number | null;
    retentionReason: string | null;
    retentionExpiresAt: Date | null;
  }): PolicyRetentionView {
    return {
      periodDays: policy.retentionPeriodDays ?? null,
      reason: policy.retentionReason ?? null,
      expiresAt: policy.retentionExpiresAt
        ? policy.retentionExpiresAt.toISOString()
        : null
    };
  }

  private toAuditEntry(
    entry: Prisma.PolicyAuditLogGetPayload<{
      include: { actor: true };
    }>
  ): PolicyAuditEntry {
    return {
      id: entry.id,
      action: entry.action,
      actor: entry.actor ? this.toUserSummary(entry.actor) : null,
      message: entry.message ?? null,
      metadata: (entry.metadata as Record<string, unknown> | null) ?? null,
      createdAt: entry.createdAt.toISOString(),
      versionId: entry.policyVersionId
    };
  }

  private async normalizeFrameworkMappings(
    actor: PolicyActor,
    rawMappings?: string
  ): Promise<NormalizedFrameworkMapping[]> {
    if (!rawMappings) {
      return [];
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawMappings);
    } catch {
      throw new BadRequestException(
        'Framework mappings payload must be valid JSON.'
      );
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException(
        'Framework mappings payload must be an array.'
      );
    }

    const sanitized: NormalizedFrameworkMapping[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const candidate = item as RawFrameworkMapping;
      const frameworkId =
        typeof candidate.frameworkId === 'string'
          ? candidate.frameworkId.trim()
          : '';

      if (!frameworkId) {
        continue;
      }

      const controlFamilies = Array.isArray(candidate.controlFamilies)
        ? candidate.controlFamilies
            .map((family) => family?.toString().trim())
            .filter((family): family is string => Boolean(family && family.length > 0))
        : [];

      const controlIds = Array.isArray(candidate.controlIds)
        ? candidate.controlIds
            .map((control) => control?.toString().trim())
            .filter((control): control is string => Boolean(control && control.length > 0))
        : [];

      sanitized.push({
        frameworkId,
        controlFamilies,
        controlIds
      });
    }

    if (sanitized.length === 0) {
      return [];
    }

    const deduped = new Map<string, NormalizedFrameworkMapping>();
    for (const mapping of sanitized) {
      const existing = deduped.get(mapping.frameworkId);
      if (existing) {
        existing.controlFamilies = this.mergeUnique(
          existing.controlFamilies,
          mapping.controlFamilies
        );
        existing.controlIds = this.mergeUnique(
          existing.controlIds,
          mapping.controlIds
        );
      } else {
        deduped.set(mapping.frameworkId, {
          frameworkId: mapping.frameworkId,
          controlFamilies: [...mapping.controlFamilies],
          controlIds: [...mapping.controlIds]
        });
      }
    }

    const normalized = Array.from(deduped.values());

    const frameworkIds = normalized.map((mapping) => mapping.frameworkId);
    const frameworks = await this.prisma.framework.findMany({
      where: {
        id: { in: frameworkIds },
        organizationId: actor.organizationId
      },
      select: { id: true }
    });

    if (frameworks.length !== frameworkIds.length) {
      throw new BadRequestException(
        'Framework mappings include frameworks outside of your organization.'
      );
    }

    return normalized;
  }

  private mergeUnique(base: string[], additions: string[]): string[] {
    const combined = [...base];
    for (const value of additions) {
      if (!combined.includes(value)) {
        combined.push(value);
      }
    }
    return combined;
  }

  private async recordAudit(
    executor: AuditLogExecutor,
    params: {
      policyId: string;
      action: PolicyAuditAction;
      actorId?: string | null;
      policyVersionId?: string | null;
      message?: string | null;
      metadata?: Prisma.InputJsonValue | null;
    }
  ): Promise<void> {
    await executor.policyAuditLog.create({
      data: {
        policyId: params.policyId,
        policyVersionId: params.policyVersionId ?? null,
        actorId: params.actorId ?? null,
        action: params.action,
        message: params.message ?? null,
        metadata:
          params.metadata === undefined || params.metadata === null
            ? Prisma.JsonNull
            : params.metadata
      }
    });
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
