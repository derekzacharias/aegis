import { ScheduleDefinition, ScheduleType } from '@compliance/shared';

export interface ScheduleHandler {
  readonly type: ScheduleType;
  execute(schedule: ScheduleDefinition): Promise<void>;
}
