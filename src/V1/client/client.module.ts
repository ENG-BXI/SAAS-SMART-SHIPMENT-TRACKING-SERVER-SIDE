import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { ClientRepository } from './client.repository';
import { ShipmentRepository } from '../shipment/shipment.repository';

@Module({
  controllers: [ClientController],
  providers: [ClientService, ClientRepository, ShipmentRepository],
})
export class ClientModule {}
