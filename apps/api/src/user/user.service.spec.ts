import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { hash } from 'bcrypt';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/types/auth.types';

const makeDate = () => new Date('2024-01-01T00:00:00.000Z');

describe('UserService', () => {
  type MockPrismaService = {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    userProfileAudit: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  const mockPrisma: MockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    userProfileAudit: {
      create: jest.fn(),
      findMany: jest.fn()
    }
  };

  const mockConfig: Partial<ConfigService> = {
    get: jest.fn((key: string) => {
      if (key === 'auth.passwordMinLength') {
        return 12;
      }
      if (key === 'auth.passwordComplexity') {
        return ['lower', 'upper', 'digit', 'symbol'];
      }
      return undefined;
    })
  };

  const service = new UserService(
    mockPrisma as unknown as PrismaService,
    mockConfig as unknown as ConfigService
  );

  const baseUser = {
    id: 'user-1',
    email: 'analyst@example.com',
    firstName: 'Cyra',
    lastName: 'Analyst',
    phoneNumber: null,
    jobTitle: null,
    timezone: null,
    avatarUrl: null,
    bio: null,
    role: UserRole.ANALYST,
    organizationId: 'org-1',
    lastLoginAt: null,
    createdAt: makeDate(),
    updatedAt: makeDate()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.userProfileAudit.findMany.mockResolvedValue([]);
  });

  describe('updateProfile', () => {
    it('persists changes and records an audit entry', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(baseUser);
      mockPrisma.user.update.mockResolvedValueOnce({
        ...baseUser,
        jobTitle: 'Security Analyst',
        updatedAt: new Date('2024-01-02T00:00:00.000Z')
      });

      const result = await service.updateProfile('user-1', 'user-1', {
        jobTitle: 'Security Analyst'
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({ jobTitle: 'Security Analyst' }),
        select: expect.any(Object)
      });

      expect(mockPrisma.userProfileAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          actorId: 'user-1',
          changes: expect.objectContaining({ jobTitle: { previous: null, current: 'Security Analyst' } })
        })
      });

      expect(result.jobTitle).toBe('Security Analyst');
    });

    it('returns the existing profile when no changes provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(baseUser);

      const result = await service.updateProfile('user-1', 'user-1', {});

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockPrisma.userProfileAudit.create).not.toHaveBeenCalled();
      expect(result.id).toBe('user-1');
    });

    it('throws when user is missing', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateProfile('missing', 'actor', {})).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('updates password and clears refresh tokens', async () => {
      const passwordHash = await hash('Password!123', 12);
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', passwordHash });

      await service.changePassword('user-1', {
        currentPassword: 'Password!123',
        newPassword: 'NewPassword!123'
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenIssuedAt: null,
          refreshTokenInvalidatedAt: expect.any(Date),
          passwordChangedAt: expect.any(Date)
        })
      });

      expect(mockPrisma.userProfileAudit.create).toHaveBeenCalled();
    });

    it('rejects invalid current password', async () => {
      const passwordHash = await hash('Password!123', 12);
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', passwordHash });

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'WrongPass!1',
          newPassword: 'AnotherPass!123'
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('enforces password complexity for new passwords', async () => {
      const passwordHash = await hash('Password!123', 12);
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', passwordHash });

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'Password!123',
          newPassword: 'alllowercase'
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('updateUserRole', () => {
    it('requires admin privileges', async () => {
      const analystActor: AuthenticatedUser = {
        id: 'user-2',
        email: 'analyst@example.com',
        organizationId: 'org-1',
        role: UserRole.ANALYST
      };

      await expect(
        service.updateUserRole(analystActor, 'user-1', { role: UserRole.AUDITOR })
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('updates role and records audit for admins', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(baseUser);
      mockPrisma.user.update.mockResolvedValueOnce({ ...baseUser, role: UserRole.AUDITOR });

      const adminActor: AuthenticatedUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        organizationId: 'org-1',
        role: UserRole.ADMIN
      };

      const result = await service.updateUserRole(
        adminActor,
        'user-1',
        { role: UserRole.AUDITOR }
      );

      expect(result.role).toBe(UserRole.AUDITOR);
      expect(mockPrisma.userProfileAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          actorId: 'admin-1'
        })
      });
    });
  });

  describe('listRefreshFailures', () => {
    const adminActor: AuthenticatedUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      organizationId: 'org-1',
      role: UserRole.ADMIN
    };

    it('requires admin privileges', async () => {
      const analystActor: AuthenticatedUser = {
        id: 'user-2',
        email: 'analyst@example.com',
        organizationId: 'org-1',
        role: UserRole.ANALYST
      };

      await expect(service.listRefreshFailures(analystActor, 10)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('returns normalized failure entries', async () => {
      const occurredAt = makeDate();
      mockPrisma.userProfileAudit.findMany.mockResolvedValueOnce([
        {
          id: 'audit-1',
          userId: 'user-2',
          user: {
            email: 'reports-agent@aegis.local',
            firstName: 'Reports',
            lastName: 'Agent'
          },
          changes: {
            refreshToken: {
              previous: 'active',
              current: 'invalidated',
              reason: 'hash-mismatch',
              metadata: { attempt: 'refresh' }
            }
          },
          createdAt: occurredAt
        }
      ]);

      const result = await service.listRefreshFailures(adminActor, 10);

      expect(mockPrisma.userProfileAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user: expect.objectContaining({ organizationId: adminActor.organizationId })
          }),
          take: 10
        })
      );
      expect(result).toEqual([
        {
          id: 'audit-1',
          userId: 'user-2',
          email: 'reports-agent@aegis.local',
          name: 'Reports Agent',
          reason: 'hash-mismatch',
          metadata: { attempt: 'refresh' },
          occurredAt: occurredAt.toISOString(),
          isServiceUser: true
        }
      ]);
    });

    it('caps the limit to 100 entries', async () => {
      mockPrisma.userProfileAudit.findMany.mockResolvedValueOnce([]);

      await service.listRefreshFailures(adminActor, 250);

      expect(mockPrisma.userProfileAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 })
      );
    });
  });
});
