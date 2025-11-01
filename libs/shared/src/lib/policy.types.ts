import { UserRole } from './auth.types';

export type PolicyUserSummary = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type PolicyVersionArtifact = {
  storagePath: string;
  uri: string;
  originalName: string;
  mimeType: string;
  fileSizeBytes: number;
  checksum: string | null;
};

export type PolicyApprovalView = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedAt: string | null;
  decisionComment: string | null;
  approver: PolicyUserSummary;
};

export type PolicyVersionStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export type PolicyVersionSummary = {
  id: string;
  versionNumber: number;
  label: string | null;
  status: PolicyVersionStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  isCurrent: boolean;
};

export type PolicyVersionView = PolicyVersionSummary & {
  createdAt: string;
  createdBy: PolicyUserSummary;
  submittedBy: PolicyUserSummary | null;
  approvedBy: PolicyUserSummary | null;
  effectiveAt: string | null;
  notes: string | null;
  supersedesId: string | null;
  artifact: PolicyVersionArtifact;
  approvals: PolicyApprovalView[];
};

export type PolicySummary = {
  id: string;
  title: string;
  category: string | null;
  tags: string[];
  owner: PolicyUserSummary;
  currentVersion: PolicyVersionSummary | null;
  pendingReviewCount: number;
  lastUpdated: string;
};

export type PolicyDetail = PolicySummary & {
  description: string | null;
  reviewCadenceDays: number | null;
  versions: PolicyVersionView[];
};

export type PolicyParticipantGroups = {
  authors: PolicyUserSummary[];
  approvers: PolicyUserSummary[];
};

export type CreatePolicyInput = {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  reviewCadenceDays?: number;
  ownerId?: string;
};

export type CreatePolicyVersionInput = {
  label?: string;
  notes?: string;
  effectiveAt?: string;
  supersedesVersionId?: string;
};

export type SubmitPolicyVersionInput = {
  approverIds: string[];
  message?: string;
};

export type ApprovalDecisionInput = {
  decision: 'approve' | 'reject';
  comment?: string;
  effectiveAt?: string;
};
