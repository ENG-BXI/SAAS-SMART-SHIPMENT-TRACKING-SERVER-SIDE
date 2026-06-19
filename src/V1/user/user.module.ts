import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { EmailModule } from '../email/email.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  imports: [EmailModule,GatewayModule],
})
export class UserModule {}
