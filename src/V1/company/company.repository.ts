import { SubscriptionStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CompanyRepository {
  constructor(private prisma: PrismaService) {}
  async getAllCompanies(page: number, limit: number, search?: string) {
    return await this.prisma.company.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
            ],
          },
          // Add Filter Subreption
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        users: {
          take: 1,
          orderBy: {
            createAt: 'desc',
          },
          select: {
            email: true,
          },
          where: {
            isManager: true,
          },
        },
        subscription: {
          select: {
            typeId: true,
            status: true,
          },
        },
        _count: {
          select: {
            clients: true,
          },
        },
      },
    });
  }
  async getCountOfAllCompanies() {
    return await this.prisma.company.count();
  }
  async getCompanyById(id: string) {
    return await this.prisma.company.findUnique({
      where: { id },
      select: {
        name: true,
        location: true,
        _count: {
          select: {
            clients: true,
          },
        },
        subscription: {
          select: {
            startDate: true,
            endDate: true,
            status: true,
            type: {
              select: {
                type: true,
                durationByMonth: true,
              },
            },
          },
        },
        users: {
          take: 1,
          orderBy: {
            createAt: 'desc',
          },
          select: {
            email: true,
          },
          where: {
            isManager: true,
          },
        },
      },
    });
  }
  async getEmailForCompany(id?: string) {
    return this.prisma.company.findFirst({
      where: {
        id,
      },
      select: {
        users: {
          where: {
            isManager: true,
          },
          select: { email: true },
          orderBy: { createAt: 'desc' },
          take: 1,
        },
      },
    });
  }
  async getCompanyWithUsersWithSubscriptionInfo(companyId:string) {
    return await this.prisma.company.findUnique({
      where: { id:companyId },
      include: {
        users: {
          where: {
            isManager: true,
          },
          select: {
            id: true,
          },
          orderBy: {
            createAt: 'desc',
          },
          take: 1,
        },
        subscription: {
          select: {
            id: true,
            typeId: true,
          },
        },
      },
    });
  }
  async isCompanyExist({
    companyEmail,
    companyId,
    companyName,
  }: {
    companyId?: string;
    companyEmail?: string;
    companyName?: string;
  }) {
    return await this.prisma.company.findFirst({
      where: {
        OR: [
          { id: companyId },
          { users: { some: { email: companyEmail } } },
          { name: companyName },
        ],
      },
    });
  }
  async isEmailUsedInAnotherCompany(
    companyId: string,
    email?: string,
    name?: string,
  ) {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { company: { name } }],
        // check all company but not current company by this id
        // because we are send same email and name when update another property
        companyId: { not: companyId },
      },
    });
  }
  async CompanySubscriptionStatus(companyId: string) {
    return await this.prisma.subscription.findFirst({
      where: {
        companyId,
      },
      select: {
        status: true,
      },
    });
  }
  async disActiveCompany(companyId: string) {
    return await this.prisma.subscription.update({
      where: { companyId },
      data: {
        status: SubscriptionStatus.inactive,
      },
    });
  }
  async activeCompany(companyId: string) {
    return await this.prisma.subscription.update({
      where: { companyId },
      data: {
        status: SubscriptionStatus.active,
      },
    });
  }
  async createCompanyAndManagerAndSubscriptionWhenCompanyRequest(
    createCompanyDto: CreateCompanyDto,
    hashedPassword: string,
    subscriptionTypeId: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: createCompanyDto.name,
          location: createCompanyDto.location,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      // Manager Of Company
      const user = await tx.user.create({
        data: {
          email: createCompanyDto.companyEmail,
          password: hashedPassword,
          userName: `Manager of ${createCompanyDto.name}`,
          isAdmin: false,
          isManager: true,
          isEmployee: false,
          isDriver: false,
          companyId: company.id,
        },
        select: {
          id: true,
          email: true,
          userName: true,
          isAdmin: true,
          isManager: true,
          isEmployee: true,
          isDriver: true,
          companyId: true,
        },
      });
      const subscription = await tx.subscription.create({
        data: {
          status: SubscriptionStatus.pending,
          companyId: company.id,
          typeId: subscriptionTypeId,
        },
      });
      return { company, user, subscription };
    });
  }
  async getAllRequestSubscriptionCompanies(
    page: number,
    limit: number,
    search?: string,
  ) {
    return await this.prisma.company.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
            ],
          },
          // Add Filter Subreption
          {
            subscription: {
              OR: [
                {
                  status: SubscriptionStatus.pending,
                },
                { status: SubscriptionStatus.change },
              ],
            },
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        users: {
          take: 1,
          orderBy: {
            createAt: 'desc',
          },
          select: {
            email: true,
          },
          where: {
            isManager: true,
          },
        },
        subscription: {
          select: {
            startDate: true,
            endDate: true,
            status: true,
            newTypeId: true,
            type: {
              select: {
                id: true,
                type: true,
                price: true,
                durationByMonth: true,
              },
            },
          },
        },
      },
    });
  }
  async getPendingCompanyCount() {
    return await this.prisma.company.count({
      where: {
        subscription: { status: SubscriptionStatus.pending },
      },
    });
  }
  async getChangeCompanyCount() {
    return await this.prisma.company.count({
      where: {
        subscription: { status: SubscriptionStatus.change },
      },
    });
  }
  async createCompanyFormAdminDashboard(
    createCompanyDto: CreateCompanyDto,
    hashedPassword: string,
    durationByMonth: number,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: createCompanyDto.name,
          location: createCompanyDto.location,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      const user = await tx.user.create({
        data: {
          email: createCompanyDto.companyEmail,
          password: hashedPassword,
          userName: `Manager of ${createCompanyDto.name}`,
          isAdmin: false,
          isManager: true,
          isEmployee: false,
          isDriver: false,
          companyId: company.id,
        },
        select: {
          id: true,
          email: true,
          userName: true,
          isAdmin: true,
          isManager: true,
          isEmployee: true,
          isDriver: true,
          companyId: true,
        },
      });
      const startDate = new Date();
      const startMonth = startDate.getMonth();
      const endDate = new Date();
      endDate.setMonth(startMonth + durationByMonth);

      const subscription = await tx.subscription.create({
        data: {
          status: SubscriptionStatus.active,
          startDate,
          endDate,
          companyId: company.id,
          typeId: createCompanyDto.subscriptionType,
        },
      });
      return { company, user, subscription };
    });
  }
  async updateCompanyWitManagerWithSubscriptionIfEdited(
    companyId: string,
    updateCompanyDto: UpdateCompanyDto,
    hashedPassword: string,
    durationByMonth: number,
    managerId: string,
    subscriptionId?: string,
    isChangeSubscription = false,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.update({
        where: { id: companyId },
        data: {
          name: updateCompanyDto.name,
          location: updateCompanyDto.location,
          updatedAt: new Date(),
        },
      });
      const user = await tx.user.update({
        where: { id: managerId },
        data: {
          email: updateCompanyDto.companyEmail,
          password: hashedPassword,
          userName: `Manager of ${company.name}`,
        },
        select: {
          id: true,
          email: true,
          userName: true,
          isAdmin: true,
          isManager: true,
          isEmployee: true,
          isDriver: true,
          companyId: true,
        },
      });
      if (isChangeSubscription) {
        const startDate = new Date();
        const startMonth = startDate.getMonth();
        const endDate = new Date();
        endDate.setMonth(startMonth + durationByMonth);

        const subscription = await tx.subscription.update({
          where: {
            id: subscriptionId,
          },
          data: {
            status: 'active',
            startDate,
            endDate,
            companyId: company.id,
            typeId: updateCompanyDto.subscriptionType,
          },
        });
        return { company, user, subscription };
      }
      return { company, user };
    });
  }
  async deleteCompany(companyId: string) {
    return await this.prisma.company.delete({ where: { id: companyId } });
  }
}
