import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  imports: [EmailModule],
})
export class UserModule {}
