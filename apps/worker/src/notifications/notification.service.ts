import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EvidenceNotificationPayload {
  evidenceId: string;
  organizationId: string;
  scanId: string;
  status: 'quarantined' | 'released';
  reason: string;
  findings?: Record<string, unknown>;
  requestedBy?: EvidenceNotificationContact;
}

export interface EvidenceNotificationContact {
  id: string | null;
  email: string;
  name: string | null;
  jobTitle: string | null;
  phoneNumber: string | null;
  timezone: string | null;
  lastUpdated: string | null;
  isStale: boolean;
  missingFields: string[];
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly endpoint: string | null;
  private readonly channel: string;

  constructor(private readonly config: ConfigService) {
    const notifications = (config.get<Record<string, unknown>>('notifications') ?? {}) as Record<
      string,
      unknown
    >;
    this.endpoint = (notifications['endpoint'] as string | undefined) ?? null;
    this.channel = (notifications['evidenceChannel'] as string | undefined) ?? 'evidence-reviewers';
  }

  async notifyEvidence(payload: EvidenceNotificationPayload): Promise<void> {
    if (!this.endpoint) {
      this.logger.log(
        JSON.stringify({
          event: 'notification.skipped',
          channel: this.channel,
          payload
        })
      );
      return;
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: this.channel,
          template: 'evidence-scan-status',
          data: payload
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Notification service returned ${response.status}: ${text || response.statusText}`
        );
      }

      this.logger.log(
        JSON.stringify({
          event: 'notification.sent',
          channel: this.channel,
          evidenceId: payload.evidenceId,
          scanId: payload.scanId,
          status: payload.status
        })
      );
    } catch (error) {
      this.logger.error(
        `Failed to dispatch evidence notification: ${(error as Error).message}`,
        (error as Error).stack
      );
    }
  }
}
