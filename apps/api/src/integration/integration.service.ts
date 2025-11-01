import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import {
  IntegrationConnectionRecord,
  IntegrationDetail,
  IntegrationMappingPreferences,
  IntegrationOAuthInitiation,
  IntegrationProvider,
  IntegrationSummary
} from './integration.types';
import { IntegrationOAuthService, OAuthCompletionResult } from './integration-oauth.service';
import {
    IntegrationDomainService,
    NormalizedIntegrationEvent
} from './integration-domain.service';

interface UpsertIntegrationInput {
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  scopes?: string[];
}

interface UpdateMappingInput {
  provider: IntegrationProvider;
  mapping: IntegrationMappingPreferences;
}

interface OAuthInitiationInput {
  provider: IntegrationProvider;
  redirectUri: string;
  scopes?: string[];
}

interface OAuthCompletionInput {
  provider: IntegrationProvider;
  state: string;
  code: string;
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);
  private readonly organizationId = 'demo-org';
  private readonly integrations = new Map<IntegrationProvider, IntegrationConnectionRecord>();

  constructor(
    private readonly oauthService: IntegrationOAuthService,
    private readonly domainService: IntegrationDomainService
  ) {
    this.seed();
  }

  async list(): Promise<IntegrationSummary[]> {
    return Array.from(this.integrations.values()).map((record) => this.toSummary(record));
  }

  async get(provider: IntegrationProvider): Promise<IntegrationConnectionRecord> {
    const record = this.integrations.get(provider);
    if (!record) {
      throw new NotFoundException(`Integration ${provider} not configured`);
    }
    return record;
  }

  async detail(provider: IntegrationProvider): Promise<IntegrationDetail> {
    const record = await this.get(provider);
    return this.toDetail(record);
  }

  async upsert(payload: UpsertIntegrationInput): Promise<IntegrationDetail> {
    const now = new Date().toISOString();
    const existing = this.integrations.get(payload.provider);
    const webhookSecret = existing?.webhook.secret ?? this.generateWebhookSecret();

    const record: IntegrationConnectionRecord = {
      id: existing?.id ?? payload.provider.toLowerCase(),
      provider: payload.provider,
      organizationId: this.organizationId,
      baseUrl: payload.baseUrl,
      clientId: payload.clientId,
      clientSecret: payload.clientSecret,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      status: 'connected',
      statusMessage: null,
      syncCursor: existing?.syncCursor ?? null,
      lastSyncedAt: now,
      webhook: {
        secret: webhookSecret,
        url: this.computeWebhookUrl(payload.provider),
        lastReceivedAt: existing?.webhook.lastReceivedAt ?? null,
        verified: existing?.webhook.verified ?? false
      },
      mapping: existing?.mapping ?? this.ensureDefaultMapping(payload.provider),
      oauth: {
        scopes: payload.scopes ?? existing?.oauth.scopes ?? [],
        expiresAt: existing?.oauth.expiresAt ?? null,
        accessToken: existing?.oauth.accessToken ?? null,
        refreshToken: existing?.oauth.refreshToken ?? null
      },
      metrics: existing?.metrics ?? { issuesLinked: 0, projectsMapped: 0 }
    };

    this.integrations.set(payload.provider, record);
    return this.toDetail(record);
  }

  async updateMapping(input: UpdateMappingInput): Promise<IntegrationDetail> {
    const existing = await this.get(input.provider);
    const updated: IntegrationConnectionRecord = {
      ...existing,
      mapping: {
        ...input.mapping,
        projectKey: input.mapping.projectKey ?? existing.mapping.projectKey
      },
      updatedAt: new Date().toISOString()
    };
    this.integrations.set(input.provider, updated);
    return this.toDetail(updated);
  }

  async initiateOAuth(input: OAuthInitiationInput): Promise<IntegrationOAuthInitiation> {
    const connection = await this.get(input.provider);
    const scopes = input.scopes ?? connection.oauth.scopes ?? [];
    return this.oauthService.initiate(
      input.provider,
      connection.baseUrl,
      connection.clientId,
      scopes,
      input.redirectUri
    );
  }

  async completeOAuth(input: OAuthCompletionInput): Promise<IntegrationDetail> {
    const connection = await this.get(input.provider);
    const tokens: OAuthCompletionResult = this.oauthService.complete(
      input.provider,
      input.state,
      input.code
    );

    const updated: IntegrationConnectionRecord = {
      ...connection,
      oauth: {
        scopes: tokens.scopes,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt
      },
      status: 'connected',
      statusMessage: null,
      updatedAt: new Date().toISOString()
    };

    this.integrations.set(input.provider, updated);
    return this.toDetail(updated);
  }

  async ingestWebhook(
    provider: IntegrationProvider,
    payload: Record<string, unknown>,
    signature: string | undefined
  ) {
    const connection = await this.get(provider);
    const secret = connection.webhook.secret;
    if (!secret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    if (!signature || !this.verifySignature(secret, payload, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const normalized = this.normalizeWebhookPayload(provider, payload);
    const snapshot = this.domainService.upsertFromWebhook(provider, normalized, connection.mapping);
    const metrics = this.domainService.getMetrics(provider);

    const updated: IntegrationConnectionRecord = {
      ...connection,
      webhook: {
        ...connection.webhook,
        lastReceivedAt: snapshot.updatedAt,
        verified: true
      },
      metrics,
      updatedAt: snapshot.updatedAt
    };

    this.integrations.set(provider, updated);

    this.logger.log(
      `Processed ${provider} webhook for ${normalized.externalId} -> task ${snapshot.taskId}`
    );
    return snapshot;
  }

  private toSummary(record: IntegrationConnectionRecord): IntegrationSummary {
    return {
      id: record.id,
      provider: record.provider,
      baseUrl: record.baseUrl,
      clientId: record.clientId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      status: record.status,
      statusMessage: record.statusMessage,
      lastSyncedAt: record.lastSyncedAt,
      webhook: record.webhook,
      mapping: record.mapping,
      oauth: {
        scopes: record.oauth.scopes,
        expiresAt: record.oauth.expiresAt
      },
      metrics: record.metrics
    };
  }

  private toDetail(record: IntegrationConnectionRecord): IntegrationDetail {
    return {
      ...this.toSummary(record),
      syncCursor: record.syncCursor,
      organizationId: record.organizationId,
      credentials: {
        clientId: record.clientId,
        hasClientSecret: Boolean(record.clientSecret)
      },
      oauth: record.oauth
    };
  }

  private seed() {
    const now = new Date().toISOString();
    const jiraMapping = this.ensureDefaultMapping('JIRA');
    const servicenowMapping = this.ensureDefaultMapping('SERVICENOW');

    this.integrations.set('JIRA', {
      id: 'jira',
      provider: 'JIRA',
      organizationId: this.organizationId,
      baseUrl: 'https://your-domain.atlassian.net',
      clientId: 'demo-client-id',
      clientSecret: 'demo-client-secret',
      createdAt: now,
      updatedAt: now,
      status: 'connected',
      statusMessage: null,
      syncCursor: null,
      lastSyncedAt: now,
      webhook: {
        secret: this.generateWebhookSecret(),
        url: this.computeWebhookUrl('JIRA'),
        lastReceivedAt: null,
        verified: false
      },
      mapping: jiraMapping,
      oauth: {
        scopes: ['read:jira-work', 'write:jira-work'],
        accessToken: null,
        refreshToken: null,
        expiresAt: null
      },
      metrics: {
        issuesLinked: 128,
        projectsMapped: 4
      }
    });

    this.integrations.set('SERVICENOW', {
      id: 'servicenow',
      provider: 'SERVICENOW',
      organizationId: this.organizationId,
      baseUrl: 'https://instance.service-now.com',
      clientId: 'demo-client-id',
      clientSecret: 'demo-client-secret',
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      statusMessage: 'Awaiting OAuth approval from ServiceNow admin.',
      syncCursor: null,
      lastSyncedAt: null,
      webhook: {
        secret: this.generateWebhookSecret(),
        url: this.computeWebhookUrl('SERVICENOW'),
        lastReceivedAt: null,
        verified: false
      },
      mapping: servicenowMapping,
      oauth: {
        scopes: ['ticket.read', 'ticket.write'],
        accessToken: null,
        refreshToken: null,
        expiresAt: null
      },
      metrics: {
        issuesLinked: 0,
        projectsMapped: 1
      }
    });
  }

  private ensureDefaultMapping(
    provider: IntegrationProvider,
    fallback?: IntegrationMappingPreferences
  ): IntegrationMappingPreferences {
    if (fallback) {
      return fallback;
    }

    if (provider === 'JIRA') {
      return {
        projectKey: 'FEDRAMP',
        defaultIssueType: 'Task',
        statusMapping: {
          ToDo: 'backlog',
          'In Progress': 'in-progress',
          Done: 'complete',
          default: 'backlog'
        },
        priorityMapping: {
          Highest: 'critical',
          High: 'high',
          Medium: 'medium',
          Low: 'low',
          Lowest: 'low',
          default: 'medium'
        },
        assessmentTagField: 'labels'
      };
    }

    return {
      projectKey: 'SN-SECOPS',
      defaultIssueType: 'incident',
      statusMapping: {
        New: 'backlog',
        'In Progress': 'in-progress',
        Resolved: 'complete',
        Closed: 'complete',
        default: 'backlog'
      },
      priorityMapping: {
        Critical: 'critical',
        High: 'high',
        Moderate: 'medium',
        Low: 'low',
        default: 'medium'
      },
      assessmentTagField: 'u_assessment_reference'
    };
  }

  private computeWebhookUrl(provider: IntegrationProvider) {
    return `/api/integrations/${provider.toLowerCase()}/webhook`;
  }

  private generateWebhookSecret() {
    return randomBytes(24).toString('hex');
  }

  private verifySignature(secret: string, payload: Record<string, unknown>, signature: string) {
    const computed = createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'hex');
    const computedBuffer = Buffer.from(computed, 'hex');

    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, computedBuffer);
  }

  private normalizeWebhookPayload(
    provider: IntegrationProvider,
    payload: Record<string, unknown>
  ): NormalizedIntegrationEvent {
    if (provider === 'JIRA') {
      const issue = payload['issue'] as Record<string, unknown> | undefined;
      if (!issue) {
        throw new BadRequestException('Missing issue payload');
      }

      const fields = (issue['fields'] as Record<string, unknown>) ?? {};

      return {
        externalId: String(issue['id'] ?? issue['key'] ?? 'unknown'),
        summary: String(fields['summary'] ?? 'Untitled issue'),
        description: fields['description'] ? String(fields['description']) : null,
        status: String(
          (fields['status'] as Record<string, unknown>)?.['name'] ?? 'ToDo'
        ),
        priority: String(
          (fields['priority'] as Record<string, unknown>)?.['name'] ?? 'Medium'
        ),
        link: typeof issue['self'] === 'string' ? issue['self'] : null,
        projectKey: String(
          ((fields['project'] as Record<string, unknown>)?.['key'] as string) ?? ''
        ),
        assessmentId: (fields['labels'] as string[] | undefined)?.find((label) =>
          label.startsWith('assessment-')
        )?.replace('assessment-', '') ?? null,
        occurredAt: payload['timestamp']
          ? new Date(Number(payload['timestamp'])).toISOString()
          : new Date().toISOString(),
        raw: payload
      };
    }

    const record = payload['record'] as Record<string, unknown> | undefined;
    if (!record) {
      throw new BadRequestException('Missing ServiceNow record payload');
    }

    return {
      externalId: String(record['sys_id'] ?? 'unknown'),
      summary: String(record['short_description'] ?? 'Untitled ticket'),
      description: record['description'] ? String(record['description']) : null,
      status: String(record['state'] ?? 'New'),
      priority: String(record['priority'] ?? 'Moderate'),
      link: record['url'] ? String(record['url']) : null,
      projectKey: record['assignment_group']
        ? String(record['assignment_group'])
        : 'SN-SECOPS',
      assessmentId: record['u_assessment_reference']
        ? String(record['u_assessment_reference'])
        : null,
      occurredAt: record['sys_updated_on']
        ? new Date(record['sys_updated_on'] as string).toISOString()
        : new Date().toISOString(),
      raw: payload
    };
  }
}
