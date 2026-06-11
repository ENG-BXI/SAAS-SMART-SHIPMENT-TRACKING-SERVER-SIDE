import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyControllerV1 } from './company.controller';
import { CompanyRepository } from './company.repository';
import { SubscriptionRepository } from '../subscription/subscription.repository';

@Module({
  controllers: [CompanyControllerV1],
  providers: [CompanyService,CompanyRepository,SubscriptionRepository],
})
export class CompanyModule {}
