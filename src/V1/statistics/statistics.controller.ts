import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('manager-statistics/:companyId')
  @UseGuards(AuthGuard)
  async getManagerStatistics(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const managerStatistics = await this.statisticsService.getManagerStatistics(
      req.user.companyId,
    );
    return {
      data: managerStatistics,
      message: 'Manager statistics fetched successfully',
      status: HttpStatus.OK,
    };
  }

  @Get('admin-statistics')
  async getAdminStatistics() {
    return await this.statisticsService.getAdminStatistics();
  }
}
