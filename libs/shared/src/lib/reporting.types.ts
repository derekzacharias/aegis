import type { JobStatus } from './job-queue';

export type ReportFormat = 'html' | 'pdf';

export interface ReportArtifactMetadata {
  version: string;
  assessmentId: string;
  generatedAt: string;
  mediaType: string;
  byteLength?: number;
  bucket?: string;
}

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
  metadata: ReportArtifactMetadata;
}

export interface ReportJobResult {
  artifacts: ReportArtifactRecord[];
  notes?: Record<string, unknown>;
}

export interface ReportArtifactSummary {
  id: string;
  format: ReportFormat;
  filename: string;
  createdAt: string;
  metadata: ReportArtifactMetadata;
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
  artifacts: ReportArtifactSummary[];
}
