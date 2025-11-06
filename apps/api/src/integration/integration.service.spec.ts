import { createHmac } from 'crypto';
import {
  IntegrationConnection as PrismaIntegrationConnection,
  Prisma
} from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { IntegrationDomainService } from './integration-domain.service';
import { IntegrationOAuthService } from './integration-oauth.service';
import { IntegrationService } from './integration.service';

const ORGANIZATION_ID = 'org-1';

describe('IntegrationService', () => {
  let service: IntegrationService;

  beforeEach(async () => {
    const { prisma } = createPrismaMock();
    service = new IntegrationService(
      prisma as unknown as PrismaService,
      new IntegrationOAuthService(),
      new IntegrationDomainService()
    );
    await service.list(ORGANIZATION_ID);
  });

  it('rejects webhook requests with invalid signatures', async () => {
    await service.detail(ORGANIZATION_ID, 'JIRA');

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
    const detail = await service.detail(ORGANIZATION_ID, 'JIRA');
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
    expect(snapshot.organizationId).toEqual(ORGANIZATION_ID);

    const updated = await service.detail(ORGANIZATION_ID, 'JIRA');
    expect(updated.metrics.issuesLinked).toBeGreaterThanOrEqual(1);
    expect(updated.webhook.verified).toBeTruthy();
  });

  it('scopes task snapshots by provider and organization', async () => {
    const detail = await service.detail(ORGANIZATION_ID, 'JIRA');
    const payload = {
      issue: {
        id: '789',
        fields: {
          summary: 'Document SSP updates',
          status: { name: 'Done' },
          priority: { name: 'Medium' },
          project: { key: 'FEDRAMP' }
        }
      }
    } as Record<string, unknown>;

    const signature = createHmac('sha256', detail.webhook.secret ?? '')
      .update(JSON.stringify(payload))
      .digest('hex');

    await service.ingestWebhook('JIRA', payload, signature);

    const scoped = service.listTasks('JIRA', ORGANIZATION_ID);
    expect(scoped.length).toBeGreaterThanOrEqual(1);
    scoped.forEach((task) => {
      expect(task.provider).toEqual('JIRA');
      expect(task.organizationId).toEqual(ORGANIZATION_ID);
    });

    const otherOrgTasks = service.listTasks('JIRA', 'org-2');
    expect(otherOrgTasks).toHaveLength(0);
  });

  it('matches webhook deliveries to the connection that signed the payload', async () => {
    const secondaryOrg = 'org-2';
    await service.list(secondaryOrg);

    const primary = await service.detail(ORGANIZATION_ID, 'JIRA');
    const secondary = await service.detail(secondaryOrg, 'JIRA');

    expect(primary.webhook.secret).not.toEqual(secondary.webhook.secret);

    const payload = {
      issue: {
        id: '321',
        fields: {
          summary: 'Secondary org sync',
          status: { name: 'ToDo' },
          priority: { name: 'Medium' },
          project: { key: 'FEDRAMP' }
        }
      }
    } as Record<string, unknown>;

    const signature = createHmac('sha256', secondary.webhook.secret ?? '')
      .update(JSON.stringify(payload))
      .digest('hex');

    await service.ingestWebhook('JIRA', payload, signature);

    const org2Tasks = service.listTasks('JIRA', secondaryOrg);
    expect(org2Tasks).toHaveLength(1);
    expect(org2Tasks[0].organizationId).toEqual(secondaryOrg);

    const org1Tasks = service.listTasks('JIRA', ORGANIZATION_ID);
    expect(org1Tasks).toHaveLength(0);
  });
});

