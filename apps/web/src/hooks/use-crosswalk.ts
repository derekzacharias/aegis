import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type CrosswalkMatchStatus = 'mapped' | 'suggested';
export type CrosswalkStatusFilter = 'all' | CrosswalkMatchStatus;

export type ControlReference = {
  id: string;
  frameworkId: string;
  title: string;
  family: string;
};

export type EvidenceReuseHint = {
  id: string;
  summary: string;
  rationale?: string;
  score: number;
  evidenceId?: string;
};

export type CrosswalkMatch = {
  id: string;
  source: ControlReference;
  target: ControlReference;
  confidence: number;
  origin: 'SEED' | 'ALGO' | 'MANUAL';
  tags: string[];
  rationale?: string;
  evidenceHints: EvidenceReuseHint[];
  status: CrosswalkMatchStatus;
  similarityBreakdown?: {
    score: number;
    matchedTerms: string[];
  };
};

export type CrosswalkResponse = {
  frameworkId: string;
  generatedAt: string;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  matches: CrosswalkMatch[];
  filters: {
    targetFrameworkId?: string;
    minConfidence?: number;
    search?: string;
    status: CrosswalkStatusFilter;
  };
};

export type CrosswalkParams = {
  targetFrameworkId?: string;
  minConfidence?: number;
  search?: string;
  status?: CrosswalkStatusFilter;
  page?: number;
  pageSize?: number;
};

export const useCrosswalk = (
  frameworkId: string | undefined,
  params: CrosswalkParams
): UseQueryResult<CrosswalkResponse, Error> =>
  useQuery<CrosswalkResponse, Error>({
    queryKey: ['frameworks', frameworkId, 'crosswalk', params],
    queryFn: async () => {
      if (!frameworkId) {
        throw new Error('frameworkId is required');
      }

      const response = await apiClient.get<CrosswalkResponse>(
        `/frameworks/${frameworkId}/crosswalk`,
        {
          params: {
            targetFrameworkId: params.targetFrameworkId || undefined,
            minConfidence:
              typeof params.minConfidence === 'number'
                ? params.minConfidence
                : undefined,
            search: params.search || undefined,
            status: params.status && params.status !== 'all' ? params.status : undefined,
            page:
              typeof params.page === 'number' && params.page > 0
                ? params.page
                : undefined,
            pageSize:
              typeof params.pageSize === 'number' && params.pageSize > 0
                ? params.pageSize
                : undefined
          }
        }
      );

      return response.data;
    },
    enabled: Boolean(frameworkId),
    staleTime: 1000 * 60 * 5,
    retry: false
  });
