export const INTEGRATION_PROVIDERS = ['JIRA', 'SERVICENOW'] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

export type IntegrationConnectionStatus = 'connected' | 'pending' | 'error';

export interface IntegrationMappingPreferences {
  projectKey: string | null;
  defaultIssueType: string;
  statusMapping: Record<string, string>;
  priorityMapping: Record<string, string>;
  assessmentTagField: string | null;
}

export interface IntegrationMetrics {
  issuesLinked: number;
  projectsMapped: number;
}

export interface IntegrationTaskSnapshot {
  taskId: string;
  externalId: string;
  provider: IntegrationProvider;
  organizationId: string;
  summary: string;
  status: string;
  priority: string;
  link: string | null;
  projectKey: string | null;
  assessmentId: string | null;
  updatedAt: string;
  lastPayload: Record<string, unknown>;
}

export interface IntegrationWebhookMetadata {
  secret: string | null;
  url: string | null;
  lastReceivedAt: string | null;
  verified: boolean;
}

export interface IntegrationOAuthMetadata {
  scopes: string[];
  expiresAt: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface IntegrationConnectionRecord {
  id: string;
  provider: IntegrationProvider;
  organizationId: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  createdAt: string;
  updatedAt: string;
  status: IntegrationConnectionStatus;
  statusMessage: string | null;
  syncCursor: string | null;
  lastSyncedAt: string | null;
  webhook: IntegrationWebhookMetadata;
  mapping: IntegrationMappingPreferences;
  oauth: IntegrationOAuthMetadata;
  metrics: IntegrationMetrics;
}

export interface IntegrationSummary {
  id: string;
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  status: IntegrationConnectionStatus;
  statusMessage: string | null;
  lastSyncedAt: string | null;
  webhook: IntegrationWebhookMetadata;
  mapping: IntegrationMappingPreferences;
  oauth: Pick<IntegrationOAuthMetadata, 'scopes' | 'expiresAt'>;
  metrics: IntegrationMetrics;
}

export interface IntegrationDetail extends IntegrationSummary {
  syncCursor: string | null;
  organizationId: string;
  credentials: {
    clientId: string;
    hasClientSecret: boolean;
  };
  oauth: IntegrationOAuthMetadata;
}

export interface IntegrationOAuthInitiation {
  state: string;
  codeVerifier: string;
  authorizationUrl: string;
  expiresAt: string;
}
