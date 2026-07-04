import { PartialType } from '@nestjs/mapped-types';
import { CreateWayDto } from './create-way.dto';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

class PointDto {
  @IsUUID('4', { message: 'id must be a valid UUID' })
  id: string;
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;
  @IsNumber({}, { message: 'order must be a number' })
  @IsNotEmpty({ message: 'order is required' })
  order: number;
  @IsOptional()
  @IsNumber({}, { message: 'lat must be a number' })
  lat?: number;
  @IsOptional()
  @IsNumber({}, { message: 'lng must be a number' })
  lng?: number;
}
export class UpdateWayDto extends PartialType(CreateWayDto) {
  points?: PointDto[];
}
