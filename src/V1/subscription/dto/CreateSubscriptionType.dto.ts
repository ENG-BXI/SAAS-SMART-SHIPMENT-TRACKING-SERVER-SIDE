import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateSubscriptionTypeDto {
  @IsString({ message: 'Must Type Be String' })
  @MinLength(3, { message: 'Type Must Be Great Then 3 Length' })
  type: string;
  @IsNumber(undefined, { message: 'Price Must Be Number' })
  price: number;
  @IsNumber(undefined, { message: 'Duration By Month Must Be Number' })
  durationByMonth: number;
}