function createPrismaMock() {
  const store = new Map<string, PrismaIntegrationConnection>();

  const clone = (record: PrismaIntegrationConnection): PrismaIntegrationConnection => ({
    ...record,
    oauthScopes: [...record.oauthScopes],
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    lastSyncedAt: record.lastSyncedAt ? new Date(record.lastSyncedAt) : null,
    lastWebhookAt: record.lastWebhookAt ? new Date(record.lastWebhookAt) : null,
    oauthExpiresAt: record.oauthExpiresAt ? new Date(record.oauthExpiresAt) : null
  });

  const resolve = <T>(value: unknown): T | undefined => {
    if (!value) {
      return undefined;
    }
    if (typeof value === 'object' && 'set' in (value as Record<string, unknown>)) {
      return (value as { set: T }).set;
    }
    return value as T;
  };

  const prisma = {
    integrationConnection: {
      findFirst: jest.fn(
        async ({ where }: { where?: Partial<PrismaIntegrationConnection> }) => {
          for (const record of store.values()) {
            if (where?.organizationId && record.organizationId !== where.organizationId) {
              continue;
            }
            if (where?.provider && record.provider !== where.provider) {
              continue;
            }
            return clone(record);
          }
          return null;
        }
      ),
      findMany: jest.fn(
        async ({ where }: { where?: Partial<PrismaIntegrationConnection> }) => {
          const list = Array.from(store.values()).filter((record) => {
            if (where?.organizationId && record.organizationId !== where.organizationId) {
              return false;
            }
            if (where?.provider && record.provider !== where.provider) {
              return false;
            }
            return true;
          });
          return list.map(clone);
        }
      ),
      create: jest.fn(
        async ({
          data
        }: {
          data: Prisma.IntegrationConnectionCreateInput;
        }) => {
          const organizationId = (data as { organizationId?: string }).organizationId;
          if (!organizationId) {
            throw new Error('organizationId is required');
          }
          const now = new Date();
          const id =
            (data as { id?: string }).id ?? `${data.provider.toLowerCase()}-${store.size + 1}`;
          const record: PrismaIntegrationConnection = {
            id,
            organizationId,
            provider: data.provider,
            clientId: data.clientId,
            clientSecret: data.clientSecret,
            baseUrl: data.baseUrl,
            oauthAccessToken: (data as { oauthAccessToken?: string | null }).oauthAccessToken ?? null,
            oauthRefreshToken: (data as { oauthRefreshToken?: string | null }).oauthRefreshToken ?? null,
            oauthExpiresAt: (data as { oauthExpiresAt?: Date | null }).oauthExpiresAt ?? null,
            oauthScopes: resolve<string[]>(data.oauthScopes) ?? [],
            webhookSecret: (data as { webhookSecret?: string | null }).webhookSecret ?? null,
            webhookUrl: (data as { webhookUrl?: string | null }).webhookUrl ?? null,
            mappingPreferences:
              resolve<Prisma.JsonValue | null>(data.mappingPreferences) ?? null,
            lastSyncedAt: (data as { lastSyncedAt?: Date | null }).lastSyncedAt ?? null,
            lastWebhookAt: (data as { lastWebhookAt?: Date | null }).lastWebhookAt ?? null,
            status:
              (data.status as PrismaIntegrationConnection['status'] | undefined) ?? 'PENDING',
            statusMessage: (data as { statusMessage?: string | null }).statusMessage ?? null,
            syncCursor: (data as { syncCursor?: string | null }).syncCursor ?? null,
            createdAt: now,
            updatedAt: now
          };
          store.set(record.id, record);
          return clone(record);
        }
      ),
      update: jest.fn(
        async ({
          where,
          data
        }: {
          where: { id: string };
          data: Prisma.IntegrationConnectionUpdateInput;
        }) => {
          const current = store.get(where.id);
          if (!current) {
            throw new Error('integration connection not found');
          }
          const now = new Date();
          const updated: PrismaIntegrationConnection = {
            ...current,
            baseUrl: resolve<string>(data.baseUrl) ?? current.baseUrl,
            clientId: resolve<string>(data.clientId) ?? current.clientId,
            clientSecret: resolve<string>(data.clientSecret) ?? current.clientSecret,
            oauthAccessToken:
              resolve<string | null>(data.oauthAccessToken) ?? current.oauthAccessToken,
            oauthRefreshToken:
              resolve<string | null>(data.oauthRefreshToken) ?? current.oauthRefreshToken,
            oauthExpiresAt:
              resolve<Date | null>(data.oauthExpiresAt) ?? current.oauthExpiresAt,
            oauthScopes: resolve<string[]>(data.oauthScopes) ?? current.oauthScopes,
            webhookSecret:
              resolve<string | null>(data.webhookSecret) ?? current.webhookSecret,
            webhookUrl: resolve<string | null>(data.webhookUrl) ?? current.webhookUrl,
            mappingPreferences:
              resolve<Prisma.JsonValue>(data.mappingPreferences) ?? current.mappingPreferences,
            lastSyncedAt: resolve<Date | null>(data.lastSyncedAt) ?? current.lastSyncedAt,
            lastWebhookAt: resolve<Date | null>(data.lastWebhookAt) ?? current.lastWebhookAt,
            status:
              resolve<PrismaIntegrationConnection['status']>(data.status) ?? current.status,
            statusMessage:
              resolve<string | null>(data.statusMessage) ?? current.statusMessage,
            syncCursor: resolve<string | null>(data.syncCursor) ?? current.syncCursor,
            updatedAt: now
          };
          store.set(updated.id, updated);
          return clone(updated);
        }
      )
    }
  };

  return { prisma, store };
}
