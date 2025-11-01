import {
  ConflictException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { hash } from 'bcrypt';
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
  organization: {
    findUnique: jest.fn(),
    findFirst: jest.fn()
  }
};

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
    jest.clearAllMocks();
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
        updatedAt: new Date()
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
          organizationId
        })
      });
      expect(mockPrisma.user.update).toHaveBeenCalled();
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
        data: expect.objectContaining({ refreshTokenHash: expect.any(String) })
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
  });

  describe('refresh', () => {
    it('refreshes tokens and persists new hashes', async () => {
      const refreshToken = 'old-refresh';
      const hashedRefresh = await hash(refreshToken, 12);

      mockJwtService.verifyAsync.mockResolvedValueOnce({
        sub: 'user-1',
        type: 'refresh'
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
        data: expect.objectContaining({ refreshTokenHash: expect.any(String) })
      });
    });

    it('rejects when refresh token invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('bad token'));

      const service = createService();

      await expect(service.refresh({ refreshToken: 'invalid' })).rejects.toBeInstanceOf(
        UnauthorizedException
      );
    });
  });

  describe('logout', () => {
    it('clears refresh hash', async () => {
      mockPrisma.user.updateMany.mockResolvedValueOnce({});
      const service = createService();

      await service.logout('user-1');

      expect(mockPrisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshTokenHash: null }
      });
    });
  });
});
