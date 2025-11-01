import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AssessmentStatus as PrismaAssessmentStatus,
  Control,
  ControlMappingOrigin,
  EvidenceStatus,
  Prisma,
  User
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

export type AssessmentStatus = 'draft' | 'in-progress' | 'complete';

export interface AssessmentSummary {
  id: string;
  name: string;
  frameworkIds: string[];
  status: AssessmentStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
  progress: {
    satisfied: number;
    partial: number;
    unsatisfied: number;
    total: number;
  };
}

export interface ControlReferenceSummary {
  id: string;
  title: string;
  frameworkId: string;
  family: string;
}

export interface EvidenceReuseHintSummary {
  id: string;
  summary: string;
  rationale?: string;
  score: number;
}

export interface EvidenceReuseEvidenceSummary {
  id: string;
  name: string;
  status: EvidenceStatus;
  uploadedAt: string;
  uri: string;
  frameworks: Array<{
    id: string;
    name: string;
    version: string;
  }>;
}

export interface EvidenceReuseRecommendation {
  mappingId: string;
  mappingOrigin: ControlMappingOrigin;
  confidence: number;
  tags: string[];
  sourceControl: ControlReferenceSummary;
  targetControl: ControlReferenceSummary;
  hint: EvidenceReuseHintSummary;
  evidence: EvidenceReuseEvidenceSummary;
}

type AssessmentWithRelations = Prisma.AssessmentProjectGetPayload<{
  include: {
    frameworks: true;
    owner: true;
  };
}>;

const statusToPrisma: Record<AssessmentStatus, PrismaAssessmentStatus> = {
  draft: PrismaAssessmentStatus.DRAFT,
  'in-progress': PrismaAssessmentStatus.IN_PROGRESS,
  complete: PrismaAssessmentStatus.COMPLETE
} as const;

const statusFromPrisma: Record<PrismaAssessmentStatus, AssessmentStatus> = {
  [PrismaAssessmentStatus.DRAFT]: 'draft',
  [PrismaAssessmentStatus.IN_PROGRESS]: 'in-progress',
  [PrismaAssessmentStatus.COMPLETE]: 'complete'
};

@Injectable()
export class AssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string): Promise<AssessmentSummary[]> {
    const assessments = await this.prisma.assessmentProject.findMany({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
      include: {
        frameworks: true,
        owner: true
      }
    });

    return assessments.map((assessment) => this.toSummary(assessment));
  }

  async create(organizationId: string, payload: CreateAssessmentDto): Promise<AssessmentSummary> {
    const name = payload.name.trim();
    if (!name) {
      throw new BadRequestException('Assessment name is required');
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

    const ownerEmail = payload.owner.toLowerCase();
    const ownerUser = await this.prisma.user.findFirst({
      where: {
        email: ownerEmail,
        organizationId
      }
    });

    const assessment = await this.prisma.assessmentProject.create({
      data: {
        name,
        organizationId,
        status: PrismaAssessmentStatus.DRAFT,
        ownerId: ownerUser?.id,
        ownerEmail,
        frameworks: {
          create: uniqueFrameworkIds.map((frameworkId) => ({
            framework: {
              connect: { id: frameworkId }
            }
          }))
        },
        progressSatisfied: 0,
        progressPartial: 0,
        progressUnsatisfied: 0,
        progressTotal: 0
      },
      include: {
        frameworks: true,
        owner: true
      }
    });

    return this.toSummary(assessment);
  }

  async updateStatus(
    organizationId: string,
    id: string,
    status: AssessmentStatus
  ): Promise<AssessmentSummary> {
    const target = await this.prisma.assessmentProject.findUnique({
      where: { id },
      include: {
        frameworks: true,
        owner: true
      }
    });

    if (!target || target.organizationId !== organizationId) {
      throw new NotFoundException(`Assessment ${id} not found`);
    }

    const prismaStatus = statusToPrisma[status];
    if (!prismaStatus) {
      throw new BadRequestException(`Unsupported status ${status}`);
    }

    if (target.status === prismaStatus) {
      return this.toSummary(target);
    }

    const updated = await this.prisma.assessmentProject.update({
      where: { id },
      data: {
        status: prismaStatus
      },
      include: {
        frameworks: true,
        owner: true
      }
    });

    return this.toSummary(updated);
  }

  async getEvidenceReuseRecommendations(
    organizationId: string,
    assessmentId: string
  ): Promise<EvidenceReuseRecommendation[]> {
    const assessment = await this.prisma.assessmentProject.findUnique({
      where: { id: assessmentId },
      include: {
        frameworks: true
      }
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }

    const frameworkIds = assessment.frameworks.map((framework) => framework.frameworkId);

    if (!frameworkIds.length) {
      return [];
    }

    const mappings = await this.prisma.controlMapping.findMany({
      where: {
        OR: [
          { sourceControl: { frameworkId: { in: frameworkIds } } },
          { targetControl: { frameworkId: { in: frameworkIds } } }
        ],
        evidenceHints: {
          some: {
            evidenceId: {
              not: null
            }
          }
        }
      },
      include: {
        sourceControl: true,
        targetControl: true,
        evidenceHints: {
          where: {
            evidenceId: {
              not: null
            }
          },
          include: {
            evidence: {
              include: {
                frameworks: {
                  include: {
                    framework: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const recommendations: EvidenceReuseRecommendation[] = [];

    for (const mapping of mappings) {
      for (const hint of mapping.evidenceHints) {
        const evidence = hint.evidence;

        if (!evidence || evidence.organizationId !== organizationId) {
          continue;
        }

        recommendations.push({
          mappingId: mapping.id,
          mappingOrigin: mapping.origin,
          confidence: Number(mapping.confidence.toFixed(3)),
          tags: mapping.tags ?? [],
          sourceControl: this.toControlReference(mapping.sourceControl),
          targetControl: this.toControlReference(mapping.targetControl),
          hint: {
            id: hint.id,
            summary: hint.summary,
            rationale: hint.rationale ?? undefined,
            score: Number((hint.score ?? 0.5).toFixed(3))
          },
          evidence: {
            id: evidence.id,
            name: evidence.name,
            status: evidence.status,
            uploadedAt: evidence.uploadedAt.toISOString(),
            uri: evidence.storageUri,
            frameworks: evidence.frameworks.map((link) => ({
              id: link.frameworkId,
              name: link.framework.name,
              version: link.framework.version
            }))
          }
        });
      }
    }

    recommendations.sort((left, right) => right.confidence - left.confidence);

    return recommendations;
  }

  private toSummary(assessment: AssessmentWithRelations): AssessmentSummary {
    return {
      id: assessment.id,
      name: assessment.name,
      frameworkIds: assessment.frameworks.map((framework) => framework.frameworkId),
      status: statusFromPrisma[assessment.status],
      owner: this.resolveOwner(assessment.owner, assessment.ownerEmail),
      createdAt: assessment.createdAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
      progress: {
        satisfied: assessment.progressSatisfied,
        partial: assessment.progressPartial,
        unsatisfied: assessment.progressUnsatisfied,
        total: assessment.progressTotal
      }
    };
  }

  private resolveOwner(owner: User | null, ownerEmail?: string | null): string {
    if (ownerEmail) {
      return ownerEmail;
    }

    if (owner) {
      return owner.email;
    }

    return 'unassigned';
  }

  private toControlReference(control: Control): ControlReferenceSummary {
    return {
      id: control.id,
      title: control.title,
      frameworkId: control.frameworkId,
      family: control.family
    };
  }
}
