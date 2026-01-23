import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './V1/company/company.module';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionModule } from './V1/subscription/subscription.module';

@Module({
  imports: [ConfigModule.forRoot(), CompanyModule, SubscriptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
