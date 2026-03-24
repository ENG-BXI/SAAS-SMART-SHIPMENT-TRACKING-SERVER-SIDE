import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShipmentService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllShipments(
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
      const { shipment, clients, shipmentItems, shipmentItemsCount } =
        await this.prisma.$transaction(async (tx) => {
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
          const shipmentItems = await tx.shipmentItem.findMany({
            where: {
              shipmentId: shipmentId,
            },
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
          const shipmentItemsCount = shipmentItems.reduce((acc, item) => {
            return acc + item.quantity;
          }, 0);
          return { shipment, clients, shipmentItems, shipmentItemsCount };
        });
      const shipments = {
        ...shipment,
        clients,
        shipmentItems,
        shipmentItemsCount,
      };
      return shipments;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  createNewShipment() {}
  editShipment() {}
  deleteShipment() {}
}
