import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  ValidationPipe,
  ParseUUIDPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

import {
  CompanyResponseDto,
  CompanyListResponseDto,
} from './dto/company-response.dto';
import { IResponseWithPagination } from 'src/Common/interfaces/IResponseWithPagination.interface';
import { Company } from './entities/company.entity';

@ApiTags('Company')
@Controller({ path: 'company', version: '1' })
export class CompanyControllerV1 {
  constructor(private readonly companyService: CompanyService) {}
  // Get All Company
  /**
   * @Get
   * @Query page? , limit? ,search? ,filter?
   * @returns Array of Company
   */
  @Get()
  @ApiOperation({
    summary: 'Retrieve all companies with pagination',
    description:
      'Fetches a list of companies. Supports searching by name/email/location and custom filtering.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, email, or location',
  })
  @ApiQuery({ name: 'filter', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: CompanyListResponseDto,
  })
  async getAllCompany(
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
    @Query('filter') filter?: string,
  ): Promise<IResponseWithPagination> {
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const company = await this.companyService.getAllCompany({
      page,
      limit,
      search: search || '',
      filter: filter || '',
    });
    const totalPages = Math.ceil(company.companiesNumber / limit);
    return {
      data: {
        data: company.companies,
        currentPage: page,
        pageSize: limit,
        totalCount: company.companiesNumber,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page !== 1,
      },
      message: 'Get Company successfully',
      status: HttpStatus.OK,
    };
  }
  // Post Company
  /**
   * @Post
   * @Body CreateCompanyDto
   * @returns Company
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new company',
    description:
      'Register a new company with necessary details (Name, Location, Email, Password).',
  })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully.',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Validation failed or passwords do not match.',
  })
  // this is used From Dash on Admin
  async createCompany(
    @Body(new ValidationPipe()) createCompanyDto: CreateCompanyDto,
  ) {
    if (createCompanyDto.companyPassword !== createCompanyDto.confirmPassword) {
      throw new HttpException('Password not match', HttpStatus.BAD_REQUEST);
    }
    const company = await this.companyService.createCompany(createCompanyDto);
    return {
      data: company,
      message: 'Create Company successfully',
      status: HttpStatus.OK,
    };
  }
  @Post('request-subscription')
  // This is used From Landing page
  async RequestSubscriptionCompany(
    @Body(new ValidationPipe()) createCompanyDto: CreateCompanyDto,
  ) {
    if (createCompanyDto.companyPassword !== createCompanyDto.confirmPassword) {
      throw new HttpException('Password not match', HttpStatus.BAD_REQUEST);
    }
    const company =
      await this.companyService.RequestSubscriptionCompany(createCompanyDto);
    return {
      data: company,
      message: 'Create Company successfully',
      status: HttpStatus.OK,
    };
  }
  @Get('request-subscription')
  async GetAllRequestSubscriptionCompanies(
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
    @Query('filter') filter?: string,
  ) {
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const companies =
      await this.companyService.getAllRequestSubscriptionCompanies({
        page,
        limit,
        search: search || '',
        filter: filter || '',
      });

    return {
      data: companies,
      status: HttpStatus.OK,
      message: 'Get All Request Company Successful',
    };
  }
  // Get Company by ID
  /**
   * @Get /:id
   * @Param id
   * @returns Company
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a company by ID',
    description: 'Retrieve a single company details using its unique UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the company (UUID)',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Company details retrieved successfully.',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found.',
  })
  async getCompanyById(@Param('id', ParseUUIDPipe) id: string) {
    const company = await this.companyService.getCompanyById(id);
    return {
      data: company,
      message: 'Get Company successfully',
      status: HttpStatus.OK,
    };
  }
  @Patch('pause-subscription/:id')
  async pauseCompanySubscription(@Param('id', ParseUUIDPipe) id: string) {
    const disActive = await this.companyService.pauseCompanySubscription(id);
    return {
      data: disActive,
      message: 'Pause Company Subscription Successful',
      status: HttpStatus.OK,
    };
  }
  @Patch('active-subscription/:id')
  async activeCompanySubscription(@Param('id', ParseUUIDPipe) id: string) {
    const disActive = await this.companyService.activeCompanySubscription(id);
    return {
      data: disActive,
      message: 'Active Company Subscription Successful',
      status: HttpStatus.OK,
    };
  }
  // Patch Company
  /**
   * @Patch /:id
   * @Param id
   * @Body UpdateCompanyDto
   * @returns Company
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a company',
    description: 'Update existing company details by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the company (UUID)',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: 200,
    description: 'Company updated successfully.',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found.',
  })
  async updateCompany(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe()) updateCompanyDto: UpdateCompanyDto,
  ) {
    const company = await this.companyService.updateCompany(
      id,
      updateCompanyDto,
    );
    return {
      data: company,
      message: 'Update Company successfully',
      status: HttpStatus.OK,
    };
  }
  // Delete Company
  /**
   * @Delete /:id
   * @Param id
   * @returns Company
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a company',
    description: 'Remove a company from the system by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the company (UUID)',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully.',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found.',
  })
  async deleteCompany(@Param('id', ParseUUIDPipe) id: string) {
    const company = await this.companyService.deleteCompany(id);
    return {
      data: company,
      message: 'Delete Company successfully',
      status: HttpStatus.OK,
    };
  }
}
