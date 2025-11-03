import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TenantProfile, UpdateTenantProfileInput } from '@compliance/shared';
import apiClient from '../services/api-client';

export const useTenantProfile = () =>
  useQuery({
    queryKey: ['tenant', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get<TenantProfile>('/tenant/profile');
      return response.data;
    }
  });

export const useUpdateTenantProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateTenantProfileInput) => {
      const response = await apiClient.patch<TenantProfile>('/tenant/profile', payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<TenantProfile>(['tenant', 'profile'], data);
    }
  });
};
