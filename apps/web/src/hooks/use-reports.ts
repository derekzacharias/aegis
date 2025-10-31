import { useMutation } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export interface ReportRequest {
  assessmentId: string;
  formats: Array<'html' | 'pdf'>;
}

export interface ReportJob {
  jobId: string;
  assessmentId: string;
  formats: Array<'html' | 'pdf'>;
  status: 'queued' | 'completed';
}

export const useCreateReport = () =>
  useMutation({
    mutationFn: async (request: ReportRequest) => {
      const response = await apiClient.post<ReportJob>('/reports', request);
      return response.data;
    }
  });
