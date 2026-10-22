import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return await this.dashboardService.getOverviewStats();
  }

  @Get('waffles')
  async getDailyWaffleAnalytics() {
    return await this.dashboardService.getDailyWaffleAnalytics();
  }
}
