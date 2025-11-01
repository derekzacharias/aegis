import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export type ControlReferenceSummary = {
  id: string;
  title: string;
  frameworkId: string;
  family: string;
};

export type EvidenceReuseHintSummary = {
  id: string;
  summary: string;
  rationale?: string;
  score: number;
};

export type EvidenceReuseEvidenceSummary = {
  id: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'ARCHIVED' | 'QUARANTINED';
  uploadedAt: string;
  uri: string;
  frameworks: Array<{
    id: string;
    name: string;
    version: string;
  }>;
};

export type EvidenceReuseRecommendation = {
  mappingId: string;
  mappingOrigin: 'SEED' | 'ALGO' | 'MANUAL';
  confidence: number;
  tags: string[];
  sourceControl: ControlReferenceSummary;
  targetControl: ControlReferenceSummary;
  hint: EvidenceReuseHintSummary;
  evidence: EvidenceReuseEvidenceSummary;
};

export const useAssessmentEvidenceReuse = (
  assessmentId: string | undefined,
  enabled: boolean
) =>
  useQuery({
    queryKey: ['assessments', assessmentId, 'evidence-reuse'],
    queryFn: async () => {
      if (!assessmentId) {
        throw new Error('assessmentId is required');
      }

      const response = await apiClient.get<EvidenceReuseRecommendation[]>(
        `/assessments/${assessmentId}/evidence-reuse`
      );

      return response.data;
    },
    enabled: Boolean(assessmentId) && enabled,
    staleTime: 1000 * 60,
    retry: false
  });
