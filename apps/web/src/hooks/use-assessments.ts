import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type AssessmentSummary = {
  id: string;
  name: string;
  frameworkIds: string[];
  status: 'draft' | 'in-progress' | 'complete';
  owner: string;
  createdAt: string;
  updatedAt: string;
  progress: {
    satisfied: number;
    partial: number;
    unsatisfied: number;
    total: number;
  };
};

// Legacy fallback removed; rely on API data
export const useAssessments = () =>
  useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const response = await apiClient.get<AssessmentSummary[]>('/assessments');
      return response.data;
    },
    placeholderData: [],
    retry: false,
    staleTime: 1000 * 60
  });

export interface CreateAssessmentInput {
  name: string;
  frameworkIds: string[];
  owner: string;
}

export interface UpdateAssessmentStatusInput {
  id: string;
  status: AssessmentSummary['status'];
}

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAssessmentInput) => {
      const response = await apiClient.post<AssessmentSummary>('/assessments', payload);
      return response.data;
    },
    onSuccess(created) {
      queryClient.setQueryData<AssessmentSummary[]>(['assessments'], (current = []) => [
        created,
        ...current.filter((assessment) => assessment.id !== created.id)
      ]);
    }
  });
};

export const useUpdateAssessmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: UpdateAssessmentStatusInput) => {
      const response = await apiClient.patch<AssessmentSummary>(`/assessments/${id}/status`, {
        status
      });
      return response.data;
    },
    onSuccess(updated) {
      queryClient.setQueryData<AssessmentSummary[]>(['assessments'], (current = []) =>
        current.map((assessment) => (assessment.id === updated.id ? updated : assessment))
      );
    }
  });
};
