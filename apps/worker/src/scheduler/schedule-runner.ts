import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { ConfigService } from '@nestjs/config';
import { ScheduleDefinition, ScheduleExecutionResult, ScheduleFrequency } from '@compliance/shared';
import { ScheduleHandler } from './schedule-handler';
import { ScheduleStore } from './interfaces/schedule-store';
import { SCHEDULE_HANDLERS, SCHEDULE_STORE } from './scheduler.constants';

dayjs.extend(utc);

interface ActiveTimer {
  timeout: NodeJS.Timeout;
  cancellationToken: { cancelled: boolean };
}

const frequencyToDuration = (frequency: ScheduleFrequency): { unit: dayjs.ManipulateType; amount: number } => {
  switch (frequency) {
    case 'daily':
      return { unit: 'day', amount: 1 };
    case 'weekly':
      return { unit: 'week', amount: 1 };
    case 'monthly':
      return { unit: 'month', amount: 1 };
    case 'quarterly':
      return { unit: 'month', amount: 3 };
    case 'custom':
    default:
      return { unit: 'day', amount: 1 };
  }
};

@Injectable()
export class ScheduleRunner implements OnModuleDestroy {
  private readonly logger = new Logger(ScheduleRunner.name);

  private readonly timers = new Map<string, ActiveTimer>();

  private refreshTimer?: NodeJS.Timeout;

  private readonly handlersByType = new Map<ScheduleDefinition['type'], ScheduleHandler>();

  private readonly refreshIntervalMs: number;

  constructor(
    @Inject(SCHEDULE_STORE) private readonly scheduleStore: ScheduleStore,
    @Inject(SCHEDULE_HANDLERS) handlers: ScheduleHandler[] | undefined,
    configService: ConfigService
  ) {
    (handlers ?? []).forEach((handler) => this.handlersByType.set(handler.type, handler));
    this.refreshIntervalMs = parseInt(configService.get<string>('scheduler.refreshIntervalMs') ?? '300000', 10);
  }

  async onModuleDestroy(): Promise<void> {
    this.cancelAllTimers();
  }

  async initialize(): Promise<void> {
    this.logger.log('Initializing scheduler service');
    await this.loadSchedules();
    this.logger.log(`Scheduler service ready; monitoring ${this.timers.size} schedules`);
    this.armRefreshTimer();
  }

  private async loadSchedules(): Promise<void> {
    const schedules = await this.scheduleStore.listActiveSchedules();
    schedules.forEach((schedule) => this.registerSchedule(schedule));
  }

  private registerSchedule(schedule: ScheduleDefinition): void {
    const existing = this.timers.get(schedule.id);
    if (existing) {
      existing.cancellationToken.cancelled = true;
      clearTimeout(existing.timeout);
      this.timers.delete(schedule.id);
    }

    const nextRun = dayjs(schedule.nextRun);
    const delay = Math.max(0, nextRun.diff(dayjs(), 'millisecond'));

    const cancellationToken = { cancelled: false };
    const timeout = setTimeout(() => this.executeSchedule(schedule, cancellationToken).catch(this.handleError), delay);

    this.timers.set(schedule.id, { timeout, cancellationToken });
    this.logger.debug(`Registered schedule ${schedule.name} (${schedule.id}) to run in ${delay}ms`);
  }

  private async executeSchedule(schedule: ScheduleDefinition, token: { cancelled: boolean }): Promise<void> {
    if (token.cancelled) {
      return;
    }

    const handler = this.handlersByType.get(schedule.type);

    if (!handler) {
      this.logger.warn(`No handler registered for schedule type ${schedule.type}`);
      return;
    }

    const startedAt = dayjs().toISOString();
    this.logger.log(`Executing schedule ${schedule.name} (${schedule.id})`);

    try {
      await handler.execute(schedule);
    } catch (error) {
      this.logger.error(`Schedule ${schedule.id} failed`, error as Error);
      return;
    }

    const completedAt = dayjs().toISOString();
    const nextRun = this.computeNextRun(schedule);
    const executionResult: ScheduleExecutionResult = {
      scheduleId: schedule.id,
      startedAt,
      completedAt,
      success: true
    };

    const updated = await this.scheduleStore.markExecution(executionResult, nextRun);

    if (updated) {
      this.registerSchedule(updated);
    } else {
      this.logger.warn(`Schedule ${schedule.id} disappeared after execution`);
      this.timers.delete(schedule.id);
    }
  }

  private computeNextRun(schedule: ScheduleDefinition): string {
    if (schedule.frequency === 'custom' && schedule.options?.intervalDays) {
      return dayjs(schedule.nextRun).add(schedule.options.intervalDays, 'day').toISOString();
    }

    const { unit, amount } = frequencyToDuration(schedule.frequency);
    return dayjs(schedule.nextRun).add(amount, unit).toISOString();
  }

  private cancelAllTimers(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = undefined;
    }

    this.timers.forEach((entry) => {
      entry.cancellationToken.cancelled = true;
      clearTimeout(entry.timeout);
    });
    this.timers.clear();
  }

  private async refreshSchedules(): Promise<void> {
    this.logger.debug('Refreshing schedule registry');
    const schedules = await this.scheduleStore.listActiveSchedules();
    const activeIds = new Set(schedules.map((schedule) => schedule.id));

    // Remove timers that are no longer active.
    this.timers.forEach((_timer, scheduleId) => {
      if (!activeIds.has(scheduleId)) {
        const entry = this.timers.get(scheduleId);
        entry?.cancellationToken && (entry.cancellationToken.cancelled = true);
        if (entry?.timeout) {
          clearTimeout(entry.timeout);
        }
        this.timers.delete(scheduleId);
      }
    });

    schedules.forEach((schedule) => this.registerSchedule(schedule));
  }

  private armRefreshTimer(): void {
    this.refreshTimer = setTimeout(async () => {
      await this.refreshSchedules().catch(this.handleError);
      this.armRefreshTimer();
    }, this.refreshIntervalMs);
  }

  private readonly handleError = (error: unknown) => {
    this.logger.error('Scheduler encountered an error', error as Error);
  };
}
