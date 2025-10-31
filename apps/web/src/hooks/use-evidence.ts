import { useQuery } from '@tanstack/react-query';
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
    status: 'approved'
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
