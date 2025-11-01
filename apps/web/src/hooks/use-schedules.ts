import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import apiClient from '../services/api-client';

export type ScheduleOwner = {
  id: string;
  displayName: string;
  email: string;
};

export type Schedule = {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: 'evidence-review-reminder' | 'recurring-assessment' | 'agent-health-check';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  nextRun: string;
  lastRun?: string | null;
  owner: ScheduleOwner;
  isActive: boolean;
};

export type UpdateSchedulePayload = {
  name?: string;
  description?: string;
  frequency?: Schedule['frequency'];
  nextRun?: string;
  isActive?: boolean;
};

const DEFAULT_ORGANIZATION_ID = 'org-sample';

const normalizeResponse = (schedules: Schedule[]): Schedule[] =>
  schedules
    .slice()
    .sort((a, b) => dayjs(a.nextRun).valueOf() - dayjs(b.nextRun).valueOf());

export const useSchedules = (organizationId: string = DEFAULT_ORGANIZATION_ID) =>
  useQuery({
    queryKey: ['scheduler', organizationId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Schedule[] }>('/scheduler', {
        params: { organizationId }
      });

      return normalizeResponse(response.data.data ?? response.data);
    },
    staleTime: 60_000,
    retry: 1
  });

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { id: string; organizationId: string; payload: UpdateSchedulePayload }) => {
      const response = await apiClient.put<{ data: Schedule }>(`/scheduler/${variables.id}`, variables.payload);
      return response.data.data ?? response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduler', variables.organizationId] });
    }
  });
};
