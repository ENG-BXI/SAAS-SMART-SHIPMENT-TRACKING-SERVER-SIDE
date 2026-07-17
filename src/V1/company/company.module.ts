import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyControllerV1 } from './company.controller';
import { CompanyRepository } from './company.repository';
import { SubscriptionRepository } from '../subscription/subscription.repository';
import { EmailModule } from '../email/email.module';
import { GatewayModule } from '../gateway/gateway.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [CompanyControllerV1],
  providers: [CompanyService, CompanyRepository, SubscriptionRepository],
  imports: [EmailModule, GatewayModule, CloudinaryModule],
})
export class CompanyModule {}
