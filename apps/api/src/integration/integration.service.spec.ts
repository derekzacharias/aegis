import { createHmac } from 'crypto';
import { IntegrationDomainService } from './integration-domain.service';
import { IntegrationOAuthService } from './integration-oauth.service';
import { IntegrationService } from './integration.service';

describe('IntegrationService', () => {
  let service: IntegrationService;

  beforeEach(() => {
    service = new IntegrationService(new IntegrationOAuthService(), new IntegrationDomainService());
  });

  it('rejects webhook requests with invalid signatures', async () => {
    const payload = {
      issue: {
        id: '123',
        fields: {
          summary: 'Invalid signature test',
          status: { name: 'ToDo' },
          priority: { name: 'Medium' }
        }
      }
    };

    await expect(service.ingestWebhook('JIRA', payload, 'bad-signature')).rejects.toThrow(
      /Invalid webhook signature/
    );
  });

  it('applies mapping rules when ingesting Jira webhooks', async () => {
    const detail = await service.detail('JIRA');
    const payload = {
      issue: {
        id: '456',
        key: 'FEDRAMP-456',
        self: 'https://example.atlassian.net/rest/api/3/issue/456',
        fields: {
          summary: 'Encrypt S3 buckets',
          status: { name: 'In Progress' },
          priority: { name: 'High' },
          project: { key: 'FEDRAMP' },
          labels: ['assessment-abc123']
        }
      },
      timestamp: Date.now()
    } as Record<string, unknown>;

    const signature = createHmac('sha256', detail.webhook.secret ?? '')
      .update(JSON.stringify(payload))
      .digest('hex');

    const snapshot = await service.ingestWebhook('JIRA', payload, signature);

    expect(snapshot.status).toEqual('in-progress');
    expect(snapshot.priority).toEqual('high');
    expect(snapshot.projectKey).toEqual('FEDRAMP');
    expect(snapshot.assessmentId).toEqual('abc123');

    const updated = await service.detail('JIRA');
    expect(updated.metrics.issuesLinked).toBeGreaterThanOrEqual(1);
    expect(updated.webhook.verified).toBeTruthy();
  });
});
