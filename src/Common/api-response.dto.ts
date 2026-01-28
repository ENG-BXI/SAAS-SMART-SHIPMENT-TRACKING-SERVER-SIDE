import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty({ example: 200 })
  status: number;
}

export class PaginatedDataDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 5 })
  number_of_page: number;

  @ApiProperty({ example: 50 })
  total: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty()
  data: PaginatedDataDto<T>;

  @ApiProperty({ example: 'Get data successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  status: number;
}
