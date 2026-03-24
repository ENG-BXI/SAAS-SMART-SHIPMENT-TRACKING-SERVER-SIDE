import { Module } from '@nestjs/common';
import { WayService } from './way.service';
import { WayController } from './way.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [WayController],
  providers: [WayService,PrismaService],
})
export class WayModule {}
