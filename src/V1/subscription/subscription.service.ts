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
    let startDate = new Date();
    let endDate = new Date();
    // if Company has subscription set the new start subscription date to the company has
    // and set the end date to the company has + duration
    if (company.subscription) {
      startDate = company.subscription.startDate;
      let date = company.subscription.endDate.getDate();
      let month;
      let year;
      if (subscriptionType.type == 'monthly') {
        month = company.subscription.endDate.getMonth() + 1;
        year = company.subscription.endDate.getFullYear();
      } else {
        month = company.subscription.endDate.getMonth();
        year = company.subscription.endDate.getFullYear() + 1;
      }
      endDate.setMonth(month);
      endDate.setFullYear(year);
      // to save what day is has endDate company
      endDate.setDate(date);
    } else {
      // if Company has no subscription set the new start subscription date to the current date
      if (subscriptionType.type == 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
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
