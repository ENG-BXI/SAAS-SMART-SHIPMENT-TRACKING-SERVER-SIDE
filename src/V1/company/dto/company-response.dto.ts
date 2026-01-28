import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../entities/company.entity';
import {
  ApiResponseDto,
  PaginatedResponseDto,
  PaginatedDataDto,
} from 'src/Common/api-response.dto';

export class CompanyResponseDto extends ApiResponseDto<Company> {
  @ApiProperty({ type: Company })
  declare data: Company;
}

export class CompanyPaginatedDataDto extends PaginatedDataDto<Company> {
  @ApiProperty({ type: [Company] })
  declare data: Company[];
}

export class CompanyListResponseDto extends PaginatedResponseDto<Company> {
  @ApiProperty({ type: CompanyPaginatedDataDto })
  declare data: CompanyPaginatedDataDto;
}
