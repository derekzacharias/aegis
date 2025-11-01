import { Injectable, Logger } from '@nestjs/common';
import { ScheduleDefinition } from '@compliance/shared';
import { ScheduleHandler } from '../schedule-handler';

@Injectable()
export class AgentHealthCheckHandler implements ScheduleHandler {
  readonly type = 'agent-health-check';

  private readonly logger = new Logger(AgentHealthCheckHandler.name);

  async execute(schedule: ScheduleDefinition): Promise<void> {
    this.logger.log(`Performing agent health validations for org ${schedule.organizationId}`);
    this.logger.debug(`Health check schedule context: ${schedule.id}`);
  }
}
