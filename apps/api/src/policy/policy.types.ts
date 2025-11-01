import {
  PolicyApprovalStatus,
  PolicyVersionStatus,
  UserRole
} from '@prisma/client';

export type PolicyActor = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  organizationId: string;
};

export type PolicyUserSummary = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type PolicyApprovalView = {
  id: string;
  status: PolicyApprovalStatus;
  decidedAt: string | null;
  decisionComment: string | null;
  approver: PolicyUserSummary;
};

export type PolicyVersionArtifact = {
  storagePath: string;
  uri: string;
  originalName: string;
  mimeType: string;
  fileSizeBytes: number;
  checksum: string | null;
};

export type PolicyVersionView = {
  id: string;
  versionNumber: number;
  label: string | null;
  status: PolicyVersionStatus;
  createdAt: string;
  createdBy: PolicyUserSummary;
  submittedAt: string | null;
  submittedBy: PolicyUserSummary | null;
  approvedAt: string | null;
  approvedBy: PolicyUserSummary | null;
  effectiveAt: string | null;
  notes: string | null;
  isCurrent: boolean;
  supersedesId: string | null;
  artifact: PolicyVersionArtifact;
  approvals: PolicyApprovalView[];
};

export type PolicyVersionSummary = {
  id: string;
  versionNumber: number;
  label: string | null;
  status: PolicyVersionStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  isCurrent: boolean;
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
