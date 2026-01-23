import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyControllerV1 } from './company.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CompanyControllerV1],
  providers: [CompanyService, PrismaService],
})
export class CompanyModule {}
