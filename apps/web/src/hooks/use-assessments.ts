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

const fallback: AssessmentSummary[] = [
  {
    id: 'demo-assessment',
    name: 'FedRAMP Moderate Readiness',
    frameworkIds: ['nist-800-53-rev5', 'nist-csf-2-0'],
    status: 'in-progress',
    owner: 'compliance-team@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: {
      satisfied: 142,
      partial: 98,
      unsatisfied: 34,
      total: 310
    }
  },
  {
    id: 'demo-pci-gap',
    name: 'PCI DSS 4.0 Gap Analysis',
    frameworkIds: ['pci-dss-4-0'],
    status: 'draft',
    owner: 'payments@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: {
      satisfied: 32,
      partial: 21,
      unsatisfied: 18,
      total: 120
    }
  },
  {
    id: 'demo-cis-review',
    name: 'CIS v8 Operational Review',
    frameworkIds: ['cis-v8'],
    status: 'complete',
    owner: 'automation@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    progress: {
      satisfied: 153,
      partial: 0,
      unsatisfied: 0,
      total: 153
    }
  }
];

export const useAssessments = () =>
  useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const response = await apiClient.get<AssessmentSummary[]>('/assessments');
      return response.data;
    },
    placeholderData: fallback,
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
