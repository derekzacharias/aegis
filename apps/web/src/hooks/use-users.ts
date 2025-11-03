import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserProfile, UserRole } from '@compliance/shared';
import apiClient from '../services/api-client';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  phoneNumber?: string;
  role: UserRole;
}

export const useUsers = (enabled = true) =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile[]>('/users');
      return data;
    },
    enabled,
    placeholderData: []
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data } = await apiClient.post<UserProfile>('/users', input);
      return data;
    },
    onSuccess(created) {
      queryClient.setQueryData<UserProfile[]>(['users'], (current = []) => [
        created,
        ...current.filter((user) => user.id !== created.id)
      ]);
    }
  });
};
