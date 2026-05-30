import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatus } from 'generated/prisma/enums';
import { CreateSubscriptionTypeDto } from './dto/CreateSubscriptionType.dto';
import { UpdateSubscriptionTypeDto } from './dto/UpdateSubscriptionType.dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}
  async getAllSubscription(page: number, search?: string) {
    const take = 10;
    const skip = (page - 1) * take;
    try {
      const allSubscription = await this.prisma.company.findMany({
        select: {
          id: true,
          name: true,
          location: true,
          subscription: {
            select: {
              type: {
                select: {
                  price: true,
                  type: true,
                },
              },
              status: true,
              startDate: true,
              endDate: true,
            },
          },
        },
        take,
        skip,
        where: search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  location: {
                    contains: search,
                  },
                },
              ],
            }
          : {},
      });
      const allSubscriptionCount = await this.prisma.company.count({
        where: {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              location: {
                contains: search,
              },
            },
          ],
        },
      });
      return { data: allSubscription, count: allSubscriptionCount };
    } catch (error) {
      throw new HttpException(
        `Failed to fetch subscription ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  // Add and Accept Company when it request subscription
  async addSubscription(
    companyId: string,
    SubscriptionDto: CreateSubscriptionDto,
  ) {
    const subscriptionType = await this.prisma.subscriptionType.findUnique({
      where: {
        id: SubscriptionDto.type,
      },
    });
    // Check the type is invalid?
    if (!subscriptionType) {
      throw new HttpException(
        'Subscription type not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        subscription: {
          select: {
            startDate: true,
            endDate: true,
            newTypeId: true,
          },
        },
      },
    });
    // check the company in exist
    if (!company) {
      throw new HttpException('Company not found', HttpStatus.BAD_REQUEST);
    }
    const startDate = new Date();
    const startMonth = startDate.getMonth();
    const endDate = new Date();
    endDate.setMonth(startMonth + subscriptionType.durationByMonth);

    const { newSubscription } = await this.prisma.$transaction(async (tx) => {
      const newSubscription = await tx.subscription.update({
        where: {
          companyId,
        },
        data: {
          type: {
            connect: {
              id: SubscriptionDto.type,
            },
          },
          startDate,
          endDate,
          status: SubscriptionStatus.active,
        },
      });
      if (company.subscription?.newTypeId) {
        await tx.company.update({
          where: { id: companyId },
          data: {
            subscription: {
              update: {
                newType: { disconnect: true },
                newTypeId: undefined,
              },
            },
          },
        });
      }
      return { newSubscription };
    });

    return newSubscription;
  }
  async getSubscription(companyId: string) {
    const existCompany = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!existCompany) {
      throw new HttpException('Company not found', HttpStatus.BAD_REQUEST);
    }
    const subscription = await this.prisma.subscription.findUnique({
      where: {
        companyId,
      },
      select: {
        startDate: true,
        endDate: true,
        status: true,
        type: {
          select: {
            type: true,
            price: true,
            durationByMonth: true,
          },
        },
      },
    });
    return subscription;
  }
  async editCompanySubscription(companyId: string, subscriptionTypeId: string) {
    const existCompany = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    if (!existCompany) {
      throw new HttpException('Company not found', HttpStatus.BAD_REQUEST);
    }
    const existSubscription = await this.prisma.subscriptionType.findUnique({
      where: {
        id: subscriptionTypeId,
      },
    });
    if (!existSubscription) {
      throw new HttpException('Subscription not found', HttpStatus.BAD_REQUEST);
    }

    const editedSubscription = await this.prisma.subscription.update({
      where: {
        companyId,
      },
      data: {
        status: SubscriptionStatus.change,
        newType: {
          connect: { id: subscriptionTypeId },
        },
      },
    });

    return editedSubscription;
  }

  async getSubscriptionType() {
    const subscriptionType = await this.prisma.subscriptionType.findMany({
      select: {
        id: true,
        type: true,
        price: true,
        durationByMonth: true,
      },
    });
    return subscriptionType;
  }
  async addSubscriptionType(
    createSubscriptionTypeDto: CreateSubscriptionTypeDto,
  ) {
    try {
      const existSubscriptionType =
        await this.prisma.subscriptionType.findFirst({
          where: {
            OR: [
              {
                type: createSubscriptionTypeDto.type,
              },
              {
                durationByMonth: createSubscriptionTypeDto.durationByMonth,
              },
            ],
          },
        });
      if (existSubscriptionType)
        throw new HttpException(
          'This Subscription Type Already Exist',
          HttpStatus.BAD_REQUEST,
        );
      const SubscriptionType = await this.prisma.subscriptionType.create({
        data: {
          type: createSubscriptionTypeDto.type,
          price: createSubscriptionTypeDto.price,
          durationByMonth: createSubscriptionTypeDto.durationByMonth,
        },
        select: {
          type: true,
          price: true,
          durationByMonth: true,
        },
      });
      return SubscriptionType;
    } catch (error) {
      if (error instanceof Error)
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateSubscriptionType(
    id: string,
    updateSubscriptionTypeDto: UpdateSubscriptionTypeDto,
  ) {
    try {
      const subscriptionType = await this.prisma.subscriptionType.findUnique({
        where: { id },
      });
      if (!subscriptionType)
        throw new HttpException(
          'Subscription Type Not Found',
          HttpStatus.BAD_REQUEST,
        );

      const existSubscriptionType =
        await this.prisma.subscriptionType.findFirst({
          where: {
            id: { not: id },
            OR: [
              {
                type: updateSubscriptionTypeDto.type,
              },
              {
                durationByMonth: updateSubscriptionTypeDto.durationByMonth,
              },
            ],
          },
        });
      if (existSubscriptionType)
        throw new HttpException(
          'This Subscription Type Already Exist',
          HttpStatus.BAD_REQUEST,
        );

      return await this.prisma.subscriptionType.update({
        where: { id },
        data: {
          type: updateSubscriptionTypeDto.type,
          price: updateSubscriptionTypeDto.price,
          durationByMonth: updateSubscriptionTypeDto.durationByMonth,
        },
        select: {
          id: true,
          type: true,
          price: true,
          durationByMonth: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error)
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteSubscriptionType(id: string) {
    try {
      const subscriptionType = await this.prisma.subscriptionType.findUnique({
        where: { id },
        select: {
          id: true,
          subscription: {
            select: {
              id: true,
            },
            take: 1,
          },
        },
      });
      if (!subscriptionType)
        throw new HttpException(
          'Subscription Type Not Found',
          HttpStatus.BAD_REQUEST,
        );
      if (subscriptionType.subscription.length > 0)
        throw new HttpException(
          'This Subscription Type Is Used By Companies',
          HttpStatus.BAD_REQUEST,
        );

      return await this.prisma.subscriptionType.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error)
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
