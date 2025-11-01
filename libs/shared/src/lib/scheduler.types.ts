export type ScheduleType = 'evidence-review-reminder' | 'recurring-assessment' | 'agent-health-check';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';

export interface ScheduleOwner {
  id: string;
  displayName: string;
  email: string;
}

export interface ScheduleOptions {
  /**
   * Optional timezone identifier (IANA) used for computing next run boundaries.
   */
  timezone?: string;
  /**
   * Optional interval in days when using the `custom` frequency.
   */
  intervalDays?: number;
  /**
   * Optional hour (0-23) at which the job should run.
   */
  hour?: number;
  /**
   * Optional minute (0-59) at which the job should run.
   */
  minute?: number;
  /**
   * Optional payload that handlers can use to enrich generated tasks or reminders.
   */
  payload?: Record<string, unknown>;
}

export interface ScheduleDefinition {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: ScheduleType;
  frequency: ScheduleFrequency;
  nextRun: string;
  owner: ScheduleOwner;
  isActive: boolean;
  lastRun?: string | null;
  options?: ScheduleOptions;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleExecutionResult {
  scheduleId: string;
  startedAt: string;
  completedAt: string;
  notes?: string;
  success: boolean;
}
