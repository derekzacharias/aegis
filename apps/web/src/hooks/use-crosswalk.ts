import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type CrosswalkMatchStatus = 'mapped' | 'suggested';

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
  matches: CrosswalkMatch[];
  filters: {
    targetFrameworkId?: string;
    minConfidence?: number;
  };
};

export type CrosswalkParams = {
  targetFrameworkId?: string;
  minConfidence?: number;
};

export const useCrosswalk = (
  frameworkId: string | undefined,
  params: CrosswalkParams
) =>
  useQuery({
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
                : undefined
          }
        }
      );

      return response.data;
    },
    enabled: Boolean(frameworkId),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    retry: false
  });
