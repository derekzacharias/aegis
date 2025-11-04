import { Logger } from '@nestjs/common';
import { ScheduleDefinition } from '@compliance/shared';
import { AgentHealthCheckHandler } from './agent-health-check.handler';

const schedule: ScheduleDefinition = {
  id: 'schedule-1',
  organizationId: 'org-1',
  name: 'Daily Agent Health',
  description: 'Monitors service user refresh errors',
  type: 'agent-health-check',
  frequency: 'daily',
  nextRun: new Date().toISOString(),
  owner: { id: 'owner-1', displayName: 'Automation', email: 'automation@example.com' },
  isActive: true,
  lastRun: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  options: {}
};

describe('AgentHealthCheckHandler', () => {
  const prisma = {
    userProfileAudit: {
      findMany: jest.fn()
    }
  };
  const metrics = {
    incrementCounter: jest.fn()
  };

  const handler = new AgentHealthCheckHandler(prisma as never, metrics as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('skips alerts when no incidents are detected', async () => {
    prisma.userProfileAudit.findMany.mockResolvedValueOnce([]);
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    await handler.execute(schedule);

    expect(prisma.userProfileAudit.findMany).toHaveBeenCalledTimes(1);
    expect(metrics.incrementCounter).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    debugSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('emits metrics for service users with refresh failures', async () => {
    const incidentDate = new Date();
    prisma.userProfileAudit.findMany.mockResolvedValueOnce([
      {
        id: 'audit-1',
        userId: 'user-1',
        actorId: null,
        changes: {
          refreshToken: {
            previous: 'active',
            current: 'invalidated',
            reason: 'refresh-id-mismatch',
            metadata: { expected: 'abc', received: 'def' }
          }
        },
        createdAt: incidentDate,
        user: {
          id: 'user-1',
          email: 'reports-agent@aegis.local',
          lastLoginAt: incidentDate
        }
      }
    ]);

    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    await handler.execute(schedule);

    expect(prisma.userProfileAudit.findMany).toHaveBeenCalledTimes(1);
    expect(metrics.incrementCounter).toHaveBeenCalledWith('agent.refresh.failures', 1, {
      userId: 'user-1',
      email: 'reports-agent@aegis.local',
      reason: 'refresh-id-mismatch'
    });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('agent.refresh.failure.detected')
    );

    logSpy.mockRestore();
    debugSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
