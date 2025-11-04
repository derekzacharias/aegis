import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import {
  IntegrationConnection as PrismaIntegrationConnection,
  IntegrationConnectionStatus as PrismaIntegrationStatus,
  Prisma
} from '@prisma/client';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationOAuthService, OAuthCompletionResult } from './integration-oauth.service';
import {
  IntegrationDomainService,
  NormalizedIntegrationEvent
} from './integration-domain.service';
import {
  INTEGRATION_PROVIDERS,
  IntegrationConnectionRecord,
  IntegrationDetail,
  IntegrationMappingPreferences,
  IntegrationOAuthInitiation,
  IntegrationProvider,
  IntegrationSummary,
  IntegrationTaskSnapshot
} from './integration.types';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly oauthService: IntegrationOAuthService,
    private readonly domainService: IntegrationDomainService
  ) {}

  async list(organizationId: string): Promise<IntegrationSummary[]> {
    await this.ensureAllProviders(organizationId);
    const connections = await this.prisma.integrationConnection.findMany({
      where: { organizationId },
      orderBy: { provider: 'asc' }
    });

    return connections.map((connection) => this.toSummary(this.mapToRecord(connection)));
  }

  async detail(
    organizationId: string,
    provider: IntegrationProvider
  ): Promise<IntegrationDetail> {
    const connection = await this.ensureConnection(organizationId, provider);
    return this.toDetail(this.mapToRecord(connection));
  }

  async upsert(
    organizationId: string,
    payload: UpsertIntegrationInput
  ): Promise<IntegrationDetail> {
    const existing = await this.ensureConnection(organizationId, payload.provider);
    const scopes =
      payload.scopes && payload.scopes.length
        ? payload.scopes
        : existing.oauthScopes.length
        ? existing.oauthScopes
        : this.getDefaultScopes(payload.provider);
    const webhookSecret = existing.webhookSecret ?? this.generateWebhookSecret();
    const webhookUrl = existing.webhookUrl ?? this.computeWebhookUrl(payload.provider);

    const updated = await this.prisma.integrationConnection.update({
      where: { id: existing.id },
      data: {
        baseUrl: payload.baseUrl,
        clientId: payload.clientId,
        clientSecret: payload.clientSecret,
        oauthScopes: scopes,
        webhookSecret,
        webhookUrl,
        status: 'CONNECTED',
        statusMessage: null,
        lastSyncedAt: new Date()
      }
    });

    return this.toDetail(this.mapToRecord(updated));
  }

  async updateMapping(
    organizationId: string,
    input: UpdateMappingInput
  ): Promise<IntegrationDetail> {
    const existing = await this.ensureConnection(organizationId, input.provider);
    const mapping = this.mergeMapping(input.provider, input.mapping);

    const updated = await this.prisma.integrationConnection.update({
      where: { id: existing.id },
      data: {
        mappingPreferences: this.toMappingJson(mapping)
      }
    });

    return this.toDetail(this.mapToRecord(updated));
  }

  async initiateOAuth(
    organizationId: string,
    input: OAuthInitiationInput
  ): Promise<IntegrationOAuthInitiation> {
    const connection = await this.ensureConnection(organizationId, input.provider);
    const scopes =
      input.scopes && input.scopes.length
        ? input.scopes
        : connection.oauthScopes.length
        ? connection.oauthScopes
        : this.getDefaultScopes(input.provider);

    return this.oauthService.initiate(
      input.provider,
      connection.baseUrl,
      connection.clientId,
      scopes,
      input.redirectUri
    );
  }

  async completeOAuth(
    organizationId: string,
    input: OAuthCompletionInput
  ): Promise<IntegrationDetail> {
    const connection = await this.ensureConnection(organizationId, input.provider);
    const tokens: OAuthCompletionResult = this.oauthService.complete(
      input.provider,
      input.state,
      input.code
    );

    const updated = await this.prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        oauthAccessToken: tokens.accessToken,
        oauthRefreshToken: tokens.refreshToken,
        oauthExpiresAt: new Date(tokens.expiresAt),
        oauthScopes: tokens.scopes,
        status: 'CONNECTED',
        statusMessage: null
      }
    });

    return this.toDetail(this.mapToRecord(updated));
  }

  async ingestWebhook(
    provider: IntegrationProvider,
    payload: Record<string, unknown>,
    signature: string | undefined
  ) {
    const connections = await this.prisma.integrationConnection.findMany({
      where: { provider }
    });

    if (!connections.length) {
      throw new NotFoundException(`Integration ${provider} not configured`);
    }

    if (!signature) {
      throw new BadRequestException('Missing webhook signature');
    }

    const connection = connections.find((candidate) => {
      const secret = candidate.webhookSecret;
      if (!secret) {
        return false;
      }
      return this.verifySignature(secret, payload, signature);
    });

    if (!connection) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const mapping = this.parseMapping(provider, connection.mappingPreferences);
    const normalized = this.normalizeWebhookPayload(provider, payload);
    const snapshot = this.domainService.upsertFromWebhook(
      provider,
      normalized,
      mapping,
      connection.organizationId
    );

    await this.prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        lastWebhookAt: new Date(snapshot.updatedAt),
        status: 'CONNECTED',
        statusMessage: null
      }
    });

    this.logger.log(
      `Processed ${provider} webhook for ${normalized.externalId} -> task ${snapshot.taskId}`
    );
    return snapshot;
  }

  listTasks(
    provider?: IntegrationProvider,
    organizationId?: string
  ): IntegrationTaskSnapshot[] {
    return this.domainService.listTasks(provider, organizationId);
  }

  private async ensureAllProviders(organizationId: string) {
    await Promise.all(
      INTEGRATION_PROVIDERS.map((provider) => this.ensureConnection(organizationId, provider))
    );
  }

  private async ensureConnection(
    organizationId: string,
    provider: IntegrationProvider
  ): Promise<PrismaIntegrationConnection> {
    let connection = await this.prisma.integrationConnection.findFirst({
      where: { organizationId, provider }
    });

    if (!connection) {
      connection = await this.prisma.integrationConnection.create({
        data: this.buildDefaultConnectionData(organizationId, provider)
      });
      return connection;
    }

    const updateData: Prisma.IntegrationConnectionUpdateInput = {};
    let shouldUpdate = false;

    if (!connection.webhookSecret) {
      updateData.webhookSecret = this.generateWebhookSecret();
      shouldUpdate = true;
    }

    if (!connection.webhookUrl) {
      updateData.webhookUrl = this.computeWebhookUrl(provider);
      shouldUpdate = true;
    }

    if (!connection.oauthScopes || connection.oauthScopes.length === 0) {
      updateData.oauthScopes = this.getDefaultScopes(provider);
      shouldUpdate = true;
    }

    if (this.isJsonEmpty(connection.mappingPreferences)) {
      updateData.mappingPreferences = this.toMappingJson(this.buildDefaultMapping(provider));
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      connection = await this.prisma.integrationConnection.update({
        where: { id: connection.id },
        data: updateData
      });
    }

    return connection;
  }

  private mapToRecord(connection: PrismaIntegrationConnection): IntegrationConnectionRecord {
    const provider = connection.provider as IntegrationProvider;
    const mapping = this.parseMapping(provider, connection.mappingPreferences);
    const metrics = this.domainService.getMetrics(provider, connection.organizationId);

    return {
      id: connection.id,
      provider,
      organizationId: connection.organizationId,
      baseUrl: connection.baseUrl,
      clientId: connection.clientId,
      clientSecret: connection.clientSecret,
      createdAt: connection.createdAt.toISOString(),
      updatedAt: connection.updatedAt.toISOString(),
      status: this.fromPrismaStatus(connection.status),
      statusMessage: connection.statusMessage,
      syncCursor: connection.syncCursor,
      lastSyncedAt: connection.lastSyncedAt
        ? connection.lastSyncedAt.toISOString()
        : null,
      webhook: {
        secret: connection.webhookSecret ?? null,
        url: connection.webhookUrl ?? this.computeWebhookUrl(provider),
        lastReceivedAt: connection.lastWebhookAt
          ? connection.lastWebhookAt.toISOString()
          : null,
        verified: Boolean(connection.webhookSecret && connection.lastWebhookAt)
      },
      mapping,
      oauth: {
        scopes: connection.oauthScopes ?? [],
        accessToken: connection.oauthAccessToken ?? null,
        refreshToken: connection.oauthRefreshToken ?? null,
        expiresAt: connection.oauthExpiresAt
          ? connection.oauthExpiresAt.toISOString()
          : null
      },
      metrics
    };
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

  private buildDefaultConnectionData(
    organizationId: string,
    provider: IntegrationProvider
  ): Prisma.IntegrationConnectionCreateInput {
    const mapping = this.buildDefaultMapping(provider);
    return {
      organizationId,
      provider,
      clientId: 'demo-client-id',
      clientSecret: 'demo-client-secret',
      baseUrl: this.getDefaultBaseUrl(provider),
      oauthScopes: this.getDefaultScopes(provider),
      webhookSecret: this.generateWebhookSecret(),
      webhookUrl: this.computeWebhookUrl(provider),
      mappingPreferences: this.toMappingJson(mapping),
      status: provider === 'JIRA' ? 'CONNECTED' : 'PENDING',
      statusMessage:
        provider === 'SERVICENOW'
          ? 'Awaiting OAuth approval from ServiceNow admin.'
          : null,
      lastSyncedAt: provider === 'JIRA' ? new Date() : null
    };
  }

  private buildDefaultMapping(provider: IntegrationProvider): IntegrationMappingPreferences {
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

  private mergeMapping(
    provider: IntegrationProvider,
    mapping?: Partial<IntegrationMappingPreferences> | null
  ): IntegrationMappingPreferences {
    const defaults = this.buildDefaultMapping(provider);
    if (!mapping) {
      return defaults;
    }

    return {
      projectKey:
        mapping.projectKey !== undefined ? mapping.projectKey : defaults.projectKey,
      defaultIssueType: mapping.defaultIssueType ?? defaults.defaultIssueType,
      assessmentTagField:
        mapping.assessmentTagField !== undefined
          ? mapping.assessmentTagField
          : defaults.assessmentTagField,
      statusMapping: this.mergeMappingRecords(mapping.statusMapping, defaults.statusMapping),
      priorityMapping: this.mergeMappingRecords(
        mapping.priorityMapping,
        defaults.priorityMapping
      )
    };
  }

  private mergeMappingRecords(
    source: Record<string, string> | undefined,
    defaults: Record<string, string>
  ): Record<string, string> {
    const sanitized: Record<string, string> = {};
    if (source) {
      for (const [key, value] of Object.entries(source)) {
        if (typeof value === 'string' && value.trim().length) {
          sanitized[key] = value;
        }
      }
    }

    const merged = { ...defaults, ...sanitized };
    if (!merged.default) {
      merged.default = defaults.default;
    }
    return merged;
  }

  private parseMapping(
    provider: IntegrationProvider,
    raw: Prisma.JsonValue | null
  ): IntegrationMappingPreferences {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return this.buildDefaultMapping(provider);
    }

    const source = raw as Record<string, unknown>;
    const mapping: Partial<IntegrationMappingPreferences> = {
      projectKey:
        source.projectKey === null || typeof source.projectKey === 'string'
          ? (source.projectKey as string | null)
          : undefined,
      defaultIssueType:
        typeof source.defaultIssueType === 'string' ? source.defaultIssueType : undefined,
      assessmentTagField:
        source.assessmentTagField === null || typeof source.assessmentTagField === 'string'
          ? (source.assessmentTagField as string | null)
          : undefined,
      statusMapping: this.castMappingRecord(source.statusMapping),
      priorityMapping: this.castMappingRecord(source.priorityMapping)
    };

    return this.mergeMapping(provider, mapping);
  }

  private castMappingRecord(value: unknown): Record<string, string> | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const result: Record<string, string> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (typeof entry === 'string') {
        result[key] = entry;
      }
    }
    return result;
  }

  private toMappingJson(mapping: IntegrationMappingPreferences): Prisma.JsonObject {
    return {
      projectKey: mapping.projectKey,
      defaultIssueType: mapping.defaultIssueType,
      assessmentTagField: mapping.assessmentTagField,
      statusMapping: mapping.statusMapping,
      priorityMapping: mapping.priorityMapping
    } as Prisma.JsonObject;
  }

  private fromPrismaStatus(status: PrismaIntegrationStatus) {
    switch (status) {
      case 'CONNECTED':
        return 'connected';
      case 'ERROR':
        return 'error';
      default:
        return 'pending';
    }
  }

  private isJsonEmpty(value: Prisma.JsonValue | null | undefined) {
    if (!value) {
      return true;
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      return true;
    }

    return Object.keys(value as Record<string, unknown>).length === 0;
  }

  private getDefaultScopes(provider: IntegrationProvider) {
    return provider === 'JIRA'
      ? ['read:jira-work', 'write:jira-work']
      : ['ticket.read', 'ticket.write'];
  }

  private getDefaultBaseUrl(provider: IntegrationProvider) {
    return provider === 'JIRA'
      ? 'https://your-domain.atlassian.net'
      : 'https://instance.service-now.com';
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
