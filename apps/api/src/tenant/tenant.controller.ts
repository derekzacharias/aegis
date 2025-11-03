import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/auth.types';
import { TenantProfile } from '@compliance/shared';
import { TenantService } from './tenant.service';
import { UpdateTenantProfileDto } from './dto/update-tenant-profile.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('profile')
  @Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
  async getProfile(@CurrentUser() user: AuthenticatedUser): Promise<TenantProfile> {
    return this.tenantService.getProfile(user.organizationId);
  }

  @Patch('profile')
  @Roles(UserRole.ADMIN)
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: UpdateTenantProfileDto
  ): Promise<TenantProfile> {
    return this.tenantService.updateProfile(user.organizationId, payload);
  }
}
