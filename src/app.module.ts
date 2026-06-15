import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './V1/company/company.module';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionModule } from './V1/subscription/subscription.module';
import { ClientModule } from './V1/client/client.module';
import { AuthModule } from './V1/auth/auth.module';
import { UserModule } from './V1/user/user.module';
import { WayModule } from './V1/way/way.module';
import { NoteModule } from './V1/note/note.module';
import { ShipmentModule } from './V1/shipment/shipment.module';
import { PrismaModule } from './prisma/prisma.module';
import { StatisticsModule } from './V1/statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    CompanyModule,
    SubscriptionModule,
    ClientModule,
    AuthModule,
    UserModule,
    WayModule,
    NoteModule,
    ShipmentModule,
    PrismaModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
