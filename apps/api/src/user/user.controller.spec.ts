import { ForbiddenException, Injectable } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  UserProfile,
  UserProfileAuditEntry,
  UserRefreshFailure,
  UserServiceTokenEvent
} from '@compliance/shared';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController (integration)', () => {
  let app: import('@nestjs/common').INestApplication;
  let userService: jest.Mocked<UserService>;

  const profile: UserProfile = {
    id: 'user-1',
    email: 'analyst@example.com',
    firstName: 'Cyra',
    lastName: 'Analyst',
    jobTitle: 'Security Analyst',
    phoneNumber: '+1 555-0100',
    timezone: 'America/New_York',
    avatarUrl: null,
    bio: 'Keeps frameworks organised',
    role: 'ANALYST',
    organizationId: 'org-1',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const audits: UserProfileAuditEntry[] = [
    {
      id: 'audit-1',
      userId: 'user-1',
      actorId: 'user-1',
      actorEmail: 'analyst@example.com',
      actorName: 'Cyra Analyst',
      changes: {
        jobTitle: {
          previous: 'Associate',
          current: 'Security Analyst'
        }
      },
      createdAt: new Date().toISOString()
    }
  ];

  const refreshFailures: UserRefreshFailure[] = [
    {
      id: 'failure-1',
      userId: 'user-2',
      email: 'reports-agent@aegis.local',
      name: 'Reports Agent',
      reason: 'hash-mismatch',
      metadata: { attempt: 'refresh' },
      occurredAt: new Date().toISOString(),
      isServiceUser: true
    }
  ];

  const serviceTokenEvents: UserServiceTokenEvent[] = [
    {
      id: 'event-1',
      userId: 'agent-1',
      email: 'reports-agent@aegis.local',
      name: 'Reports Agent',
      source: 'login',
      refreshTokenId: 'refresh-123',
      issuedAt: new Date().toISOString(),
      occurredAt: new Date().toISOString(),
      isServiceUser: true
    }
  ];
  let currentUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'analyst@example.com',
    organizationId: 'org-1',
    role: 'ANALYST',
    firstName: 'Cyra',
    lastName: 'Analyst'
  };

  @Injectable()
  class MockAuthGuard {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: import('@nestjs/common').ExecutionContext) {
      const requiredRoles =
        this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
          context.getHandler(),
          context.getClass()
        ]) ?? [];

      const request = context.switchToHttp().getRequest();
      request.user = currentUser;

      if (requiredRoles.length === 0 || requiredRoles.includes(currentUser.role)) {
        return true;
      }

      throw new ForbiddenException();
    }
  }

  beforeAll(async () => {
    userService = {
      getProfile: jest.fn().mockResolvedValue(profile),
      updateProfile: jest.fn().mockResolvedValue(profile),
      changePassword: jest.fn().mockResolvedValue(undefined),
      listAuditEntries: jest.fn().mockResolvedValue(audits),
      listRefreshFailures: jest.fn().mockResolvedValue(refreshFailures),
      listServiceTokenEvents: jest.fn().mockResolvedValue(serviceTokenEvents),
      updateUserRole: jest.fn().mockResolvedValue({ ...profile, role: 'ADMIN' })
    } as unknown as jest.Mocked<UserService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        Reflector,
        { provide: UserService, useValue: userService },
        {
          provide: APP_GUARD,
          useClass: MockAuthGuard
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    currentUser = {
      id: 'user-1',
      email: 'analyst@example.com',
      organizationId: 'org-1',
      role: 'ANALYST'
    } as AuthenticatedUser;
  });

  it('returns the authenticated user profile', async () => {
    const response = await request(app.getHttpServer()).get('/users/me');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: 'user-1', email: 'analyst@example.com' });
    expect(userService.getProfile).toHaveBeenCalledWith('user-1');
  });

  it('updates the current user profile', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/me')
      .send({ jobTitle: 'Senior Analyst' });

    expect(response.status).toBe(200);
    expect(userService.updateProfile).toHaveBeenCalledWith('user-1', 'user-1', {
      jobTitle: 'Senior Analyst'
    });
  });

  it('changes the current user password', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/me/password')
      .send({ currentPassword: 'CurrentPass!1', newPassword: 'NewPass!2345' });

    expect(response.status).toBe(200);
    expect(userService.changePassword).toHaveBeenCalledWith('user-1', {
      currentPassword: 'CurrentPass!1',
      newPassword: 'NewPass!2345'
    });
  });

  it('lists audit entries with default limit', async () => {
    const response = await request(app.getHttpServer()).get('/users/me/audits');

    expect(response.status).toBe(200);
    expect(userService.listAuditEntries).toHaveBeenCalledWith('user-1', 20);
    expect(response.body).toHaveLength(1);
  });

  it('blocks non-admin users from viewing refresh failures', async () => {
    const response = await request(app.getHttpServer()).get('/users/refresh-failures');

    expect(response.status).toBe(403);
    expect(userService.listRefreshFailures).not.toHaveBeenCalled();
  });

  it('allows administrators to view refresh failures', async () => {
    currentUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      organizationId: 'org-1',
      role: 'ADMIN'
    } as AuthenticatedUser;

    const response = await request(app.getHttpServer()).get('/users/refresh-failures');

    expect(response.status).toBe(200);
    expect(userService.listRefreshFailures).toHaveBeenCalledWith(currentUser, 20);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ reason: 'hash-mismatch' });
  });

  it('blocks non-admin users from viewing service token events', async () => {
    const response = await request(app.getHttpServer()).get('/users/service-token-events');

    expect(response.status).toBe(403);
    expect(userService.listServiceTokenEvents).not.toHaveBeenCalled();
  });

  it('allows administrators to view service token events', async () => {
    currentUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      organizationId: 'org-1',
      role: 'ADMIN'
    } as AuthenticatedUser;

    const response = await request(app.getHttpServer()).get('/users/service-token-events');

    expect(response.status).toBe(200);
    expect(userService.listServiceTokenEvents).toHaveBeenCalledWith(currentUser, 20);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ source: 'login' });
  });

  it('prevents non-admin users from changing roles', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/target-user/role')
      .send({ role: 'ADMIN' });

    expect(response.status).toBe(403);
    expect(userService.updateUserRole).not.toHaveBeenCalled();
  });

  it('allows administrators to change roles', async () => {
    currentUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      organizationId: 'org-1',
      role: 'ADMIN'
    } as AuthenticatedUser;

    const response = await request(app.getHttpServer())
      .patch('/users/target-user/role')
      .send({ role: 'AUDITOR' });

    expect(response.status).toBe(200);
    expect(userService.updateUserRole).toHaveBeenCalledWith(currentUser, 'target-user', {
      role: 'AUDITOR'
    });
  });
});
