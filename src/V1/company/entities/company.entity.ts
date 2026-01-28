import { ApiProperty } from '@nestjs/swagger';

export class Company {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique ID of the company',
  })
  id: string;

  @ApiProperty({
    example: 'Smart Logistics Corp',
    description: 'The name of the company',
  })
  name: string;

  @ApiProperty({
    example: 'contact@smartlogistics.com',
    description: 'Official email of the company',
  })
  companyEmail: string;

  @ApiProperty({
    example: 'Dubai, UAE',
    description: 'Company headquarters location',
  })
  location: string;

  @ApiProperty({
    example: '2024-01-28T12:00:00Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-28T12:00:00Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
