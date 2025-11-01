import { ScheduleDefinition, ScheduleExecutionResult } from '@compliance/shared';

export interface ScheduleStore {
  listActiveSchedules(): Promise<ScheduleDefinition[]>;
  markExecution(result: ScheduleExecutionResult, nextRun: string): Promise<ScheduleDefinition | null>;
  upsert(schedule: ScheduleDefinition): Promise<ScheduleDefinition>;
  remove(scheduleId: string): Promise<void>;
}
