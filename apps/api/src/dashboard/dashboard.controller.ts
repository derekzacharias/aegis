import { Controller, Get } from '@nestjs/common';
import { DashboardService, DashboardOverview } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async overview(): Promise<DashboardOverview> {
    return this.dashboardService.getOverview();
  }
}
