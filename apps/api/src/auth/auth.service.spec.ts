import {
  BadRequestException,
  ConflictException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { hash } from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  userInvite: {
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  },
  userPasswordResetToken: {
    findFirst: jest.fn(),
    update: jest.fn()
  },
  userProfileAudit: {
    create: jest.fn()
  },
  organization: {
    findUnique: jest.fn(),
    findFirst: jest.fn()
  },
  $transaction: jest.fn()
};

const transactionalClient = {
  user: mockPrisma.user,
  userInvite: mockPrisma.userInvite,
  userPasswordResetToken: mockPrisma.userPasswordResetToken,
  userProfileAudit: mockPrisma.userProfileAudit
};

mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof transactionalClient) => Promise<unknown>) =>
  callback(transactionalClient)
);

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn()
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    switch (key) {
      case 'jwtSecret':
        return 'test-secret';
      case 'auth.accessTokenTtlSeconds':
        return 900;
      case 'auth.refreshTokenTtlSeconds':
        return 604800;
      case 'auth.passwordMinLength':
        return 12;
      case 'auth.passwordComplexity':
        return ['lower', 'upper', 'digit', 'symbol'];
      case 'auth.tokenIssuer':
        return 'test-issuer';
      case 'auth.tokenAudience':
        return 'test-audience';
      default:
        return undefined;
    }
  })
};

const createService = () =>
  new AuthService(
    mockPrisma as unknown as PrismaService,
    mockJwtService as unknown as JwtService,
    mockConfigService as unknown as ConfigService
  );

