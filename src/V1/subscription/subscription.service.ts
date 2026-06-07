import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionStatus } from 'generated/prisma/enums';
import { CreateSubscriptionTypeDto } from './dto/CreateSubscriptionType.dto';
import { UpdateSubscriptionTypeDto } from './dto/UpdateSubscriptionType.dto';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService {
  constructor(
    private prisma: PrismaService,
    private subscriptionRepository: SubscriptionRepository,
  ) {}
  async getAllSubscription(page: number, search?: string) {
    try {
      const allSubscription =
        await this.subscriptionRepository.getAllSubscription(page, search);
      const allSubscriptionCount =
        await this.subscriptionRepository.getCountOfSubscription(search);
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
    const subscriptionType =
      await this.subscriptionRepository.getSubscriptionType(
        SubscriptionDto.type,
      );
    // Check the type is invalid?
    if (!subscriptionType) {
      throw new HttpException(
        'Subscription type not found',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Keeep it in Company Repository
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
    const newSubscription =
      await this.subscriptionRepository.addSubscriptionForRequestCompany(
        companyId,
        SubscriptionDto,
        subscriptionType.durationByMonth,
        company.subscription?.newTypeId,
      );
    return newSubscription;
  }
  async getSubscription(companyId: string) {
    // TODO : make it in Company Repository
    const existCompany = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!existCompany) {
      throw new HttpException('Company not found', HttpStatus.BAD_REQUEST);
    }
    const subscription =
      await this.subscriptionRepository.getSubscription(companyId);
    return subscription;
  }
  async editCompanySubscription(companyId: string, subscriptionTypeId: string) {
    // TODO : make it in Company Repository
    const existCompany = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    if (!existCompany) {
      throw new HttpException('Company not found', HttpStatus.BAD_REQUEST);
    }
    const existSubscription =
      await this.subscriptionRepository.getSubscriptionType({
        id: subscriptionTypeId,
      });
    if (!existSubscription) {
      throw new HttpException('Subscription not found', HttpStatus.BAD_REQUEST);
    }

    const editedSubscription =
      await this.subscriptionRepository.updateSubscription(
        companyId,
        subscriptionTypeId,
      );

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
        await this.subscriptionRepository.getSubscriptionType({
          type: createSubscriptionTypeDto.type,
          durationByMonth: createSubscriptionTypeDto.durationByMonth,
        });
      if (existSubscriptionType)
        throw new HttpException(
          'This Subscription Type Already Exist',
          HttpStatus.BAD_REQUEST,
        );
      const SubscriptionType =
        await this.subscriptionRepository.createSubscriptionType(
          createSubscriptionTypeDto,
        );
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
      const subscriptionType =
        await this.subscriptionRepository.getSubscriptionType({ id });
      if (!subscriptionType)
        throw new HttpException(
          'Subscription Type Not Found',
          HttpStatus.BAD_REQUEST,
        );

      const existSubscriptionType =
        await this.subscriptionRepository.getSubscriptionType({
          type: updateSubscriptionTypeDto.type,
          durationByMonth: updateSubscriptionTypeDto.durationByMonth,
          id,
          notId: true,
        });
      if (existSubscriptionType)
        throw new HttpException(
          'This Subscription Type Already Exist',
          HttpStatus.BAD_REQUEST,
        );

      const updatedSubscriptionType =
        await this.subscriptionRepository.updateSubscriptionType(
          id,
          updateSubscriptionTypeDto,
        );
      return updatedSubscriptionType;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error)
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteSubscriptionType(id: string) {
    try {
      const subscriptionType =
        await this.subscriptionRepository.getSubscriptionTypeUsage(id);
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

      const deletedSubscriptionType =
        await this.subscriptionRepository.deleteSubscriptionType(id);
      return deletedSubscriptionType;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (error instanceof Error)
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
