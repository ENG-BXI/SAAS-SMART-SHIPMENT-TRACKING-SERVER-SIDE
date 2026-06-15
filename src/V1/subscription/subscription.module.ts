import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionRepository } from './subscription.repository';
import { CompanyRepository } from '../company/company.repository';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService, SubscriptionRepository, CompanyRepository],
  imports:[EmailModule]
})
export class SubscriptionModule {}
