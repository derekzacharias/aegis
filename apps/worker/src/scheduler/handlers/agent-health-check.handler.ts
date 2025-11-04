import { Injectable, Logger } from '@nestjs/common';
import { ScheduleDefinition } from '@compliance/shared';
import { PrismaService } from '../../prisma.service';
import { MetricsService } from '../../metrics/metrics.service';
import { ScheduleHandler } from '../schedule-handler';

@Injectable()
export class AgentHealthCheckHandler implements ScheduleHandler {
  readonly type = 'agent-health-check';

  private readonly logger = new Logger(AgentHealthCheckHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService
  ) {}

  async execute(schedule: ScheduleDefinition): Promise<void> {
    this.logger.log(`Performing agent health validations for org ${schedule.organizationId}`);
    this.logger.debug(`Health check schedule context: ${schedule.id}`);

    const lookbackMinutes = 60;
    const since = new Date(Date.now() - lookbackMinutes * 60 * 1000);

    const incidents = await this.prisma.userProfileAudit.findMany({
      where: {
        createdAt: { gte: since },
        changes: {
          path: ['refreshToken', 'current'],
          string_contains: 'invalidated'
        },
        user: {
          email: { contains: '-agent@' }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            lastLoginAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!incidents.length) {
      this.logger.debug(
        `No refresh failures detected for automation accounts in the last ${lookbackMinutes} minutes`
      );
      return;
    }

    for (const incident of incidents) {
      const changeRecord = (
        incident.changes as Record<string, { reason?: string; metadata?: Record<string, unknown> }>
      )['refreshToken'];
      const reason = changeRecord?.reason ?? 'unknown';
      const metadata = changeRecord?.metadata ?? {};

      this.logger.warn(
        JSON.stringify({
          event: 'agent.refresh.failure.detected',
          scheduleId: schedule.id,
          userId: incident.user.id,
          email: incident.user.email,
          reason,
          metadata,
          createdAt: incident.createdAt.toISOString()
        })
      );

      this.metrics.incrementCounter('agent.refresh.failures', 1, {
        userId: incident.user.id,
        email: incident.user.email,
        reason
      });
    }
  }
}
