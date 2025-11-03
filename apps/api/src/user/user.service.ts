import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, UserRole } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { UserProfile, UserProfileAuditEntry } from '@compliance/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
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

  private readonly profileSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
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

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        const rawValue = payload[field];
        const normalizedRaw = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        const normalized = normalizedRaw === '' ? null : normalizedRaw ?? null;

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
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can update roles');
    }

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

  private toProfile(user: UserProfileSelectable): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
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
}

type UserProfileSelectable = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
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
