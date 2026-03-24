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

@Module({
  imports: [
    ConfigModule.forRoot(),
    CompanyModule,
    SubscriptionModule,
    ClientModule,
    AuthModule,
    UserModule,
    WayModule,
    NoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
