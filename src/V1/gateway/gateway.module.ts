import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { AppGateway } from './app.gateway';
import { JwtModule } from '@nestjs/jwt';
import { CONFIG } from 'src/Config';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: CONFIG.JWT_SECRET,
      signOptions: { expiresIn: CONFIG.JWT_EXPIRES_IN },
    }),
  ],
  providers: [AppGateway, GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
