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
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  // Get All Company
  /**
   * @Get
   * @returns Array of Company
   */
  @Get()
  async getAllCompany() {
    const companies = await this.companyService.getAllCompany();
    return {
      data: companies,
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
}
