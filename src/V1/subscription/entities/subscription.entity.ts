import { ApiProperty } from '@nestjs/swagger';

export class Subscription {
  @ApiProperty({ example: 1, description: 'The unique ID of the subscription' })
  id: number;

  @ApiProperty({
    example: 'Gold Plan',
    description: 'Name of the subscription plan',
  })
  name: string;

  @ApiProperty({ example: 99.99, description: 'Price of the plan' })
  price: number;

  @ApiProperty({
    example: 'Monthly',
    enum: ['Monthly', 'Yearly'],
    description: 'Billing cycle',
  })
  billingCycle: string;

  @ApiProperty({ example: true, description: 'Availability status' })
  isActive: boolean;
}
