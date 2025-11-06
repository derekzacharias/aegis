import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserRole } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import {
  ForcePasswordResetResult,
  UserInviteSummary,
  UserProfile,
  UserProfileAuditEntry,
  UserRefreshFailure,
  UserServiceTokenEvent
} from '@compliance/shared';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { ForcePasswordResetDto } from './dto/force-password-reset.dto';
import { BulkUpdateRolesDto } from './dto/bulk-update-roles.dto';
import {
  DEFAULT_PASSWORD_COMPLEXITY,
  PasswordComplexityRule,
  getPasswordPolicyError
} from '../auth/utils/password.utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  private readonly logger = new Logger(UserService.name);

  private readonly profileSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    mustResetPassword: true,
    phoneNumber: true,
    jobTitle: true,
    timezone: true,
    avatarUrl: true,
    bio: true,
    role: true,
    organizationId: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true
  } satisfies Record<keyof UserProfileSelectable, boolean>;

  async listUsers(actor: AuthenticatedUser): Promise<UserProfile[]> {
    this.ensureAdmin(actor);

    const users = await this.prisma.user.findMany({
      where: { organizationId: actor.organizationId },
      select: this.profileSelect,
      orderBy: { createdAt: 'desc' }
    });

    return users.map((user) => this.toProfile(user));
  }

  async listInvites(actor: AuthenticatedUser): Promise<UserInviteSummary[]> {
    this.ensureAdmin(actor);

    const invites = await this.prisma.userInvite.findMany({
      where: { organizationId: actor.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        invitedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return invites.map((invite) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      invitedByName: invite.invitedBy
        ? [invite.invitedBy.firstName, invite.invitedBy.lastName].filter(Boolean).join(' ') ||
          invite.invitedBy.email
        : null,
      invitedByEmail: invite.invitedBy?.email ?? null,
      expiresAt: invite.expiresAt.toISOString(),
      acceptedAt: invite.acceptedAt ? invite.acceptedAt.toISOString() : null,
      revokedAt: invite.revokedAt ? invite.revokedAt.toISOString() : null,
      createdAt: invite.createdAt.toISOString()
    }));
  }

  async createInvite(
    actor: AuthenticatedUser,
    payload: CreateInviteDto
  ): Promise<UserInviteSummary> {
    this.ensureAdmin(actor);

    const email = payload.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email,
        organizationId: actor.organizationId
      }
    });

    if (existingUser) {
      throw new ConflictException('A user with that email already exists');
    }

    const existingInvite = await this.prisma.userInvite.findFirst({
      where: {
        organizationId: actor.organizationId,
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    const expiresInHours = payload.expiresInHours ?? 72;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const { token, hash: tokenHash } = this.generateToken();

    const invite = await this.prisma.$transaction(async (tx) => {
      if (existingInvite) {
        return tx.userInvite.update({
          where: { id: existingInvite.id },
          data: {
            tokenHash,
            expiresAt,
            invitedById: actor.id,
            updatedAt: new Date()
          },
          include: {
            invitedBy: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        });
      }

      return tx.userInvite.create({
        data: {
          email,
          organizationId: actor.organizationId,
          role: payload.role ?? UserRole.ANALYST,
          invitedById: actor.id,
          tokenHash,
          expiresAt
        },
        include: {
          invitedBy: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
    });

    const summary: UserInviteSummary = {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      invitedByName: invite.invitedBy
        ? [invite.invitedBy.firstName, invite.invitedBy.lastName].filter(Boolean).join(' ') ||
          invite.invitedBy.email
        : null,
      invitedByEmail: invite.invitedBy?.email ?? null,
      expiresAt: invite.expiresAt.toISOString(),
      acceptedAt: invite.acceptedAt ? invite.acceptedAt.toISOString() : null,
      revokedAt: invite.revokedAt ? invite.revokedAt.toISOString() : null,
      createdAt: invite.createdAt.toISOString(),
      token
    };

    return summary;
  }

  async revokeInvite(actor: AuthenticatedUser, inviteId: string): Promise<UserInviteSummary> {
    this.ensureAdmin(actor);

    const invite = await this.prisma.userInvite.findUnique({
      where: { id: inviteId },
      include: {
        invitedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!invite || invite.organizationId !== actor.organizationId) {
      throw new NotFoundException('Invite not found');
    }

    const revokedAt = new Date();

    const updated = await this.prisma.userInvite.update({
      where: { id: inviteId },
      data: {
        revokedAt,
        updatedAt: revokedAt
      },
      include: {
        invitedBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role,
      invitedByName: updated.invitedBy
        ? [updated.invitedBy.firstName, updated.invitedBy.lastName].filter(Boolean).join(' ') ||
          updated.invitedBy.email
        : null,
      invitedByEmail: updated.invitedBy?.email ?? null,
      expiresAt: updated.expiresAt.toISOString(),
      acceptedAt: updated.acceptedAt ? updated.acceptedAt.toISOString() : null,
      revokedAt: updated.revokedAt ? updated.revokedAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString()
    };
  }

  async forcePasswordReset(
    actor: AuthenticatedUser,
    userId: string,
    payload: ForcePasswordResetDto
  ): Promise<ForcePasswordResetResult> {
    this.ensureAdmin(actor);

    const target = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!target || target.organizationId !== actor.organizationId) {
      throw new NotFoundException('User not found');
    }

    const expiresInHours = payload.expiresInHours ?? 48;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const { token, hash } = this.generateToken();
    const issuedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: target.id },
        data: {
          mustResetPassword: true,
          refreshTokenHash: null,
          refreshTokenId: null,
          refreshTokenIssuedAt: null,
          refreshTokenInvalidatedAt: issuedAt
        }
      });

      await tx.userProfileAudit.create({
        data: {
          userId: target.id,
          actorId: actor.id,
          changes: {
            forcedPasswordReset: {
              previous: false,
              current: true
            }
          } as Prisma.InputJsonValue,
          createdAt: issuedAt
        }
      });

      await tx.userPasswordResetToken.updateMany({
        where: {
          userId: target.id,
          consumedAt: null
        },
        data: {
          consumedAt: issuedAt
        }
      });

      await tx.userPasswordResetToken.create({
        data: {
          userId: target.id,
          tokenHash: hash,
          expiresAt
        }
      });
    });

    this.logger.log(`Forced password reset initiated for user ${target.id}`);

    return {
      userId: target.id,
      token,
      expiresAt: expiresAt.toISOString()
    };
  }

  async bulkUpdateRoles(
    actor: AuthenticatedUser,
    payload: BulkUpdateRolesDto
  ): Promise<UserProfile[]> {
    this.ensureAdmin(actor);

    const now = new Date();
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: payload.userIds },
        organizationId: actor.organizationId
      },
      select: this.profileSelect
    });

    if (!users.length) {
      return [];
    }

    const updatedUsers = await this.prisma.$transaction(async (tx) => {
      const results: UserProfile[] = [];

      for (const user of users) {
        if (user.role === payload.role) {
          results.push(this.toProfile(user));
          continue;
        }

        const updated = await tx.user.update({
          where: { id: user.id },
          data: { role: payload.role },
          select: this.profileSelect
        });

        await tx.userProfileAudit.create({
          data: {
            userId: user.id,
            actorId: actor.id,
            changes: {
              role: {
                previous: user.role,
                current: payload.role
              }
            } as Prisma.InputJsonValue,
            createdAt: now
          }
        });

        results.push(this.toProfile(updated));
      }

      return results;
    });

    return updatedUsers;
  }

  async exportUsersCsv(actor: AuthenticatedUser): Promise<{ filename: string; csv: string }> {
    const users = await this.listUsers(actor);

    const header = [
      'Email',
      'First Name',
      'Last Name',
      'Role',
      'Job Title',
      'Phone Number',
      'Must Reset Password',
      'Last Login',
      'Created At',
      'Updated At'
    ].join(',');

    const rows = users.map((user) =>
      [
        user.email,
        user.firstName ?? '',
        user.lastName ?? '',
        user.role,
        user.jobTitle ?? '',
        user.phoneNumber ?? '',
        user.mustResetPassword ? 'true' : 'false',
        user.lastLoginAt ?? '',
        user.createdAt,
        user.updatedAt
      ]
        .map((value) => this.escapeCsv(String(value ?? '')))
        .join(',')
    );

    const csv = [header, ...rows].join('\n');
    const dateStamp = new Date().toISOString().split('T')[0];
    const filename = `users-${actor.organizationId}-${dateStamp}.csv`;

    return { filename, csv };
  }

  async createUser(actor: AuthenticatedUser, payload: CreateUserDto): Promise<UserProfile> {
    this.ensureAdmin(actor);

    const email = payload.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      throw new BadRequestException('A user with that email already exists');
    }

    const minLength = this.configService.get<number>('auth.passwordMinLength') ?? 12;
    const complexityRules =
      this.configService.get<PasswordComplexityRule[]>('auth.passwordComplexity') ??
      DEFAULT_PASSWORD_COMPLEXITY;

    const policyError = getPasswordPolicyError(payload.password, minLength, complexityRules);

    if (policyError) {
      throw new BadRequestException(policyError);
    }

    const passwordHash = await hash(payload.password, 12);

    const created = await this.prisma.user.create({
      data: {
        email,
        firstName: payload.firstName?.trim() || null,
        lastName: payload.lastName?.trim() || null,
        jobTitle: payload.jobTitle?.trim() || null,
        phoneNumber: payload.phoneNumber?.trim() || null,
        role: payload.role ?? UserRole.ANALYST,
        passwordHash,
        passwordChangedAt: new Date(),
        organizationId: actor.organizationId
      },
      select: this.profileSelect
    });

    await this.prisma.userProfileAudit.create({
      data: {
        userId: created.id,
        actorId: actor.id,
        changes: {
          created: {
            previous: null,
            current: 'created'
          }
        } as Prisma.InputJsonValue
      }
    });

    return this.toProfile(created);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.profileSelect
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toProfile(user);
  }

  async updateProfile(userId: string, actorId: string, payload: UpdateProfileDto): Promise<UserProfile> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.profileSelect
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const updateData: Prisma.UserUpdateInput = {};
    const changes: Record<string, { previous: unknown; current: unknown }> = {};
    const fields: Array<keyof UpdateProfileDto & keyof UserProfileSelectable> = [
      'firstName',
      'lastName',
      'jobTitle',
      'timezone',
      'phoneNumber',
      'avatarUrl',
      'bio'
    ];
    const requiredFields: Array<keyof UpdateProfileDto & keyof UserProfileSelectable> = [
      'firstName',
      'lastName',
      'jobTitle',
      'phoneNumber',
      'timezone'
    ];
    const requiredFieldLabels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      jobTitle: 'Job title',
      phoneNumber: 'Phone number',
      timezone: 'Timezone'
    };

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        const rawValue = payload[field];
        let normalized: string | null;

        if (typeof rawValue === 'string') {
          const trimmed = rawValue.trim();
          normalized = trimmed.length === 0 ? null : trimmed;
        } else if (rawValue === null || rawValue === undefined) {
          normalized = null;
        } else {
          normalized = rawValue as string;
        }

        if (requiredFields.includes(field) && (normalized === null || normalized === undefined)) {
          const label = requiredFieldLabels[field as string] ?? field;
          throw new BadRequestException(`${label} is required.`);
        }

        if (normalized !== existing[field]) {
          (updateData as Record<string, unknown>)[field] = normalized;
          changes[field] = { previous: existing[field] ?? null, current: normalized };
        }
      }
    }

    if (Object.keys(changes).length === 0) {
      return this.toProfile(existing);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: this.profileSelect
    });

    await this.prisma.userProfileAudit.create({
      data: {
        userId,
        actorId,
        changes: changes as Prisma.InputJsonValue
      }
    });

    return this.toProfile(updated);
  }

  async changePassword(userId: string, payload: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true
      }
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Password change is not available for this account');
    }

    const matches = await compare(payload.currentPassword, user.passwordHash);

    if (!matches) {
      throw new BadRequestException('The current password is incorrect');
    }

    if (await compare(payload.newPassword, user.passwordHash)) {
      throw new BadRequestException('New password must be different from the current password');
    }

    const minLength = this.configService.get<number>('auth.passwordMinLength') ?? 12;
    const complexityRules =
      this.configService.get<PasswordComplexityRule[]>('auth.passwordComplexity') ??
      DEFAULT_PASSWORD_COMPLEXITY;
    const policyError = getPasswordPolicyError(payload.newPassword, minLength, complexityRules);

    if (policyError) {
      throw new BadRequestException(policyError);
    }

    const newHash = await hash(payload.newPassword, 12);
    const passwordChangedAt = new Date();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        passwordChangedAt,
        refreshTokenHash: null,
        refreshTokenId: null,
        refreshTokenIssuedAt: null,
        refreshTokenInvalidatedAt: passwordChangedAt
      }
    });

    await this.prisma.userProfileAudit.create({
      data: {
        userId,
        actorId: userId,
        changes: {
          password: {
            previous: 'updated',
            current: 'updated'
          }
        } as Prisma.InputJsonValue
      }
    });
  }

  async updateUserRole(
    actor: AuthenticatedUser,
    targetUserId: string,
    payload: UpdateUserRoleDto
  ): Promise<UserProfile> {
    this.ensureAdmin(actor);

    const existing = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: this.profileSelect
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (existing.role === payload.role) {
      return this.toProfile(existing);
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: payload.role },
      select: this.profileSelect
    });

    await this.prisma.userProfileAudit.create({
      data: {
        userId: targetUserId,
        actorId: actor.id,
        changes: {
          role: {
            previous: existing.role,
            current: payload.role
          }
        } as Prisma.InputJsonValue
      }
    });

    return this.toProfile(updated);
  }

  async listAuditEntries(userId: string, take = 20): Promise<UserProfileAuditEntry[]> {
    const audits = await this.prisma.userProfileAudit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return audits.map((audit) => ({
      id: audit.id,
      userId: audit.userId,
      actorId: audit.actorId ?? null,
      actorEmail: audit.actor?.email ?? null,
      actorName: audit.actor
        ? [audit.actor.firstName, audit.actor.lastName].filter(Boolean).join(' ') || audit.actor.email
        : null,
      changes: audit.changes as Record<string, { previous: unknown; current: unknown }>,
      createdAt: audit.createdAt.toISOString()
    }));
  }

  async listRefreshFailures(actor: AuthenticatedUser, take = 20): Promise<UserRefreshFailure[]> {
    this.ensureAdmin(actor);

    const limit = Math.min(Math.max(take, 1), 100);

    const audits = await this.prisma.userProfileAudit.findMany({
      where: {
        user: {
          organizationId: actor.organizationId
        },
        changes: {
          path: ['refreshToken', 'current'],
          equals: 'invalidated'
        }
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return audits.map((audit) => {
      const user =
        (
          audit as unknown as {
            user?: { email: string; firstName: string | null; lastName: string | null };
          }
        ).user ?? null;
      const changes = (audit.changes ?? {}) as Record<string, unknown>;
      const refreshDetails =
        changes &&
        typeof changes === 'object' &&
        !Array.isArray(changes) &&
        'refreshToken' in changes &&
        changes.refreshToken
          ? (changes.refreshToken as Record<string, unknown>)
          : {};
      const reasonValue = refreshDetails['reason'];
      const metadataValue = refreshDetails['metadata'];
      const metadata =
        metadataValue && typeof metadataValue === 'object' && !Array.isArray(metadataValue)
          ? (metadataValue as Record<string, unknown>)
          : {};

      const email = user?.email ?? 'unknown';
      const fullName = user
        ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
        : null;

      return {
        id: audit.id,
        userId: audit.userId,
        email,
        name: fullName,
        reason: typeof reasonValue === 'string' ? reasonValue : null,
        metadata,
        occurredAt: audit.createdAt.toISOString(),
        isServiceUser: email.toLowerCase().includes('-agent@')
      };
    });
  }

  async listServiceTokenEvents(
    actor: AuthenticatedUser,
    take = 20
  ): Promise<UserServiceTokenEvent[]> {
    this.ensureAdmin(actor);

    const limit = Math.min(Math.max(take, 1), 100);

    const audits = await this.prisma.userProfileAudit.findMany({
      where: {
        user: {
          organizationId: actor.organizationId
        },
        changes: {
          path: ['serviceToken', 'current'],
          equals: 'issued'
        }
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return audits.map((audit) => {
      const user =
        (
          audit as unknown as {
            user?: { email: string; firstName: string | null; lastName: string | null };
          }
        ).user ?? null;
      const changes = (audit.changes ?? {}) as Record<string, unknown>;
      const tokenDetails =
        changes &&
        typeof changes === 'object' &&
        !Array.isArray(changes) &&
        'serviceToken' in changes &&
        changes.serviceToken
          ? (changes.serviceToken as Record<string, unknown>)
          : {};
      const sourceValue = tokenDetails['source'];
      const refreshTokenIdValue = tokenDetails['refreshTokenId'];
      const issuedAtValue = tokenDetails['issuedAt'];

      const email = user?.email ?? 'unknown';
      const fullName = user
        ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
        : null;

      const isServiceUser = email.toLowerCase().includes('-agent@');

      return {
        id: audit.id,
        userId: audit.userId,
        email,
        name: fullName,
        source: typeof sourceValue === 'string' ? sourceValue : null,
        refreshTokenId: typeof refreshTokenIdValue === 'string' ? refreshTokenIdValue : null,
        issuedAt:
          typeof issuedAtValue === 'string'
            ? new Date(issuedAtValue).toISOString()
            : null,
        occurredAt: audit.createdAt.toISOString(),
        isServiceUser
      };
    });
  }

  private generateToken(): { token: string; hash: string } {
    const token = randomBytes(32).toString('hex');
    return { token, hash: this.hashToken(token) };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private computeExpiryDate(explicitHours: number | undefined, fallbackHours: number): Date {
    const hours = explicitHours && explicitHours > 0 ? explicitHours : fallbackHours;
    const safeHours = Number.isFinite(hours) && hours > 0 ? hours : fallbackHours || 24;
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + safeHours * 60 * 60 * 1000);
    return expiresAt;
  }

  private getInviteExpiryHours(): number {
    return this.configService.get<number>('user.inviteExpiryHours') ?? 72;
  }

  private getPasswordResetExpiryHours(): number {
    return this.configService.get<number>('user.passwordResetExpiryHours') ?? 24;
  }

  private toInviteSummary(invite: InviteSelectable, token?: string): UserInviteSummary {
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      invitedByName: this.resolveUserLabel(invite.invitedBy),
      invitedByEmail: invite.invitedBy?.email ?? null,
      expiresAt: invite.expiresAt.toISOString(),
      acceptedAt: invite.acceptedAt ? invite.acceptedAt.toISOString() : null,
      revokedAt: invite.revokedAt ? invite.revokedAt.toISOString() : null,
      createdAt: invite.createdAt.toISOString(),
      token
    };
  }

  private resolveUserLabel(
    user: { firstName: string | null; lastName: string | null; email: string } | null | undefined
  ): string | null {
    if (!user) {
      return null;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name.trim().length > 0 ? name : user.email;
  }

  private toProfile(user: UserProfileSelectable): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      mustResetPassword: user.mustResetPassword,
      phoneNumber: user.phoneNumber ?? null,
      jobTitle: user.jobTitle ?? null,
      timezone: user.timezone ?? null,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
      role: user.role,
      organizationId: user.organizationId,
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  private ensureAdmin(actor: AuthenticatedUser): void {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can perform this action');
    }
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

type UserProfileSelectable = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  mustResetPassword: boolean;
  phoneNumber: string | null;
  jobTitle: string | null;
  timezone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  organizationId: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type InviteSelectable = {
  id: string;
  email: string;
  role: UserRole;
  invitedById: string | null;
  invitedBy: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
};
