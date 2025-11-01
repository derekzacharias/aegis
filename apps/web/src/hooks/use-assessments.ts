import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api-client';
import type {
  AssessmentControl,
  AssessmentControlStatus,
  AssessmentControlSummary,
  AssessmentDetail,
  AssessmentSummary,
  AssessmentTask,
  AssessmentTaskPriority,
  AssessmentTaskStatus
} from '@compliance/shared';

// Legacy fallback removed; rely on API data
export const useAssessments = () =>
  useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const response = await apiClient.get<AssessmentSummary[]>('/assessments');
      return response.data;
    },
    placeholderData: [],
    retry: false,
    staleTime: 1000 * 60
  });

export const useAssessmentControls = (assessmentId: string | undefined) =>
  useQuery({
    queryKey: ['assessments', assessmentId, 'controls'],
    queryFn: async () => {
      if (!assessmentId) {
        throw new Error('assessmentId is required');
      }

      const response = await apiClient.get<AssessmentControlSummary[]>(
        `/assessments/${assessmentId}/controls`
      );
      return response.data;
    },
    enabled: Boolean(assessmentId),
    staleTime: 1000 * 30,
    placeholderData: []
  });

export interface CreateAssessmentInput {
  name: string;
  frameworkIds: string[];
  owner: string;
}

export interface UpdateAssessmentStatusInput {
  id: string;
  status: AssessmentSummary['status'];
}

export interface UpdateAssessmentInput {
  id: string;
  payload: {
    name?: string;
    owner?: string;
    frameworkIds?: string[];
  };
}

export interface UpdateAssessmentControlInput {
  assessmentId: string;
  controlId: string;
  payload: {
    status?: AssessmentControlStatus;
    owner?: string;
    dueDate?: string;
    comments?: string;
  };
}

export interface CreateAssessmentTaskInput {
  assessmentId: string;
  title: string;
  description?: string;
  owner?: string;
  dueDate?: string;
  status?: AssessmentTaskStatus;
  priority?: AssessmentTaskPriority;
  assessmentControlId?: string;
}

export interface UpdateAssessmentTaskInput {
  assessmentId: string;
  taskId: string;
  payload: {
    title?: string;
    description?: string;
    owner?: string;
    dueDate?: string;
    status?: AssessmentTaskStatus;
    priority?: AssessmentTaskPriority;
    assessmentControlId?: string | null;
  };
}

export interface DeleteAssessmentTaskInput {
  assessmentId: string;
  taskId: string;
}

const toSummary = (detail: AssessmentDetail): AssessmentSummary => ({
  id: detail.id,
  name: detail.name,
  frameworkIds: detail.frameworkIds,
  status: detail.status,
  owner: detail.owner,
  createdAt: detail.createdAt,
  updatedAt: detail.updatedAt,
  progress: detail.progress
});

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAssessmentInput) => {
      const response = await apiClient.post<AssessmentSummary>('/assessments', payload);
      return response.data;
    },
    onSuccess(created) {
      queryClient.setQueryData<AssessmentSummary[]>(['assessments'], (current = []) => [
        created,
        ...current.filter((assessment) => assessment.id !== created.id)
      ]);
    }
  });
};

export const useUpdateAssessmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: UpdateAssessmentStatusInput) => {
      const response = await apiClient.patch<AssessmentSummary>(`/assessments/${id}/status`, {
        status
      });
      return response.data;
    },
    onSuccess(updated) {
      queryClient.setQueryData<AssessmentSummary[]>(['assessments'], (current = []) =>
        current.map((assessment) => (assessment.id === updated.id ? updated : assessment))
      );
      queryClient.invalidateQueries({ queryKey: ['assessments', updated.id] });
    }
  });
};

export const useAssessmentDetail = (id?: string) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['assessments', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('Assessment id is required');
      }
      const response = await apiClient.get<AssessmentDetail>(`/assessments/${id}`);
      return response.data;
    },
    staleTime: 1000 * 30
  });

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: UpdateAssessmentInput) => {
      const response = await apiClient.patch<AssessmentDetail>(`/assessments/${id}`, payload);
      return response.data;
    },
    onSuccess(detail) {
      queryClient.setQueryData(['assessments', detail.id], detail);
      queryClient.setQueryData<AssessmentSummary[]>(['assessments'], (current = []) =>
        [toSummary(detail), ...current.filter((item) => item.id !== detail.id)]
      );
    }
  });
};

export const useUpdateAssessmentControl = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assessmentId, controlId, payload }: UpdateAssessmentControlInput) => {
      const response = await apiClient.patch<AssessmentControl>(
        `/assessments/${assessmentId}/controls/${controlId}`,
        payload
      );
      return { control: response.data, assessmentId };
    },
    async onSuccess(_, { assessmentId }) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] }),
        queryClient.invalidateQueries({ queryKey: ['assessments'] })
      ]);
    }
  });
};

export const useCreateAssessmentTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAssessmentTaskInput) => {
      const { assessmentId, ...body } = payload;
      const response = await apiClient.post<AssessmentTask>(
        `/assessments/${assessmentId}/tasks`,
        body
      );
      return { task: response.data, assessmentId };
    },
    async onSuccess({ assessmentId }) {
      await queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    }
  });
};

export const useUpdateAssessmentTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assessmentId, taskId, payload }: UpdateAssessmentTaskInput) => {
      const response = await apiClient.patch<AssessmentTask>(
        `/assessments/${assessmentId}/tasks/${taskId}`,
        payload
      );
      return { task: response.data, assessmentId };
    },
    async onSuccess({ assessmentId }) {
      await queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    }
  });
};

export const useDeleteAssessmentTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assessmentId, taskId }: DeleteAssessmentTaskInput) => {
      await apiClient.delete(`/assessments/${assessmentId}/tasks/${taskId}`);
      return { assessmentId, taskId };
    },
    async onSuccess({ assessmentId }) {
      await queryClient.invalidateQueries({ queryKey: ['assessments', assessmentId] });
    }
  });
};

export type {
  AssessmentSummary,
  AssessmentDetail,
  AssessmentControl,
  AssessmentControlSummary,
  AssessmentTask,
  AssessmentControlStatus,
  AssessmentTaskStatus,
  AssessmentTaskPriority
} from '@compliance/shared';
