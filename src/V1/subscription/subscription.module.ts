import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionRepository } from './subscription.repository';
import { CompanyRepository } from '../company/company.repository';

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionService,SubscriptionRepository,CompanyRepository],
})
export class SubscriptionModule {}
