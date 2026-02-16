import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatus } from 'generated/prisma/enums';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}
  async getAllSubscription() {
    try {
      const allSubscription = await this.prisma.subscription.findMany({
        select: {
          type: true,
          company: {
            select: {
              name: true,
              location: true,
              companyEmail: true,
            },
          },
        },
      });
      return allSubscription;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch subscription ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
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
          },
        },
      },
    });
    // check the company in exist
    if (!company) {
      throw new HttpException('Company not found', HttpStatus.BAD_REQUEST);
    }
    const duration = subscriptionType?.type === 'monthly' ? 1 : 12;
    let startDate = new Date();
    let endDate = new Date();
    // if Company has subscription set the new start subscription date to the company has
    // and set the end date to the company has + duration
    if (company.subscription) {
      startDate = company.subscription.startDate;
      endDate.setMonth(company.subscription.endDate.getMonth() + duration);
      // to save what day is has endDate company
      endDate.setDate(company.subscription.endDate.getDate());
    } else {
      // if Company has no subscription set the new start subscription date to the current date
      endDate.setMonth(endDate.getMonth() + duration);
    }
    const data = {
      companyId,
      startDate: startDate,
      endDate: endDate,
      typeId: SubscriptionDto.type,
      status: SubscriptionStatus.pending,
    };
    let newSubscription;
    if (!company.subscription) {
      newSubscription = await this.prisma.subscription.create({
        data,
      });
    } else {
      newSubscription = await this.prisma.subscription.update({
        where: {
          companyId,
        },
        data,
      });
    }
    return newSubscription;
  }
}
