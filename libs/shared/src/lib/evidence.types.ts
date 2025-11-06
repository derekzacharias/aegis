export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'ARCHIVED' | 'QUARANTINED';

export type EvidenceIngestionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'QUARANTINED';

export type EvidenceStorageProvider = 'S3' | 'LOCAL';
export const EvidenceScanStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  CLEAN: 'CLEAN',
  INFECTED: 'INFECTED',
  FAILED: 'FAILED'
} as const;

export type EvidenceScanStatus = (typeof EvidenceScanStatus)[keyof typeof EvidenceScanStatus];

export interface EvidencePerson {
  id: string;
  email: string;
  name: string;
}

export interface EvidenceFrameworkLink {
  id: string;
  name: string;
}

export interface EvidenceRetentionPolicy {
  periodDays: number | null;
  expiresAt: string | null;
  reason: string | null;
}

export interface EvidenceMetadata extends Record<string, unknown> {
  controlIds?: string[];
  assessmentControlIds?: string[];
  manualControlIds?: string[];
  manualFrameworkIds?: string[];
  categories?: string[];
  tags?: string[];
  notes?: string | null;
  nextAction?: string | null;
  source?: string | null;
}

export interface EvidenceAssessmentLink {
  assessmentControlId: string;
  assessmentId: string;
  assessmentName: string;
  assessmentStatus: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETE';
  controlId: string;
  controlTitle: string;
  controlFamily: string;
}

export interface EvidenceStatusHistoryEntry {
  id: string;
  fromStatus: EvidenceStatus | null;
  toStatus: EvidenceStatus;
  note: string | null;
  changedAt: string;
  changedBy: EvidencePerson | null;
}

export interface EvidenceReleaseEvent {
  id: string;
  evidenceId: string;
  evidenceName: string;
  evidenceFilename: string | null;
  releasedTo: EvidenceStatus;
  note: string | null;
  changedAt: string;
  changedBy: EvidencePerson | null;
  isAutomatic: boolean;
}

export interface EvidenceRecord {
  id: string;
  name: string;
  originalFilename: string;
  status: EvidenceStatus;
  ingestionStatus: EvidenceIngestionStatus;
  storageUri: string;
  storageProvider: EvidenceStorageProvider;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  reviewDue: string | null;
  retention: EvidenceRetentionPolicy;
  checksum: string | null;
  frameworks: EvidenceFrameworkLink[];
  controlIds: string[];
  assessmentLinks: EvidenceAssessmentLink[];
  metadata: EvidenceMetadata;
  reviewer: EvidencePerson | null;
  uploadedBy: EvidencePerson | null;
  nextAction: string | null;
  ingestionNotes: string | null;
  lastScanStatus: EvidenceScanStatus | null;
  lastScanAt: string | null;
  lastScanEngine: string | null;
  lastScanSignatureVersion: string | null;
  lastScanSummary: string | null;
  lastScanDurationMs: number | null;
  lastScanBytes: number | null;
  statusHistory: EvidenceStatusHistoryEntry[];
}

export interface EvidenceUploadRequestView {
  id: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
  storageProvider: EvidenceStorageProvider;
  storageKey: string;
  checksum: string | null;
  sizeInBytes: number;
  contentType: string;
}

export interface EvidenceIngestionJobPayload {
  evidenceId: string;
  scanId: string;
  storageUri: string;
  storageKey: string;
  storageProvider: EvidenceStorageProvider;
  checksum?: string;
  requestedBy?: string;
}
