import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PointDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;
  @IsNumber({}, { message: 'order must be a number' })
  @IsNotEmpty({ message: 'order is required' })
  order: number;
  @IsOptional()
  @IsNumber({}, { message: 'lan must be a number' })
  lan?: number;
  @IsOptional()
  @IsNumber({}, { message: 'lng must be a number' })
  lng?: number;
}
export class CreateWayDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  name: string;
  @IsArray({ message: 'points must be an array' })
  @IsNotEmpty({ message: 'points is required' })
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  points: PointDto[];
}
