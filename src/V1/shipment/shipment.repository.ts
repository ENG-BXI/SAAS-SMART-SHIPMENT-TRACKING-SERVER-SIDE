import { PrismaService } from 'src/prisma/prisma.service';

export class ShipmentRepository {
  constructor(private prisma: PrismaService) {}
  async getAllShipment(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    return await this.prisma.shipment.findMany({
      where: {
        AND: [
          { companyId: companyId },
          { isCompleted: false },
          search
            ? {
                OR: [
                  {
                    shipmentNumber: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    way: {
                      name: { contains: search, mode: 'insensitive' },
                    },
                  },
                  {
                    way: {
                      points: {
                        some: {
                          name: { contains: search, mode: 'insensitive' },
                        },
                      },
                    },
                    driver: {
                      userName: { contains: search, mode: 'insensitive' },
                    },
                  },
                ],
              }
            : {},
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        shipmentNumber: true,
        launchDate: true,
        isCompleted: true,
        isPaused: true,
        way: {
          select: {
            id: true,
            name: true,
          },
        },
        currentPoint: {
          select: {
            id: true,
            name: true,
          },
        },
        driver: {
          select: {
            id: true,
            userName: true,
          },
        },
      },
    });
  }
  async getCountOfShipment(
    companyId: string,
    search?: string,
  ) {
    return await this.prisma.shipment.count({
      where: {
        AND: [
          { companyId: companyId },
          { isCompleted: false },
          search
            ? {
                OR: [
                  {
                    shipmentNumber: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                  {
                    way: {
                      name: { contains: search, mode: 'insensitive' },
                    },
                  },
                  {
                    way: {
                      points: {
                        some: {
                          name: { contains: search, mode: 'insensitive' },
                        },
                      },
                    },
                    driver: {
                      userName: { contains: search, mode: 'insensitive' },
                    },
                  },
                ],
              }
            : {},
        ],
      },
    });
  }
}
