import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';

class ShipmentItemDto {
  @IsString()
  name: string;
  @IsNumber()
  quantity: number;
  @IsBoolean()
  isBreakable: boolean;
}
export class CreateShipmentItemDto {
  @IsString()
  @IsUUID()
  clientId: string;
  @Type(() => ShipmentItemDto)
  @ValidateNested({ each: true })
  items: ShipmentItemDto[];
}
