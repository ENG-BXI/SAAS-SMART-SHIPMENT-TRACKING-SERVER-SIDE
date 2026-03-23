import { IsString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID('all', { message: 'Type must be a uuid' })
  @IsString({ message: 'Type must be a string' })
  type: string;
}
