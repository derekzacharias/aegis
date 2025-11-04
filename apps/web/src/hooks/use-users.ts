import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BulkRoleUpdateInput,
  CreateUserInviteInput,
  ForcePasswordResetResult,
  UserInviteSummary,
  UserProfile,
  UserRole
} from '@compliance/shared';
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

export const useUserInvites = (enabled = true) =>
  useQuery({
    queryKey: ['users', 'invites'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserInviteSummary[]>('/users/invites');
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

export const useCreateInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserInviteInput) => {
      const { data } = await apiClient.post<UserInviteSummary>('/users/invites', payload);
      return data;
    },
    onSuccess(created) {
      queryClient.setQueryData<UserInviteSummary[]>(['users', 'invites'], (current = []) => {
        const next = current.filter((invite) => invite.id !== created.id);
        const { token, ...rest } = created;
        return [{ ...rest }, ...next];
      });
    }
  });
};

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data } = await apiClient.delete<UserInviteSummary>(`/users/invites/${inviteId}`);
      return data;
    },
    onSuccess(updated) {
      queryClient.setQueryData<UserInviteSummary[]>(['users', 'invites'], (current = []) =>
        current.map((invite) => (invite.id === updated.id ? updated : invite))
      );
    }
  });
};

export const useForcePasswordReset = () => {
  return useMutation({
    mutationFn: async ({ userId, expiresInHours }: { userId: string; expiresInHours?: number }) => {
      const { data } = await apiClient.post<ForcePasswordResetResult>(
        `/users/${userId}/force-reset`,
        expiresInHours ? { expiresInHours } : {}
      );
      return data;
    }
  });
};

export const useBulkUpdateRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkRoleUpdateInput) => {
      const { data } = await apiClient.post<UserProfile[]>('/users/roles/bulk', payload);
      return data;
    },
    onSuccess(updated) {
      if (!updated.length) {
        return;
      }
      queryClient.setQueryData<UserProfile[]>(['users'], (current = []) => {
        const updatedMap = new Map(updated.map((user) => [user.id, user]));
        return current.map((user) => updatedMap.get(user.id) ?? user);
      });
    }
  });
};
