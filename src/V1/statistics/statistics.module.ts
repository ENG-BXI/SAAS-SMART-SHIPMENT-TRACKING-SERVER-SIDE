import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsRepository } from './statistics.repository';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsRepository],
})
export class StatisticsModule {}
