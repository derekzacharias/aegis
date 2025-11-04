import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AntivirusAutoReleaseStrategy,
  AntivirusSettingsView,
  UpdateAntivirusSettingsInput
} from '@compliance/shared';
import apiClient from '../services/api-client';

const queryKey = ['tenant', 'security', 'antivirus'];

export const useAntivirusSettings = () =>
  useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<AntivirusSettingsView>('/tenant/security/antivirus');
      return response.data;
    }
  });

export const useUpdateAntivirusSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateAntivirusSettingsInput) => {
      const response = await apiClient.patch<AntivirusSettingsView>(
        '/tenant/security/antivirus',
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<AntivirusSettingsView>(queryKey, data);
    }
  });
};

export const AUTO_RELEASE_LABELS: Record<AntivirusAutoReleaseStrategy, string> = {
  manual: 'Manual release (analyst approval required)',
  pending: 'Auto-release to pending review',
  previous: 'Auto-release back to previous status'
};
