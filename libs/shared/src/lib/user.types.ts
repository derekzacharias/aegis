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