describe('AuthService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof transactionalClient) => Promise<unknown>) =>
      callback(transactionalClient)
    );
  });

  describe('register', () => {
    it('creates a user and returns tokens', async () => {
      const organizationId = 'org-123';

      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.organization.findUnique.mockResolvedValueOnce({ id: organizationId });
      mockPrisma.user.create.mockImplementation(async ({ data }) => ({
        id: 'user-1',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        passwordHash: data.passwordHash,
        refreshTokenHash: null,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        passwordChangedAt: data.passwordChangedAt
      }));
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrisma.user.update.mockResolvedValue({});

      const service = createService();

      const payload: RegisterDto = {
        email: 'new.user@example.com',
        password: 'StrongPass!234',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.AUDITOR,
        organizationSlug: 'aegis-compliance'
      };

      const result = await service.register(payload);

      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toBe('refresh-token');
      expect(result.user.email).toBe(payload.email.toLowerCase());
      expect(result.user.role).toBe(UserRole.AUDITOR);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: payload.email.toLowerCase(),
          role: UserRole.AUDITOR,
          organizationId,
          passwordChangedAt: expect.any(Date)
        })
      });
      const updateCall = mockPrisma.user.update.mock.calls[0]?.[0];
      expect(updateCall).toBeDefined();
      expect(updateCall).toEqual({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          refreshTokenHash: expect.any(String),
          refreshTokenId: expect.any(String),
          refreshTokenIssuedAt: expect.any(Date),
          refreshTokenInvalidatedAt: null,
          lastLoginAt: expect.any(Date)
        })
      });
    });

    it('throws when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' });

      const service = createService();

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'StrongPass!234'
        })
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('validates password and returns tokens', async () => {
      const password = 'Password!23';
      const passwordHash = await hash(password, 12);
      const userRecord = {
        id: 'user-1',
        email: 'analyst@example.com',
        firstName: 'Analyst',
        lastName: 'User',
        role: UserRole.ANALYST,
        passwordHash,
        refreshTokenHash: null,
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.user.findUnique.mockResolvedValueOnce(userRecord);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-login')
        .mockResolvedValueOnce('refresh-login');
      mockPrisma.user.update.mockResolvedValue({});

      const service = createService();

    const result = await service.login({
      email: userRecord.email,
      password
    });

      expect(result.tokens.accessToken).toBe('access-login');
      expect(result.user.id).toBe(userRecord.id);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userRecord.id },
        data: expect.objectContaining({
          refreshTokenHash: expect.any(String),
          refreshTokenId: expect.any(String),
          refreshTokenIssuedAt: expect.any(Date),
          refreshTokenInvalidatedAt: null,
          lastLoginAt: expect.any(Date)
        })
      });
    });

    it('throws for invalid password', async () => {
      const passwordHash = await hash('CorrectPass!123', 12);

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'analyst@example.com',
        passwordHash,
        role: UserRole.ANALYST,
        organizationId: 'org-1'
      });

      const service = createService();

      await expect(
        service.login({
          email: 'analyst@example.com',
          password: 'WrongPass!123'
        })
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('requires password reset when mustResetPassword is true', async () => {
      const passwordHash = await hash('ResetMeNow!42', 12);

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'analyst@example.com',
        passwordHash,
        role: UserRole.ANALYST,
        organizationId: 'org-1',
        mustResetPassword: true
      });

      const service = createService();

      await expect(
        service.login({
          email: 'analyst@example.com',
          password: 'ResetMeNow!42'
        })
      ).rejects.toMatchObject({
        response: expect.objectContaining({ code: 'PASSWORD_RESET_REQUIRED' })
    });

    expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: expect.objectContaining({ refreshTokenInvalidatedAt: expect.any(Date) })
    });
  });

  it('records service token issuance when a service user logs in', async () => {
    const password = 'Password!23';
    const passwordHash = await hash(password, 12);
    const serviceUser = {
      id: 'agent-1',
      email: 'reports-agent@aegis.local',
      firstName: 'Reports',
      lastName: 'Agent',
      role: UserRole.ANALYST,
      passwordHash,
      refreshTokenHash: null,
      organizationId: 'org-1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockPrisma.user.findUnique.mockResolvedValueOnce(serviceUser);
    mockJwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
    mockPrisma.user.update.mockResolvedValue({});

    const service = createService();

    await service.login({
      email: serviceUser.email,
      password
    });

    expect(mockPrisma.userProfileAudit.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'agent-1',
        changes: expect.objectContaining({
          serviceToken: expect.objectContaining({
            current: 'issued',
            source: 'login'
          })
        })
      })
    });
  });
});

  describe('refresh', () => {
    it('refreshes tokens and persists new hashes', async () => {
      const refreshToken = 'old-refresh';
      const hashedRefresh = await hash(refreshToken, 12);

      mockJwtService.verifyAsync.mockResolvedValueOnce({
        sub: 'user-1',
        type: 'refresh',
        jti: 'refresh-id',
        iat: Math.floor(Date.now() / 1000)
      });

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        jobTitle: null,
        phoneNumber: null,
        timezone: null,
        avatarUrl: null,
        bio: null,
        role: UserRole.ANALYST,
        passwordHash: 'hash',
        refreshTokenHash: hashedRefresh,
        refreshTokenId: 'refresh-id',
        refreshTokenInvalidatedAt: null,
        passwordChangedAt: null,
        organizationId: 'org-1',
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockJwtService.signAsync
        .mockResolvedValueOnce('access-refresh')
        .mockResolvedValueOnce('refresh-new');

      mockPrisma.user.update.mockResolvedValueOnce({});

      const service = createService();

      const result = await service.refresh({ refreshToken });

      expect(result.tokens.accessToken).toBe('access-refresh');
      expect(result.tokens.refreshToken).toBe('refresh-new');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          refreshTokenHash: expect.any(String),
          refreshTokenId: expect.any(String),
          refreshTokenIssuedAt: expect.any(Date),
          refreshTokenInvalidatedAt: null
        })
      });
      expect(mockPrisma.userProfileAudit.create).not.toHaveBeenCalled();
    });

  it('rejects when refresh token invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('bad token'));

      const service = createService();

      await expect(service.refresh({ refreshToken: 'invalid' })).rejects.toBeInstanceOf(
        UnauthorizedException
      );
      expect(mockPrisma.userProfileAudit.create).not.toHaveBeenCalled();
    });

    it('invalidates refresh hash when payload is missing jti', async () => {
      const hashedRefresh = await hash('token', 12);
      mockJwtService.verifyAsync.mockResolvedValueOnce({
        sub: 'user-1',
        type: 'refresh'
      });

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.com',
        role: UserRole.ANALYST,
        passwordHash: 'hash',
        refreshTokenHash: hashedRefresh,
        refreshTokenId: 'existing',
        refreshTokenInvalidatedAt: null,
        passwordChangedAt: null,
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const service = createService();

      await expect(service.refresh({ refreshToken: 'token' })).rejects.toBeInstanceOf(
        UnauthorizedException
      );

      expect(mockPrisma.user.updateMany).not.toHaveBeenCalled();
      expect(mockPrisma.userProfileAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          actorId: null,
          changes: expect.any(Object)
        })
      });
    });
  });

  describe('logout', () => {
    it('clears refresh hash', async () => {
      mockPrisma.user.updateMany.mockResolvedValueOnce({});
      const service = createService();

      await service.logout('user-1');

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenIssuedAt: null,
          refreshTokenInvalidatedAt: expect.any(Date)
        }
      });
    });
  });

  describe('acceptInvite', () => {
    it('creates a user from a valid invite and returns tokens', async () => {
      const expiresAt = new Date(Date.now() + 3600 * 1000);
      const inviteToken = 'invite-token';
      const inviteHash = createHash('sha256').update(inviteToken).digest('hex');

      mockPrisma.userInvite.findFirst.mockResolvedValueOnce({
        id: 'invite-1',
        email: 'invitee@example.com',
        role: UserRole.ANALYST,
        tokenHash: inviteHash,
        expiresAt,
        revokedAt: null,
        acceptedAt: null,
        organizationId: 'org-1'
      });

      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      mockPrisma.userInvite.update.mockResolvedValueOnce({});

      const createdUser = {
        id: 'user-2',
        email: 'invitee@example.com',
        firstName: 'Invited',
        lastName: 'User',
        jobTitle: null,
        phoneNumber: null,
        timezone: null,
        avatarUrl: null,
        bio: null,
        role: UserRole.ANALYST,
        organizationId: 'org-1',
        mustResetPassword: false,
        passwordHash: await hash('InvitePass!234', 12),
        refreshTokenHash: null,
        refreshTokenId: null,
        refreshTokenIssuedAt: null,
        refreshTokenInvalidatedAt: null,
        passwordChangedAt: new Date(),
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.user.create.mockResolvedValueOnce(createdUser);
      mockPrisma.userProfileAudit.create.mockResolvedValueOnce({});

      mockJwtService.signAsync
        .mockResolvedValueOnce('invite-access')
        .mockResolvedValueOnce('invite-refresh');
      mockPrisma.user.update.mockResolvedValueOnce({});

      const service = createService();

      const result = await service.acceptInvite({
        token: inviteToken,
        email: 'invitee@example.com',
        password: 'InvitePass!234',
        firstName: 'Invited',
        lastName: 'User'
      });

      expect(result.user.email).toBe('invitee@example.com');
      expect(result.tokens.accessToken).toBe('invite-access');
      expect(mockPrisma.userInvite.update).toHaveBeenCalledWith({
        where: { id: 'invite-1' },
        data: expect.objectContaining({ acceptedAt: expect.any(Date) })
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'invitee@example.com',
          role: UserRole.ANALYST,
          organizationId: 'org-1'
        })
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-2' },
        data: expect.objectContaining({
          refreshTokenHash: expect.any(String),
          refreshTokenId: expect.any(String)
        })
      });
    });

    it('throws when invite token is invalid', async () => {
      mockPrisma.userInvite.findFirst.mockResolvedValueOnce(null);

      const service = createService();

      await expect(
        service.acceptInvite({
          token: 'bad-token',
          email: 'invitee@example.com',
          password: 'InvitePass!234'
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('resetPasswordWithToken', () => {
    it('resets password when provided a valid token', async () => {
      const resetToken = 'reset-token';
      const tokenHash = createHash('sha256').update(resetToken).digest('hex');
      const userId = 'user-3';

      mockPrisma.userPasswordResetToken.findFirst.mockResolvedValueOnce({
        id: 'token-1',
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 3600 * 1000),
        consumedAt: null,
        user: {
          id: userId,
          email: 'reset@example.com'
        }
      });

      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.userPasswordResetToken.update.mockResolvedValueOnce({});
      mockPrisma.userProfileAudit.create.mockResolvedValueOnce({});

      const service = createService();

      await service.resetPasswordWithToken({
        token: resetToken,
        password: 'NewSecurePass!9'
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining({
          mustResetPassword: false,
          passwordHash: expect.any(String),
          refreshTokenHash: null
        })
      });
      expect(mockPrisma.userPasswordResetToken.update).toHaveBeenCalledWith({
        where: { id: 'token-1' },
        data: { consumedAt: expect.any(Date) }
      });
    });

    it('throws when reset token is invalid or expired', async () => {
      mockPrisma.userPasswordResetToken.findFirst.mockResolvedValueOnce(null);

      const service = createService();

      await expect(
        service.resetPasswordWithToken({
          token: 'bad-reset',
          password: 'NewSecurePass!9'
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('password policy', () => {
    it('rejects weak passwords during registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.organization.findUnique.mockResolvedValueOnce({ id: 'org-1' });

      const service = createService();

      await expect(
        service.register({
          email: 'weak@example.com',
          password: 'alllowercase'
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
