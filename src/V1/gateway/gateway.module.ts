import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { AppGateway } from './app.gateway';

@Module({
  providers: [AppGateway, GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
