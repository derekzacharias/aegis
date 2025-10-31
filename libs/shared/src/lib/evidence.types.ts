export type EvidenceStatus = 'pending' | 'approved' | 'archived';

export interface EvidenceItem {
  id: string;
  name: string;
  controlIds: string[];
  frameworkIds: string[];
  storagePath: string;
  uploadedBy: string;
  uploadedAt: string;
  reviewDue: string | null;
  status: EvidenceStatus;
  checksum?: string;
}
