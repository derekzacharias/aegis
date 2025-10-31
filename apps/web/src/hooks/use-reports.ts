import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export interface ReportRequest {
  assessmentId: string;
  formats: Array<'html' | 'pdf'>;
}

export interface ReportJob {
  jobId: string;
  assessmentId: string;
  formats: Array<'html' | 'pdf'>;
  status: 'queued' | 'processing' | 'completed';
  createdAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
}

export const useCreateReport = () =>
  useMutation({
    mutationFn: async (request: ReportRequest) => {
      const response = await apiClient.post<ReportJob>('/reports', request);
      return response.data;
    }
  });

export const useReportJobs = () =>
  useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await apiClient.get<ReportJob[]>('/reports');
      return response.data;
    },
    placeholderData: [],
    refetchInterval: 5000
  });
