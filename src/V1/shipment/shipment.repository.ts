import { PrismaService } from 'src/prisma/prisma.service';
import {
  IAddShipmentItem,
  IEditShipmentItem,
} from './interfaces/shipment-item';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateShipmentItemDto } from './dto/update-shipment-item.dto';
import { CreateShipmentItemDto } from './dto/create-shipment-item.dto';
@Injectable()
export class ShipmentRepository {
  constructor(private prisma: PrismaService) {}
  async getAllShipment({
    companyId,
    limit,
    page,
    isCompleted,
    search,
  }: {
    companyId: string;
    page: number;
    limit: number;
    isCompleted?: boolean;
    search?: string;
  }) {
    return await this.prisma.shipment.findMany({
      where: {
        AND: [
          { companyId: companyId },
          { isCompleted },
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
  async getCountOfShipment({
    companyId,
    search,
    isCompleted,
  }: {
    companyId: string;
    search?: string;
    isCompleted?: boolean;
  }) {
    return await this.prisma.shipment.count({
      where: {
        AND: [
          { companyId: companyId },
          { isCompleted },
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
  async getShipmentById(shipmentId: string, companyId: string) {
    return await this.prisma.shipment.findUnique({
      where: { id: shipmentId, companyId: companyId },
      select: {
        id: true,
        shipmentNumber: true,
        launchDate: true,
        isCompleted: true,
        isPaused: true,
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
  }
  async createNewShipment(Shipment: CreateShipmentDto, companyId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const isWayExist = await tx.way.findUnique({
        where: { id: Shipment.wayId, companyId: companyId },
        select: { id: true },
      });
      if (!isWayExist) {
        throw new HttpException('Way not found', HttpStatus.NOT_FOUND);
      }
      const firstPointInWay = await tx.point.findFirst({
        where: { wayId: Shipment.wayId },
        orderBy: { order: 'asc' },
        select: { id: true },
      });
      if (!firstPointInWay?.id) {
        throw new HttpException(
          'Way has no points in Way to start shipment',
          HttpStatus.BAD_REQUEST,
        );
      }
      const shipment = await tx.shipment.create({
        data: {
          ...Shipment,
          companyId: companyId,
          currentPointId: firstPointInWay?.id,
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
              email: true,
            },
          },
        },
      });
      return { shipment };
    });
  }
  async editShipment(
    companyId: string,
    shipmenId: string,
    Shipment: UpdateShipmentDto,
  ) {
    return await this.prisma.shipment.update({
      where: { id: shipmenId, companyId: companyId },
      data: Shipment,
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
  }
  async deleteShipment(companyId: string, shipmenId: string) {
    return await this.prisma.shipment.delete({
      where: { id: shipmenId, companyId: companyId },
    });
  }
  async getCountOfClientInShipment(shipmentId: string) {
    return await this.prisma.client.count({
      where: {
        shipments: {
          some: {
            id: shipmentId,
          },
        },
      },
    });
  }
  async getShipmentItem(
    companyId: string,
    shipmentId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    return await this.prisma.shipmentItem.findMany({
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
            id: true,
            name: true,
          },
        },
        name: true,
        quantity: true,
        isBreakable: true,
      },
    });
  }
  async getCountOfShipmentItemInShipment(
    companyId: string,
    shipmentId: string,
    search?: string,
  ) {
    return await this.prisma.shipmentItem.count({
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
  }
  async isShipmentExist(shipmentId: string) {
    return await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });
  }
  async isShipmentItemExist(shipmentItemId: string) {
    return await this.prisma.shipmentItem.findUnique({
      where: { id: shipmentItemId },
    });
  }
  async addShipmentItem(
    shipmentId: string,
    createShipmentItem: CreateShipmentItemDto,
  ) {
    return await await this.prisma.$transaction(async (tx) => {
      const existShipment = await tx.shipment.findUnique({
        where: { id: shipmentId },
      });
      if (!existShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      const existClient = await tx.client.findUnique({
        where: { id: createShipmentItem.clientId },
      });
      if (!existClient) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
      const client = await tx.client.update({
        where: { id: createShipmentItem.clientId },
        data: {
          shipments: { connect: { id: shipmentId } },
        },
      });
      const data = createShipmentItem.items.map((item) => {
        return {
          clientId: createShipmentItem.clientId,
          name: item.name,
          quantity: item.quantity,
          isBreakable: item.isBreakable,
          shipmentId: shipmentId,
        };
      });
      const shipmentItem = await tx.shipmentItem.createMany({
        data,
      });
      return { client, shipmentItem };
    });
  }
  async editShipmentItem(
    shipmentItemId: string,
    updateShipmentItem: UpdateShipmentItemDto,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const existShipmentItem = await tx.shipmentItem.findUnique({
        where: { id: shipmentItemId },
      });
      if (!existShipmentItem) {
        throw new HttpException(
          'Shipment item not found',
          HttpStatus.NOT_FOUND,
        );
      }
      const existClient = await tx.client.findUnique({
        where: { id: updateShipmentItem.clientId },
      });
      if (!existClient) {
        throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
      }
      const data = {
        name: updateShipmentItem.items?.[0]?.name,
        quantity: updateShipmentItem.items?.[0]?.quantity,
        isBreakable: updateShipmentItem.items?.[0]?.isBreakable,
      };
      const shipmentItem = await tx.shipmentItem.update({
        where: { id: shipmentItemId },
        data: {
          ...data,
          client: { connect: { id: updateShipmentItem.clientId } },
        },
      });
      return shipmentItem;
    });
  }
  async deleteShipmentItem(shipmentItemId: string) {
    return await this.prisma.shipmentItem.delete({
      where: { id: shipmentItemId },
    });
  }
  async isShipmentComplete(companyId: string, shipmentId: string) {
    return await this.prisma.shipment.findUnique({
      where: { id: shipmentId, companyId: companyId, isCompleted: true },
    });
  }
  // Movement
  async MoveShipment(shipmenId: string, companyId: string, wayId: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Get Order From Current Point
      const currentPoint = await tx.shipment.findUnique({
        where: { id: shipmenId, companyId: companyId },
        select: {
          currentPointId: true,
          currentPoint: { select: { order: true } },
        },
      });
      // Get Next Point
      const nextPoint = currentPoint?.currentPoint?.order! + 1;

      // Find Next Point
      const NextPoint = await tx.point.findFirst({
        where: { order: nextPoint, wayId },
        select: { id: true },
      });
      // Check if Next Point Exist
      if (!NextPoint) {
        throw new HttpException(
          'Next point not found Check Your Way',
          HttpStatus.NOT_FOUND,
        );
      }
      // Get Last Point
      const lastPoint = await tx.point.findFirst({
        where: { wayId },
        select: { id: true },
        orderBy: { order: 'desc' },
      });
      const isComplete = lastPoint?.id === NextPoint.id;
      // Update Shipment
      const shipment = await tx.shipment.update({
        where: { id: shipmenId, companyId: companyId },
        data: {
          currentPointId: NextPoint.id,
          isCompleted: isComplete,
          endDate: isComplete ? new Date() : null,
          isPaused: false,
        },
        select: {
          id: true,
          companyId: true,
          shipmentNumber: true,
          launchDate: true,
          endDate: true,
          wayId: true,
          way:{select:{name:true}},
          currentPointId: true,
          driverId: true,
          isPaused: true,
          isCompleted: true,
        },
      });
      return { shipment };
    });
  }
  async pauseShipment(companyId: string, shipmentId: string) {
    return await this.prisma.shipment.update({
      where: { id: shipmentId, companyId: companyId },
      data: { isPaused: true },
    });
  }
  async resumeShipment(companyId: string, shipmentId: string) {
    return await this.prisma.shipment.update({
      where: { id: shipmentId, companyId: companyId },
      data: { isPaused: false },
    });
  }
  async getShipmentWithShipmentItemWithWatWithCompanyWithClientWithDriver(
    shipmentId: string,
    clientId: string,
  ) {
    return await this.prisma.shipment.findUnique({
      where: {
        id: shipmentId,
      },
      select: {
        shipmentNumber: true,
        isCompleted: true,
        isPaused: true,
        launchDate: true,
        shipmentItems: {
          where: { clientId },
          select: { name: true, quantity: true, isBreakable: true },
        },
        way: {
          select: {
            points: {
              select: {
                id: true,
                name: true,
              },
              orderBy: { order: 'asc' },
            },
            name: true,
          },
        },
        company: {
          select: {
            name: true,
            users: {
              select: { email: true, userName: true },
              where: { isEmployee: true },
              take: 1,
              orderBy: { createAt: 'asc' },
            },
          },
        },
        client: {
          take: 1,
          where: { id: clientId },
          select: {
            name: true,
            contactWays: {
              select: { text: true, contactType: true, isPrimary: true },
            },
          },
        },
        driver: {
          select: { userName: true, phoneNumber: true, email: true },
        },
        currentPointId: true,
      },
    });
  }
}
