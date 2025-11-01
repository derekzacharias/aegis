import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { IntegrationOAuthInitiation, IntegrationProvider } from './integration.types';

interface OAuthSession {
  provider: IntegrationProvider;
  baseUrl: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  scopes: string[];
  expiresAt: number;
}

export interface OAuthCompletionResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scopes: string[];
}

@Injectable()
export class IntegrationOAuthService {
  private readonly sessions = new Map<string, OAuthSession>();

  initiate(
    provider: IntegrationProvider,
    baseUrl: string,
    clientId: string,
    scopes: string[],
    redirectUri: string
  ): IntegrationOAuthInitiation {
    this.pruneExpiredSessions();
    const state = randomBytes(16).toString('hex');
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = this.buildCodeChallenge(codeVerifier);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.sessions.set(state, {
      provider,
      baseUrl,
      clientId,
      redirectUri,
      codeVerifier,
      scopes,
      expiresAt
    });

    const scopeFragment = scopes.length ? `&scope=${encodeURIComponent(scopes.join(' '))}` : '';
    const authorizationUrl = `${baseUrl.replace(/\/$/, '')}/oauth2/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&state=${encodeURIComponent(
      state
    )}&code_challenge=${codeChallenge}&code_challenge_method=S256${scopeFragment}`;

    return {
      state,
      codeVerifier,
      authorizationUrl,
      expiresAt: new Date(expiresAt).toISOString()
    };
  }

  complete(
    provider: IntegrationProvider,
    state: string,
    code: string
  ): OAuthCompletionResult {
    this.pruneExpiredSessions();
    const session = this.sessions.get(state);

    if (!session || session.provider !== provider) {
      throw new BadRequestException('Invalid or expired OAuth state');
    }

    this.sessions.delete(state);

    const baseToken = `${provider}:${code}:${session.codeVerifier}`;
    const accessToken = createHash('sha256').update(baseToken).digest('hex');
    const refreshToken = createHash('sha256')
      .update(`${state}:${provider}:${session.clientId}`)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    return {
      accessToken,
      refreshToken,
      expiresAt,
      scopes: session.scopes
    };
  }

  private buildCodeChallenge(codeVerifier: string) {
    const hash = createHash('sha256').update(codeVerifier).digest();
    return hash
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private pruneExpiredSessions() {
    const now = Date.now();
    for (const [state, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(state);
      }
    }
  }
}
