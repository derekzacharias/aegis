import {
  AuthResponse as SharedAuthResponse,
  AuthTokens as SharedAuthTokens,
  AuthUser
} from '@compliance/shared';

export type AuthenticatedUser = AuthUser;
export type AuthTokens = SharedAuthTokens;
export type AuthResponse = SharedAuthResponse;
