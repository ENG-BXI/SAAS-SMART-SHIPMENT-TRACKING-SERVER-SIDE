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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

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
  async getAllCompany(
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
    @Query('filter') filter?: string,
  ) {
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const companies = await this.companyService.getAllCompany({
      page,
      limit,
      search: search || '',
      filter: filter || '',
    });
    return {
      data: {
        data: companies,
        page: page,
        number_of_page: Math.ceil(companies.length / limit),
        total: companies.length,
      },
      message: 'Get Company successfully',
      status: HttpStatus.OK,
    };
  }
  // Get Company by ID
  /**
   * @Get /:id
   * @Param id
   * @returns Company
   */
  @Get(':id')
  async getCompanyById(@Param('id', ParseUUIDPipe) id: string) {
    const company = await this.companyService.getCompanyById(id);
    return {
      data: company,
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
  // Patch Company
  /**
   * @Patch /:id
   * @Param id
   * @Body UpdateCompanyDto
   * @returns Company
   */
  @Patch(':id')
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
  async deleteCompany(@Param('id', ParseUUIDPipe) id: string) {
    const company = await this.companyService.deleteCompany(id);
    return {
      data: company,
      message: 'Delete Company successfully',
      status: HttpStatus.OK,
    };
  }
}
