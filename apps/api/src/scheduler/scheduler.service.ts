import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import {
  ScheduleDefinition,
  ScheduleExecutionResult,
  ScheduleFrequency,
  ScheduleOptions,
  ScheduleOwner,
  ScheduleType
} from '@compliance/shared';

export interface CreateScheduleInput {
  organizationId: string;
  name: string;
  description?: string;
  type: ScheduleType;
  frequency: ScheduleFrequency;
  nextRun: string;
  owner: ScheduleOwner;
  options?: ScheduleOptions;
}

export interface UpdateScheduleInput {
  name?: string;
  description?: string;
  frequency?: ScheduleFrequency;
  nextRun?: string;
  isActive?: boolean;
  owner?: ScheduleOwner;
  options?: ScheduleOptions;
}

@Injectable()
export class SchedulerService {
  private readonly schedules = new Map<string, ScheduleDefinition>();

  constructor() {
    this.seedDefaults();
  }

  async list(organizationId?: string): Promise<ScheduleDefinition[]> {
    const items = Array.from(this.schedules.values());
    const filtered = organizationId ? items.filter((schedule) => schedule.organizationId === organizationId) : items;

    return filtered.map((schedule) => ({ ...schedule, options: schedule.options ? { ...schedule.options } : undefined }));
  }

  async findById(id: string): Promise<ScheduleDefinition | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) {
      return undefined;
    }

    return { ...schedule, options: schedule.options ? { ...schedule.options } : undefined };
  }

  async create(payload: CreateScheduleInput): Promise<ScheduleDefinition> {
    const now = dayjs().toISOString();
    const schedule: ScheduleDefinition = {
      id: randomUUID(),
      organizationId: payload.organizationId,
      name: payload.name,
      description: payload.description,
      type: payload.type,
      frequency: payload.frequency,
      nextRun: payload.nextRun,
      owner: payload.owner,
      isActive: true,
      lastRun: null,
      options: payload.options,
      createdAt: now,
      updatedAt: now
    };

    this.schedules.set(schedule.id, schedule);
    return { ...schedule, options: schedule.options ? { ...schedule.options } : undefined };
  }

  async update(id: string, payload: UpdateScheduleInput): Promise<ScheduleDefinition> {
    const schedule = this.schedules.get(id);

    if (!schedule) {
      throw new Error(`Schedule ${id} not found`);
    }

    const updated: ScheduleDefinition = {
      ...schedule,
      ...payload,
      options: payload.options ?? schedule.options,
      owner: payload.owner ?? schedule.owner,
      nextRun: payload.nextRun ?? schedule.nextRun,
      frequency: payload.frequency ?? schedule.frequency,
      isActive: payload.isActive ?? schedule.isActive,
      updatedAt: dayjs().toISOString()
    };

    this.schedules.set(id, updated);
    return { ...updated, options: updated.options ? { ...updated.options } : undefined };
  }

  async delete(id: string): Promise<void> {
    this.schedules.delete(id);
  }

  async recordExecution(scheduleId: string, result: ScheduleExecutionResult, nextRun: string): Promise<ScheduleDefinition> {
    const schedule = this.schedules.get(scheduleId);

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    const updated: ScheduleDefinition = {
      ...schedule,
      lastRun: result.completedAt,
      nextRun,
      updatedAt: result.completedAt
    };

    this.schedules.set(scheduleId, updated);
    return { ...updated, options: updated.options ? { ...updated.options } : undefined };
  }

  private seedDefaults() {
    const now = dayjs();
    const owner: ScheduleOwner = {
      id: 'owner-default',
      displayName: 'Compliance Automation',
      email: 'automation@example.com'
    };

    const defaults: Array<Omit<CreateScheduleInput, 'owner' | 'nextRun'>> = [
      {
        organizationId: 'org-sample',
        name: 'Weekly Evidence Review Reminder',
        description: 'Notifies evidence owners about upcoming review deadlines.',
        type: 'evidence-review-reminder',
        frequency: 'weekly',
        options: {
          payload: {
            daysLookahead: 7
          }
        }
      },
      {
        organizationId: 'org-sample',
        name: 'Monthly Assessment Draft',
        description: 'Creates a draft assessment leveraging last month findings.',
        type: 'recurring-assessment',
        frequency: 'monthly',
        options: {
          payload: {
            templateAssessmentId: 'template-fedramp-moderate'
          }
        }
      },
      {
        organizationId: 'org-sample',
        name: 'Daily Agent Health Check',
        description: 'Runs integrity checks for connected automation agents.',
        type: 'agent-health-check',
        frequency: 'daily'
      }
    ];

    defaults.forEach((definition, index) => {
      void this.create({
        ...definition,
        nextRun: now.add(index + 1, 'minute').toISOString(),
        owner
      });
    });
  }
}
