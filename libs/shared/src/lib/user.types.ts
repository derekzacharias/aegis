import { AuthUser } from './auth.types';

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
