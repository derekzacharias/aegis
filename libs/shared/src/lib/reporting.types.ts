import type { JobStatus } from './job-queue';

export type ReportFormat = 'html' | 'pdf';

export interface ReportJobPayload {
  assessmentId: string;
  formats: ReportFormat[];
  requestedBy: string;
}

export interface ReportArtifactRecord {
  id: string;
  jobId: string;
  assessmentId: string;
  format: ReportFormat;
  storageUri: string;
  filename: string;
  requestedBy: string;
  createdAt: string;
}

export interface ReportJobResult {
  artifacts: ReportArtifactRecord[];
  notes?: Record<string, unknown>;
}

export interface ReportJobView {
  jobId: string;
  assessmentId: string;
  formats: ReportFormat[];
  status: JobStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  requestedBy: string;
  artifactIds: string[];
  downloadUrl: string | null;
  error: string | null;
}
