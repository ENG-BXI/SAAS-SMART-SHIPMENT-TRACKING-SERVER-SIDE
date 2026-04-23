import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyControllerV1 } from './company.controller';

@Module({
  controllers: [CompanyControllerV1],
  providers: [CompanyService],
})
export class CompanyModule {}
