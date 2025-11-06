import { Logger } from '@nestjs/common';
import { ScheduleDefinition } from '@compliance/shared';
import { ProfileContactReminderHandler } from './profile-contact-reminder.handler';

const schedule: ScheduleDefinition = {
  id: 'schedule-1',
  organizationId: 'org-1',
  name: 'Weekly Profile Check',
  description: 'Reminds users to complete contact details',
  type: 'profile-contact-reminder',
  frequency: 'weekly',
  nextRun: new Date().toISOString(),
  owner: { id: 'owner-1', displayName: 'Automation', email: 'automation@example.com' },
  isActive: true,
  lastRun: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  options: {}
};

describe('ProfileContactReminderHandler', () => {
  const prisma = {
    user: {
      findMany: jest.fn()
    }
  };
  const notifications = {
    notifyContactReminder: jest.fn()
  };
  const metrics = {
    incrementCounter: jest.fn()
  };

  const handler = new ProfileContactReminderHandler(
    prisma as never,
    notifications as never,
    metrics as never
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips notifications when all profiles are complete and fresh', async () => {
    prisma.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-1',
        email: 'analyst@example.com',
        firstName: 'Casey',
        lastName: 'Morgan',
        jobTitle: 'Analyst',
        phoneNumber: '+1 555 0100',
        timezone: 'America/New_York',
        updatedAt: new Date()
      }
    ]);

    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    await handler.execute(schedule);

    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(notifications.notifyContactReminder).not.toHaveBeenCalled();
    expect(metrics.incrementCounter).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    debugSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('dispatches notifications for profiles missing critical fields', async () => {
    const staleDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
    prisma.user.findMany.mockResolvedValueOnce([
      {
        id: 'user-2',
        email: 'auditor@example.com',
        firstName: 'Jordan',
        lastName: 'Lee',
        jobTitle: null,
        phoneNumber: '',
        timezone: null,
        updatedAt: staleDate
      }
    ]);

    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    await handler.execute(schedule);

    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(notifications.notifyContactReminder).toHaveBeenCalledWith({
      scheduleId: schedule.id,
      organizationId: schedule.organizationId,
      user: {
        id: 'user-2',
        email: 'auditor@example.com',
        name: 'Jordan Lee'
      },
      missingFields: expect.arrayContaining(['jobTitle', 'phoneNumber', 'timezone']),
      isStale: true,
      lastUpdated: staleDate.toISOString()
    });
    expect(metrics.incrementCounter).toHaveBeenCalledWith(
      'notifications.contact.reminder.dispatched',
      1,
      expect.objectContaining({
        organizationId: schedule.organizationId,
        userId: 'user-2',
        stale: true
      })
    );

    logSpy.mockRestore();
    debugSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
