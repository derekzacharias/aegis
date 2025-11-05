import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Optional
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EvidenceIngestionStatus,
  EvidenceStatus,
  EvidenceUploadStatus,
  EvidenceStorageProvider,
  EvidenceUploadRequest,
  EvidenceScanStatus,
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
import { UpdateEvidenceMetadataDto } from './dto/update-evidence-metadata.dto';
import { UpdateEvidenceLinksDto } from './dto/update-evidence-links.dto';
import { ReprocessEvidenceDto } from './dto/reprocess-evidence.dto';
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

type AssessmentControlWithRelations = Prisma.AssessmentControlGetPayload<{
  include: {
    assessment: true;
    control: true;
  };
}>;

export interface CreateEvidenceInput {
  name: string;
  controlIds: string[];
  frameworkIds: string[];
  assessmentControlIds?: string[];
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
    private readonly config: ConfigService,
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
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return items.map((item) => this.toEvidenceRecord(item));
  }

  async get(organizationId: string, evidenceId: string): Promise<EvidenceRecord> {
    const item = await this.prisma.evidenceItem.findUnique({
      where: { id: evidenceId },
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

    if (!item || item.organizationId !== organizationId) {
      throw new NotFoundException('Evidence not found');
    }

    return this.toEvidenceRecord(item);
  }

  async openFileStream(
    user: AuthenticatedUser,
    evidenceId: string
  ): Promise<{
    filename: string;
    contentType: string;
    contentLength?: number;
    stream: NodeJS.ReadableStream;
  }> {
    const evidence = await this.prisma.evidenceItem.findUnique({
      where: { id: evidenceId },
      select: {
        id: true,
        organizationId: true,
        storageKey: true,
        storageProvider: true,
        originalFilename: true,
        contentType: true,
        fileSize: true,
        ingestionStatus: true,
        status: true,
        lastScanStatus: true
      }
    });

    if (!evidence || evidence.organizationId !== user.organizationId) {
      throw new NotFoundException('Evidence not found');
    }

    if (
      evidence.ingestionStatus === EvidenceIngestionStatus.QUARANTINED ||
      evidence.status === EvidenceStatus.QUARANTINED
    ) {
      throw new ForbiddenException('Evidence is quarantined and cannot be accessed.');
    }

    if (evidence.lastScanStatus === EvidenceScanStatus.INFECTED) {
      throw new ForbiddenException('Evidence failed antivirus checks and cannot be accessed.');
    }

    try {
      const handle = await this.storage.createDownloadStream(
        evidence.storageProvider,
        evidence.storageKey
      );

      return {
        filename: evidence.originalFilename,
        contentType: handle.contentType ?? evidence.contentType ?? 'application/octet-stream',
        contentLength: handle.contentLength ?? evidence.fileSize ?? undefined,
        stream: handle.stream
      };
    } catch (error) {
      const err = error as NodeJS.ErrnoException | { name?: string };
      if (err && (err['code'] === 'ENOENT' || err['name'] === 'NoSuchKey')) {
        throw new NotFoundException('Evidence file not found');
      }

      this.logger.error(
        `Failed to stream evidence ${evidence.id}: ${(error as Error).message}`,
        (error as Error).stack
      );
      throw new InternalServerErrorException('Unable to read evidence file');
    }
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

    const normalizedControlIds = payload.controlIds
      .map((id) => id.trim())
      .filter((value) => value.length > 0);

    const assessmentControlIds = Array.from(new Set(payload.assessmentControlIds ?? []));

    const assessmentControls = await this.resolveAssessmentControls(
      user.organizationId,
      assessmentControlIds
    );

    const assessmentControlDisplayIds = assessmentControls.map((control) => control.controlId);
    const combinedControlIds = Array.from(
      new Set([...normalizedControlIds, ...assessmentControlDisplayIds])
    );

    const frameworksFromAssessment = assessmentControls.map(
      (control) => control.control.frameworkId
    );
    const combinedFrameworkIds = Array.from(
      new Set([...uniqueFrameworkIds, ...frameworksFromAssessment])
    );

    await this.ensureFrameworksExist(user.organizationId, combinedFrameworkIds);

    const extension = this.normalizeExtension(payload.fileType);
    const originalFilename = `${this.normalizeFilenameBase(name)}.${extension}`;
    const storageKey = this.buildStorageKey(user.organizationId, originalFilename);
    const storageUri = this.resolveStorageUri(EvidenceStorageProvider.LOCAL, storageKey);

    const sizeInKb = Math.max(1, payload.sizeInKb);
    const uploaderLabel = payload.uploadedBy.trim();

    const metadata = this.mergeMetadata(null, {
      controlIds: combinedControlIds,
      manualControlIds: normalizedControlIds,
      manualFrameworkIds: uniqueFrameworkIds,
      assessmentControlIds,
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
        displayControlIds: combinedControlIds,
        displayFrameworkIds: combinedFrameworkIds,
        frameworks: {
          create: combinedFrameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        },
        controls: assessmentControls.length
          ? {
              create: assessmentControls.map((control) => ({
                assessmentControl: {
                  connect: { id: control.id }
                }
              }))
            }
          : undefined
      },
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
        uploadExpiresAt: new Date(presigned.expiresAt),
        retryCount: 0,
        failureReason: null,
        lastErrorAt: null
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

    let objectMetadata: import('./evidence-storage.service').UploadedObjectMetadata;

    try {
      objectMetadata = await this.storage.getObjectMetadata(
        uploadRequest.storageProvider,
        uploadRequest.storageKey
      );
    } catch (error) {
      await this.markUploadFailed(uploadRequest.id, 'Uploaded object missing or inaccessible');
      this.logger.error('Failed to verify uploaded evidence object', error as Error);
      throw new BadRequestException('Evidence upload could not be verified. Please retry the upload.');
    }

    const resolvedFileSize = objectMetadata.size ?? uploadRequest.sizeInBytes;

    if (!Number.isFinite(resolvedFileSize) || resolvedFileSize <= 0) {
      await this.markUploadFailed(uploadRequest.id, 'Uploaded evidence file has zero length');
      throw new BadRequestException('Uploaded evidence file is empty. Please upload again.');
    }

    const resolvedChecksum = objectMetadata.checksum ?? uploadRequest.checksum ?? null;

    if (
      uploadRequest.checksum &&
      resolvedChecksum &&
      uploadRequest.checksum !== resolvedChecksum
    ) {
      await this.markUploadFailed(uploadRequest.id, 'Checksum mismatch during confirmation');
      throw new BadRequestException('Uploaded evidence checksum mismatch. Please upload again.');
    }

    const resolvedContentType = objectMetadata.contentType ?? uploadRequest.contentType;

    const retentionPeriodDays = payload.retentionPeriodDays ?? null;
    const retentionExpiresAt = this.computeRetentionExpiry(retentionPeriodDays);
    const controlIds = (payload.controlIds ?? []).map((id) => id.trim()).filter(Boolean);
    const frameworkIds = Array.from(new Set(payload.frameworkIds ?? []));
    const assessmentControlIds = Array.from(new Set(payload.assessmentControlIds ?? []));
    const assessmentControls = await this.resolveAssessmentControls(
      user.organizationId,
      assessmentControlIds
    );
    const assessmentControlDisplayIds = assessmentControls.map((control) => control.controlId);
    const combinedControlIds = Array.from(
      new Set([...controlIds, ...assessmentControlDisplayIds])
    );
    const frameworksFromAssessment = assessmentControls.map(
      (control) => control.control.frameworkId
    );
    const combinedFrameworkIds = Array.from(
      new Set([...frameworkIds, ...frameworksFromAssessment])
    );
    await this.ensureFrameworksExist(user.organizationId, combinedFrameworkIds);
    const fileType = this.normalizeExtension(path.extname(uploadRequest.fileName).replace('.', ''));
    const sizeInKb = Math.max(1, Math.round(resolvedFileSize / 1024));

    const metadata = this.mergeMetadata(null, {
      controlIds: combinedControlIds,
      manualControlIds: controlIds,
      assessmentControlIds,
      manualFrameworkIds: frameworkIds,
      categories: payload.categories ?? [],
      tags: payload.tags ?? [],
      notes: payload.notes ?? null,
      source: payload.source ?? 'manual',
      nextAction: payload.nextAction ?? 'Pending analyst review',
      uploadedByLabel: user.email
    }) as Prisma.JsonObject;

    const storageUri = this.resolveStorageUri(uploadRequest.storageProvider, uploadRequest.storageKey);

    const initialStatus = payload.initialStatus ?? EvidenceStatus.PENDING;

    const evidenceInclude = this.getEvidenceInclude();

    const evidence = await this.prisma.evidenceItem.create({
      data: {
        organizationId: user.organizationId,
        name: payload.name,
        storageUri,
        storageKey: uploadRequest.storageKey,
        storageProvider: uploadRequest.storageProvider,
        originalFilename: uploadRequest.fileName,
        contentType: resolvedContentType,
        fileSize: resolvedFileSize,
        checksum: resolvedChecksum,
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
        displayControlIds: combinedControlIds,
        displayFrameworkIds: combinedFrameworkIds,
        uploadRequestId: uploadRequest.id,
        frameworks: {
          create: combinedFrameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        },
        controls: assessmentControls.length
          ? {
              create: assessmentControls.map((control) => ({
                assessmentControl: {
                  connect: { id: control.id }
                }
              }))
            }
          : undefined
      },
      include: evidenceInclude
    });

    await this.prisma.evidenceUploadRequest.update({
      where: { id: uploadRequest.id },
      data: {
        status: EvidenceUploadStatus.CONFIRMED,
        confirmedAt: new Date(),
        uploadedAt: uploadRequest.uploadedAt ?? new Date(),
        sizeInBytes: resolvedFileSize,
        contentType: resolvedContentType,
        checksum: resolvedChecksum,
        failureReason: null,
        lastErrorAt: null
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

    const scanEngine = this.resolveScanEngine();
    const scan = await this.prisma.evidenceScan.create({
      data: {
        evidenceId: evidence.id,
        engine: scanEngine,
        status: EvidenceScanStatus.PENDING,
        findings: null,
        failureReason: null,
        quarantined: false
      }
    });

    if (!this.isAntivirusEnabled()) {
      const skipNote = 'Scan skipped: antivirus disabled in this environment';
      const updated = await this.completeWithoutScan(
        evidence.id,
        scan.id,
        resolvedFileSize,
        scanEngine,
        skipNote,
        evidenceInclude
      );

      this.logger.log(
        `Evidence ${evidence.id} ingestion auto-completed (antivirus disabled)`
      );

      return this.toEvidenceRecord(updated);
    }

    await this.queue.enqueue<EvidenceIngestionJobPayload>('evidence.ingest', {
      evidenceId: evidence.id,
      scanId: scan.id,
      storageUri: evidence.storageUri,
      storageKey: evidence.storageKey,
      storageProvider: evidence.storageProvider,
      checksum: evidence.checksum ?? undefined,
      requestedByEmail: user.email
    });

    this.logger.log(`Evidence ${evidence.id} queued for ingestion`);

    return this.toEvidenceRecord(evidence);
  }

  async reprocess(
    user: AuthenticatedUser,
    evidenceId: string,
    payload: ReprocessEvidenceDto
  ): Promise<EvidenceRecord> {
    const evidenceInclude = this.getEvidenceInclude();
    const evidence = await this.prisma.evidenceItem.findUnique({
      where: { id: evidenceId },
      include: evidenceInclude
    });

    if (!evidence || evidence.organizationId !== user.organizationId) {
      throw new NotFoundException('Evidence not found');
    }

    const scanEngine = this.resolveScanEngine();
    const reason = payload.reason?.trim();

    const scan = await this.prisma.evidenceScan.create({
      data: {
        evidenceId: evidence.id,
        engine: scanEngine,
        status: EvidenceScanStatus.PENDING,
        findings: reason
          ? ({ reprocessReason: reason } as Prisma.JsonObject)
          : undefined,
        failureReason: null,
        quarantined: false
      }
    });

    if (!this.isAntivirusEnabled()) {
      const skipNote = 'Re-scan skipped: antivirus disabled in this environment';
      const updated = await this.completeWithoutScan(
        evidence.id,
        scan.id,
        evidence.fileSize,
        scanEngine,
        skipNote,
        evidenceInclude
      );
      return this.toEvidenceRecord(updated);
    }

    const reprocessNote = reason ? `Re-scan queued: ${reason}` : 'Re-scan queued for antivirus';

    const updated = await this.prisma.evidenceItem.update({
      where: { id: evidence.id },
      data: {
        ingestionStatus: EvidenceIngestionStatus.PENDING,
        ingestionNotes: reprocessNote,
        lastScanStatus: EvidenceScanStatus.PENDING,
        lastScanAt: new Date(),
        lastScanEngine: scanEngine,
        lastScanSignatureVersion: null,
        lastScanNotes: reprocessNote,
        lastScanDurationMs: null,
        lastScanBytes: null,
        nextAction: 'Antivirus re-scan pending'
      },
      include: evidenceInclude
    });

    await this.queue.enqueue<EvidenceIngestionJobPayload>('evidence.ingest', {
      evidenceId: evidence.id,
      scanId: scan.id,
      storageUri: evidence.storageUri,
      storageKey: evidence.storageKey,
      storageProvider: evidence.storageProvider,
      checksum: evidence.checksum ?? undefined,
      requestedByEmail: user.email
    });

    this.logger.log(`Evidence ${evidence.id} re-scan queued (scan ${scan.id})`);

    return this.toEvidenceRecord(updated);
  }

  async updateMetadata(
    user: AuthenticatedUser,
    evidenceId: string,
    payload: UpdateEvidenceMetadataDto
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

    if (!evidence || evidence.organizationId !== user.organizationId) {
      throw new NotFoundException('Evidence not found');
    }

    const updateData: Prisma.EvidenceItemUpdateInput = {};
    const metadataUpdates: Record<string, unknown> = {};
    const currentMetadata = this.normalizeMetadata(evidence.metadata);

    if (payload.name !== undefined) {
      const trimmedName = payload.name.trim();
      if (!trimmedName) {
        throw new BadRequestException('Evidence name cannot be empty');
      }
      updateData.name = trimmedName;
    }

    const attachmentControlIds = evidence.controls.map(
      (link) => link.assessmentControl.controlId
    );
    const attachmentFrameworkIds = evidence.controls.map(
      (link) => link.assessmentControl.control.frameworkId
    );

    if (payload.controlIds !== undefined) {
      const manualControlIds = Array.from(
        new Set(
          payload.controlIds
            .map((value) => value.trim())
            .filter((value) => value.length > 0)
        )
      );

      metadataUpdates.manualControlIds = manualControlIds;
      const combinedControlIds = Array.from(
        new Set([...manualControlIds, ...attachmentControlIds])
      );
      metadataUpdates.controlIds = combinedControlIds;
      updateData.displayControlIds = combinedControlIds;
    }

    if (payload.frameworkIds !== undefined) {
      const manualFrameworkIds = Array.from(
        new Set(
          payload.frameworkIds
            .map((value) => value.trim())
            .filter((value) => value.length > 0)
        )
      );

      metadataUpdates.manualFrameworkIds = manualFrameworkIds;
      const combinedFrameworkIds = Array.from(
        new Set([...manualFrameworkIds, ...attachmentFrameworkIds])
      );
      await this.ensureFrameworksExist(user.organizationId, combinedFrameworkIds);
      updateData.displayFrameworkIds = combinedFrameworkIds;
      updateData.frameworks = {
        deleteMany: {},
        create: combinedFrameworkIds.map((frameworkId) => ({
          framework: {
            connect: { id: frameworkId }
          }
        }))
      };
    }

    if (payload.categories !== undefined) {
      const categories = payload.categories
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      metadataUpdates.categories = categories;
    }

    if (payload.tags !== undefined) {
      const tags = payload.tags
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      metadataUpdates.tags = tags;
    }

    if (payload.notes !== undefined) {
      const notes = payload.notes.trim();
      metadataUpdates.notes = notes.length > 0 ? notes : null;
    }

    if (payload.nextAction !== undefined) {
      const nextAction = payload.nextAction.trim();
      const normalized = nextAction.length > 0 ? nextAction : null;
      metadataUpdates.nextAction = normalized;
      updateData.nextAction = normalized;
    }

    if (payload.source !== undefined) {
      const source = payload.source.trim();
      metadataUpdates.source = source.length > 0 ? source : null;
    }

    if (Object.keys(metadataUpdates).length > 0) {
      updateData.metadata = this.mergeMetadata(evidence.metadata, metadataUpdates) as Prisma.JsonObject;
    }

    if (Object.keys(updateData).length === 0) {
      return this.toEvidenceRecord(evidence);
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

    return this.toEvidenceRecord(updated);
  }

  async updateAssessmentLinks(
    user: AuthenticatedUser,
    evidenceId: string,
    payload: UpdateEvidenceLinksDto
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

    if (!evidence || evidence.organizationId !== user.organizationId) {
      throw new NotFoundException('Evidence not found');
    }

    const desiredControls = await this.resolveAssessmentControls(
      user.organizationId,
      payload.assessmentControlIds ?? []
    );

    const desiredIds = desiredControls.map((control) => control.id);
    const currentMetadata = this.normalizeMetadata(evidence.metadata);

    const manualControlIds = Array.isArray(currentMetadata.manualControlIds)
      ? (currentMetadata.manualControlIds as string[])
      : [];
    const manualFrameworkIds = Array.isArray(currentMetadata.manualFrameworkIds)
      ? (currentMetadata.manualFrameworkIds as string[])
      : [];

    const combinedControlIds = Array.from(
      new Set([...manualControlIds, ...desiredControls.map((control) => control.controlId)])
    );

    const combinedFrameworkIds = Array.from(
      new Set([
        ...manualFrameworkIds,
        ...desiredControls.map((control) => control.control.frameworkId)
      ])
    );

    await this.ensureFrameworksExist(user.organizationId, combinedFrameworkIds);

    const updatedMetadata = this.mergeMetadata(evidence.metadata, {
      controlIds: combinedControlIds,
      manualControlIds,
      manualFrameworkIds,
      assessmentControlIds: desiredIds
    }) as Prisma.JsonObject;

    await this.prisma.$transaction(async (tx) => {
      if (desiredIds.length) {
        await tx.assessmentEvidence.deleteMany({
          where: {
            evidenceId: evidence.id,
            assessmentControlId: {
              notIn: desiredIds
            }
          }
        });

        await tx.assessmentEvidence.createMany({
          data: desiredIds.map((id) => ({
            evidenceId: evidence.id,
            assessmentControlId: id
          })),
          skipDuplicates: true
        });
      } else {
        await tx.assessmentEvidence.deleteMany({
          where: { evidenceId: evidence.id }
        });
      }

      await tx.evidenceItem.update({
        where: { id: evidence.id },
        data: {
          displayControlIds: combinedControlIds,
          displayFrameworkIds: combinedFrameworkIds,
          metadata: updatedMetadata,
          frameworks: {
            deleteMany: {},
            create: combinedFrameworkIds.map((frameworkId) => ({
              framework: {
                connect: { id: frameworkId }
              }
            }))
          }
        }
      });
    });

    const refreshed = await this.prisma.evidenceItem.findUnique({
      where: { id: evidence.id },
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

    if (!refreshed) {
      throw new NotFoundException('Evidence not found');
    }

    return this.toEvidenceRecord(refreshed);
  }

  async delete(user: AuthenticatedUser, evidenceId: string): Promise<void> {
    const evidence = await this.prisma.evidenceItem.findUnique({
      where: { id: evidenceId },
      select: { organizationId: true }
    });

    if (!evidence || evidence.organizationId !== user.organizationId) {
      throw new NotFoundException('Evidence not found');
    }

    await this.prisma.evidenceItem.delete({
      where: { id: evidenceId }
    });
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
      await this.markUploadFailed(uploadRequest.id, 'Failed to persist local evidence upload');
      this.logger.error('Failed to persist local evidence upload', error as Error);
      throw new InternalServerErrorException('Failed to persist evidence upload');
    }

    let stats: import('fs').Stats;
    try {
      stats = await fs.stat(destination);
    } catch (error) {
      await this.markUploadFailed(uploadRequest.id, 'Unable to inspect uploaded file');
      this.logger.error('Failed to inspect uploaded evidence file', error as Error);
      throw new InternalServerErrorException('Failed to persist evidence upload');
    }

    await this.prisma.evidenceUploadRequest.update({
      where: { id: uploadRequest.id },
      data: {
        status: EvidenceUploadStatus.UPLOADED,
        uploadedAt: new Date(),
        uploadUrl: `file://${destination}`,
        sizeInBytes: stats.size,
        failureReason: null,
        lastErrorAt: null
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

    const assessmentLinks = item.controls
      .filter((link) => link.assessmentControl)
      .map((link) => {
        const assessment = link.assessmentControl.assessment;
        const control = link.assessmentControl.control;

        return {
          assessmentControlId: link.assessmentControlId,
          assessmentId: assessment.id,
          assessmentName: assessment.name,
          assessmentStatus: assessment.status,
          controlId: control.id,
          controlTitle: control.title,
          controlFamily: control.family
        };
      });

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
      assessmentLinks,
      metadata,
      reviewer,
      uploadedBy,
      nextAction,
      ingestionNotes: item.ingestionNotes ?? null,
      lastScanStatus: item.lastScanStatus ?? null,
      lastScanAt: item.lastScanAt?.toISOString() ?? null,
      lastScanEngine: item.lastScanEngine ?? null,
      lastScanSignatureVersion: item.lastScanSignatureVersion ?? null,
      lastScanSummary: item.lastScanNotes ?? null,
      lastScanDurationMs: item.lastScanDurationMs ?? null,
      lastScanBytes: item.lastScanBytes ?? null
    };
  }

  private resolveScanEngine(): string {
    const configured = this.config.get<string>('antivirus.engineName')?.trim();
    if (configured && configured.length > 0) {
      return configured;
    }
    return 'clamav';
  }

  private getEvidenceInclude(): Prisma.EvidenceItemInclude {
    return {
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
    };
  }

  private async completeWithoutScan(
    evidenceId: string,
    scanId: string,
    fileSize: number,
    scanEngine: string,
    notes: string,
    include: Prisma.EvidenceItemInclude
  ): Promise<EvidenceItemWithRelations> {
    const completedAt = new Date();

    await this.prisma.evidenceScan.update({
      where: { id: scanId },
      data: {
        status: EvidenceScanStatus.CLEAN,
        completedAt,
        durationMs: 0,
        bytesScanned: fileSize,
        findings: {
          skipped: true,
          reason: 'antivirus_disabled'
        } as Prisma.JsonObject,
        failureReason: null,
        quarantined: false,
        engineVersion: scanEngine,
        signatureVersion: null
      }
    });

    return this.prisma.evidenceItem.update({
      where: { id: evidenceId },
      data: {
        ingestionStatus: EvidenceIngestionStatus.COMPLETED,
        ingestionNotes: notes,
        lastScanStatus: EvidenceScanStatus.CLEAN,
        lastScanAt: completedAt,
        lastScanEngine: scanEngine,
        lastScanSignatureVersion: null,
        lastScanNotes: notes,
        lastScanDurationMs: 0,
        lastScanBytes: fileSize
      },
      include
    });
  }

  private isAntivirusEnabled(): boolean {
    const configured = this.config.get<boolean>('antivirus.enabled');
    return configured === undefined ? true : configured;
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
    try {
      return this.storage.resolveLocalPath(storageKey);
    } catch (error) {
      this.logger.warn(`Rejected invalid storage key ${storageKey}: ${(error as Error).message}`);
      throw new ForbiddenException('Invalid storage key');
    }
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

    if (uploadRequest.status === EvidenceUploadStatus.FAILED) {
      throw new BadRequestException('Upload request failed verification. Request a new upload.');
    }

    if (uploadRequest.uploadExpiresAt && uploadRequest.uploadExpiresAt.getTime() < Date.now()) {
      await this.prisma.evidenceUploadRequest.update({
        where: { id: uploadRequest.id },
        data: { status: EvidenceUploadStatus.EXPIRED }
      });
      throw new BadRequestException('Upload request has expired');
    }
  }

  private async resolveAssessmentControls(
    organizationId: string,
    identifiers: string[]
  ): Promise<AssessmentControlWithRelations[]> {
    if (!identifiers.length) {
      return [];
    }

    const uniqueIds = Array.from(
      new Set(
        identifiers
          .map((identifier) => identifier.trim())
          .filter((identifier) => identifier.length > 0)
      )
    );

    if (!uniqueIds.length) {
      return [];
    }

    const controls = await this.prisma.assessmentControl.findMany({
      where: {
        id: {
          in: uniqueIds
        },
        assessment: {
          organizationId
        }
      },
      include: {
        assessment: true,
        control: true
      }
    });

    if (controls.length !== uniqueIds.length) {
      throw new BadRequestException('One or more assessment controls are invalid');
    }

    return controls;
  }

  private async ensureFrameworksExist(
    organizationId: string,
    frameworkIds: string[]
  ): Promise<void> {
    if (!frameworkIds.length) {
      return;
    }

    const uniqueIds = Array.from(new Set(frameworkIds));

    const frameworks = await this.prisma.framework.findMany({
      where: {
        id: {
          in: uniqueIds
        },
        organizationId
      },
      select: {
        id: true
      }
    });

    if (frameworks.length !== uniqueIds.length) {
      throw new BadRequestException('One or more frameworks are invalid');
    }
  }

  private async markUploadFailed(uploadRequestId: string, reason: string): Promise<void> {
    try {
      await this.prisma.evidenceUploadRequest.update({
        where: { id: uploadRequestId },
        data: {
          status: EvidenceUploadStatus.FAILED,
          failureReason: reason.substring(0, 512),
          lastErrorAt: new Date(),
          retryCount: {
            increment: 1
          }
        }
      });
    } catch (error) {
      this.logger.warn(
        `Unable to record upload failure for ${uploadRequestId}: ${(error as Error).message}`
      );
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
