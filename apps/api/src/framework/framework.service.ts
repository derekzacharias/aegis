import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AssessmentControl as AssessmentControlModel,
  AssessmentEvidence,
  AssessmentProject,
  Control as ControlModel,
  ControlKind as PrismaControlKind,
  ControlMapping as ControlMappingModel,
  ControlMappingEvidenceHint,
  ControlStatus as PrismaControlStatus,
  BaselineLevel as PrismaBaselineLevelEnum,
  EvidenceFramework,
  EvidenceItem,
  EvidenceStatus,
  Framework as FrameworkModel,
  FrameworkStatus as PrismaFrameworkStatus,
  Prisma
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomFrameworkDto, CustomControlDto } from './dto/create-custom-framework.dto';
import { UpdateCustomFrameworkDto } from './dto/update-custom-framework.dto';
import { UpsertCustomControlsDto } from './dto/upsert-custom-controls.dto';
import { PublishFrameworkDto } from './dto/publish-framework.dto';
import {
  BaselineLevel,
  ControlMappingOrigin,
  ControlPriority,
  FrameworkFamily
} from './framework.types';
import { frameworks as seededFrameworks } from './seed/frameworks.seed';
import { controls as seededControls } from './seed/controls.seed';

export type FrameworkSummary = {
  id: string;
  slug: string;
  name: string;
  version: string;
  description: string;
  family: FrameworkFamily;
  status: PrismaFrameworkStatus;
  isCustom: boolean;
  controlCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type EvidenceReuseHintSummary = {
  id: string;
  summary: string;
  rationale?: string;
  score: number;
  evidenceId?: string;
};

export type ControlMappingSummary = {
  id: string;
  targetControlId: string;
  targetControlTitle: string;
  targetFramework: {
    id: string;
    name: string;
    version: string;
  };
  confidence: number;
  origin: ControlMappingOrigin;
  rationale?: string;
  tags: string[];
  evidenceHints: EvidenceReuseHintSummary[];
};

export type ControlEvidenceSummary = {
  id: string;
  name: string;
  status: EvidenceStatus;
  uploadedAt: string;
  uri?: string;
  tags: string[];
  frameworks: Array<{
    id: string;
    name: string;
    version: string;
  }>;
};

export type ControlAssessmentSummary = {
  id: string;
  name: string;
  status: AssessmentProject['status'];
  controlStatus: PrismaControlStatus;
  dueDate?: string | null;
};

export type ControlStatusSummary = {
  status: PrismaControlStatus;
  count: number;
};

export type ControlCatalogItem = {
  id: string;
  frameworkId: string;
  family: string;
  title: string;
  description: string;
  priority: ControlPriority;
  kind: 'base' | 'enhancement';
  parentId?: string | null;
  baselines?: BaselineLevel[];
  keywords?: string[];
  references?: string[];
  relatedControls?: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
  assessments: ControlAssessmentSummary[];
  evidence: ControlEvidenceSummary[];
  mappings: ControlMappingSummary[];
  statusSummary: ControlStatusSummary[];
};

export type ControlCatalogFacets = {
  families: Array<{ value: string; count: number }>;
  priorities: Array<{ value: ControlPriority; count: number }>;
  types: Array<{ value: 'base' | 'enhancement'; count: number }>;
  statuses: Array<{ value: PrismaControlStatus; count: number }>;
};

export type ControlCatalogResponse = {
  frameworkId: string;
  framework: FrameworkSummary;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  items: ControlCatalogItem[];
  facets: ControlCatalogFacets;
};

export type ControlCatalogFilters = {
  search?: string;
  family?: string;
  priority?: ControlPriority;
  kind?: 'base' | 'enhancement';
  status?: PrismaControlStatus;
  page: number;
  pageSize: number;
};

export type FrameworkControlDetail = {
  id: string;
  frameworkId: string;
  family: string;
  title: string;
  description: string;
  priority: ControlPriority;
  kind: 'base' | 'enhancement';
  parentId?: string | null;
  baselines?: BaselineLevel[];
  keywords?: string[];
  references?: string[];
  relatedControls?: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
  mappings: ControlMappingSummary[];
};

export type FrameworkDetail = FrameworkSummary & {
  metadata?: Record<string, unknown>;
  controls: FrameworkControlDetail[];
};

type ControlWithRelations = ControlModel & {
  sourceMappings: any[];
  assessmentControls: any[];
};

@Injectable()
export class FrameworkService {
  private static readonly STATUS_ORDER: PrismaControlStatus[] = [
    'UNASSESSED',
    'SATISFIED',
    'PARTIAL',
    'UNSATISFIED',
    'NOT_APPLICABLE'
  ];

  private readonly baselineFromPrisma: Record<PrismaBaselineLevelEnum, BaselineLevel> = {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high',
    PRIVACY: 'privacy'
  };

  private readonly baselineToPrisma: Record<BaselineLevel, PrismaBaselineLevelEnum> = {
    low: 'LOW',
    moderate: 'MODERATE',
    high: 'HIGH',
    privacy: 'PRIVACY'
  };

  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string): Promise<FrameworkSummary[]> {
    const frameworks = await this.prisma.framework.findMany({
      where: { organizationId },
      orderBy: [{ status: 'desc' }, { family: 'asc' }, { name: 'asc' }]
    });

    if (frameworks.length === 0) {
      const now = new Date().toISOString();
      return seededFrameworks.map((framework) => ({
        id: framework.id,
        slug: framework.id,
        name: framework.name,
        version: framework.version,
        description: framework.description,
        family: framework.family as FrameworkFamily,
        status: 'PUBLISHED',
        isCustom: false,
        controlCount:
          framework.controlCount ??
          seededControls.filter((control) => control.frameworkId === framework.id).length,
        createdAt: now,
        updatedAt: now,
        publishedAt: now
      }));
    }

    return frameworks.map((framework) => this.toFrameworkSummary(framework));
  }

  async get(organizationId: string, frameworkId: string): Promise<FrameworkSummary | null> {
    const framework = await this.prisma.framework.findFirst({
      where: { id: frameworkId, organizationId }
    });

    return framework ? this.toFrameworkSummary(framework) : null;
  }

  async getDetail(organizationId: string, frameworkId: string): Promise<FrameworkDetail | null> {
    const framework = await this.prisma.framework.findFirst({
      where: { id: frameworkId, organizationId },
      include: {
        controls: {
          orderBy: [{ family: 'asc' }, { title: 'asc' }],
          include: this.controlRelationsInclude()
        }
      }
    });

    if (!framework) {
      return null;
    }

    return this.toFrameworkDetail(framework);
  }

  async createCustomFramework(
    organizationId: string,
    userId: string,
    dto: CreateCustomFrameworkDto
  ): Promise<FrameworkDetail> {
    try {
      const frameworkId = await this.prisma.$transaction(async (tx) => {
        const name = dto.name.trim();
        const version = dto.version.trim();
        const slug = await this.generateUniqueSlug(tx, organizationId, name, version);

        const framework = await tx.framework.create({
          data: {
            slug,
            name,
            version,
            description: dto.description.trim(),
            family: (dto.family ?? 'CUSTOM') as FrameworkFamily,
            status: dto.publish ? 'PUBLISHED' : 'DRAFT',
            isCustom: true,
            metadata: dto.metadata ? (dto.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
            organizationId,
            createdById: userId,
            updatedById: userId,
            publishedAt: dto.publish ? new Date() : null
          }
        });

        if (dto.controls?.length) {
          await this.upsertControlsInternal(tx, framework.id, userId, dto.controls);
        }

        const controlCount = await tx.control.count({
          where: { frameworkId: framework.id }
        });

        await tx.framework.update({
          where: { id: framework.id },
          data: {
            controlCount,
            status: dto.publish ? 'PUBLISHED' : 'DRAFT',
            publishedAt: dto.publish ? new Date() : framework.publishedAt
          }
        });

        return framework.id;
      });

      return this.getDetailOrThrow(organizationId, frameworkId);
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async updateCustomFramework(
    organizationId: string,
    userId: string,
    frameworkId: string,
    dto: UpdateCustomFrameworkDto
  ): Promise<FrameworkDetail> {
    await this.ensureFrameworkOwnership(organizationId, frameworkId);

    try {
      await this.prisma.framework.update({
        where: { id: frameworkId },
        data: {
          ...(dto.name ? { name: dto.name.trim() } : {}),
          ...(dto.version ? { version: dto.version.trim() } : {}),
          ...(dto.description ? { description: dto.description.trim() } : {}),
          ...(dto.family ? { family: dto.family } : {}),
          ...(dto.metadata !== undefined
            ? { metadata: dto.metadata ? (dto.metadata as Prisma.InputJsonValue) : Prisma.JsonNull }
            : {}),
          updatedById: userId
        }
      });
    } catch (error) {
      this.handlePrismaError(error);
      throw error;
    }

    return this.getDetailOrThrow(organizationId, frameworkId);
  }

  async upsertCustomControls(
    organizationId: string,
    userId: string,
    frameworkId: string,
    dto: UpsertCustomControlsDto
  ): Promise<FrameworkDetail> {
    await this.ensureFrameworkOwnership(organizationId, frameworkId);

    await this.prisma.$transaction(async (tx) => {
      await this.upsertControlsInternal(tx, frameworkId, userId, dto.controls);

      const controlCount = await tx.control.count({
        where: { frameworkId }
      });

      await tx.framework.update({
        where: { id: frameworkId },
        data: {
          controlCount,
          updatedById: userId
        }
      });
    });

    return this.getDetailOrThrow(organizationId, frameworkId);
  }

  async publishFramework(
    organizationId: string,
    frameworkId: string,
    userId: string,
    dto: PublishFrameworkDto
  ): Promise<FrameworkSummary> {
    await this.ensureFrameworkOwnership(organizationId, frameworkId);

    const controlCount = await this.prisma.control.count({
      where: { frameworkId }
    });

    if (controlCount === 0) {
      throw new BadRequestException('Cannot publish a framework without controls');
    }

    const updateData: Prisma.FrameworkUncheckedUpdateInput = {
      status: 'PUBLISHED',
      updatedById: userId,
      publishedAt: new Date()
    };

    if (dto.metadata !== undefined) {
      updateData.metadata = dto.metadata
        ? (dto.metadata as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    }

    const updated = await this.prisma.framework.update({
      where: { id: frameworkId },
      data: updateData
    });

    return this.toFrameworkSummary(updated);
  }

  async listControls(
    organizationId: string,
    frameworkId: string,
    rawFilters: ControlCatalogFilters
  ): Promise<ControlCatalogResponse> {
    const framework = await this.ensureFrameworkOwnership(organizationId, frameworkId);
    const filters = this.normalizeControlFilters(rawFilters);

    const where = this.buildControlWhere(frameworkId, filters, { includeStatusFilter: true });
    const facetWhere = this.buildControlWhere(frameworkId, filters, { includeStatusFilter: false });

    const [total, controls, familyBuckets, priorityBuckets, typeBuckets, statusBuckets] =
      await Promise.all([
        this.prisma.control.count({ where }),
        this.prisma.control.findMany({
          where,
          include: this.controlRelationsInclude(),
          orderBy: [{ family: 'asc' }, { title: 'asc' }],
          skip: (filters.page - 1) * filters.pageSize,
          take: filters.pageSize
        }),
        this.prisma.control.groupBy({
          where: facetWhere,
          by: ['family'],
          _count: { _all: true }
        }),
        this.prisma.control.groupBy({
          where: facetWhere,
          by: ['priority'],
          _count: { _all: true }
        }),
        this.prisma.control.groupBy({
          where: facetWhere,
          by: ['kind'],
          _count: { _all: true }
        }),
        this.prisma.assessmentControl.groupBy({
          where: {
            control: facetWhere
          },
          by: ['status'],
          _count: { _all: true }
        })
      ]);

    const items = controls.map((control) => this.toControlCatalogItem(control));
    const hasNextPage =
      (filters.page - 1) * filters.pageSize + controls.length < total;

    return {
      frameworkId,
      framework: this.toFrameworkSummary(framework),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      hasNextPage,
      items,
      facets: {
        families: familyBuckets.map((bucket) => ({
          value: bucket.family,
          count: bucket._count._all
        })),
        priorities: priorityBuckets.map((bucket) => ({
          value: bucket.priority as ControlPriority,
          count: bucket._count._all
        })),
        types: typeBuckets.map((bucket) => ({
          value: this.mapControlKind(bucket.kind as PrismaControlKind),
          count: bucket._count._all
        })),
        statuses: statusBuckets.map((bucket) => ({
          value: bucket.status,
          count: bucket._count._all
        }))
      }
    };
  }

  private toFrameworkSummary(framework: FrameworkModel): FrameworkSummary {
    return {
      id: framework.id,
      slug: framework.slug,
      name: framework.name,
      version: framework.version,
      description: framework.description,
      family: framework.family as FrameworkFamily,
      status: framework.status,
      isCustom: framework.isCustom,
      controlCount: framework.controlCount,
      createdAt: framework.createdAt.toISOString(),
      updatedAt: framework.updatedAt.toISOString(),
      publishedAt: framework.publishedAt ? framework.publishedAt.toISOString() : null
    };
  }

  private toFrameworkDetail(
    framework: FrameworkModel & { controls: ControlWithRelations[] }
  ): FrameworkDetail {
    return {
      ...this.toFrameworkSummary(framework),
      metadata: this.deserializeMetadata(framework.metadata),
      controls: framework.controls.map((control) => this.toFrameworkControlDetail(control))
    };
  }

  private toFrameworkControlDetail(control: ControlWithRelations): FrameworkControlDetail {
    return {
      id: control.id,
      frameworkId: control.frameworkId,
      family: control.family,
      title: control.title,
      description: control.description,
      priority: control.priority as ControlPriority,
      kind: this.mapControlKind(control.kind),
      parentId: control.parentId ?? null,
      baselines: this.mapBaselinesFromPrisma(control.baselines ?? []),
      keywords: control.keywords ?? [],
      references: control.references ?? [],
      relatedControls: control.relatedControls ?? [],
      tags: control.tags ?? [],
      metadata: this.deserializeMetadata(control.metadata),
      mappings: control.sourceMappings
        .filter((mapping) => Boolean(mapping.targetControl))
        .map((mapping) => this.toControlMappingSummary(mapping))
    };
  }

  private toControlCatalogItem(control: ControlWithRelations): ControlCatalogItem {
    const assessments: ControlAssessmentSummary[] = control.assessmentControls
      .filter((record) => Boolean(record.assessment))
      .map((record) => ({
        id: record.assessment.id,
        name: record.assessment.name,
        status: record.assessment.status,
        controlStatus: record.status,
        dueDate: record.dueDate ? record.dueDate.toISOString() : null
      }));

    const evidence: ControlEvidenceSummary[] = [];
    for (const assessmentControl of control.assessmentControls) {
      for (const link of assessmentControl.evidenceLinks) {
        if (!link.evidence) {
          continue;
        }

        evidence.push({
          id: link.evidence.id,
          name: link.evidence.name,
          status: link.evidence.status,
          uploadedAt: link.evidence.uploadedAt.toISOString(),
          uri: link.evidence.storageUri,
          tags: this.extractEvidenceTags(link.evidence),
          frameworks: link.evidence.frameworks.map(
            (entry: EvidenceFramework & { framework: Pick<FrameworkModel, 'id' | 'name' | 'version'> }) => ({
              id: entry.framework.id,
              name: entry.framework.name,
              version: entry.framework.version
            })
          )
        });
      }
    }

    return {
      id: control.id,
      frameworkId: control.frameworkId,
      family: control.family,
      title: control.title,
      description: control.description,
      priority: control.priority as ControlPriority,
      kind: this.mapControlKind(control.kind),
      parentId: control.parentId ?? null,
      baselines: this.mapBaselinesFromPrisma(control.baselines ?? []),
      keywords: control.keywords ?? [],
      references: control.references ?? [],
      relatedControls: control.relatedControls ?? [],
      tags: control.tags ?? [],
      metadata: this.deserializeMetadata(control.metadata),
      assessments,
      evidence,
      mappings: control.sourceMappings
        .filter((mapping) => Boolean(mapping.targetControl))
        .map((mapping) => this.toControlMappingSummary(mapping)),
      statusSummary: this.buildStatusSummary(control.assessmentControls)
    };
  }

  private toControlMappingSummary(
    mapping: ControlMappingModel & {
      targetControl: ControlModel & { framework: FrameworkModel };
      evidenceHints: ControlMappingEvidenceHint[];
    }
  ): ControlMappingSummary {
    return {
      id: mapping.id,
      targetControlId: mapping.targetControlId,
      targetControlTitle: mapping.targetControl.title,
      targetFramework: {
        id: mapping.targetControl.framework.id,
        name: mapping.targetControl.framework.name,
        version: mapping.targetControl.framework.version
      },
      confidence: mapping.confidence,
      origin: mapping.origin as ControlMappingOrigin,
      rationale: mapping.rationale ?? undefined,
      tags: this.normalizeTags(mapping.tags),
      evidenceHints:
        mapping.evidenceHints?.map((hint) => ({
          id: hint.id,
          summary: hint.summary,
          rationale: hint.rationale ?? undefined,
          score: hint.score,
          evidenceId: hint.evidenceId ?? undefined
        })) ?? []
    };
  }

  private buildStatusSummary(
    assessmentControls: AssessmentControlModel[]
  ): ControlStatusSummary[] {
    if (!assessmentControls.length) {
      return [];
    }

    const counts = new Map<PrismaControlStatus, number>();
    for (const record of assessmentControls) {
      counts.set(record.status, (counts.get(record.status) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort(
        (left, right) =>
          FrameworkService.STATUS_ORDER.indexOf(left[0]) -
          FrameworkService.STATUS_ORDER.indexOf(right[0])
      )
      .map(([status, count]) => ({ status, count }));
  }

  private normalizeControlFilters(filters: ControlCatalogFilters): ControlCatalogFilters {
    const page = Math.max(filters.page ?? 1, 1);
    const pageSize = Math.max(Math.min(filters.pageSize ?? 25, 100), 1);
    const kind = filters.kind === 'base' || filters.kind === 'enhancement' ? filters.kind : undefined;

    return {
      search: filters.search?.trim() || undefined,
      family: filters.family?.trim() || undefined,
      priority: filters.priority ?? undefined,
      kind,
      status: filters.status,
      page,
      pageSize
    };
  }

  private buildControlWhere(
    frameworkId: string,
    filters: ControlCatalogFilters,
    options: { includeStatusFilter: boolean }
  ): Prisma.ControlWhereInput {
    const where: Prisma.ControlWhereInput = {
      frameworkId
    };

    if (filters.family) {
      where.family = { equals: filters.family, mode: 'insensitive' };
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.kind) {
      where.kind = filters.kind === 'enhancement' ? 'ENHANCEMENT' : 'BASE';
    }

    if (filters.search) {
      const term = filters.search;
      where.OR = [
        { id: { contains: term, mode: 'insensitive' } },
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { family: { contains: term, mode: 'insensitive' } },
        { keywords: { has: term } }
      ];
    }

    if (filters.status && options.includeStatusFilter) {
      where.assessmentControls = {
        some: {
          status: filters.status
        }
      };
    }

    return where;
  }

  private async generateUniqueSlug(
    tx: Prisma.TransactionClient,
    organizationId: string,
    name: string,
    version: string
  ): Promise<string> {
    const base = this.slugify(`${name}-${version}`);
    let candidate = base;
    let attempt = 1;

    while (true) {
      const existing = await tx.framework.findFirst({
        where: {
          organizationId,
          slug: candidate
        },
        select: { id: true }
      });

      if (!existing) {
        return candidate;
      }

      attempt += 1;
      candidate = `${base}-${attempt}`;
    }
  }

  private slugify(value: string): string {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return normalized || `framework-${Date.now()}`;
  }

  private async upsertControlsInternal(
    tx: Prisma.TransactionClient,
    frameworkId: string,
    userId: string,
    controls: CustomControlDto[]
  ) {
    const retainedIds: string[] = [];

    for (const control of controls) {
      const { create, update } = this.buildControlWriteData(frameworkId, userId, control);
      let record: ControlModel;

      if (control.id) {
        const existing = await tx.control.findFirst({
          where: { id: control.id, frameworkId }
        });

        if (!existing) {
          throw new NotFoundException(
            `Control ${control.id} does not belong to framework ${frameworkId}`
          );
        }

        record = await tx.control.update({
          where: { id: existing.id },
          data: update
        });
      } else {
        record = await tx.control.create({
          data: create
        });
      }

      retainedIds.push(record.id);
      await this.replaceControlMappings(tx, record.id, control.mappings);
    }

    await tx.control.deleteMany({
      where: {
        frameworkId,
        isCustom: true,
        id: { notIn: retainedIds }
      }
    });
  }

  private buildControlWriteData(
    frameworkId: string,
    userId: string,
    control: CustomControlDto
  ): {
    create: Prisma.ControlUncheckedCreateInput;
    update: Prisma.ControlUncheckedUpdateInput;
  } {
    const tags = this.normalizeTags(control.tags);
    const metadataValue =
      control.metadata !== undefined
        ? (control.metadata as Prisma.InputJsonValue)
        : undefined;
    const prismaBaselines = this.mapBaselinesToPrisma(control.baselines);

    return {
      create: {
        id: control.id,
        frameworkId,
        family: control.family.trim(),
        title: control.title.trim(),
        description: control.description.trim(),
        priority: control.priority,
        kind: control.kind === 'enhancement' ? 'ENHANCEMENT' : 'BASE',
        parentId: control.parentId ?? null,
        baselines: prismaBaselines ?? [],
        keywords: control.keywords ?? [],
        references: control.references ?? [],
        relatedControls: control.relatedControls ?? [],
        tags,
        metadata: metadataValue ?? Prisma.JsonNull,
        isCustom: true,
        createdById: userId,
        updatedById: userId
      },
      update: {
        family: control.family.trim(),
        title: control.title.trim(),
        description: control.description.trim(),
        priority: control.priority,
        kind: control.kind === 'enhancement' ? 'ENHANCEMENT' : 'BASE',
        parentId: control.parentId ?? null,
        keywords: control.keywords ?? [],
        references: control.references ?? [],
        relatedControls: control.relatedControls ?? [],
        tags,
        ...(metadataValue !== undefined ? { metadata: metadataValue } : {}),
        ...(prismaBaselines !== undefined ? { baselines: prismaBaselines } : {}),
        updatedById: userId
      }
    };
  }

  private async replaceControlMappings(
    tx: Prisma.TransactionClient,
    controlId: string,
    mappings: CustomControlDto['mappings']
  ) {
    await tx.controlMapping.deleteMany({
      where: { sourceControlId: controlId }
    });

    if (!mappings?.length) {
      return;
    }

    for (const mapping of mappings) {
      const tags = this.normalizeTags(mapping.tags);
      await tx.controlMapping.create({
        data: {
          sourceControlId: controlId,
          targetControlId: mapping.targetControlId,
          confidence: mapping.confidence ?? 0.5,
          rationale: mapping.rationale?.trim(),
          tags,
          origin: 'MANUAL'
        }
      });
    }
  }

  private controlRelationsInclude() {
    return {
      sourceMappings: {
        include: {
          targetControl: {
            include: {
              framework: {
                select: {
                  id: true,
                  name: true,
                  version: true
                }
              }
            }
          },
          evidenceHints: {
            select: {
              id: true,
              summary: true,
              rationale: true,
              score: true,
              evidenceId: true
            }
          }
        }
      },
      assessmentControls: {
        include: {
          assessment: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          evidenceLinks: {
            include: {
              evidence: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  storageUri: true,
                  uploadedAt: true,
                  metadata: true,
                  frameworks: {
                    include: {
                      framework: {
                        select: {
                          id: true,
                          name: true,
                          version: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  private async ensureFrameworkOwnership(
    organizationId: string,
    frameworkId: string
  ): Promise<FrameworkModel> {
    const framework = await this.prisma.framework.findFirst({
      where: { id: frameworkId, organizationId }
    });

    if (!framework) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

    return framework;
  }

  private async getDetailOrThrow(
    organizationId: string,
    frameworkId: string
  ): Promise<FrameworkDetail> {
    const detail = await this.getDetail(organizationId, frameworkId);

    if (!detail) {
      throw new NotFoundException(`Framework ${frameworkId} not found`);
    }

    return detail;
  }

  private handlePrismaError(error: unknown): never {
    if (this.isUniqueConstraintError(error)) {
      throw new BadRequestException(
        'A framework with the same name and version already exists for this organization.'
      );
    }

    throw error;
  }

  private isUniqueConstraintError(error: unknown): error is { code: string } {
    return Boolean(
      error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === 'P2002'
    );
  }

  private mapControlKind(kind: PrismaControlKind): 'base' | 'enhancement' {
    return kind === 'ENHANCEMENT' ? 'enhancement' : 'base';
  }

  private deserializeMetadata(
    value: Prisma.JsonValue | null
  ): Record<string, unknown> | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'object') {
      return value as Record<string, unknown>;
    }

    return undefined;
  }

  private extractEvidenceTags(evidence: EvidenceItem): string[] {
    const metadata = this.deserializeMetadata(evidence.metadata);
    if (!metadata) {
      return [];
    }

    const tagsValue = metadata['tags'];
    if (!Array.isArray(tagsValue)) {
      return [];
    }

    return this.normalizeTags(
      tagsValue.filter((tag: unknown): tag is string => typeof tag === 'string')
    );
  }

  private normalizeTags(tags?: string[] | null): string[] {
    if (!tags?.length) {
      return [];
    }

    const seen = new Set<string>();
    const results: string[] = [];

    for (const tag of tags) {
      const trimmed = tag.trim();
      if (!trimmed) {
        continue;
      }

      const key = trimmed.toLowerCase();
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      results.push(trimmed);
    }

    return results;
  }

  private mapBaselinesFromPrisma(values: PrismaBaselineLevelEnum[]): BaselineLevel[] {
    return values.map((value) => this.baselineFromPrisma[value]);
  }

  private mapBaselinesToPrisma(values?: BaselineLevel[]): PrismaBaselineLevelEnum[] | undefined {
    if (!values) {
      return undefined;
    }

    return values.map((value) => this.baselineToPrisma[value]);
  }
}
