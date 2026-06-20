import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsRepository } from './statistics.repository';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [StatisticsController],
  providers: [StatisticsService, StatisticsRepository],
})
export class StatisticsModule {}
