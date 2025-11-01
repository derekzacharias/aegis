import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type IntegrationProvider = 'JIRA' | 'SERVICENOW';

export interface IntegrationMappingPreferences {
  projectKey: string | null;
  defaultIssueType: string;
  statusMapping: Record<string, string>;
  priorityMapping: Record<string, string>;
  assessmentTagField: string | null;
}

export interface IntegrationWebhookMetadata {
  secret: string | null;
  url: string | null;
  lastReceivedAt: string | null;
  verified: boolean;
}

export interface IntegrationMetrics {
  issuesLinked: number;
  projectsMapped: number;
}

export interface IntegrationOAuthInfo {
  scopes: string[];
  expiresAt: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface IntegrationSummary {
  id: string;
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
  status: 'connected' | 'error' | 'pending';
  statusMessage: string | null;
  lastSyncedAt: string | null;
  webhook: IntegrationWebhookMetadata;
  mapping: IntegrationMappingPreferences;
  oauth: Pick<IntegrationOAuthInfo, 'scopes' | 'expiresAt'>;
  metrics: IntegrationMetrics;
}

export interface IntegrationDetail extends IntegrationSummary {
  syncCursor: string | null;
  organizationId: string;
  credentials: {
    clientId: string;
    hasClientSecret: boolean;
  };
  oauth: IntegrationOAuthInfo;
}

interface ConnectIntegrationInput {
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

interface InitiateOAuthInput {
  provider: IntegrationProvider;
  redirectUri: string;
  scopes?: string[];
}

interface CompleteOAuthInput {
  provider: IntegrationProvider;
  state: string;
  code: string;
}

export interface OAuthInitiationResponse {
  state: string;
  codeVerifier: string;
  authorizationUrl: string;
  expiresAt: string;
}

const fallback: IntegrationSummary[] = [
  {
    id: 'jira',
    provider: 'JIRA',
    baseUrl: 'https://your-domain.atlassian.net',
    clientId: 'demo-client-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'connected',
    statusMessage: null,
    lastSyncedAt: new Date().toISOString(),
    webhook: {
      secret: 'demo-secret',
      url: '/api/integrations/jira/webhook',
      lastReceivedAt: null,
      verified: false
    },
    mapping: {
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
        default: 'medium'
      },
      assessmentTagField: 'labels'
    },
    oauth: {
      scopes: ['read:jira-work', 'write:jira-work'],
      expiresAt: null
    },
    metrics: {
      issuesLinked: 128,
      projectsMapped: 4
    }
  },
  {
    id: 'servicenow',
    provider: 'SERVICENOW',
    baseUrl: 'https://instance.service-now.com',
    clientId: 'demo-client-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    statusMessage: 'Awaiting OAuth approval from ServiceNow admin.',
    lastSyncedAt: null,
    webhook: {
      secret: 'demo-secret',
      url: '/api/integrations/servicenow/webhook',
      lastReceivedAt: null,
      verified: false
    },
    mapping: {
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
    },
    oauth: {
      scopes: ['ticket.read', 'ticket.write'],
      expiresAt: null
    },
    metrics: {
      issuesLinked: 0,
      projectsMapped: 1
    }
  }
];

export const useIntegrations = () =>
  useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await apiClient.get<IntegrationSummary[]>('/integrations');
      return response.data;
    },
    placeholderData: fallback,
    staleTime: 1000 * 60 * 10,
    retry: false
  });

export const useConnectIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ConnectIntegrationInput) => {
      const response = await apiClient.put<IntegrationDetail>('/integrations', input);
      return response.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });
};

export const useUpdateIntegrationMapping = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateMappingInput) => {
      const response = await apiClient.patch<IntegrationDetail>('/integrations/mapping', input);
      return response.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });
};

export const useInitiateIntegrationOAuth = () =>
  useMutation({
    mutationFn: async (input: InitiateOAuthInput) => {
      const response = await apiClient.post<OAuthInitiationResponse>(
        '/integrations/oauth/initiate',
        input
      );
      return response.data;
    }
  });

export const useCompleteIntegrationOAuth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CompleteOAuthInput) => {
      const response = await apiClient.post<IntegrationDetail>(
        '/integrations/oauth/complete',
        input
      );
      return response.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });
};
