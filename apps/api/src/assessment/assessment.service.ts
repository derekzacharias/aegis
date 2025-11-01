import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AssessmentStatus as PrismaAssessmentStatus,
  Control,
  ControlMappingOrigin,
  ControlStatus as PrismaControlStatus,
  FrameworkStatus as PrismaFrameworkStatus,
  EvidenceStatus,
  Prisma,
  TaskPriority as PrismaTaskPriority,
  TaskStatus as PrismaTaskStatus,
  User
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import {
  CONTROL_STATUS_VALUES,
  ControlStatusValue,
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
  TaskPriorityValue,
  TaskStatusValue
} from './assessment.constants';
import { AuthenticatedUser } from '../auth/types/auth.types';

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

export interface AssessmentControlSummary {
  id: string;
  assessmentId: string;
  controlId: string;
  title: string;
  frameworkId: string;
  frameworkName: string;
  family: string;
  status: ControlStatusValue;
  owner: string;
  dueDate: string | null;
  comments: string | null;
  updatedAt: string;
}

export interface AssessmentFrameworkSummary {
  id: string;
  name: string;
  version: string;
}

export interface AssessmentTaskSummary {
  id: string;
  title: string;
  description?: string;
  status: TaskStatusValue;
  priority: TaskPriorityValue;
  owner: string;
  dueDate?: string;
  assessmentControlId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentControlView {
  id: string;
  controlId: string;
  title: string;
  frameworkId: string;
  frameworkName: string;
  status: ControlStatusValue;
  owner: string;
  dueDate?: string;
  comments?: string;
  tasks: AssessmentTaskSummary[];
  updatedAt: string;
}

export interface AssessmentAuditEntry {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AssessmentDetail extends AssessmentSummary {
  frameworks: AssessmentFrameworkSummary[];
  controls: AssessmentControlView[];
  tasks: AssessmentTaskSummary[];
  auditLog: AssessmentAuditEntry[];
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

type AssessmentSummaryPayload = Prisma.AssessmentProjectGetPayload<{
  include: {
    frameworks: true;
    owner: true;
  };
}>;

type AssessmentDetailPayload = Prisma.AssessmentProjectGetPayload<{
  include: {
    frameworks: {
      include: {
        framework: true;
      };
    };
    owner: true;
    controls: {
      include: {
        control: {
          include: {
            framework: true;
          };
        };
        owner: true;
        tasks: {
          include: {
            owner: true;
          };
        };
      };
    };
    tasks: {
      include: {
        owner: true;
      };
    };
    auditLogs: {
      include: {
        actor: true;
      };
    };
  };
}>;

type AssessmentControlPayload = Prisma.AssessmentControlGetPayload<{
  include: {
    control: {
      include: {
        framework: true;
      };
    };
    owner: true;
    tasks: {
      include: {
        owner: true;
      };
    };
  };
}>;

type TaskPayload = Prisma.TaskGetPayload<{
  include: {
    owner: true;
  };
}>;

type AssessmentAuditPayload = Prisma.AssessmentAuditLogGetPayload<{
  include: {
    actor: true;
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

type AssessmentControlSummaryPayload = Prisma.AssessmentControlGetPayload<{
  include: {
    control: {
      include: {
        framework: true;
      };
    };
    owner: true;
  };
}>;

const controlStatusToPrisma: Record<ControlStatusValue, PrismaControlStatus> = {
  unassessed: PrismaControlStatus.UNASSESSED,
  satisfied: PrismaControlStatus.SATISFIED,
  partial: PrismaControlStatus.PARTIAL,
  unsatisfied: PrismaControlStatus.UNSATISFIED,
  'not-applicable': PrismaControlStatus.NOT_APPLICABLE
};

const controlStatusFromPrisma: Record<PrismaControlStatus, ControlStatusValue> = {
  [PrismaControlStatus.UNASSESSED]: 'unassessed',
  [PrismaControlStatus.SATISFIED]: 'satisfied',
  [PrismaControlStatus.PARTIAL]: 'partial',
  [PrismaControlStatus.UNSATISFIED]: 'unsatisfied',
  [PrismaControlStatus.NOT_APPLICABLE]: 'not-applicable'
};

const taskStatusToPrisma: Record<TaskStatusValue, PrismaTaskStatus> = {
  open: PrismaTaskStatus.OPEN,
  'in-progress': PrismaTaskStatus.IN_PROGRESS,
  blocked: PrismaTaskStatus.BLOCKED,
  complete: PrismaTaskStatus.COMPLETE
};

const taskStatusFromPrisma: Record<PrismaTaskStatus, TaskStatusValue> = {
  [PrismaTaskStatus.OPEN]: 'open',
  [PrismaTaskStatus.IN_PROGRESS]: 'in-progress',
  [PrismaTaskStatus.BLOCKED]: 'blocked',
  [PrismaTaskStatus.COMPLETE]: 'complete'
};

const taskPriorityToPrisma: Record<TaskPriorityValue, PrismaTaskPriority> = {
  low: PrismaTaskPriority.LOW,
  medium: PrismaTaskPriority.MEDIUM,
  high: PrismaTaskPriority.HIGH,
  critical: PrismaTaskPriority.CRITICAL
};

const taskPriorityFromPrisma: Record<PrismaTaskPriority, TaskPriorityValue> = {
  [PrismaTaskPriority.LOW]: 'low',
  [PrismaTaskPriority.MEDIUM]: 'medium',
  [PrismaTaskPriority.HIGH]: 'high',
  [PrismaTaskPriority.CRITICAL]: 'critical'
};

const allowedStatusTransitions: Record<AssessmentStatus, AssessmentStatus[]> = {
  draft: ['draft', 'in-progress', 'complete'],
  'in-progress': ['in-progress', 'complete'],
  complete: ['complete', 'in-progress']
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

  async listControls(
    organizationId: string,
    assessmentId: string
  ): Promise<AssessmentControlSummary[]> {
    const assessment = await this.prisma.assessmentProject.findUnique({
      where: { id: assessmentId },
      select: { organizationId: true }
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }

    const controls = await this.prisma.assessmentControl.findMany({
      where: { assessmentId },
      include: {
        control: {
          include: {
            framework: true
          }
        },
        owner: true
      },
      orderBy: {
        control: {
          id: 'asc'
        }
      }
    });

    return controls.map((control) => this.toControlSummary(control));
  }

  async get(organizationId: string, id: string): Promise<AssessmentDetail> {
    const assessment = await this.prisma.assessmentProject.findUnique({
      where: { id },
      include: {
        frameworks: {
          include: {
            framework: true
          }
        },
        owner: true,
        controls: {
          include: {
            control: {
              include: {
                framework: true
              }
            },
            owner: true,
            tasks: {
              include: {
                owner: true
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        tasks: {
          include: {
            owner: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        auditLogs: {
          include: {
            actor: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        }
      }
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new NotFoundException(`Assessment ${id} not found`);
    }

    return this.toDetail(assessment);
  }

  async create(
    organizationId: string,
    actor: AuthenticatedUser,
    payload: CreateAssessmentDto
  ): Promise<AssessmentSummary> {
    const name = payload.name.trim();
    if (!name) {
      throw new BadRequestException('Assessment name is required');
    }

    if (!payload.frameworkIds.length) {
      throw new BadRequestException('Select at least one framework');
    }

    const uniqueFrameworkIds = Array.from(new Set(payload.frameworkIds));
    const frameworks = await this.prisma.framework.findMany({
      where: {
        id: { in: uniqueFrameworkIds },
        organizationId,
        status: PrismaFrameworkStatus.PUBLISHED
      },
      select: { id: true }
    });

    if (frameworks.length !== uniqueFrameworkIds.length) {
      throw new BadRequestException('One or more frameworks are invalid');
    }

    const ownerEmail = payload.owner.trim().toLowerCase();
    const ownerUser = await this.prisma.user.findFirst({
      where: {
        email: ownerEmail,
        organizationId
      }
    });

    const controlIds = await this.prisma.control.findMany({
      where: {
        frameworkId: {
          in: uniqueFrameworkIds
        },
        framework: { organizationId }
      },
      select: {
        id: true
      }
    });

    const assessment = await this.prisma.assessmentProject.create({
      data: {
        name,
        organizationId,
        status: PrismaAssessmentStatus.DRAFT,
        ownerId: ownerUser?.id ?? null,
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
        progressTotal: controlIds.length
      },
      include: {
        frameworks: true,
        owner: true
      }
    });

    if (controlIds.length) {
      await this.prisma.assessmentControl.createMany({
        data: controlIds.map((control) => ({
          assessmentId: assessment.id,
          controlId: control.id,
          status: PrismaControlStatus.UNASSESSED
        }))
      });
    }

    await this.recordAudit({
      assessmentId: assessment.id,
      organizationId,
      actor,
      action: 'assessment.created',
      metadata: {
        name,
        frameworks: uniqueFrameworkIds,
        owner: ownerEmail
      }
    });

    return this.toSummary(assessment);
  }

  async update(
    organizationId: string,
    id: string,
    actor: AuthenticatedUser,
    payload: {
      name?: string;
      owner?: string;
      frameworkIds?: string[];
    }
  ): Promise<AssessmentDetail> {
    const assessment = await this.prisma.assessmentProject.findUnique({
      where: { id },
      include: {
        frameworks: true,
        owner: true
      }
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new NotFoundException(`Assessment ${id} not found`);
    }

    const updateData: Prisma.AssessmentProjectUpdateInput = {};
    const metadata: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      const trimmed = payload.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Assessment name cannot be empty');
      }
      if (trimmed !== assessment.name) {
        updateData.name = trimmed;
        metadata.name = { previous: assessment.name, next: trimmed };
      }
    }

    if (payload.owner !== undefined) {
      const ownerEmail = payload.owner.trim();
      if (!ownerEmail) {
        updateData.owner = { disconnect: true };
        updateData.ownerEmail = null;
        metadata.owner = {
          previous: this.resolveOwner(assessment.owner, assessment.ownerEmail),
          next: 'unassigned'
        };
      } else {
        const normalizedEmail = ownerEmail.toLowerCase();
        const ownerUser = await this.prisma.user.findFirst({
          where: {
            organizationId,
            email: normalizedEmail
          }
        });

        updateData.owner = ownerUser
          ? { connect: { id: ownerUser.id } }
          : { disconnect: true };
        updateData.ownerEmail = normalizedEmail;
        metadata.owner = {
          previous: this.resolveOwner(assessment.owner, assessment.ownerEmail),
          next: normalizedEmail
        };
      }
    }

    if (payload.frameworkIds !== undefined) {
      if (!payload.frameworkIds.length) {
        throw new BadRequestException('Select at least one framework');
      }

      const uniqueFrameworkIds = Array.from(new Set(payload.frameworkIds));
      const frameworks = await this.prisma.framework.findMany({
        where: {
          id: { in: uniqueFrameworkIds },
          organizationId,
          status: PrismaFrameworkStatus.PUBLISHED
        },
        select: { id: true }
      });

      if (frameworks.length !== uniqueFrameworkIds.length) {
        throw new BadRequestException('One or more frameworks are invalid');
      }

      const existingFrameworkIds = assessment.frameworks.map((framework) => framework.frameworkId);
      const frameworksToAdd = uniqueFrameworkIds.filter(
        (frameworkId) => !existingFrameworkIds.includes(frameworkId)
      );
      const frameworksToRemove = existingFrameworkIds.filter(
        (frameworkId) => !uniqueFrameworkIds.includes(frameworkId)
      );

      if (frameworksToAdd.length || frameworksToRemove.length) {
        metadata.frameworks = {
          added: frameworksToAdd,
          removed: frameworksToRemove
        };

        await this.prisma.$transaction(async (tx) => {
          if (frameworksToRemove.length) {
            await tx.assessmentFramework.deleteMany({
              where: {
                assessmentId: id,
                frameworkId: { in: frameworksToRemove }
              }
            });

            await tx.assessmentControl.deleteMany({
              where: {
                assessmentId: id,
                control: {
                  frameworkId: { in: frameworksToRemove }
                }
              }
            });
          }

          if (frameworksToAdd.length) {
            await tx.assessmentFramework.createMany({
              data: frameworksToAdd.map((frameworkId) => ({
                assessmentId: id,
                frameworkId
              }))
            });

            const controlsToAdd = await tx.control.findMany({
              where: {
                frameworkId: {
                  in: frameworksToAdd
                }
              },
              select: {
                id: true
              }
            });

            if (controlsToAdd.length) {
              await tx.assessmentControl.createMany({
                data: controlsToAdd.map((control) => ({
                  assessmentId: id,
                  controlId: control.id,
                  status: PrismaControlStatus.UNASSESSED
                }))
              });
            }
          }

          if (Object.keys(updateData).length) {
            await tx.assessmentProject.update({
              where: { id },
              data: updateData
            });
          }
        });
      } else if (Object.keys(updateData).length) {
        await this.prisma.assessmentProject.update({
          where: { id },
          data: updateData
        });
      }
    } else if (Object.keys(updateData).length) {
      await this.prisma.assessmentProject.update({
        where: { id },
        data: updateData
      });
    }

    await this.recalculateProgress(id);

    if (Object.keys(metadata).length) {
      await this.recordAudit({
        assessmentId: id,
        organizationId,
        actor,
        action: 'assessment.updated',
        metadata
      });
    }

    return this.get(organizationId, id);
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const assessment = await this.prisma.assessmentProject.findUnique({
      where: { id },
      select: {
        id: true,
        organizationId: true
      }
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new NotFoundException(`Assessment ${id} not found`);
    }

    await this.prisma.assessmentProject.delete({
      where: { id }
    });
  }

  async updateStatus(
    organizationId: string,
    id: string,
    actor: AuthenticatedUser,
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

    const currentStatus = statusFromPrisma[target.status];
    if (!allowedStatusTransitions[currentStatus].includes(status)) {
      throw new BadRequestException(
        `Cannot transition assessment ${id} from ${currentStatus} to ${status}`
      );
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

    await this.recordAudit({
      assessmentId: id,
      organizationId,
      actor,
      action: 'assessment.statusChanged',
      metadata: {
        from: currentStatus,
        to: status
      }
    });

    return this.toSummary(updated);
  }

  async updateControl(
    organizationId: string,
    assessmentId: string,
    controlId: string,
    actor: AuthenticatedUser,
    payload: Partial<{
      status: ControlStatusValue;
      owner: string;
      dueDate: string;
      comments: string;
    }>
  ): Promise<AssessmentControlView> {
    const control = await this.prisma.assessmentControl.findUnique({
      where: { id: controlId },
      include: {
        assessment: {
          select: {
            id: true,
            organizationId: true
          }
        },
        control: {
          include: {
            framework: true
          }
        },
        owner: true,
        tasks: {
          include: {
            owner: true
          }
        }
      }
    });

    if (
      !control ||
      control.assessment.organizationId !== organizationId ||
      control.assessmentId !== assessmentId
    ) {
      throw new NotFoundException(`Control ${controlId} not found for assessment ${assessmentId}`);
    }

    const updateData: Prisma.AssessmentControlUpdateInput = {};
    const metadata: Record<string, unknown> = {};

    if (payload.status) {
      if (!CONTROL_STATUS_VALUES.includes(payload.status)) {
        throw new BadRequestException('Unsupported control status');
      }
      updateData.status = controlStatusToPrisma[payload.status];
      metadata.status = {
        previous: controlStatusFromPrisma[control.status],
        next: payload.status
      };
    }

    if (payload.owner !== undefined) {
      const ownerEmail = payload.owner.trim();
      if (!ownerEmail) {
        updateData.owner = { disconnect: true };
        metadata.owner = {
          previous: control.owner?.email ?? 'unassigned',
          next: 'unassigned'
        };
      } else {
        const normalizedEmail = ownerEmail.toLowerCase();
        const ownerUser = await this.prisma.user.findFirst({
          where: {
            organizationId,
            email: normalizedEmail
          }
        });

        if (!ownerUser) {
          throw new BadRequestException(`Owner ${normalizedEmail} not found`);
        }

        updateData.owner = { connect: { id: ownerUser.id } };
        metadata.owner = {
          previous: control.owner?.email ?? 'unassigned',
          next: normalizedEmail
        };
      }
    }

    if (payload.dueDate !== undefined) {
      if (!payload.dueDate.trim()) {
        updateData.dueDate = null;
        metadata.dueDate = {
          previous: control.dueDate?.toISOString() ?? null,
          next: null
        };
      } else {
        const dueDate = new Date(payload.dueDate);
        if (Number.isNaN(dueDate.getTime())) {
          throw new BadRequestException('Invalid due date');
        }
        updateData.dueDate = dueDate;
        metadata.dueDate = {
          previous: control.dueDate?.toISOString() ?? null,
          next: dueDate.toISOString()
        };
      }
    }

    if (payload.comments !== undefined) {
      updateData.comments = payload.comments.trim() ? payload.comments.trim() : null;
      metadata.comments = {
        previous: control.comments ?? null,
        next: updateData.comments
      };
    }

    if (!Object.keys(updateData).length) {
      return this.toControlView(control);
    }

    await this.prisma.assessmentControl.update({
      where: { id: controlId },
      data: updateData
    });

    if (metadata.status) {
      await this.recalculateProgress(assessmentId);
    }

    await this.recordAudit({
      assessmentId,
      organizationId,
      actor,
      action: 'assessment.controlUpdated',
      metadata: {
        controlId,
        ...metadata
      }
    });

    const updated = await this.prisma.assessmentControl.findUnique({
      where: { id: controlId },
      include: {
        control: {
          include: {
            framework: true
          }
        },
        owner: true,
        tasks: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!updated) {
      throw new NotFoundException(`Control ${controlId} not found after update`);
    }

    return this.toControlView(updated);
  }

  async createTask(
    organizationId: string,
    assessmentId: string,
    actor: AuthenticatedUser,
    payload: {
      title: string;
      description?: string;
      owner?: string;
      dueDate?: string;
      status?: TaskStatusValue;
      priority?: TaskPriorityValue;
      assessmentControlId?: string;
    }
  ): Promise<AssessmentTaskSummary> {
    const assessment = await this.prisma.assessmentProject.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        organizationId: true
      }
    });

    if (!assessment || assessment.organizationId !== organizationId) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }

    let ownerId: string | null = null;
    let ownerEmail: string | null = null;
    if (payload.owner) {
      const normalizedEmail = payload.owner.trim().toLowerCase();
      if (normalizedEmail) {
        const owner = await this.prisma.user.findFirst({
          where: {
            organizationId,
            email: normalizedEmail
          }
        });
        if (!owner) {
          throw new BadRequestException(`Owner ${normalizedEmail} not found`);
        }
        ownerId = owner.id;
        ownerEmail = owner.email;
      }
    }

    let assessmentControlId: string | undefined;
    if (payload.assessmentControlId) {
      const control = await this.prisma.assessmentControl.findUnique({
        where: { id: payload.assessmentControlId },
        select: {
          id: true,
          assessmentId: true
        }
      });

      if (!control || control.assessmentId !== assessmentId) {
        throw new BadRequestException('Control does not belong to this assessment');
      }
      assessmentControlId = control.id;
    }

    const task = await this.prisma.task.create({
      data: {
        assessmentId,
        assessmentControlId,
        organizationId,
        title: payload.title.trim(),
        description: payload.description?.trim() ?? null,
        status: payload.status ? taskStatusToPrisma[payload.status] : PrismaTaskStatus.OPEN,
        priority: payload.priority ? taskPriorityToPrisma[payload.priority] : PrismaTaskPriority.MEDIUM,
        ownerId,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null
      },
      include: {
        owner: true
      }
    });

    await this.recordAudit({
      assessmentId,
      organizationId,
      actor,
      action: 'assessment.taskCreated',
      metadata: {
        taskId: task.id,
        title: task.title,
        owner: ownerEmail ?? 'unassigned',
        status: taskStatusFromPrisma[task.status]
      }
    });

    return this.toTaskView(task);
  }

  async updateTask(
    organizationId: string,
    assessmentId: string,
    taskId: string,
    actor: AuthenticatedUser,
    payload: Partial<{
      title: string;
      description: string;
      owner: string;
      dueDate: string;
      status: TaskStatusValue;
      priority: TaskPriorityValue;
      assessmentControlId: string | null;
    }>
  ): Promise<AssessmentTaskSummary> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        owner: true
      }
    });

    if (!task || task.organizationId !== organizationId || task.assessmentId !== assessmentId) {
      throw new NotFoundException(`Task ${taskId} not found for assessment ${assessmentId}`);
    }

    const updateData: Prisma.TaskUpdateInput = {};
    const metadata: Record<string, unknown> = {};

    if (payload.title !== undefined) {
      const trimmed = payload.title.trim();
      if (!trimmed) {
        throw new BadRequestException('Task title cannot be empty');
      }
      updateData.title = trimmed;
      metadata.title = { previous: task.title, next: trimmed };
    }

    if (payload.description !== undefined) {
      const description = payload.description.trim() ? payload.description.trim() : null;
      updateData.description = description;
      metadata.description = {
        previous: task.description ?? null,
        next: description
      };
    }

    if (payload.status) {
      if (!TASK_STATUS_VALUES.includes(payload.status)) {
        throw new BadRequestException('Unsupported task status');
      }
      updateData.status = taskStatusToPrisma[payload.status];
      metadata.status = {
        previous: taskStatusFromPrisma[task.status],
        next: payload.status
      };
    }

    if (payload.priority) {
      if (!TASK_PRIORITY_VALUES.includes(payload.priority)) {
        throw new BadRequestException('Unsupported task priority');
      }
      updateData.priority = taskPriorityToPrisma[payload.priority];
      metadata.priority = {
        previous: taskPriorityFromPrisma[task.priority],
        next: payload.priority
      };
    }

    if (payload.owner !== undefined) {
      const ownerEmail = payload.owner.trim();
      if (!ownerEmail) {
        updateData.owner = { disconnect: true };
        metadata.owner = {
          previous: task.owner?.email ?? 'unassigned',
          next: 'unassigned'
        };
      } else {
        const normalizedEmail = ownerEmail.toLowerCase();
        const ownerUser = await this.prisma.user.findFirst({
          where: {
            organizationId,
            email: normalizedEmail
          }
        });

        if (!ownerUser) {
          throw new BadRequestException(`Owner ${normalizedEmail} not found`);
        }

        updateData.owner = { connect: { id: ownerUser.id } };
        metadata.owner = {
          previous: task.owner?.email ?? 'unassigned',
          next: normalizedEmail
        };
      }
    }

    if (payload.dueDate !== undefined) {
      if (!payload.dueDate.trim()) {
        updateData.dueDate = null;
        metadata.dueDate = {
          previous: task.dueDate?.toISOString() ?? null,
          next: null
        };
      } else {
        const dueDate = new Date(payload.dueDate);
        if (Number.isNaN(dueDate.getTime())) {
          throw new BadRequestException('Invalid due date');
        }
        updateData.dueDate = dueDate;
        metadata.dueDate = {
          previous: task.dueDate?.toISOString() ?? null,
          next: dueDate.toISOString()
        };
      }
    }

    if (payload.assessmentControlId !== undefined) {
      if (!payload.assessmentControlId) {
        updateData.assessmentControl = { disconnect: true };
        metadata.assessmentControlId = {
          previous: task.assessmentControlId ?? null,
          next: null
        };
      } else {
        const control = await this.prisma.assessmentControl.findUnique({
          where: { id: payload.assessmentControlId },
          select: {
            id: true,
            assessmentId: true
          }
        });

        if (!control || control.assessmentId !== assessmentId) {
          throw new BadRequestException('Control does not belong to this assessment');
        }

        updateData.assessmentControl = { connect: { id: control.id } };
        metadata.assessmentControlId = {
          previous: task.assessmentControlId ?? null,
          next: control.id
        };
      }
    }

    if (!Object.keys(updateData).length) {
      return this.toTaskView(task);
    }

    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        owner: true
      }
    });

    await this.recordAudit({
      assessmentId,
      organizationId,
      actor,
      action: 'assessment.taskUpdated',
      metadata: {
        taskId,
        ...metadata
      }
    });

    return this.toTaskView(updated);
  }

  async deleteTask(
    organizationId: string,
    assessmentId: string,
    taskId: string,
    actor: AuthenticatedUser
  ): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        assessmentId: true,
        organizationId: true
      }
    });

    if (!task || task.organizationId !== organizationId || task.assessmentId !== assessmentId) {
      throw new NotFoundException(`Task ${taskId} not found for assessment ${assessmentId}`);
    }

    await this.prisma.task.delete({
      where: { id: taskId }
    });

    await this.recordAudit({
      assessmentId,
      organizationId,
      actor,
      action: 'assessment.taskDeleted',
      metadata: {
        taskId,
        title: task.title
      }
    });
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

  private async recalculateProgress(assessmentId: string): Promise<void> {
    const aggregates = await this.prisma.assessmentControl.groupBy({
      by: ['status'],
      where: { assessmentId },
      _count: {
        _all: true
      }
    });

    let satisfied = 0;
    let partial = 0;
    let unsatisfied = 0;
    let total = 0;

    for (const aggregate of aggregates) {
      const count = aggregate._count._all;
      switch (aggregate.status) {
        case PrismaControlStatus.SATISFIED:
          satisfied += count;
          total += count;
          break;
        case PrismaControlStatus.PARTIAL:
          partial += count;
          total += count;
          break;
        case PrismaControlStatus.UNSATISFIED:
          unsatisfied += count;
          total += count;
          break;
        case PrismaControlStatus.UNASSESSED:
          unsatisfied += count;
          total += count;
          break;
        case PrismaControlStatus.NOT_APPLICABLE:
          break;
      }
    }

    await this.prisma.assessmentProject.update({
      where: { id: assessmentId },
      data: {
        progressSatisfied: satisfied,
        progressPartial: partial,
        progressUnsatisfied: unsatisfied,
        progressTotal: total
      }
    });
  }

  private async recordAudit(params: {
    assessmentId: string;
    organizationId: string;
    actor?: AuthenticatedUser;
    action: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.prisma.assessmentAuditLog.create({
      data: {
        assessmentId: params.assessmentId,
        organizationId: params.organizationId,
        actorId: params.actor?.id,
        actorEmail: params.actor?.email,
        action: params.action,
        metadata: params.metadata
          ? (params.metadata as Prisma.InputJsonValue)
          : undefined
      }
    });
  }

  private toSummary(assessment: AssessmentSummaryPayload | AssessmentDetailPayload): AssessmentSummary {
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

  private toControlSummary(control: AssessmentControlSummaryPayload): AssessmentControlSummary {
    return {
      id: control.id,
      assessmentId: control.assessmentId,
      controlId: control.controlId,
      title: control.control.title,
      frameworkId: control.control.frameworkId,
      frameworkName: control.control.framework.name,
      family: control.control.family,
      status: controlStatusFromPrisma[control.status],
      owner: control.owner?.email ?? 'unassigned',
      dueDate: control.dueDate?.toISOString() ?? null,
      comments: control.comments ?? null,
      updatedAt: control.updatedAt.toISOString()
    };
  }

  private toDetail(assessment: AssessmentDetailPayload): AssessmentDetail {
    const summary = this.toSummary(assessment);
    return {
      ...summary,
      frameworks: assessment.frameworks.map((link) => ({
        id: link.frameworkId,
        name: link.framework.name,
        version: link.framework.version
      })),
      controls: assessment.controls.map((control) => this.toControlView(control)),
      tasks: assessment.tasks.map((task) => this.toTaskView(task)),
      auditLog: assessment.auditLogs.map((log) => this.toAuditEntry(log))
    };
  }

  private toControlView(control: AssessmentControlPayload): AssessmentControlView {
    return {
      id: control.id,
      controlId: control.controlId,
      title: control.control.title,
      frameworkId: control.control.frameworkId,
      frameworkName: control.control.framework.name,
      status: controlStatusFromPrisma[control.status],
      owner: control.owner?.email ?? 'unassigned',
      dueDate: control.dueDate?.toISOString(),
      comments: control.comments ?? undefined,
      tasks: control.tasks.map((task) => this.toTaskView(task)),
      updatedAt: control.updatedAt.toISOString()
    };
  }

  private toTaskView(task: TaskPayload): AssessmentTaskSummary {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: taskStatusFromPrisma[task.status],
      priority: taskPriorityFromPrisma[task.priority],
      owner: task.owner?.email ?? 'unassigned',
      dueDate: task.dueDate?.toISOString(),
      assessmentControlId: task.assessmentControlId ?? undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };
  }

  private toAuditEntry(entry: AssessmentAuditPayload): AssessmentAuditEntry {
    const metadataValue =
      entry.metadata && typeof entry.metadata === 'object' && !Array.isArray(entry.metadata)
        ? (entry.metadata as Record<string, unknown>)
        : undefined;

    return {
      id: entry.id,
      action: entry.action,
      actor: entry.actor?.email ?? entry.actorEmail ?? 'system',
      createdAt: entry.createdAt.toISOString(),
      metadata: metadataValue
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
