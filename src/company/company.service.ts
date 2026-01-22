import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}
  create(createCompanyDto: CreateCompanyDto) {
    return 'This action adds a new company';
  }

  findAll() {
    return this.prisma.company.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
