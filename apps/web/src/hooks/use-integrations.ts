import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type IntegrationProvider = 'JIRA' | 'SERVICENOW';

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

interface ConnectIntegrationInput {
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

const fallback: IntegrationSummary[] = [
  {
    id: 'jira',
    provider: 'JIRA',
    baseUrl: 'https://your-domain.atlassian.net',
    clientId: 'demo-client-id',
    createdAt: new Date().toISOString(),
    status: 'connected',
    lastSyncedAt: new Date().toISOString(),
    issuesLinked: 128,
    projectsMapped: 4,
    notes: null
  },
  {
    id: 'servicenow',
    provider: 'SERVICENOW',
    baseUrl: 'https://instance.service-now.com',
    clientId: 'demo-client-id',
    createdAt: new Date().toISOString(),
    status: 'pending',
    lastSyncedAt: null,
    issuesLinked: 0,
    projectsMapped: 1,
    notes: 'Awaiting OAuth approval from ServiceNow admin.'
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
      const response = await apiClient.put<IntegrationSummary>('/integrations', input);
      return response.data;
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });
};
