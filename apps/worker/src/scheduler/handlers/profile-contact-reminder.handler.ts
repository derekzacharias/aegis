import { Injectable, Logger } from '@nestjs/common';
import {
  CONTACT_STALE_DAYS,
  PROFILE_CRITICAL_FIELDS,
  ProfileCriticalField,
  ScheduleDefinition
} from '@compliance/shared';
import dayjs from 'dayjs';
import { PrismaService } from '../../prisma.service';
import { NotificationService } from '../../notifications/notification.service';
import { MetricsService } from '../../metrics/metrics.service';
import { ScheduleHandler } from '../schedule-handler';

type ReminderTarget = {
  id: string;
  email: string;
  name: string | null;
  missingFields: ProfileCriticalField[];
  isStale: boolean;
  lastUpdated: string | null;
};

const hasValue = (value: string | null | undefined): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  return value.trim().length > 0;
};

@Injectable()
export class ProfileContactReminderHandler implements ScheduleHandler {
  readonly type = 'profile-contact-reminder';

  private readonly logger = new Logger(ProfileContactReminderHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly metrics: MetricsService
  ) {}

  async execute(schedule: ScheduleDefinition): Promise<void> {
    this.logger.log(
      `Evaluating profile contact completeness for org ${schedule.organizationId} (schedule: ${schedule.name})`
    );

    const users = await this.prisma.user.findMany({
      where: { organizationId: schedule.organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        phoneNumber: true,
        timezone: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'asc'
      }
    });

    const attention = users
      .map<ReminderTarget | null>((user) => {
        const missingFields = PROFILE_CRITICAL_FIELDS.filter((field) =>
          !hasValue(user[field as keyof typeof user] as string | null | undefined)
        );
        const lastUpdatedIso = user.updatedAt ? user.updatedAt.toISOString() : null;
        const isStale = user.updatedAt
          ? dayjs().diff(dayjs(user.updatedAt), 'day') >= CONTACT_STALE_DAYS
          : true;

        if (missingFields.length === 0 && !isStale) {
          return null;
        }

        const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || null;

        return {
          id: user.id,
          email: user.email,
          name,
          missingFields,
          isStale,
          lastUpdated: lastUpdatedIso
        };
      })
      .filter((entry): entry is ReminderTarget => entry !== null);

    if (!attention.length) {
      this.logger.debug('All user profiles have complete and current contact metadata.');
      return;
    }

    const missingFieldCounts = PROFILE_CRITICAL_FIELDS.reduce<Record<ProfileCriticalField, number>>(
      (acc, field) => {
        acc[field] = attention.filter((entry) => entry.missingFields.includes(field)).length;
        return acc;
      },
      {} as Record<ProfileCriticalField, number>
    );

    this.logger.warn(
      JSON.stringify({
        event: 'profile.contact.needs_attention',
        scheduleId: schedule.id,
        organizationId: schedule.organizationId,
        attentionCount: attention.length,
        missingFieldCounts
      })
    );

    for (const target of attention) {
      await this.notifications.notifyContactReminder({
        scheduleId: schedule.id,
        organizationId: schedule.organizationId,
        user: {
          id: target.id,
          email: target.email,
          name: target.name
        },
        missingFields: target.missingFields,
        isStale: target.isStale,
        lastUpdated: target.lastUpdated
      });

      this.metrics.incrementCounter('notifications.contact.reminder.dispatched', 1, {
        organizationId: schedule.organizationId,
        userId: target.id,
        missing: target.missingFields.join(',') || 'none',
        stale: target.isStale
      });
    }
  }
}
