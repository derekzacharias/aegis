import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserProfile, UserProfileAuditEntry } from '@compliance/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileAuditQueryDto } from './dto/profile-audit-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
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
