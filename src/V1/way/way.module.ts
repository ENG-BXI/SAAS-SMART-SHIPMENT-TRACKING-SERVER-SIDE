import { Module } from '@nestjs/common';
import { WayService } from './way.service';
import { WayController } from './way.controller';
import { WayRepository } from './way.repository';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports:[GatewayModule],
  controllers: [WayController],
  providers: [WayService,WayRepository],
})
export class WayModule {}
