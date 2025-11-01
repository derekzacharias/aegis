export type UserRole = 'ADMIN' | 'ANALYST' | 'AUDITOR' | 'READ_ONLY';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  organizationId: string;
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
