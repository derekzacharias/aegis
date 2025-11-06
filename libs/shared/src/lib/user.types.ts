import { AuthUser, UserRole } from './auth.types';

export interface UserProfile extends AuthUser {
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileAuditEntry {
  id: string;
  userId: string;
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  changes: Record<string, { previous: unknown; current: unknown }>;
  createdAt: string;
}

export interface UserRefreshFailure {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
  isServiceUser: boolean;
}

export interface UserServiceTokenEvent {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  source: string | null;
  refreshTokenId: string | null;
  issuedAt: string | null;
  occurredAt: string;
  isServiceUser: boolean;
}

export interface CreateUserInviteInput {
  email: string;
  role: UserRole;
  expiresInHours?: number;
}

export interface UserInviteSummary {
  id: string;
  email: string;
  role: UserRole;
  invitedByName: string | null;
  invitedByEmail: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  token?: string;
}

export interface ForcePasswordResetResult {
  userId: string;
  token: string;
  expiresAt: string;
}

export interface BulkRoleUpdateInput {
  userIds: string[];
  role: UserRole;
}

export const PROFILE_CRITICAL_FIELDS = ['firstName', 'lastName', 'jobTitle', 'phoneNumber', 'timezone'] as const;

export type ProfileCriticalField = (typeof PROFILE_CRITICAL_FIELDS)[number];

export const CONTACT_STALE_DAYS = 90;

export interface ProfileCompletenessEntry {
  id: string;
  email: string;
  name: string | null;
  missingFields: ProfileCriticalField[];
  isStale: boolean;
  lastUpdated: string | null;
}

export interface ProfileCompletenessSummary {
  total: number;
  complete: number;
  incomplete: number;
  stale: number;
  completenessRate: number;
  missingFieldCounts: Record<ProfileCriticalField, number>;
  attention: ProfileCompletenessEntry[];
}
