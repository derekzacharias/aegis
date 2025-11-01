import { EvidenceRecord, EvidenceStatus, EvidenceUploadRequestView } from '@compliance/shared';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api-client';

export const useEvidence = () =>
  useQuery({
    queryKey: ['evidence'],
    queryFn: async () => {
      const response = await apiClient.get<EvidenceRecord[]>('/evidence');
      return response.data;
    },
    placeholderData: [],
    retry: false,
    staleTime: 1000 * 60 * 5
  });

export type EvidenceUploadPayload = {
  file: File;
  name: string;
  frameworkIds: string[];
  controlIds?: string[];
  retentionPeriodDays?: number;
  retentionReason?: string;
  reviewDue?: string;
  reviewerId?: string;
  notes?: string;
  tags?: string[];
  categories?: string[];
  nextAction?: string;
  statusNote?: string;
  initialStatus?: EvidenceStatus;
  onProgress?: (percent: number) => void;
};

const encodeHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

const computeChecksum = async (file: File): Promise<string | null> => {
  if (!('crypto' in window) || !window.crypto.subtle) {
    return null;
  }

  const arrayBuffer = await file.arrayBuffer();
  const digest = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
  return `sha256:${encodeHex(digest)}`;
};

export const useEvidenceUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EvidenceUploadPayload) => {
      const checksum = await computeChecksum(payload.file);
      const { data: upload } = await apiClient.post<EvidenceUploadRequestView>('/evidence/uploads', {
        fileName: payload.file.name,
        contentType: payload.file.type || 'application/octet-stream',
        sizeInBytes: payload.file.size,
        checksum
      });

      const headers: Record<string, string> = {
        ...upload.requiredHeaders,
        'Content-Type': payload.file.type || upload.contentType || 'application/octet-stream'
      };

      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/octet-stream';
      }

      Object.entries(headers).forEach(([key, value]) => {
        if (!value) {
          delete headers[key];
        }
      });

      await axios.put(upload.uploadUrl, payload.file, {
        headers,
        onUploadProgress: (event) => {
          if (!payload.onProgress || !event.total) {
            return;
          }
          const percent = Math.round((event.loaded / event.total) * 100);
          payload.onProgress(percent);
        }
      });

      payload.onProgress?.(100);

      const confirmPayload = {
        name: payload.name,
        frameworkIds: payload.frameworkIds,
        controlIds: payload.controlIds ?? [],
        retentionPeriodDays: payload.retentionPeriodDays,
        retentionReason: payload.retentionReason,
        reviewDue: payload.reviewDue ?? null,
        reviewerId: payload.reviewerId,
        notes: payload.notes,
        tags: payload.tags ?? [],
        categories: payload.categories ?? [],
        nextAction: payload.nextAction,
        statusNote: payload.statusNote,
        initialStatus: payload.initialStatus ?? 'PENDING'
      };

      const { data: record } = await apiClient.post<EvidenceRecord>(
        `/evidence/uploads/${upload.id}/confirm`,
        confirmPayload
      );

      queryClient.setQueryData<EvidenceRecord[]>(['evidence'], (current = []) => [record, ...current]);

      return record;
    }
  });
};
