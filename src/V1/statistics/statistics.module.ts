import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { StatisticsRepository } from './statistics.repository';
import { GatewayModule } from '../gateway/gateway.module';
import { ShipmentRepository } from '../shipment/shipment.repository';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [GatewayModule],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    StatisticsRepository,
    ShipmentRepository,
    UserRepository,
  ],
})
export class StatisticsModule {}
