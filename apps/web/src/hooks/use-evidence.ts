import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type EvidenceItem = {
  id: string;
  name: string;
  controlIds: string[];
  frameworkIds: string[];
  storagePath: string;
  uploadedBy: string;
  uploadedAt: string;
  reviewDue: string | null;
  status: 'pending' | 'approved' | 'archived';
  fileType: string;
  sizeInKb: number;
  lastReviewed: string | null;
  nextAction: string | null;
};

const fallback: EvidenceItem[] = [
  {
    id: 'demo-evidence-1',
    name: 'SSP - GovCloud',
    controlIds: ['ac-2', 'ac-17'],
    frameworkIds: ['nist-800-53-rev5'],
    storagePath: 's3://evidence/ssp-govcloud.pdf',
    uploadedBy: 'alex@example.com',
    uploadedAt: new Date().toISOString(),
    reviewDue: null,
    status: 'approved',
    fileType: 'pdf',
    sizeInKb: 18400,
    lastReviewed: new Date().toISOString(),
    nextAction: 'Share with auditor'
  }
];

export const useEvidence = () =>
  useQuery({
    queryKey: ['evidence'],
    queryFn: async () => {
      const response = await apiClient.get<EvidenceItem[]>('/evidence');
      return response.data;
    },
    placeholderData: fallback,
    retry: false,
    staleTime: 1000 * 60 * 5
  });

export type CreateEvidenceInput = {
  name: string;
  controlIds: string[];
  frameworkIds: string[];
  uploadedBy: string;
  status: EvidenceItem['status'];
  fileType: string;
  sizeInKb: number;
};

export const useCreateEvidence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEvidenceInput) => {
      const response = await apiClient.post<EvidenceItem>('/evidence', payload);
      return response.data;
    },
    onSuccess(created) {
      queryClient.setQueryData<EvidenceItem[]>(['evidence'], (current = []) => [created, ...current]);
    }
  });
};
