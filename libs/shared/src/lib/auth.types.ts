export type UserRole = 'ADMIN' | 'ANALYST' | 'AUDITOR' | 'READ_ONLY';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  phoneNumber?: string | null;
  timezone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role: UserRole;
  organizationId: string;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
