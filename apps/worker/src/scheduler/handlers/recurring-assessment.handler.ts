import { Injectable, Logger } from '@nestjs/common';
import { ScheduleDefinition } from '@compliance/shared';
import { ScheduleHandler } from '../schedule-handler';

@Injectable()
export class RecurringAssessmentHandler implements ScheduleHandler {
  readonly type = 'recurring-assessment';

  private readonly logger = new Logger(RecurringAssessmentHandler.name);

  async execute(schedule: ScheduleDefinition): Promise<void> {
    const templateId =
      typeof schedule.options?.payload?.templateAssessmentId === 'string'
        ? schedule.options?.payload?.templateAssessmentId
        : 'standard-fedramp-template';

    this.logger.log(
      `Queuing new assessment draft for org ${schedule.organizationId} using template ${templateId} (schedule: ${schedule.name})`
    );
  }
}
