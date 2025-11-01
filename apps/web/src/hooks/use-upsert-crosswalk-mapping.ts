import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type EvidenceHintInput = {
  evidenceId?: string;
  summary: string;
  rationale?: string;
  score?: number;
};

export type UpsertCrosswalkPayload = {
  sourceControlId: string;
  targetControlId: string;
  confidence?: number;
  rationale?: string;
  tags?: string[];
  evidenceHints?: EvidenceHintInput[];
};

export const useUpsertCrosswalkMapping = (frameworkId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertCrosswalkPayload) => {
      if (!frameworkId) {
        throw new Error('frameworkId is required');
      }

      const response = await apiClient.post(
        `/frameworks/${frameworkId}/crosswalk`,
        payload
      );

      return response.data;
    },
    onSuccess: () => {
      if (frameworkId) {
        queryClient.invalidateQueries({
          queryKey: ['frameworks', frameworkId, 'crosswalk']
        });
      }
    }
  });
};
