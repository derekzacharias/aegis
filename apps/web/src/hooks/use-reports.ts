import { useMutation, useQuery } from '@tanstack/react-query';
import type { ReportFormat, ReportJobView } from '@compliance/shared';
import apiClient from '../services/api-client';

export interface ReportRequest {
  assessmentId: string;
  formats: ReportFormat[];
}

export const useCreateReport = () =>
  useMutation({
    mutationFn: async (request: ReportRequest) => {
      const response = await apiClient.post<ReportJobView>('/reports', request);
      return response.data;
    }
  });

export const useReportJobs = () =>
  useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await apiClient.get<ReportJobView[]>('/reports');
      return response.data;
    },
    placeholderData: [],
    refetchInterval: 5000
  });
