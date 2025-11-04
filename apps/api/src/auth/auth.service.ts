import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User, UserRole } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthenticatedUser, AuthResponse, AuthTokens } from './types/auth.types';
import {
  DEFAULT_PASSWORD_COMPLEXITY,
  PasswordComplexityRule,
  getPasswordPolicyError
} from './utils/password.utils';

type RefreshTokenPayload = {
  sub: string;
  type?: string;
  jti?: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async register(payload: RegisterDto): Promise<AuthResponse> {
    const email = payload.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const organizationId = await this.resolveOrganizationId(payload.organizationSlug);

    this.ensurePasswordPolicy(payload.password);

    const passwordHash = await hash(payload.password, 12);
    const passwordChangedAt = new Date();

    const role = this.ensureRole(payload.role);

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        passwordHash,
        role,
        organizationId,
        passwordChangedAt
      }
    });

    if (user.mustResetPassword) {
      throw new UnauthorizedException({
        message: 'Password reset required',
        code: 'PASSWORD_RESET_REQUIRED'
      });
    }

    const tokens = await this.generateTokens(user);
    const { refreshTokenId, ...publicTokens } = tokens;
    await this.storeRefreshToken(user.id, publicTokens.refreshToken, refreshTokenId, {
      lastLoginAt: new Date()
    });

    return {
      user: this.sanitizeUser(user),
      tokens: publicTokens
    };
  }

  async acceptInvite(payload: AcceptInviteDto): Promise<AuthResponse> {
    const token = payload.token.trim();
    const tokenHash = this.hashToken(token);
    const normalizedEmail = payload.email.trim().toLowerCase();
    const now = new Date();

    const invite = await this.prisma.userInvite.findFirst({
      where: {
        tokenHash,
        revokedAt: null
      },
      include: {
        organization: {
          select: { id: true }
        }
      }
    });

    if (!invite || invite.expiresAt <= now) {
      throw new BadRequestException('Invalid or expired invite');
    }

    if (invite.email.toLowerCase() !== normalizedEmail) {
      throw new BadRequestException('Invite email does not match');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    this.ensurePasswordPolicy(payload.password);

    const passwordHash = await hash(payload.password, 12);
    const passwordChangedAt = new Date();

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.userInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() }
      });

      const created = await tx.user.create({
        data: {
          email: normalizedEmail,
          firstName: payload.firstName?.trim() || null,
          lastName: payload.lastName?.trim() || null,
          jobTitle: payload.jobTitle?.trim() || null,
          phoneNumber: payload.phoneNumber?.trim() || null,
          passwordHash,
          passwordChangedAt,
          role: invite.role,
          organizationId: invite.organizationId,
          mustResetPassword: false
        }
      });

      await tx.userProfileAudit.create({
        data: {
          userId: created.id,
          actorId: null,
          changes: {
            invited: {
              previous: invite.email,
              current: 'accepted',
              inviteId: invite.id
            }
          } as Prisma.InputJsonValue
        }
      });

      return created;
    });

    const tokens = await this.generateTokens(user);
    const { refreshTokenId, ...publicTokens } = tokens;
    await this.storeRefreshToken(user.id, publicTokens.refreshToken, refreshTokenId, {
      lastLoginAt: new Date()
    });

    this.logger.log(
      JSON.stringify({
        event: 'auth.invite.accepted',
        inviteId: invite.id,
        userId: user.id,
        email: user.email
      })
    );

    return {
      user: this.sanitizeUser(user),
      tokens: publicTokens
    };
  }

  async acceptInvite(payload: AcceptInviteDto): Promise<AuthResponse> {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const tokenHash = this.hashOpaqueToken(payload.token);
    const now = new Date();

    const invite = await this.prisma.userInvite.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        acceptedAt: null,
        expiresAt: {
          gt: now
        }
      }
    });

    if (!invite) {
      throw new UnauthorizedException('Invalid or expired invite token');
    }

    if (invite.email.trim().toLowerCase() !== normalizedEmail) {
      throw new UnauthorizedException('Invite token does not match email');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    this.ensurePasswordPolicy(payload.password);

    const passwordHash = await hash(payload.password, 12);
    const passwordChangedAt = new Date();

    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          firstName: payload.firstName?.trim() || null,
          lastName: payload.lastName?.trim() || null,
          jobTitle: payload.jobTitle?.trim() || null,
          phoneNumber: payload.phoneNumber?.trim() || null,
          role: invite.role,
          organizationId: invite.organizationId,
          passwordHash,
          passwordChangedAt,
          mustResetPassword: false
        }
      });

      const acceptedAt = new Date();

      await tx.userInvite.update({
        where: { id: invite.id },
        data: {
          acceptedAt,
          updatedAt: acceptedAt
        }
      });

      await tx.userInvite.updateMany({
        where: {
          id: { not: invite.id },
          organizationId: invite.organizationId,
          email: invite.email,
          revokedAt: null,
          acceptedAt: null
        },
        data: {
          revokedAt: acceptedAt,
          updatedAt: acceptedAt
        }
      });

      return user;
    });

    const tokens = await this.generateTokens(createdUser);
    const { refreshTokenId, ...publicTokens } = tokens;
    await this.storeRefreshToken(createdUser.id, publicTokens.refreshToken, refreshTokenId, {
      lastLoginAt: new Date()
    });

    return {
      user: this.sanitizeUser(createdUser),
      tokens: publicTokens
    };
  }

  async resetPasswordWithToken(payload: ResetPasswordDto): Promise<void> {
    const tokenHash = this.hashOpaqueToken(payload.token);
    const now = new Date();

    const resetRecord = await this.prisma.userPasswordResetToken.findFirst({
      where: {
        tokenHash,
        consumedAt: null,
        expiresAt: {
          gt: now
        }
      }
    });

    if (!resetRecord) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: resetRecord.userId }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid reset token');
    }

    this.ensurePasswordPolicy(payload.password);

    const newHash = await hash(payload.password, 12);
    const passwordChangedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          passwordChangedAt,
          mustResetPassword: false,
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenIssuedAt: null,
          refreshTokenInvalidatedAt: passwordChangedAt
        }
      });

      await tx.userPasswordResetToken.update({
        where: { id: resetRecord.id },
        data: {
          consumedAt: passwordChangedAt
        }
      });

      await tx.userPasswordResetToken.updateMany({
        where: {
          userId: user.id,
          consumedAt: null,
          id: { not: resetRecord.id }
        },
        data: {
          consumedAt: passwordChangedAt
        }
      });

      await tx.userProfileAudit.create({
        data: {
          userId: user.id,
          actorId: null,
          changes: {
            passwordReset: {
              previous: 'pending',
              current: 'completed'
            }
          } as Prisma.InputJsonValue,
          createdAt: passwordChangedAt
        }
      });
    });
  }

  async login(payload: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = payload.email.toLowerCase();
    const trimmedEmail = normalizedEmail.trim();

    let user = await this.prisma.user.findUnique({
      where: { email: trimmedEmail }
    });

    if (!user && trimmedEmail !== normalizedEmail) {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail }
      });
    }

    if (user && user.email !== trimmedEmail) {
      try {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { email: trimmedEmail }
        });
      } catch {
        // ignore; unique constraint may prevent normalization if another user already uses trimmed email
      }
    }

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await compare(payload.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mustResetPassword) {
      await this.invalidateRefreshToken(user.id);
      throw new UnauthorizedException({
        message: 'Password reset required',
        code: 'PASSWORD_RESET_REQUIRED'
      });
    }

    const tokens = await this.generateTokens(user);
    const { refreshTokenId, ...publicTokens } = tokens;
    await this.storeRefreshToken(user.id, publicTokens.refreshToken, refreshTokenId, {
      lastLoginAt: new Date()
    });

    return {
      user: this.sanitizeUser(user),
      tokens: publicTokens
    };
  }

  async refresh(payload: RefreshDto): Promise<AuthResponse> {
    let decoded: RefreshTokenPayload;

    try {
      decoded = await this.jwtService.verifyAsync<RefreshTokenPayload>(payload.refreshToken, {
        secret: this.getJwtSecret(),
        issuer: this.getTokenIssuer(),
        audience: this.getTokenAudience()
      });
    } catch (error) {
      await this.recordRefreshFailure(null, 'verification-failed', {
        error: (error as Error).message
      });
      throw new UnauthorizedException('Unable to refresh session');
    }

    if (decoded.type !== 'refresh' || !decoded.sub || !decoded.jti) {
      await this.recordRefreshFailure(decoded.sub ?? null, 'invalid-payload', {
        tokenType: decoded.type ?? 'unknown',
        hasSubject: Boolean(decoded.sub),
        hasJti: Boolean(decoded.jti)
      });
      throw new UnauthorizedException('Unable to refresh session');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user || !user.refreshTokenHash || !user.refreshTokenId) {
      await this.recordRefreshFailure(decoded.sub, 'missing-refresh-state');
      throw new UnauthorizedException('Unable to refresh session');
    }

    if (user.refreshTokenInvalidatedAt && decoded.iat) {
      const invalidatedAt = user.refreshTokenInvalidatedAt.getTime();
      if (decoded.iat * 1000 <= invalidatedAt) {
        await this.invalidateRefreshToken(user.id);
        await this.recordRefreshFailure(user.id, 'token-invalidated', {
          invalidatedAt: user.refreshTokenInvalidatedAt.toISOString(),
          issuedAt: user.refreshTokenIssuedAt?.toISOString() ?? null
        });
        throw new UnauthorizedException('Unable to refresh session');
      }
    }

    if (user.passwordChangedAt && decoded.iat) {
      const passwordChangedAt = user.passwordChangedAt.getTime();
      if (decoded.iat * 1000 <= passwordChangedAt) {
        await this.invalidateRefreshToken(user.id);
        await this.recordRefreshFailure(user.id, 'password-rotated', {
          passwordChangedAt: user.passwordChangedAt.toISOString()
        });
        throw new UnauthorizedException('Unable to refresh session');
      }
    }

    if (decoded.jti !== user.refreshTokenId) {
      await this.invalidateRefreshToken(user.id);
      await this.recordRefreshFailure(user.id, 'refresh-id-mismatch', {
        expected: user.refreshTokenId,
        received: decoded.jti
      });
      throw new UnauthorizedException('Unable to refresh session');
    }

    const matches = await compare(payload.refreshToken, user.refreshTokenHash);

    if (!matches) {
      await this.invalidateRefreshToken(user.id);
      await this.recordRefreshFailure(user.id, 'hash-mismatch');
      throw new UnauthorizedException('Unable to refresh session');
    }

    const tokens = await this.generateTokens(user);
    const { refreshTokenId, ...publicTokens } = tokens;
    await this.storeRefreshToken(user.id, publicTokens.refreshToken, refreshTokenId);

    return {
      user: this.sanitizeUser(user),
      tokens: publicTokens
    };
  }

  async resetPasswordWithToken(payload: ResetPasswordDto): Promise<void> {
    const token = payload.token.trim();
    const tokenHash = this.hashToken(token);
    const now = new Date();

    const resetToken = await this.prisma.userPasswordResetToken.findFirst({
      where: { tokenHash },
      include: {
        user: true
      }
    });

    if (
      !resetToken ||
      resetToken.consumedAt ||
      resetToken.expiresAt <= now ||
      !resetToken.user
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    this.ensurePasswordPolicy(payload.password);

    const passwordHash = await hash(payload.password, 12);
    const passwordChangedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          passwordChangedAt,
          mustResetPassword: false,
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenIssuedAt: null,
          refreshTokenInvalidatedAt: passwordChangedAt
        }
      });

      await tx.userPasswordResetToken.update({
        where: { id: resetToken.id },
        data: { consumedAt: passwordChangedAt }
      });

      await tx.userProfileAudit.create({
        data: {
          userId: resetToken.userId,
          actorId: null,
          changes: {
            password: {
              previous: 'reset-required',
              current: 'reset-completed'
            }
          } as Prisma.InputJsonValue
        }
      });
    });

    this.logger.log(
      JSON.stringify({
        event: 'auth.password.reset',
        userId: resetToken.userId
      })
    );
  }

  private async recordRefreshFailure(
    userId: string | null,
    reason: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    this.logger.warn(
      JSON.stringify({
        event: 'auth.refresh.failure',
        userId,
        reason,
        metadata
      })
    );

    if (!userId) {
      return;
    }

    try {
      await this.prisma.userProfileAudit.create({
        data: {
          userId,
          actorId: null,
          changes: {
            refreshToken: {
              previous: 'active',
              current: 'invalidated',
              reason,
              metadata
            }
          } as Prisma.InputJsonValue
        }
      });
    } catch (error) {
      this.logger.error(
        `Failed to persist refresh failure audit for user ${userId}: ${(error as Error).message}`,
        (error as Error).stack
      );
    }
  }

  async logout(userId: string): Promise<void> {
    await this.invalidateRefreshToken(userId);
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle,
      phoneNumber: user.phoneNumber,
      timezone: user.timezone,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      organizationId: user.organizationId,
      mustResetPassword: user.mustResetPassword,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  private async generateTokens(user: User): Promise<AuthTokens & { refreshTokenId: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };

    const accessTokenTtl = this.configService.get<number>('auth.accessTokenTtlSeconds') ?? 60 * 15;
    const refreshTokenTtl =
      this.configService.get<number>('auth.refreshTokenTtlSeconds') ?? 60 * 60 * 24 * 7;
    const secret = this.getJwtSecret();
    const issuer = this.getTokenIssuer();
    const audience = this.getTokenAudience();
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessTokenTtl,
        secret,
        issuer,
        audience
      }),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh', jti: refreshTokenId },
        {
          expiresIn: refreshTokenTtl,
          secret,
          issuer,
          audience
        }
      )
    ]);

    return {
      accessToken,
      accessTokenExpiresIn: accessTokenTtl,
      refreshToken,
      refreshTokenExpiresIn: refreshTokenTtl,
      refreshTokenId
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    tokenId: string,
    extra?: Prisma.UserUpdateInput
  ): Promise<void> {
    const hashed = await hash(refreshToken, 12);
    const issuedAt = new Date();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: hashed,
        refreshTokenId: tokenId,
        refreshTokenIssuedAt: issuedAt,
        refreshTokenInvalidatedAt: null,
        ...(extra ?? {})
      }
    });
  }

  private hashOpaqueToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private ensureRole(role?: UserRole): UserRole {
    if (!role || role === UserRole.ADMIN) {
      return UserRole.ANALYST;
    }

    return role;
  }

  private ensurePasswordPolicy(candidate: string): void {
    const policy = this.getPasswordPolicyConfig();
    const error = getPasswordPolicyError(candidate, policy.minLength, policy.complexity);
    if (error) {
      throw new BadRequestException(error);
    }
  }

  private getPasswordPolicyConfig(): {
    minLength: number;
    complexity: PasswordComplexityRule[];
  } {
    const minLength = this.configService.get<number>('auth.passwordMinLength') ?? 12;
    const configured =
      this.configService.get<PasswordComplexityRule[]>('auth.passwordComplexity') ??
      DEFAULT_PASSWORD_COMPLEXITY;
    const complexity = configured.length ? configured : DEFAULT_PASSWORD_COMPLEXITY;
    return { minLength, complexity };
  }

  private getJwtSecret(): string {
    return this.configService.get<string>('jwtSecret') ?? 'change-me';
  }

  private getTokenIssuer(): string | undefined {
    const issuer = this.configService.get<string>('auth.tokenIssuer');
    return issuer && issuer.trim().length > 0 ? issuer : undefined;
  }

  private getTokenAudience(): string | undefined {
    const audience = this.configService.get<string>('auth.tokenAudience');
    return audience && audience.trim().length > 0 ? audience : undefined;
  }

  private async invalidateRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenId: null,
        refreshTokenIssuedAt: null,
        refreshTokenInvalidatedAt: new Date()
      }
    });
  }

  private async resolveOrganizationId(slug?: string): Promise<string> {
    if (slug) {
      const normalizedSlug = slug.toLowerCase();
      const organization = await this.prisma.organization.findUnique({
        where: { slug: normalizedSlug }
      });

      if (organization) {
        return organization.id;
      }
    }

    const fallback = await this.prisma.organization.findFirst();

    if (!fallback) {
      throw new BadRequestException('Organization not available');
    }

    return fallback.id;
  }
}
