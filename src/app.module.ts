import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './V1/company/company.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), CompanyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
