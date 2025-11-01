import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FrameworkSummary } from './use-frameworks';
import apiClient from '../services/api-client';

export type BaselineLevel = 'low' | 'moderate' | 'high' | 'privacy';

export type CustomControlMappingInput = {
  targetControlId: string;
  confidence?: number;
  rationale?: string;
  tags?: string[];
};

export type CustomControlInput = {
  id?: string;
  family: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  kind?: 'base' | 'enhancement';
  parentId?: string;
  baselines?: BaselineLevel[];
  keywords?: string[];
  references?: string[];
  relatedControls?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  mappings?: CustomControlMappingInput[];
};

export type ControlMappingSummary = {
  id: string;
  targetControlId: string;
  targetControlTitle: string;
  targetFramework: {
    id: string;
    name: string;
    version: string;
  };
  confidence: number;
  origin: 'SEED' | 'ALGO' | 'MANUAL';
  tags: string[];
  rationale?: string;
};

export type FrameworkControlDetail = CustomControlInput & {
  id: string;
  frameworkId: string;
  tags?: string[];
  mappings: ControlMappingSummary[];
};

export type FrameworkDetail = FrameworkSummary & {
  metadata?: Record<string, unknown>;
  controls: FrameworkControlDetail[];
};

export type CreateCustomFrameworkPayload = {
  name: string;
  version: string;
  description: string;
  family?: 'NIST' | 'CIS' | 'PCI' | 'CUSTOM';
  publish?: boolean;
  metadata?: Record<string, unknown>;
  controls?: CustomControlInput[];
};

export type UpdateCustomFrameworkPayload = {
  name?: string;
  version?: string;
  description?: string;
  family?: 'NIST' | 'CIS' | 'PCI' | 'CUSTOM';
  metadata?: Record<string, unknown>;
};

export type UpsertControlsPayload = {
  controls: CustomControlInput[];
};

export type PublishFrameworkPayload = {
  metadata?: Record<string, unknown>;
};

export const useFrameworkDetail = (frameworkId?: string) =>
  useQuery({
    queryKey: ['frameworks', frameworkId, 'detail'],
    queryFn: async () => {
      if (!frameworkId) {
        throw new Error('frameworkId is required');
      }
      const response = await apiClient.get<FrameworkDetail>(`/frameworks/${frameworkId}`);
      return response.data;
    },
    enabled: Boolean(frameworkId),
    staleTime: 1000 * 30
  });

export const useCreateFrameworkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCustomFrameworkPayload) => {
      const response = await apiClient.post<FrameworkDetail>('/frameworks', payload);
      return response.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
      if (created?.id) {
        queryClient.setQueryData(['frameworks', created.id, 'detail'], created);
      }
    }
  });
};

export const useUpdateFrameworkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      frameworkId,
      payload
    }: {
      frameworkId: string;
      payload: UpdateCustomFrameworkPayload;
    }) => {
      const response = await apiClient.patch<FrameworkDetail>(`/frameworks/${frameworkId}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
      queryClient.setQueryData(['frameworks', data.id, 'detail'], data);
    }
  });
};

export const useUpsertControlsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      frameworkId,
      payload
    }: {
      frameworkId: string;
      payload: UpsertControlsPayload;
    }) => {
      const response = await apiClient.put<FrameworkDetail>(`/frameworks/${frameworkId}/controls`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
      queryClient.setQueryData(['frameworks', data.id, 'detail'], data);
    }
  });
};

export const usePublishFrameworkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      frameworkId,
      payload
    }: {
      frameworkId: string;
      payload: PublishFrameworkPayload;
    }) => {
      const response = await apiClient.post<FrameworkSummary>(
        `/frameworks/${frameworkId}/publish`,
        payload
      );
      return response.data;
    },
    onSuccess: (summary) => {
      queryClient.invalidateQueries({ queryKey: ['frameworks'] });
      queryClient.setQueryData(['frameworks', summary.id, 'detail'], (previous) => {
        const existing = previous as FrameworkDetail | undefined;
        if (!existing) {
          return previous;
        }
        return {
          ...existing,
          status: summary.status,
          publishedAt: summary.publishedAt ?? existing.publishedAt,
          updatedAt: summary.updatedAt
        } as FrameworkDetail;
      });
    }
  });
};
