import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatus } from 'generated/prisma/enums';
import { CreateSubscriptionTypeDto } from './dto/CreateSubscriptionType.dto';
import { UpdateSubscriptionTypeDto } from './dto/UpdateSubscriptionType.dto';

@Injectable()
export class SubscriptionRepository {
  constructor(private prisma: PrismaService) {}
  async getAllSubscription(page: number, search?: string) {
    const take = 10;
    const skip = (page - 1) * take;
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
    return allSubscription;
  }
  async getCountOfSubscription(search?: string) {
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
    return allSubscriptionCount;
  }
  async getAllSubscriptionType() {
    return await this.prisma.subscriptionType.findMany({
      select: {
        id: true,
        type: true,
        price: true,
        durationByMonth: true,
      },
    });
  }
  async getSubscriptionType({
    id,
    type,
    durationByMonth,
    notId = false,
  }: {
    id?: string;
    type?: string;
    durationByMonth?: number;
    notId?: boolean;
  }) {
    const subscriptionType = await this.prisma.subscriptionType.findFirst({
      where: {
        NOT: notId ? { id } : {},
        OR: [
          {
            id,
          },
          {
            type,
          },
          {
            durationByMonth,
          },
        ],
      },
    });
    return subscriptionType;
  }
  async getSubscriptionTypeUsage(id: string) {
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
    return subscriptionType;
  }
  async updateSubscriptionType(
    id: string,
    updateSubscriptionTypeDto: UpdateSubscriptionTypeDto,
  ) {
    const updatedSubscriptionType = await this.prisma.subscriptionType.update({
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
    return updatedSubscriptionType;
  }
  async deleteSubscriptionType(id: string) {
    const deletedSubscriptionType = await this.prisma.subscriptionType.delete({
      where: { id },
    });
    return deletedSubscriptionType;
  }
  async AcceptSubscriptionForRequestCompany(
    companyId: string,
    SubscriptionDto: CreateSubscriptionDto,
    durationByMonth: number,
    newTypeId?: null | string,
  ) {
    const startDate = new Date();
    const startMonth = startDate.getMonth();
    const endDate = new Date();
    endDate.setMonth(startMonth + durationByMonth);

    const { newSubscription, isChange } = await this.prisma.$transaction(
      async (tx) => {
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
        if (newTypeId) {
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
        return { newSubscription, isChange: !!newTypeId };
      },
    );
    return { newSubscription, isChange };
  }
  async getSubscription(companyId: string) {
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
  async updateSubscription(companyId: string, subscriptionTypeId: string) {
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
  async createSubscriptionType(
    createSubscriptionTypeDto: CreateSubscriptionTypeDto,
  ) {
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
  }
}
