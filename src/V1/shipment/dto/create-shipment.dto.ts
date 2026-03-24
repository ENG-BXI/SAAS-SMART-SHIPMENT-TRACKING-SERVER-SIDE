import { IsDate, IsString, IsUUID } from 'class-validator';

export class CreateShipmentDto {
  @IsString({ message: 'Shipment number is required' })
  shipmentNumber: string;
  @IsUUID('all', { message: 'Way ID is required' })
  wayId: string;
  @IsUUID('all', { message: 'Driver ID is required' })
  driverId: string;
  @IsDate({ message: 'Launch date is required' })
  launchDate: Date;
}
