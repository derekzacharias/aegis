import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  ForcePasswordResetResult,
  UserInviteSummary,
  UserProfile,
  UserProfileAuditEntry
} from '@compliance/shared';
import type { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileAuditQueryDto } from './dto/profile-audit-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { ForcePasswordResetDto } from './dto/force-password-reset.dto';
import { BulkUpdateRolesDto } from './dto/bulk-update-roles.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async list(@CurrentUser() actor: AuthenticatedUser): Promise<UserProfile[]> {
    return this.userService.listUsers(actor);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() payload: CreateUserDto
  ): Promise<UserProfile> {
    return this.userService.createUser(actor, payload);
  }

  @Get('invites')
  @Roles(UserRole.ADMIN)
  async listInvites(@CurrentUser() actor: AuthenticatedUser): Promise<UserInviteSummary[]> {
    return this.userService.listInvites(actor);
  }

  @Post('invites')
  @Roles(UserRole.ADMIN)
  async createInvite(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() payload: CreateInviteDto
  ): Promise<UserInviteSummary> {
    return this.userService.createInvite(actor, payload);
  }

  @Delete('invites/:inviteId')
  @Roles(UserRole.ADMIN)
  async revokeInvite(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('inviteId') inviteId: string
  ): Promise<UserInviteSummary> {
    return this.userService.revokeInvite(actor, inviteId);
  }

  @Post(':userId/force-reset')
  @Roles(UserRole.ADMIN)
  async forcePasswordReset(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() payload: ForcePasswordResetDto
  ): Promise<ForcePasswordResetResult> {
    return this.userService.forcePasswordReset(actor, userId, payload);
  }

  @Post('roles/bulk')
  @Roles(UserRole.ADMIN)
  async bulkUpdateRoles(
    @CurrentUser() actor: AuthenticatedUser,
    @Body() payload: BulkUpdateRolesDto
  ): Promise<UserProfile[]> {
    return this.userService.bulkUpdateRoles(actor, payload);
  }

  @Get('export')
  @Roles(UserRole.ADMIN)
  async exportCsv(
    @CurrentUser() actor: AuthenticatedUser,
    @Res() res: Response
  ): Promise<void> {
    const { csv, filename } = await this.userService.exportUsersCsv(actor);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('me')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async getSelf(@CurrentUser() user: AuthenticatedUser): Promise<UserProfile> {
    return this.userService.getProfile(user.id);
  }

  @Patch('me')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async updateSelf(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpdateProfileDto
  ): Promise<UserProfile> {
    return this.userService.updateProfile(user.id, user.id, payload);
  }

  @Patch('me/password')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ChangePasswordDto
  ): Promise<{ success: true }> {
    await this.userService.changePassword(user.id, payload);
    return { success: true };
  }

  @Get('me/audits')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async listAudits(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ProfileAuditQueryDto
  ): Promise<UserProfileAuditEntry[]> {
    return this.userService.listAuditEntries(user.id, query.limit ?? 20);
  }

  @Patch(':userId/role')
  @Roles(UserRole.ADMIN)
  async updateRole(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('userId') userId: string,
    @Body() payload: UpdateUserRoleDto
  ): Promise<UserProfile> {
    return this.userService.updateUserRole(actor, userId, payload);
  }
}
