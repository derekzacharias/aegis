import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Optional
} from '@nestjs/common';
import {
  EvidenceIngestionStatus,
  EvidenceStatus,
  EvidenceUploadStatus,
  EvidenceStorageProvider,
  EvidenceUploadRequest,
  Prisma
} from '@prisma/client';
import {
  EvidenceRecord,
  EvidenceUploadRequestView,
  EvidenceIngestionJobPayload,
  jobQueue,
  JobQueue
} from '@compliance/shared';
import { randomUUID } from 'crypto';
import path from 'path';
import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { EvidenceStorageService } from './evidence-storage.service';
import { RequestUploadDto } from './dto/request-upload.dto';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { UpdateEvidenceStatusDto } from './dto/update-evidence-status.dto';
import { AuthenticatedUser } from '../auth/types/auth.types';

type EvidenceItemWithRelations = Prisma.EvidenceItemGetPayload<{
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

export interface CreateEvidenceInput {
  name: string;
  controlIds: string[];
  frameworkIds: string[];
  uploadedBy: string;
  status: 'pending' | 'approved' | 'archived';
  fileType: string;
  sizeInKb: number;
}

const SIMPLE_STATUS_TO_ENUM: Record<CreateEvidenceInput['status'], EvidenceStatus> = {
  pending: EvidenceStatus.PENDING,
  approved: EvidenceStatus.APPROVED,
  archived: EvidenceStatus.ARCHIVED
};

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  private readonly queue: JobQueue;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: EvidenceStorageService,
    @Optional() queue?: JobQueue
  ) {
    this.queue = queue ?? jobQueue;
  }

  async list(organizationId: string): Promise<EvidenceRecord[]> {
    const items = await this.prisma.evidenceItem.findMany({
      where: { organizationId },
      include: {
        reviewer: true,
        uploadedBy: true,
        frameworks: {
          include: {
            framework: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return items.map((item) => this.toEvidenceRecord(item));
  }

  async createSimple(
    user: AuthenticatedUser,
    payload: CreateEvidenceInput
  ): Promise<EvidenceRecord> {
    const name = payload.name.trim();
    if (!name) {
      throw new BadRequestException('Evidence name is required');
    }

    if (!payload.frameworkIds.length) {
      throw new BadRequestException('Select at least one framework');
    }

    const uniqueFrameworkIds = Array.from(new Set(payload.frameworkIds));
    const frameworks = await this.prisma.framework.findMany({
      where: { id: { in: uniqueFrameworkIds } },
      select: { id: true }
    });

    if (frameworks.length !== uniqueFrameworkIds.length) {
      throw new BadRequestException('One or more frameworks are invalid');
    }

    const normalizedControlIds = payload.controlIds
      .map((id) => id.trim())
      .filter((value) => value.length > 0);

    const extension = this.normalizeExtension(payload.fileType);
    const originalFilename = `${this.normalizeFilenameBase(name)}.${extension}`;
    const storageKey = this.buildStorageKey(user.organizationId, originalFilename);
    const storageUri = this.resolveStorageUri(EvidenceStorageProvider.LOCAL, storageKey);

    const sizeInKb = Math.max(1, payload.sizeInKb);
    const uploaderLabel = payload.uploadedBy.trim();

    const metadata = this.mergeMetadata(null, {
      controlIds: normalizedControlIds,
      nextAction: 'Pending analyst review',
      origin: 'quick-create',
      uploadedByLabel: uploaderLabel
    });

    const evidence = await this.prisma.evidenceItem.create({
      data: {
        organizationId: user.organizationId,
        name,
        storageUri,
        storageKey,
        storageProvider: EvidenceStorageProvider.LOCAL,
        originalFilename,
        contentType: this.resolveContentType(extension),
        fileSize: sizeInKb * 1024,
        fileType: extension,
        sizeInKb,
        checksum: null,
        metadata: metadata as Prisma.JsonObject,
        uploadedById: user.id,
        uploadedByEmail: uploaderLabel.toLowerCase(),
        reviewerId: null,
        reviewDue: null,
        retentionPeriodDays: null,
        retentionReason: null,
        retentionExpiresAt: null,
        status: SIMPLE_STATUS_TO_ENUM[payload.status],
        ingestionStatus: EvidenceIngestionStatus.PENDING,
        nextAction: 'Pending analyst review',
        lastReviewed: null,
        displayControlIds: normalizedControlIds,
        displayFrameworkIds: uniqueFrameworkIds,
        frameworks: {
          create: uniqueFrameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        }
      },
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

    await this.prisma.evidenceStatusHistory.create({
      data: {
        evidenceId: evidence.id,
        fromStatus: null,
        toStatus: evidence.status,
        note: 'Evidence created via quick entry',
        changedById: user.id
      }
    });

    return this.toEvidenceRecord(evidence);
  }

  async requestUpload(
    user: AuthenticatedUser,
    payload: RequestUploadDto
  ): Promise<EvidenceUploadRequestView> {
    const id = randomUUID();
    const storageKey = this.buildStorageKey(user.organizationId, payload.fileName);
    const authToken = this.storage.createUploadToken();

    const presigned = await this.storage.createPresignedUpload({
      id,
      storageKey,
      contentType: payload.contentType,
      sizeInBytes: payload.sizeInBytes,
      checksum: payload.checksum ?? null,
      authToken
    });

    const uploadRequest = await this.prisma.evidenceUploadRequest.create({
      data: {
        id,
        organizationId: user.organizationId,
        requestedById: user.id,
        fileName: payload.fileName,
        contentType: payload.contentType,
        sizeInBytes: payload.sizeInBytes,
        checksum: payload.checksum ?? null,
        storageProvider: presigned.storageProvider,
        storageKey,
        uploadUrl: presigned.uploadUrl,
        uploadAuthToken: authToken,
        status: EvidenceUploadStatus.PENDING,
        uploadExpiresAt: new Date(presigned.expiresAt)
      }
    });

    return {
      id: uploadRequest.id,
      uploadUrl: presigned.uploadUrl,
      expiresAt: presigned.expiresAt,
      requiredHeaders: presigned.requiredHeaders,
      storageProvider: presigned.storageProvider,
      storageKey: uploadRequest.storageKey,
      checksum: uploadRequest.checksum ?? null,
      sizeInBytes: uploadRequest.sizeInBytes,
      contentType: uploadRequest.contentType
    };
  }

  async confirmUpload(
    user: AuthenticatedUser,
    uploadId: string,
    payload: ConfirmUploadDto
  ): Promise<EvidenceRecord> {
    const uploadRequest = await this.prisma.evidenceUploadRequest.findUnique({
      where: { id: uploadId }
    });

    if (!uploadRequest || uploadRequest.organizationId !== user.organizationId) {
      throw new NotFoundException('Upload request not found');
    }

    await this.ensureUploadActive(uploadRequest);

    if (
      this.storage.getMode() === 'local' &&
      uploadRequest.status !== EvidenceUploadStatus.UPLOADED
    ) {
      throw new BadRequestException(
        'Upload has not been received by the API storage pipeline yet'
      );
    }

    const retentionPeriodDays = payload.retentionPeriodDays ?? null;
    const retentionExpiresAt = this.computeRetentionExpiry(retentionPeriodDays);
    const controlIds = (payload.controlIds ?? []).map((id) => id.trim()).filter(Boolean);
    const frameworkIds = payload.frameworkIds ?? [];
    const fileType = this.normalizeExtension(path.extname(uploadRequest.fileName).replace('.', ''));
    const sizeInKb = Math.max(1, Math.round(uploadRequest.sizeInBytes / 1024));

    const metadata: Prisma.JsonObject = {
      controlIds,
      categories: payload.categories ?? [],
      tags: payload.tags ?? [],
      notes: payload.notes ?? null,
      source: payload.source ?? 'manual',
      nextAction: payload.nextAction ?? 'Pending analyst review',
      uploadedByLabel: user.email
    };

    const storageUri = this.resolveStorageUri(uploadRequest.storageProvider, uploadRequest.storageKey);

    const initialStatus = payload.initialStatus ?? EvidenceStatus.PENDING;

    const evidence = await this.prisma.evidenceItem.create({
      data: {
        organizationId: user.organizationId,
        name: payload.name,
        storageUri,
        storageKey: uploadRequest.storageKey,
        storageProvider: uploadRequest.storageProvider,
        originalFilename: uploadRequest.fileName,
        contentType: uploadRequest.contentType,
        fileSize: uploadRequest.sizeInBytes,
        checksum: uploadRequest.checksum,
        fileType,
        sizeInKb,
        metadata,
        uploadedById: user.id,
        uploadedByEmail: user.email,
        reviewerId: payload.reviewerId ?? null,
        reviewDue: payload.reviewDue ? new Date(payload.reviewDue) : null,
        retentionPeriodDays,
        retentionReason: payload.retentionReason ?? null,
        retentionExpiresAt,
        status: initialStatus,
        ingestionStatus: EvidenceIngestionStatus.PENDING,
        nextAction: payload.nextAction ?? 'Pending analyst review',
        lastReviewed: null,
        displayControlIds: controlIds,
        displayFrameworkIds: frameworkIds,
        uploadRequestId: uploadRequest.id,
        frameworks: {
          create: frameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        }
      },
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

    await this.prisma.evidenceUploadRequest.update({
      where: { id: uploadRequest.id },
      data: {
        status: EvidenceUploadStatus.CONFIRMED,
        confirmedAt: new Date()
      }
    });

    await this.prisma.evidenceStatusHistory.create({
      data: {
        evidenceId: evidence.id,
        fromStatus: null,
        toStatus: initialStatus,
        note: payload.statusNote ?? 'Evidence uploaded',
        changedById: user.id
      }
    });

    await this.queue.enqueue<EvidenceIngestionJobPayload>('evidence.ingest', {
      evidenceId: evidence.id,
      storageUri: evidence.storageUri,
      storageKey: evidence.storageKey,
      checksum: evidence.checksum ?? undefined
    });

    this.logger.log(`Evidence ${evidence.id} queued for ingestion`);

    return this.toEvidenceRecord(evidence);
  }

  async updateStatus(
    user: AuthenticatedUser,
    evidenceId: string,
    payload: UpdateEvidenceStatusDto
  ): Promise<EvidenceRecord> {
    const evidence = await this.prisma.evidenceItem.findUnique({
      where: { id: evidenceId },
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

    if (!evidence || evidence.organizationId !== user.organizationId) {
      throw new NotFoundException('Evidence not found');
    }

    const updateData: Prisma.EvidenceItemUpdateInput = {
      status: payload.status,
      ingestionStatus: payload.ingestionStatus ?? evidence.ingestionStatus,
      reviewer: payload.reviewerId
        ? {
            connect: {
              id: payload.reviewerId
            }
          }
        : undefined,
      reviewDue: payload.reviewDue ? new Date(payload.reviewDue) : undefined,
      retentionPeriodDays: payload.retentionPeriodDays ?? evidence.retentionPeriodDays,
      retentionReason: payload.retentionReason ?? evidence.retentionReason,
      retentionExpiresAt: payload.retentionPeriodDays
        ? this.computeRetentionExpiry(payload.retentionPeriodDays)
        : evidence.retentionExpiresAt,
      ingestionNotes: payload.ingestionNotes ?? evidence.ingestionNotes,
      lastStatusChangeAt: new Date()
    };

    if (payload.nextAction !== undefined) {
      const metadata = this.mergeMetadata(evidence.metadata ?? {}, {
        nextAction: payload.nextAction
      });
      updateData.metadata = metadata as Prisma.JsonObject;
      updateData.nextAction = payload.nextAction ?? null;
    }

    const updated = await this.prisma.evidenceItem.update({
      where: { id: evidence.id },
      data: updateData,
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

    await this.prisma.evidenceStatusHistory.create({
      data: {
        evidenceId: evidence.id,
        fromStatus: evidence.status,
        toStatus: payload.status,
        note: payload.statusNote ?? null,
        changedById: user.id
      }
    });

    return this.toEvidenceRecord(updated);
  }

  async handleLocalUpload(
    uploadId: string,
    token: string | undefined,
    request: Request
  ): Promise<void> {
    if (this.storage.getMode() !== 'local') {
      throw new NotFoundException('Local uploads are not enabled');
    }

    if (!token) {
      throw new ForbiddenException('Upload token missing');
    }

    const uploadRequest = await this.prisma.evidenceUploadRequest.findUnique({
      where: { id: uploadId }
    });

    if (!uploadRequest) {
      throw new NotFoundException('Upload request not found');
    }

    if (uploadRequest.uploadAuthToken !== token) {
      throw new ForbiddenException('Invalid upload token');
    }

    await this.ensureUploadActive(uploadRequest);

    const destination = this.resolveLocalPath(uploadRequest.storageKey);

    await fs.mkdir(path.dirname(destination), { recursive: true });

    const writeStream = createWriteStream(destination);

    try {
      await pipeline(request, writeStream);
    } catch (error) {
      this.logger.error('Failed to persist local evidence upload', error as Error);
      throw new InternalServerErrorException('Failed to persist evidence upload');
    }

    await this.prisma.evidenceUploadRequest.update({
      where: { id: uploadRequest.id },
      data: {
        status: EvidenceUploadStatus.UPLOADED,
        uploadedAt: new Date(),
        uploadUrl: `file://${destination}`
      }
    });
  }

  private toEvidenceRecord(item: EvidenceItemWithRelations): EvidenceRecord {
    const metadata = this.normalizeMetadata(item.metadata);
    const retention = {
      periodDays: item.retentionPeriodDays ?? null,
      expiresAt: item.retentionExpiresAt?.toISOString() ?? null,
      reason: item.retentionReason ?? null
    };

    const frameworks = item.frameworks.map(({ framework }) => ({
      id: framework.id,
      name: framework.name
    }));

    const controlIds = item.displayControlIds.length > 0
      ? item.displayControlIds
      : Array.isArray(metadata.controlIds)
        ? (metadata.controlIds as string[])
        : [];

    const reviewer = item.reviewer
      ? {
          id: item.reviewer.id,
          email: item.reviewer.email,
          name: [item.reviewer.firstName, item.reviewer.lastName]
            .filter(Boolean)
            .join(' ') || item.reviewer.email
        }
      : null;

    const uploadedBy = item.uploadedBy
      ? {
          id: item.uploadedBy.id,
          email: item.uploadedBy.email,
          name: [item.uploadedBy.firstName, item.uploadedBy.lastName]
            .filter(Boolean)
            .join(' ') || item.uploadedBy.email
        }
      : item.uploadedByEmail
        ? {
            id: 'external',
            email: item.uploadedByEmail,
            name: item.uploadedByEmail
          }
        : null;

    const nextAction = item.nextAction ?? (typeof metadata.nextAction === 'string'
      ? (metadata.nextAction as string)
      : this.deriveNextAction(item));

    return {
      id: item.id,
      name: item.name,
      originalFilename: item.originalFilename,
      status: item.status,
      ingestionStatus: item.ingestionStatus,
      storageUri: item.storageUri,
      storageProvider: item.storageProvider,
      fileSize: item.fileSize,
      contentType: item.contentType,
      uploadedAt: (item.uploadedAt ?? new Date()).toISOString(),
      reviewDue: item.reviewDue?.toISOString() ?? null,
      retention,
      checksum: item.checksum ?? null,
      frameworks,
      controlIds,
      metadata,
      reviewer,
      uploadedBy,
      nextAction,
      ingestionNotes: item.ingestionNotes ?? null
    };
  }

  private deriveNextAction(item: EvidenceItemWithRelations): string | null {
    if (item.status === EvidenceStatus.PENDING) {
      return 'Pending analyst review';
    }

    if (item.status === EvidenceStatus.APPROVED && item.reviewDue) {
      return `Review again by ${item.reviewDue.toISOString().substring(0, 10)}`;
    }

    return null;
  }

  private normalizeMetadata(value: Prisma.JsonValue | null | undefined): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    return value as Record<string, unknown>;
  }

  private mergeMetadata(
    current: Prisma.JsonValue | null | undefined,
    updates: Record<string, unknown>
  ): Record<string, unknown> {
    const normalized = this.normalizeMetadata(current);
    return {
      ...normalized,
      ...updates
    };
  }

  private normalizeExtension(fileType: string): string {
    return fileType
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 8) || 'dat';
  }

  private normalizeFilenameBase(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'evidence';
  }

  private resolveContentType(extension: string): string {
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'csv':
        return 'text/csv';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  private resolveStorageUri(provider: EvidenceStorageProvider, storageKey: string): string {
    if (provider === 'LOCAL') {
      const absolutePath = this.resolveLocalPath(storageKey);
      return `file://${encodeURI(absolutePath)}`;
    }

    const bucket = this.storage.getBucket();
    const normalizedKey = storageKey.replace(/\\/g, '/');
    return `s3://${bucket}/${normalizedKey}`;
  }

  private resolveLocalPath(storageKey: string): string {
    const baseDir = this.storage.getLocalDirectory();
    const candidate = path.resolve(baseDir, storageKey);

    if (path.relative(baseDir, candidate).startsWith('..')) {
      throw new ForbiddenException('Invalid storage key');
    }

    return candidate;
  }

  private computeRetentionExpiry(periodDays: number | null): Date | null {
    if (!periodDays || periodDays <= 0) {
      return null;
    }

    const now = new Date();
    return new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);
  }

  private async ensureUploadActive(uploadRequest: EvidenceUploadRequest): Promise<void> {
    if (uploadRequest.status === EvidenceUploadStatus.EXPIRED) {
      throw new BadRequestException('Upload request has expired');
    }

    if (uploadRequest.status === EvidenceUploadStatus.CONFIRMED) {
      throw new BadRequestException('Upload request has already been confirmed');
    }

    if (uploadRequest.uploadExpiresAt && uploadRequest.uploadExpiresAt.getTime() < Date.now()) {
      await this.prisma.evidenceUploadRequest.update({
        where: { id: uploadRequest.id },
        data: { status: EvidenceUploadStatus.EXPIRED }
      });
      throw new BadRequestException('Upload request has expired');
    }
  }

  private buildStorageKey(organizationId: string, fileName: string): string {
    const extension = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, extension);
    const normalizedBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
    const safeBase = normalizedBase.length > 0 ? normalizedBase : 'evidence';
    const timestamp = new Date().toISOString().split('T')[0];
    const id = randomUUID();
    const filename = `${safeBase}-${id}${extension}`;
    return path.posix.join('organizations', organizationId, 'evidence', timestamp, filename);
  }
}
