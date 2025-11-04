import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { AntivirusSettingsView, TenantProfile } from '@compliance/shared';
import { TenantService } from './tenant.service';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';
import { UpdateAntivirusSettingsDto } from './dto/update-antivirus-settings.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('profile')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async getProfile(@CurrentUser() user: AuthenticatedUser): Promise<TenantProfile> {
    return this.tenantService.getProfile(user.organizationId);
  }

  @Get('security/antivirus')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async getAntivirusSettings(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<AntivirusSettingsView> {
    return this.tenantService.getAntivirusSettings(user.organizationId);
  }

  @Patch('profile')
  @Roles(UserRole.ADMIN)
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpdateTenantProfileDto
  ): Promise<TenantProfile> {
    return this.tenantService.updateProfile(user.organizationId, payload);
  }

  @Patch('security/antivirus')
  @Roles(UserRole.ADMIN)
  async updateAntivirusSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpdateAntivirusSettingsDto
  ): Promise<AntivirusSettingsView> {
    return this.tenantService.updateAntivirusSettings(user.organizationId, payload);
  }
}
