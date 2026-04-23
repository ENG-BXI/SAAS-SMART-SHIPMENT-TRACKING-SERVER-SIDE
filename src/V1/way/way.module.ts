import { Module } from '@nestjs/common';
import { WayService } from './way.service';
import { WayController } from './way.controller';

@Module({
  controllers: [WayController],
  providers: [WayService],
})
export class WayModule {}
