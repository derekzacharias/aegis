import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { ScheduleDefinition, ScheduleExecutionResult } from '@compliance/shared';
import { ScheduleHandler } from './schedule-handler';
import { ScheduleStore } from './interfaces/schedule-store';
import { ScheduleRunner } from './schedule-runner';

const buildSchedule = (overrides?: Partial<ScheduleDefinition>): ScheduleDefinition => {
  const now = dayjs();
  const base: ScheduleDefinition = {
    id: 'schedule-test',
    organizationId: 'org-sample',
    name: 'Test Schedule',
    description: 'Executes quickly for test coverage',
    type: 'evidence-review-reminder',
    frequency: 'daily',
    nextRun: now.add(500, 'millisecond').toISOString(),
    owner: {
      id: 'owner-1',
      displayName: 'Automation Agent',
      email: 'automation@example.com'
    },
    isActive: true,
    lastRun: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    options: undefined
  };

  return {
    ...base,
    ...(overrides ?? {})
  };
};

describe('ScheduleRunner', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: Date.now(), legacyFakeTimers: false });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('executes due schedules and reschedules next run', async () => {
    const schedule = buildSchedule();
    let currentSchedule = schedule;

    const handler: ScheduleHandler = {
      type: 'evidence-review-reminder',
      execute: jest.fn().mockResolvedValue(undefined)
    };

    const store: ScheduleStore = {
      listActiveSchedules: jest.fn().mockImplementation(async () => [currentSchedule]),
      markExecution: jest.fn().mockImplementation(async (result: ScheduleExecutionResult, nextRun: string) => {
        currentSchedule = {
          ...currentSchedule,
          lastRun: result.completedAt,
          nextRun,
          updatedAt: result.completedAt
        };
        return currentSchedule;
      }),
      upsert: jest.fn().mockResolvedValue(schedule),
      remove: jest.fn().mockResolvedValue(undefined)
    };

    const runner = new ScheduleRunner(
      store,
      [handler],
      new ConfigService({ scheduler: { refreshIntervalMs: '1000' } })
    );

    await runner.initialize();

    await jest.runOnlyPendingTimersAsync();

    expect(handler.execute).toHaveBeenCalledTimes(1);
    expect(store.markExecution).toHaveBeenCalledTimes(1);

    const markExecutionMock = store.markExecution as jest.Mock;
    const nextRun = markExecutionMock.mock.calls[0][1];
    expect(dayjs(nextRun).diff(dayjs(schedule.nextRun), 'day')).toBe(1);

    await runner.onModuleDestroy();
  });

  it('refreshes schedules periodically', async () => {
    const schedule = buildSchedule();

    const store: ScheduleStore = {
      listActiveSchedules: jest.fn().mockResolvedValue([schedule]),
      markExecution: jest.fn().mockResolvedValue(schedule),
      upsert: jest.fn().mockResolvedValue(schedule),
      remove: jest.fn().mockResolvedValue(undefined)
    };

    const handler: ScheduleHandler = {
      type: 'evidence-review-reminder',
      execute: jest.fn().mockResolvedValue(undefined)
    };

    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    const runner = new ScheduleRunner(
      store,
      [handler],
      new ConfigService({ scheduler: { refreshIntervalMs: '200' } })
    );

    await runner.initialize();

    const refreshCall = (setTimeoutSpy.mock.calls as Array<[() => void, number]>).find(
      ([, delay]) => delay === 200
    );

    expect(refreshCall).toBeDefined();

    setTimeoutSpy.mockRestore();
    await runner.onModuleDestroy();
  });
});
