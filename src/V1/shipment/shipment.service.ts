import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShipmentItemDto } from './dto/create-shipment-item.dto';
import { UpdateShipmentItemDto } from './dto/update-shipment-item.dto';

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
          endDate: true,
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
          if (!shipment) {
            throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
          }
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
                  id: true,
                  name: true,
                },
              },
              name: true,
              quantity: true,
              isBreakable: true,
            },
          });
          // const shipmentItems = await tx.client.findMany({
          //   where: {
          //     companyId: companyId,
          //     shipmentItems: {
          //       some: {
          //         shipmentId: shipmentId,
          //       },
          //     },
          //     ...(search
          //       ? {
          //           OR: [
          //             { name: { contains: search, mode: 'insensitive' } },
          //             {
          //               shipmentItems: {
          //                 some: {
          //                   name: { contains: search, mode: 'insensitive' },
          //                 },
          //               },
          //             },
          //           ],
          //         }
          //       : {}),
          //   },
          //   skip: (page - 1) * limit,
          //   take: limit,
          //   select: {
          //     id: true,
          //     name: true,
          //     shipmentItems: {
          //       select: {
          //         name: true,
          //         quantity: true,
          //         isBreakable: true,
          //       },
          //     },
          //   },
          // });
          const shipmentItemsCount = await this.prisma.shipmentItem.count({
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

          return { shipmentItems, shipmentItemsCount };
        });

      return {
        shipmentItems,
        shipmentItemsCount,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async addClientAndShipmentItem(
    shipmentId: string,
    createShipmenItem: CreateShipmentItemDto,
  ) {
    try {
      const shipmentItem = await this.prisma.$transaction(async (tx) => {
        const existShipment = await tx.shipment.findUnique({
          where: { id: shipmentId },
        });
        if (!existShipment) {
          throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
        }
        const existClient = await tx.client.findUnique({
          where: { id: createShipmenItem.clientId },
        });
        if (!existClient) {
          throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
        }
        const data = createShipmenItem.items.map((item) => {
          return {
            clientId: createShipmenItem.clientId,
            name: item.name,
            quantity: item.quantity,
            isBreakable: item.isBreakable,
            shipmentId: shipmentId,
          };
        });
        const shipmentItem = await tx.shipmentItem.createMany({
          data,
        });
        return shipmentItem;
      });
      return shipmentItem;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateShipmentItem(
    shipmentItemId: string,
    updateShipmenItem: UpdateShipmentItemDto,
  ) {
    try {
      const shipmentItem = await this.prisma.$transaction(async (tx) => {
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
          where: { id: updateShipmenItem.clientId },
        });
        if (!existClient) {
          throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
        }
        const data = {
          name: updateShipmenItem.items?.[0]?.name,
          quantity: updateShipmenItem.items?.[0]?.quantity,
          isBreakable: updateShipmenItem.items?.[0]?.isBreakable,
        };
        const shipmentItem = await tx.shipmentItem.update({
          where: { id: shipmentItemId },
          data: {
            ...data,
            client: { connect: { id: updateShipmenItem.clientId } },
          },
        });
        return shipmentItem;
      });
      return shipmentItem;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteShipmentItem(shipmentItemId: string) {
    try {
      const shipmentItem = await this.prisma.$transaction(async (tx) => {
        const existShipmentItem = await tx.shipmentItem.findUnique({
          where: { id: shipmentItemId },
        });
        if (!existShipmentItem) {
          throw new HttpException(
            'Shipment item not found',
            HttpStatus.NOT_FOUND,
          );
        }
        const shipmentItem = await tx.shipmentItem.delete({
          where: { id: shipmentItemId },
        });
        return shipmentItem;
      });
      return shipmentItem;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createNewShipment(Shipment: CreateShipmentDto, companyId: string) {
    try {
      const { shipment } = await this.prisma.$transaction(async (tx) => {
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
              },
            },
          },
        });
        return { shipment };
      });
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editShipment(
    shipmenId: string,
    Shipment: UpdateShipmentDto,
    companyId: string,
  ) {
    try {
      const existingShipment = await this.prisma.shipment.findUnique({
        where: { id: shipmenId, companyId: companyId },
      });
      if (!existingShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      const shipment = await this.prisma.shipment.update({
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
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteShipment(shipmenId: string, companyId: string) {
    try {
      const existingShipment = await this.prisma.shipment.findUnique({
        where: { id: shipmenId, companyId: companyId },
      });
      if (!existingShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      const shipment = await this.prisma.shipment.delete({
        where: { id: shipmenId, companyId: companyId },
      });
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  // Movement
  async MoveShipmentWithNotification(shipmenId: string, companyId: string) {
    try {
      const { shipment } = await this.prisma.$transaction(async (tx) => {
        // Check if Shipment Exist
        const existingShipment = await tx.shipment.findUnique({
          where: { id: shipmenId, companyId: companyId },
        });
        if (!existingShipment) {
          throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
        }
        // Check if Shipment is Completed
        const isShipmentComplete = await tx.shipment.findUnique({
          where: { id: shipmenId, companyId: companyId, isCompleted: true },
        });
        if (isShipmentComplete) {
          throw new HttpException(
            'Shipment is already completed',
            HttpStatus.BAD_REQUEST,
          );
        }
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
          where: { order: nextPoint, wayId: existingShipment.wayId },
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
          where: { wayId: existingShipment.wayId },
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
        });
        // Add Notification
        return { shipment };
      });
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async MoveShipmentWithoutNotification(shipmenId: string, companyId: string) {
    try {
      const { shipment } = await this.prisma.$transaction(async (tx) => {
        // Check if Shipment Exist
        const existingShipment = await tx.shipment.findUnique({
          where: { id: shipmenId, companyId: companyId },
        });
        if (!existingShipment) {
          throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
        }
        // Check if Shipment is Completed
        const isShipmentComplete = await tx.shipment.findUnique({
          where: { id: shipmenId, companyId: companyId, isCompleted: true },
        });
        if (isShipmentComplete) {
          throw new HttpException(
            'Shipment is already completed',
            HttpStatus.BAD_REQUEST,
          );
        }
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
          where: { order: nextPoint, wayId: existingShipment.wayId },
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
          where: { wayId: existingShipment.wayId },
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
        });
        return { shipment };
      });
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async pauseShipment(shipmentId: string, companyId: string) {
    try {
      const { shipment } = await this.prisma.$transaction(async (tx) => {
        // Check if Shipment Exist
        const existingShipment = await tx.shipment.findUnique({
          where: { id: shipmentId, companyId: companyId },
        });
        if (!existingShipment) {
          throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
        }
        // Check if Shipment is Completed
        const isShipmentComplete = await tx.shipment.findUnique({
          where: { id: shipmentId, companyId: companyId, isCompleted: true },
        });
        if (isShipmentComplete) {
          throw new HttpException(
            'Shipment is already completed',
            HttpStatus.BAD_REQUEST,
          );
        }
        // Update Shipment
        const shipment = await tx.shipment.update({
          where: { id: shipmentId, companyId: companyId },
          data: { isPaused: true },
        });
        return { shipment };
      });
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async resumeShipment(shipmentId: string, companyId: string) {
    try {
      const { shipment } = await this.prisma.$transaction(async (tx) => {
        // Check if Shipment Exist
        const existingShipment = await tx.shipment.findUnique({
          where: { id: shipmentId, companyId: companyId },
        });
        if (!existingShipment) {
          throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
        }
        // Check if Shipment is Completed
        const isShipmentNotPaused = await tx.shipment.findUnique({
          where: { id: shipmentId, companyId: companyId, isPaused: false },
        });
        if (isShipmentNotPaused) {
          throw new HttpException(
            'Shipment is already running',
            HttpStatus.BAD_REQUEST,
          );
        }
        // Update Shipment
        const shipment = await tx.shipment.update({
          where: { id: shipmentId, companyId: companyId },
          data: { isPaused: false },
        });
        return { shipment };
      });
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
