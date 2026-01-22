import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllCompany() {
    try {
      const companies = await this.prisma.company.findMany();
      return companies;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getCompanyById(id: string) {
    try {
      const company = await this.prisma.company.findUnique({ where: { id } });
      if (!company) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      return company;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createCompany(createCompanyDto: CreateCompanyDto) {
    try {
      const existingCompany = await this.prisma.company.findFirst({
        where: {
          OR: [
            { companyEmail: createCompanyDto.companyEmail },
            { name: createCompanyDto.name },
          ],
        },
      });

      if (existingCompany) {
        const message =
          existingCompany.companyEmail === createCompanyDto.companyEmail
            ? 'Company with this email already exists'
            : 'Company with this name already exists';
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      const company = await this.prisma.company.create({
        data: {
          name: createCompanyDto.name,
          companyEmail: createCompanyDto.companyEmail,
          companyPassword: createCompanyDto.companyPassword,
          location: createCompanyDto.location,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return company;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      const existingCompany = await this.prisma.company.findUnique({
        where: { id },
      });
      if (!existingCompany) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      const existingCompanyWithSameEmail = await this.prisma.company.findFirst({
        where: {
          OR: [
            { companyEmail: updateCompanyDto.companyEmail },
            { name: updateCompanyDto.name },
          ],
          // check all company but not current company by this id
          // because we are send same email and name when update another property
          id: { not: id },
        },
      });
      if (existingCompanyWithSameEmail) {
        const message =
          existingCompanyWithSameEmail.companyEmail ===
          updateCompanyDto.companyEmail
            ? 'Company with this email already exists'
            : 'Company with this name already exists';
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      const company = await this.prisma.company.update({
        where: { id },
        data: {
          name: updateCompanyDto.name,
          companyEmail: updateCompanyDto.companyEmail,
          companyPassword: updateCompanyDto.companyPassword,
          location: updateCompanyDto.location,
          updatedAt: new Date(),
        },
      });
      return company;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
