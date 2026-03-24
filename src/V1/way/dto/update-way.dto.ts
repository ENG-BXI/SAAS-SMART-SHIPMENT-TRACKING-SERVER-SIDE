import { PartialType } from '@nestjs/mapped-types';
import { CreateWayDto } from './create-way.dto';

export class UpdateWayDto extends PartialType(CreateWayDto) {}
