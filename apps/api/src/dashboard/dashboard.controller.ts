import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService, DashboardOverview } from './dashboard.service';

@Roles(UserRole.READ_ONLY, UserRole.ANALYST, UserRole.AUDITOR, UserRole.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async overview(): Promise<DashboardOverview> {
    return this.dashboardService.getOverview();
  }
}
