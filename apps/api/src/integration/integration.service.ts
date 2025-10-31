import { Injectable } from '@nestjs/common';

export const INTEGRATION_PROVIDERS = ['JIRA', 'SERVICENOW'] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

export interface IntegrationSummary {
  id: string;
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  createdAt: string;
  status: 'connected' | 'error' | 'pending';
  lastSyncedAt: string | null;
  issuesLinked: number;
  projectsMapped: number;
  notes: string | null;
}

interface UpsertIntegrationInput {
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

@Injectable()
export class IntegrationService {
  private readonly integrations: Map<IntegrationProvider, IntegrationSummary> = new Map();

  constructor() {
    const now = new Date().toISOString();
    this.integrations.set('JIRA', {
      id: 'jira',
      provider: 'JIRA',
      baseUrl: 'https://your-domain.atlassian.net',
      clientId: 'demo-client-id',
      createdAt: now,
      status: 'connected',
      lastSyncedAt: now,
      issuesLinked: 128,
      projectsMapped: 4,
      notes: null
    });
    this.integrations.set('SERVICENOW', {
      id: 'servicenow',
      provider: 'SERVICENOW',
      baseUrl: 'https://instance.service-now.com',
      clientId: 'demo-client-id',
      createdAt: now,
      status: 'pending',
      lastSyncedAt: null,
      issuesLinked: 0,
      projectsMapped: 1,
      notes: 'Awaiting OAuth approval from ServiceNow admin.'
    });
  }

  async list(): Promise<IntegrationSummary[]> {
    return Array.from(this.integrations.values());
  }

  async upsert(payload: UpsertIntegrationInput): Promise<IntegrationSummary> {
    const summary: IntegrationSummary = {
      id: payload.provider.toLowerCase(),
      provider: payload.provider,
      baseUrl: payload.baseUrl,
      clientId: payload.clientId,
      createdAt: new Date().toISOString(),
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      issuesLinked: this.integrations.get(payload.provider)?.issuesLinked ?? 0,
      projectsMapped: this.integrations.get(payload.provider)?.projectsMapped ?? 0,
      notes: null
    };

    this.integrations.set(payload.provider, summary);
    return summary;
  }
}
