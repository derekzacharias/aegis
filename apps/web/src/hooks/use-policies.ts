import {
  ApprovalDecisionInput,
  CreatePolicyInput,
  CreatePolicyVersionInput,
  PolicyDetail,
  PolicyParticipantGroups,
  PolicySummary,
  PolicyVersionView,
  SubmitPolicyVersionInput
} from '@compliance/shared';
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query';
import apiClient from '../services/api-client';

const baseKey = 'policies';

export const usePolicySummaries = (actorId?: string) =>
  useQuery({
    queryKey: [baseKey, 'list', actorId],
    queryFn: async () => {
      const { data } = await apiClient.get<PolicySummary[]>('/policies');
      return data;
    },
    enabled: Boolean(actorId)
  });

export const usePolicyDetail = (policyId?: string, actorId?: string) =>
  useQuery({
    queryKey: [baseKey, 'detail', policyId, actorId],
    queryFn: async () => {
      if (!policyId) {
        throw new Error('policyId is required');
      }
      const { data } = await apiClient.get<PolicyDetail>(`/policies/${policyId}`);
      return data;
    },
    enabled: Boolean(policyId && actorId)
  });

export const usePolicyParticipants = (actorId?: string) =>
  useQuery({
    queryKey: [baseKey, 'participants', actorId],
    queryFn: async () => {
      const { data } = await apiClient.get<PolicyParticipantGroups>(
        '/policies/actors'
      );
      return data;
    },
    enabled: Boolean(actorId)
  });

export const useCreatePolicy = (actorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePolicyInput) => {
      const { data } = await apiClient.post<PolicyDetail>('/policies', payload);
      return data;
    },
    onSuccess(detail) {
      queryClient.setQueryData<PolicySummary[] | undefined>(
        [baseKey, 'list', actorId],
        (current) =>
          current
            ? [detail, ...current.filter((item) => item.id !== detail.id)]
            : [detail]
      );
      queryClient.setQueryData<PolicyDetail>(
        [baseKey, 'detail', detail.id, actorId],
        detail
      );
    }
  });
};

type UploadPolicyVersionInput = {
  policyId: string;
  payload: CreatePolicyVersionInput;
  file: File;
};

export const useUploadPolicyVersion = (actorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ policyId, payload, file }: UploadPolicyVersionInput) => {
      const formData = new FormData();
      formData.append('file', file);

      if (payload.label) {
        formData.append('label', payload.label);
      }

      if (payload.notes) {
        formData.append('notes', payload.notes);
      }

      if (payload.effectiveAt) {
        formData.append('effectiveAt', payload.effectiveAt);
      }

      if (payload.supersedesVersionId) {
        formData.append('supersedesVersionId', payload.supersedesVersionId);
      }

      const { data } = await apiClient.post<PolicyVersionView>(
        `/policies/${policyId}/versions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return { policyId, version: data };
    },
    onSuccess({ policyId, version }) {
      queryClient.invalidateQueries({ queryKey: [baseKey, 'list', actorId] });
      queryClient.setQueryData<PolicyDetail | undefined>(
        [baseKey, 'detail', policyId, actorId],
        (current) =>
          current
            ? {
                ...current,
                versions: [
                  version,
                  ...current.versions.filter((existing) => existing.id !== version.id)
                ]
              }
            : current
      );
    }
  });
};

export const useSubmitPolicyVersion = (actorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      policyId,
      versionId,
      payload
    }: {
      policyId: string;
      versionId: string;
      payload: SubmitPolicyVersionInput;
    }) => {
      const { data } = await apiClient.post<PolicyVersionView>(
        `/policies/${policyId}/versions/${versionId}/submit`,
        payload
      );
      return { policyId, version: data };
    },
    onSuccess({ policyId, version }) {
      queryClient.invalidateQueries({ queryKey: [baseKey, 'list', actorId] });
      queryClient.setQueryData<PolicyDetail | undefined>(
        [baseKey, 'detail', policyId, actorId],
        (current) =>
          current
            ? {
                ...current,
                versions: current.versions.map((existing) =>
                  existing.id === version.id ? version : existing
                )
              }
            : current
      );
    }
  });
};

export const usePolicyDecision = (actorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      policyId,
      versionId,
      payload
    }: {
      policyId: string;
      versionId: string;
      payload: ApprovalDecisionInput;
    }) => {
      const { data } = await apiClient.post<PolicyVersionView>(
        `/policies/${policyId}/versions/${versionId}/decision`,
        payload
      );
      return { policyId, version: data };
    },
    onSuccess({ policyId, version }) {
      queryClient.invalidateQueries({ queryKey: [baseKey, 'list', actorId] });
      queryClient.setQueryData<PolicyDetail | undefined>(
        [baseKey, 'detail', policyId, actorId],
        (current) =>
          current
            ? {
                ...current,
                versions: current.versions.map((existing) =>
                  existing.id === version.id ? version : existing
                ),
                currentVersion: version.isCurrent
                  ? {
                      id: version.id,
                      versionNumber: version.versionNumber,
                      label: version.label,
                      status: version.status,
                      submittedAt: version.submittedAt,
                      approvedAt: version.approvedAt,
                      isCurrent: version.isCurrent
                    }
                  : current.currentVersion
              }
            : current
      );
    }
  });
};
