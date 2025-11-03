import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../services/api-client';
import { FrameworkSummary } from './use-frameworks';
import { EvidenceReuseHint } from './use-crosswalk';

export type ControlPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type BaselineLevel = 'low' | 'moderate' | 'high' | 'privacy';

export type ControlStatus = 'UNASSESSED' | 'SATISFIED' | 'PARTIAL' | 'UNSATISFIED' | 'NOT_APPLICABLE';

export type AssessmentStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETE';

export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'ARCHIVED' | 'QUARANTINED';

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
  tags?: string[];
  metadata?: Record<string, unknown> | null;
};

export type ControlStatusSummary = {
  status: ControlStatus;
  count: number;
};

export type ControlEvidenceSummary = {
  id: string;
  name: string;
  status: EvidenceStatus;
  uploadedAt: string;
  uri?: string;
  tags: string[];
  frameworks: Array<{
    id: string;
    name: string;
    version?: string;
  }>;
};

export type ControlAssessmentSummary = {
  id: string;
  name: string;
  status: AssessmentStatus;
  controlStatus: ControlStatus;
  dueDate?: string | null;
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
  evidenceHints: EvidenceReuseHint[];
};

export type ControlCatalogItem = ControlDefinition & {
  statusSummary: ControlStatusSummary[];
  assessments: ControlAssessmentSummary[];
  evidence: ControlEvidenceSummary[];
  mappings: ControlMappingSummary[];
  metadata?: Record<string, unknown> | null;
  tags: string[];
};

export type ControlCatalogFacets = {
  families: Array<{ value: string; count: number }>;
  priorities: Array<{ value: ControlPriority; count: number }>;
  types: Array<{ value: 'base' | 'enhancement'; count: number }>;
  statuses: Array<{ value: ControlStatus; count: number }>;
};

export type ControlCatalogResponse = {
  frameworkId: string;
  framework: FrameworkSummary;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  items: ControlCatalogItem[];
  facets: ControlCatalogFacets;
};

export type ControlCatalogParams = {
  search?: string;
  family?: string;
  priority?: ControlPriority;
  type?: 'base' | 'enhancement';
  status?: ControlStatus;
  pageSize?: number;
};

export const useControlCatalog = (frameworkId: string | undefined, params: ControlCatalogParams) =>
  useInfiniteQuery<ControlCatalogResponse, Error>({
    queryKey: ['frameworks', frameworkId, 'controls', params],
    queryFn: async ({ pageParam = 1 }) => {
      if (!frameworkId) {
        throw new Error('frameworkId is required');
      }

      const response = await apiClient.get<ControlCatalogResponse>(`/frameworks/${frameworkId}/controls`, {
        params: {
          search: params.search || undefined,
          family: params.family || undefined,
          priority: params.priority || undefined,
          type: params.type || undefined,
          status: params.status || undefined,
          page: pageParam,
          pageSize: params.pageSize ?? 25
        }
      });

      return response.data;
    },
    enabled: Boolean(frameworkId),
    staleTime: 1000 * 60 * 5,
    retry: false,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined)
  });
