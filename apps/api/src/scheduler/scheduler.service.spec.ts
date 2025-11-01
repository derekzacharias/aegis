import dayjs from 'dayjs';
import { SchedulerService } from './scheduler.service';

describe('SchedulerService', () => {
  let service: SchedulerService;

  beforeEach(() => {
    service = new SchedulerService();
  });

  it('lists schedules scoped by organization', async () => {
    const orgSample = await service.list('org-sample');
    expect(orgSample.length).toBeGreaterThan(0);

    const otherOrg = await service.list('org-alt');
    expect(otherOrg).toHaveLength(0);
  });

  it('creates and updates a schedule', async () => {
    const nextRun = dayjs().add(1, 'hour').toISOString();

    const created = await service.create({
      organizationId: 'org-alt',
      name: 'Quarterly Assessment Draft',
      description: 'Creates a template-driven assessment every quarter',
      type: 'recurring-assessment',
      frequency: 'quarterly',
      nextRun,
      owner: {
        id: 'owner-42',
        displayName: 'Risk Committee',
        email: 'risk@example.com'
      }
    });

    expect(created.organizationId).toBe('org-alt');
    expect(created.frequency).toBe('quarterly');

    const updated = await service.update(created.id, {
      frequency: 'monthly',
      isActive: false
    });

    expect(updated.frequency).toBe('monthly');
    expect(updated.isActive).toBe(false);
  });

  it('records execution results and updates next run', async () => {
    const [schedule] = await service.list('org-sample');
    expect(schedule).toBeDefined();

    const nextRun = dayjs(schedule.nextRun).add(1, 'day').toISOString();
    const completedAt = dayjs().toISOString();

    const updated = await service.recordExecution(schedule.id, {
      scheduleId: schedule.id,
      startedAt: dayjs(completedAt).subtract(1, 'minute').toISOString(),
      completedAt,
      success: true
    }, nextRun);

    expect(updated.lastRun).toBe(completedAt);
    expect(updated.nextRun).toBe(nextRun);
  });
});
