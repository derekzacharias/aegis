import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { ScheduleDefinition, ScheduleExecutionResult, ScheduleFrequency, ScheduleOwner, ScheduleType } from '@compliance/shared';
import { ScheduleStore } from '../interfaces/schedule-store';

const DEFAULT_ORG_ID = 'org-sample';

const owner: ScheduleOwner = {
  id: 'owner-initial',
  displayName: 'Automation Agent',
  email: 'automation@example.com'
};

const seedSchedules = (): ScheduleDefinition[] => {
  const now = dayjs().second(0).millisecond(0);

  const definitions: Array<{ name: string; type: ScheduleType; frequency: ScheduleFrequency; days?: number }> = [
    { name: 'Weekly Evidence Review Reminder', type: 'evidence-review-reminder', frequency: 'weekly' },
    { name: 'Monthly Assessment Draft', type: 'recurring-assessment', frequency: 'monthly' },
    { name: 'Daily Agent Health Check', type: 'agent-health-check', frequency: 'daily' }
  ];

  return definitions.map((definition, index) => {
    const baseNextRun = now.add(index + 1, 'minute');
    return {
      id: `schedule-${index + 1}`,
      organizationId: DEFAULT_ORG_ID,
      name: definition.name,
      type: definition.type,
      frequency: definition.frequency,
      owner,
      isActive: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      nextRun: baseNextRun.toISOString(),
      lastRun: null,
      options:
        definition.type === 'recurring-assessment'
          ? {
              payload: {
                templateAssessmentId: 'template-fedramp-moderate'
              }
            }
          : undefined
    };
  });
};

@Injectable()
export class InMemoryScheduleStore implements ScheduleStore {
  private readonly schedules = new Map<string, ScheduleDefinition>();

  constructor() {
    seedSchedules().forEach((schedule) => this.schedules.set(schedule.id, schedule));
  }

  async listActiveSchedules(): Promise<ScheduleDefinition[]> {
    return Array.from(this.schedules.values())
      .filter((schedule) => schedule.isActive)
      .map((schedule) => ({ ...schedule, options: schedule.options ? { ...schedule.options } : undefined }));
  }

  async markExecution(result: ScheduleExecutionResult, nextRun: string): Promise<ScheduleDefinition | null> {
    const schedule = this.schedules.get(result.scheduleId);

    if (!schedule) {
      return null;
    }

    const updated: ScheduleDefinition = {
      ...schedule,
      nextRun,
      lastRun: result.completedAt,
      updatedAt: result.completedAt
    };

    this.schedules.set(schedule.id, updated);
    return { ...updated, options: updated.options ? { ...updated.options } : undefined };
  }

  async upsert(schedule: ScheduleDefinition): Promise<ScheduleDefinition> {
    const record = { ...schedule, options: schedule.options ? { ...schedule.options } : undefined };
    this.schedules.set(schedule.id, record);
    return record;
  }

  async remove(scheduleId: string): Promise<void> {
    this.schedules.delete(scheduleId);
  }
}
