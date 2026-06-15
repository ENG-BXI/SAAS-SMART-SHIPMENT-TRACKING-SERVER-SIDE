import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { ShipmentRepository } from './shipment.repository';
import { EmailModule } from '../email/email.module';
import { ClientRepository } from '../client/client.repository';

@Module({
  controllers: [ShipmentController],
  providers: [ShipmentService, ShipmentRepository, ClientRepository],
  imports: [EmailModule],
})
export class ShipmentModule {}
