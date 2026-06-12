import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { ShipmentRepository } from './shipment.repository';

@Module({
  controllers: [ShipmentController],
  providers: [ShipmentService, ShipmentRepository],
})
export class ShipmentModule {}
