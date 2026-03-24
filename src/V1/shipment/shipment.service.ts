import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShipmentService {
  constructor(private readonly prisma: PrismaService) {}
  async getCurrentShipments(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const shipments = await this.prisma.shipment.findMany({
        where: {
          AND: [
            { companyId: companyId },
            { isCompleted: false },
            search
              ? {
                  OR: [
                    {
                      shipmentNumber: { contains: search, mode: 'insensitive' },
                    },
                    { launchDate: { gte: search } },
                    { launchDate: { lte: search } },
                    {
                      way: { name: { contains: search, mode: 'insensitive' } },
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
          way: {
            select: {
              name: true,
            },
          },
          currentPoint: {
            select: {
              name: true,
            },
          },
          driver: {
            select: {
              userName: true,
            },
          },
        },
      });
      const shipmentCount = await this.prisma.shipment.count({
        where: {
          AND: [
            { companyId: companyId },
            { isCompleted: false },
            search
              ? {
                  OR: [
                    {
                      shipmentNumber: { contains: search, mode: 'insensitive' },
                    },
                    { launchDate: { gte: search } },
                    { launchDate: { lte: search } },
                    {
                      way: { name: { contains: search, mode: 'insensitive' } },
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
      return { shipments, shipmentCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getFinishedShipments(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const shipments = await this.prisma.shipment.findMany({
        where: {
          AND: [
            { companyId: companyId },
            { isCompleted: true },
            search
              ? {
                  OR: [
                    {
                      shipmentNumber: { contains: search, mode: 'insensitive' },
                    },
                    { launchDate: { gte: search } },
                    { launchDate: { lte: search } },
                    {
                      way: { name: { contains: search, mode: 'insensitive' } },
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
          way: {
            select: {
              name: true,
            },
          },
          currentPoint: {
            select: {
              name: true,
            },
          },
          driver: {
            select: {
              userName: true,
            },
          },
        },
      });
      const shipmentCount = await this.prisma.shipment.count({
        where: {
          AND: [
            { companyId: companyId },
            { isCompleted: true },
            search
              ? {
                  OR: [
                    {
                      shipmentNumber: { contains: search, mode: 'insensitive' },
                    },
                    { launchDate: { gte: search } },
                    { launchDate: { lte: search } },
                    {
                      way: { name: { contains: search, mode: 'insensitive' } },
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
      return { shipments, shipmentCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getShipmentById(shipmentId: string, companyId: string) {
    try {
      const { shipment, clients } = await this.prisma.$transaction(
        async (tx) => {
          const shipment = await tx.shipment.findUnique({
            where: { id: shipmentId, companyId: companyId },
            select: {
              id: true,
              shipmentNumber: true,
              launchDate: true,
              driver: {
                select: {
                  userName: true,
                  phoneNumber: true,
                },
              },
              endDate: true,
              way: {
                select: {
                  name: true,
                },
              },
              currentPoint: {
                select: {
                  name: true,
                },
              },
            },
          });
          const clients = await tx.client.count({
            where: {
              shipments: {
                some: {
                  id: shipmentId,
                },
              },
            },
          });

          return { shipment, clients };
        },
      );
      const shipments = {
        ...shipment,
        clients,
      };
      return shipments;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getShipmentItems(
    shipmentId: string,
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const { shipmentItems, shipmentItemsCount } =
        await this.prisma.$transaction(async (tx) => {
          const shipmentItems = await tx.shipmentItem.findMany({
            where: {
              shipmentId: shipmentId,
              shipment: {
                companyId: companyId,
              },
              ...(search
                ? {
                    OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      {
                        client: {
                          name: { contains: search, mode: 'insensitive' },
                        },
                      },
                    ],
                  }
                : {}),
            },
            skip: (page - 1) * limit,
            take: limit,
            select: {
              id: true,
              client: {
                select: {
                  name: true,
                },
              },
              name: true,
              quantity: true,
              isBreakable: true,
            },
          });
          const shipmentItem = await tx.shipmentItem.findMany({
            where: {
              shipmentId: shipmentId,
              shipment: {
                companyId: companyId,
              },
              ...(search
                ? {
                    OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      {
                        client: {
                          name: { contains: search, mode: 'insensitive' },
                        },
                      },
                    ],
                  }
                : {}),
            },
          });
          const shipmentItemsCount = shipmentItem.reduce((acc, item) => {
            return acc + item.quantity;
          }, 0);
          return { shipmentItems, shipmentItemsCount };
        });
      return { shipmentItems, shipmentItemsCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createNewShipment(Shipment: CreateShipmentDto, companyId: string) {
    try {
      const shipment = await this.prisma.shipment.create({
        data: {
          ...Shipment,
          companyId: companyId,
        },
        select: {
          id: true,
          shipmentNumber: true,
          launchDate: true,
          way: {
            select: {
              name: true,
            },
          },
          driver: {
            select: {
              userName: true,
            },
          },
        },
      });
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  editShipment() {}
  deleteShipment() {}
}
