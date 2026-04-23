import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
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
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
