import { Injectable, Logger } from '@nestjs/common';
import { AssessmentStatus as PrismaAssessmentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../database/prisma.service';

export type AssessmentStatus = 'draft' | 'in-progress' | 'complete';

export interface AssessmentSummary {
  id: string;
  name: string;
  frameworkIds: string[];
  status: AssessmentStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_MAP_FROM_PRISMA: Record<PrismaAssessmentStatus, AssessmentStatus> = {
  [PrismaAssessmentStatus.DRAFT]: 'draft',
  [PrismaAssessmentStatus.IN_PROGRESS]: 'in-progress',
  [PrismaAssessmentStatus.COMPLETE]: 'complete'
};

const STATUS_MAP_TO_PRISMA: Record<AssessmentStatus, PrismaAssessmentStatus> = {
  draft: PrismaAssessmentStatus.DRAFT,
  'in-progress': PrismaAssessmentStatus.IN_PROGRESS,
  complete: PrismaAssessmentStatus.COMPLETE
};

@Injectable()
export class AssessmentService {
  private readonly logger = new Logger(AssessmentService.name);
  private readonly fallbackAssessments: Map<string, AssessmentSummary> = new Map();

  constructor(private readonly prisma: PrismaService) {
    const now = new Date().toISOString();
    const initialAssessment: AssessmentSummary = {
      id: uuidv4(),
      name: 'FedRAMP Moderate Baseline Readiness',
      frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
      status: 'in-progress',
      owner: 'compliance-team@example.com',
      createdAt: now,
      updatedAt: now
    };

    this.fallbackAssessments.set(initialAssessment.id, initialAssessment);
  }

  async list(): Promise<AssessmentSummary[]> {
    try {
      const assessments = await this.prisma.assessmentProject.findMany({
        include: {
          frameworks: true,
          owner: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      if (!assessments.length) {
        return this.getFallbackAssessments();
      }

      return assessments.map((assessment) => ({
        id: assessment.id,
        name: assessment.name,
        frameworkIds: assessment.frameworks.map((f) => f.frameworkId),
        status: STATUS_MAP_FROM_PRISMA[assessment.status],
        owner: assessment.owner?.email ?? 'unassigned',
        createdAt: assessment.createdAt.toISOString(),
        updatedAt: assessment.updatedAt.toISOString()
      }));
    } catch (error) {
      this.logger.warn(
        `Failed to load assessments from database, using fallback seed: ${String(error)}`
      );
      return this.getFallbackAssessments();
    }
  }

  async create(payload: Pick<AssessmentSummary, 'name' | 'frameworkIds' | 'owner'>) {
    try {
      const assessment = await this.prisma.assessmentProject.create({
        data: {
          name: payload.name,
          status: PrismaAssessmentStatus.DRAFT,
          organization: {
            connectOrCreate: {
              where: { slug: 'aegis-compliance' },
              create: {
                name: 'Aegis Compliance Control Center',
                slug: 'aegis-compliance'
              }
            }
          },
          frameworks: {
            create: payload.frameworkIds.map((frameworkId) => ({
              framework: {
                connect: { id: frameworkId }
              }
            }))
          },
          owner: {
            connectOrCreate: {
              where: { email: payload.owner },
              create: {
                email: payload.owner,
                organization: {
                  connect: { slug: 'aegis-compliance' }
                }
              }
            }
          }
        },
        include: {
          frameworks: true,
          owner: true
        }
      });

      return {
        id: assessment.id,
        name: assessment.name,
        frameworkIds: assessment.frameworks.map((f) => f.frameworkId),
        status: STATUS_MAP_FROM_PRISMA[assessment.status],
        owner: assessment.owner?.email ?? payload.owner,
        createdAt: assessment.createdAt.toISOString(),
        updatedAt: assessment.updatedAt.toISOString()
      };
    } catch (error) {
      this.logger.warn(
        `Failed to create assessment in database, storing fallback entry: ${String(error)}`
      );

      const now = new Date().toISOString();
      const record: AssessmentSummary = {
        id: uuidv4(),
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        ...payload
      };

      this.fallbackAssessments.set(record.id, record);
      return record;
    }
  }

  async updateStatus(id: string, status: AssessmentStatus): Promise<AssessmentSummary> {
    try {
      const assessment = await this.prisma.assessmentProject.update({
        where: { id },
        data: {
          status: STATUS_MAP_TO_PRISMA[status]
        },
        include: {
          frameworks: true,
          owner: true
        }
      });

      return {
        id: assessment.id,
        name: assessment.name,
        frameworkIds: assessment.frameworks.map((f) => f.frameworkId),
        status,
        owner: assessment.owner?.email ?? 'unassigned',
        createdAt: assessment.createdAt.toISOString(),
        updatedAt: assessment.updatedAt.toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to update assessment ${id}: ${String(error)}`);

      const fallback = this.fallbackAssessments.get(id);
      if (fallback) {
        const now = new Date().toISOString();
        const updated: AssessmentSummary = {
          ...fallback,
          status,
          updatedAt: now
        };
        this.fallbackAssessments.set(id, updated);
        return updated;
      }

      throw error;
    }
  }

  private getFallbackAssessments(): AssessmentSummary[] {
    return Array.from(this.fallbackAssessments.values());
  }
}
