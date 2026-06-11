import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticsRepository {
  constructor(private prisma: PrismaService) {}
  async getCountOfShipments({
    companyId,
    isCompleted,
    isPaused,
  }: {
    companyId: string;
    isPaused?: boolean;
    isCompleted?: boolean;
  }) {
    return await this.prisma.shipment.count({
      where: {
        companyId,
        isPaused,
        isCompleted,
      },
    });
  }
  async getCountOfClient(companyId: string) {
    return await this.prisma.client.count({
      where: {
        companyId,
      },
    });
  }
  async getCountOfWay(companyId: string) {
    return await this.prisma.way.count({
      where: {
        companyId,
      },
    });
  }
  async getCountOfCompany() {
    return await this.prisma.company.count();
  }
  async getCountOfSubscriptionRequestCompany() {
    return await this.prisma.company.count({
      where: {
        subscription: {
          OR: [{ status: 'pending' }, { status: 'change' }],
        },
      },
    });
  }
  async getCountOfVisited() {
    return await this.prisma.system.findFirst({
      where: { name: 'NUMBER_OF_VISITOR' },
      select: { value: true },
    });
  }
  async getCountOfNote() {
    return await this.prisma.note.count();
  }
  async getCountOfExpireCompanySubscription() {
    return await this.prisma.company.count({
      where: {
        subscription: {
          endDate: {
            lt: new Date(),
          },
        },
      },
    });
  }
  async getCountOfInActiveCompany() {
    return await this.prisma.company.count({
      where: {
        subscription: {
          status: 'inactive',
        },
      },
    });
  }
  async getChartCompanyData(year: number) {
    return await this.prisma.company.findMany({
      select: {
        createdAt: true,
      },
      where: {
        createdAt: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31),
        },
      },
    });
  }
  async isVisitedTableIsNotEmpty() {
    return await this.prisma.system.findFirst();
  }
  async IncreaseNumberOfVisit(value:string) {
     return await this.prisma.system.update({
       where: { name: 'NUMBER_OF_VISITOR' },
       data: {
         value: (Number(value) + 1).toString(),
       },
     });
  }
  async InitialVisitTable() {
    return await this.prisma.system.create({
      data: {
        name: 'NUMBER_OF_VISITOR',
        value: '1',
      },
    });
  }
}
