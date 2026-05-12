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

  async getAdminStatistics() {}
}
