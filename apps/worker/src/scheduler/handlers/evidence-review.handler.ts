import { Injectable, Logger } from '@nestjs/common';
import { ScheduleDefinition } from '@compliance/shared';
import { ScheduleHandler } from '../schedule-handler';

@Injectable()
export class EvidenceReviewReminderHandler implements ScheduleHandler {
  readonly type = 'evidence-review-reminder';

  private readonly logger = new Logger(EvidenceReviewReminderHandler.name);

  async execute(schedule: ScheduleDefinition): Promise<void> {
    this.logger.log(
      `Dispatching evidence review reminders for org ${schedule.organizationId} (schedule: ${schedule.name})`
    );
    const payloadSummary = JSON.stringify(schedule.options?.payload ?? {}, null, 2);
    this.logger.debug(`Reminder payload: ${payloadSummary}`);
  }
}
