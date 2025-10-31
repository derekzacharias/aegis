import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api-client';
import { FrameworkSummary } from './use-frameworks';

export type ControlPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type BaselineLevel = 'low' | 'moderate' | 'high';

export type ControlDefinition = {
  id: string;
  frameworkId: string;
  kind: 'base' | 'enhancement';
  parentId?: string;
  family: string;
  title: string;
  description: string;
  priority: ControlPriority;
  baselines?: BaselineLevel[];
  keywords?: string[];
  references?: string[];
  relatedControls?: string[];
};

export type ControlCatalogFacets = {
  families: Array<{ value: string; count: number }>;
  priorities: Array<{ value: ControlPriority; count: number }>;
  types: Array<{ value: 'base' | 'enhancement'; count: number }>;
};

export type ControlCatalogResponse = {
  frameworkId: string;
  framework: FrameworkSummary;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  items: ControlDefinition[];
  facets: ControlCatalogFacets;
};

export type ControlCatalogParams = {
  search?: string;
  family?: string;
  priority?: ControlPriority;
  type?: 'base' | 'enhancement';
  page?: number;
  pageSize?: number;
};

export const useControlCatalog = (frameworkId: string | undefined, params: ControlCatalogParams) =>
  useQuery({
    queryKey: ['frameworks', frameworkId, 'controls', params],
    queryFn: async () => {
      if (!frameworkId) {
        throw new Error('frameworkId is required');
      }

      const response = await apiClient.get<ControlCatalogResponse>(`/frameworks/${frameworkId}/controls`, {
        params: {
          search: params.search || undefined,
          family: params.family || undefined,
          priority: params.priority || undefined,
          type: params.type || undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 25
        }
      });

      return response.data;
    },
    enabled: Boolean(frameworkId),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    retry: false
  });
