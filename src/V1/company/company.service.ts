import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import * as bcrypt from 'bcrypt';
import { SubscriptionStatus } from 'generated/prisma/enums';
@Injectable()
export class CompanyService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllCompany({
    page,
    limit,
    search,
    filter,
  }: {
    page: number;
    limit: number;
    search: string;
    filter: string;
  }) {
    try {
      const companies = await this.prisma.company.findMany({
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
      const companiesNumber = await this.prisma.company.count();
      return { companies, companiesNumber };
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
  async RequestSubscriptionCompany(createCompanyDto: CreateCompanyDto) {
    try {
      const existingCompany = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: createCompanyDto.companyEmail },
            {
              company: {
                name: createCompanyDto.name,
              },
            },
          ],
        },
      });
      if (existingCompany) {
        const message =
          existingCompany.email === createCompanyDto.companyEmail
            ? 'Company with this email already exists'
            : 'Company with this name already exists';
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      const hashedPassword = await bcrypt.hash(
        createCompanyDto.companyPassword,
        10,
      );
      const subscriptionType = await this.prisma.subscriptionType.findUnique({
        where: {
          id: createCompanyDto.subscriptionType,
        },
        select: {
          id: true,
        },
      });
      if (!subscriptionType)
        throw new HttpException(
          'Cannot Find Subscription Type',
          HttpStatus.BAD_REQUEST,
        );
      const { company, user, subscription } = await this.prisma.$transaction(
        async (tx) => {
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
              typeId: subscriptionType.id,
            },
          });
          return { company, user, subscription };
        },
      );

      return { company, user, subscription };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getAllRequestSubscriptionCompanies({
    page,
    limit,
    search,
    filter,
  }: {
    page: number;
    limit: number;
    search: string;
    filter: string;
  }) {
    try {
      const [companies, pendingCompanyCount, changeCompanyCount] =
        await Promise.all([
          await this.prisma.company.findMany({
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
                  newTypeId:true,
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
          }),
          await this.prisma.company.count({
            where: {
              subscription: { status: SubscriptionStatus.pending },
            },
          }),
          await this.prisma.company.count({
            where: {
              subscription: { status: SubscriptionStatus.change },
            },
          }),
        ]);

      // const newData = companies.map((item) => {
      //   return {
      //     ...item,
      //     subscription: {
      //       ...item.subscription,
      //       type: {
      //         ...item.subscription?.type,
      //         id: item.subscription?.newType?.id || item.subscription?.type.id,
      //       },
      //     },
      //   };
      // });
      return { companies, pendingCompanyCount, changeCompanyCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createCompany(createCompanyDto: CreateCompanyDto) {
    try {
      const existingCompany = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: createCompanyDto.companyEmail },
            {
              company: {
                name: createCompanyDto.name,
              },
            },
          ],
        },
      });

      if (existingCompany) {
        const message =
          existingCompany.email === createCompanyDto.companyEmail
            ? 'Company with this email already exists'
            : 'Company with this name already exists';
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      const hashedPassword = await bcrypt.hash(
        createCompanyDto.companyPassword,
        10,
      );
      const subscriptionType = await this.prisma.subscriptionType.findUnique({
        where: {
          id: createCompanyDto.subscriptionType,
        },
        select: {
          durationByMonth: true,
        },
      });
      if (!subscriptionType)
        throw new HttpException(
          'Cannot Find Subscription Type',
          HttpStatus.BAD_REQUEST,
        );
      const { company, user, subscription } = await this.prisma.$transaction(
        async (tx) => {
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
          endDate.setMonth(startMonth + subscriptionType.durationByMonth);

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
        },
      );

      return { company, user, subscription };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      const existingCompany = await this.prisma.company.findUnique({
        where: { id },
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
      if (!existingCompany) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }

      const existingCompanyWithSameEmail = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: updateCompanyDto.companyEmail },
            { company: { name: updateCompanyDto.name } },
          ],
          // check all company but not current company by this id
          // because we are send same email and name when update another property
          companyId: { not: id },
        },
      });

      if (existingCompanyWithSameEmail) {
        const message =
          existingCompanyWithSameEmail.email === updateCompanyDto.companyEmail
            ? 'Company with this email already exists'
            : 'Company with this name already exists';
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }

      const subscriptionType = await this.prisma.subscriptionType.findUnique({
        where: {
          id: updateCompanyDto.subscriptionType,
        },
        select: {
          durationByMonth: true,
        },
      });

      if (!subscriptionType)
        throw new HttpException(
          'Cannot Find Subscription Type',
          HttpStatus.BAD_REQUEST,
        );

      const isChangeSubscription =
        existingCompany.subscription?.typeId !== updateCompanyDto.companyEmail;

      let hashedPassword;
      if (updateCompanyDto.companyPassword) {
        hashedPassword = await bcrypt.hash(
          updateCompanyDto.companyPassword,
          10,
        );
      }
      const { company, user, subscription } = await this.prisma.$transaction(
        async (tx) => {
          const company = await tx.company.update({
            where: { id },
            data: {
              name: updateCompanyDto.name,
              location: updateCompanyDto.location,
              updatedAt: new Date(),
            },
          });
          const user = await tx.user.update({
            where: { id: existingCompany.users[0].id },
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
            endDate.setMonth(startMonth + subscriptionType.durationByMonth);

            const subscription = await tx.subscription.update({
              where: {
                id: existingCompany.subscription?.id,
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
        },
      );
      return { company, user, subscription };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteCompany(id: string) {
    try {
      const existCompany = await this.prisma.company.findUnique({
        where: { id },
      });
      if (!existCompany) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      const company = await this.prisma.company.delete({ where: { id } });
      return company;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
