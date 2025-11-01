export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'ARCHIVED' | 'QUARANTINED';

export type EvidenceIngestionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'QUARANTINED';

export type EvidenceStorageProvider = 'S3' | 'LOCAL';

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
  categories?: string[];
  tags?: string[];
  notes?: string | null;
  nextAction?: string | null;
  source?: string | null;
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
  metadata: EvidenceMetadata;
  reviewer: EvidencePerson | null;
  uploadedBy: EvidencePerson | null;
  nextAction: string | null;
  ingestionNotes: string | null;
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
  storageUri: string;
  storageKey: string;
  checksum?: string;
}
