import { Injectable } from '@nestjs/common';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}
  /*
    numberOfShipments,
    numberOfCurrentShipments,
    numberOfFinishedShipments,
    numberOfClients,
    numberOfWays
    */
  async getManagerStatistics(companyId: string) {
    const [
      numberOfShipments,
      numberOfCurrentShipments,
      numberOfFinishedShipments,
      numberOfClients,
      numberOfWays,
    ] = await Promise.all([
      this.prisma.shipment.count({
        where: {
          companyId,
        },
      }),
      this.prisma.shipment.count({
        where: {
          companyId,
          isPaused: false,
          isCompleted: false,
        },
      }),
      this.prisma.shipment.count({
        where: {
          companyId,
          isPaused: false,
          isCompleted: true,
        },
      }),
      this.prisma.client.count({
        where: {
          companyId,
        },
      }),
      this.prisma.way.count({
        where: {
          companyId,
        },
      }),
    ]);
    return {
      numberOfShipments,
      numberOfCurrentShipments,
      numberOfFinishedShipments,
      numberOfClients,
      numberOfWays,
    };
  }

  /*
  numberOfCompanies
  numberOfVisited
  numberOfNotes
  numberOfWillSubscriptionFinish
  numberOfPausedCompanies

  LineChart => numberOfCompanyByMonth
  {
    month: string,
    count: number
  }
   */
  async getAdminStatistics() {
    const year = new Date().getFullYear();
    const [
      numberOfCompanies,
      numberOfSubscriptionRequest,
      numberOfVisited,
      numberOfNotes,
      numberOfWillSubscriptionFinish,
      numberOfPausedCompanies,
      CompanyByMonth,
    ] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.company.count({
        where: {
          subscription: {
            OR: [{ status: 'pending' }, { status: 'change' }],
          },
        },
      }),
      this.prisma.system.findFirst({
        where: { name: 'NUMBER_OF_VISITOR' },
        select: { value: true },
      }),
      this.prisma.note.count(),
      this.prisma.company.count({
        where: {
          subscription: {
            endDate: {
              lt: new Date(),
            },
          },
        },
      }),
      this.prisma.company.count({
        where: {
          subscription: {
            status: 'inactive',
          },
        },
      }),
      this.prisma.company.findMany({
        select: {
          createdAt: true,
        },
        where: {
          createdAt: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31),
          },
        },
      }),
    ]);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const returnCompaniesByMonth = Array.from({ length: 12 }, (_, index) => ({
      month: monthNames[index],
      count: 0,
    }));

    CompanyByMonth.forEach((company) => {
      const monthIndex = new Date(company.createdAt).getMonth();
      returnCompaniesByMonth[monthIndex].count++;
    });
    return {
      numberOfCompanies,
      numberOfSubscriptionRequest,
      numberOfVisited: numberOfVisited?.value || 0,
      numberOfNotes,
      numberOfWillSubscriptionFinish,
      numberOfPausedCompanies,
      numberOfCompanyByMonth: returnCompaniesByMonth,
    };
  }

  async addVisit() {
    try {
      const isNumberOfVisitExist = await this.prisma.system.findFirst();
      if (
        isNumberOfVisitExist &&
        isNumberOfVisitExist.name == 'NUMBER_OF_VISITOR'
      ) {
        const addedVisit = await this.prisma.system.update({
          where: { name: 'NUMBER_OF_VISITOR' },
          data: {
            value: (Number(isNumberOfVisitExist.value) + 1).toString(),
          },
        });
        return addedVisit;
      } else {
        const addedVisit = await this.prisma.system.create({
          data: {
            name: 'NUMBER_OF_VISITOR',
            value: '1',
          },
        });
        return addedVisit;
      }
    } catch (error) {}
  }
}
