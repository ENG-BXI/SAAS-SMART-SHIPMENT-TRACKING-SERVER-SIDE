import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { SHIPMENT_STATUS } from 'src/Common/constant/enum-shipment-status';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllClient(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const clients = await this.prisma.client.findMany({
        where: {
          AND: [
            { companyId: companyId },
            search ? { name: { contains: search, mode: 'insensitive' } } : {},
          ],
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          contactWays: {
            select: {
              text: true,
              isPrimary: true,
              contactType: true,
            },
          },
        },
      });
      const clientCount = await this.prisma.client.count({
        where: {
          AND: [
            { companyId: companyId },
            search ? { name: { contains: search, mode: 'insensitive' } } : {},
          ],
        },
      });
      return { clients, clientCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async addNewClient(client: CreateClientDto, companyId: string) {
    try {
      const { newClient, contactWay } = await this.prisma.$transaction(
        async (tx) => {
          const newClient = await tx.client.create({
            data: {
              name: client.name,
              companyId: companyId,
            },
            select: {
              id: true,
              name: true,
              contactWays: {
                select: {
                  id: true,
                  text: true,
                  isPrimary: true,
                  contactType: true,
                },
              },
            },
          });
          const contactWays = client.contactWays.map((contactWay) => ({
            ...contactWay,
            clientId: newClient.id,
          }));
          const contactWay = await tx.contactWay.createMany({
            data: contactWays,
          });
          return { newClient, contactWay };
        },
      );
      return { client: newClient, contactWay };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editClient(client: UpdateClientDto, clientId: string) {
    try {
      const existClient = await this.prisma.client.findUnique({
        where: {
          id: clientId,
        },
      });
      if (!existClient) {
        throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
      }
      const { updatedClient, contactWay } = await this.prisma.$transaction(
        async (tx) => {
          const updatedClient = await tx.client.update({
            where: {
              id: clientId,
            },
            data: {
              name: client.name,
            },
          });
          if (!client.contactWays) return { updatedClient, contactWay: [] };
          await tx.contactWay.deleteMany({
            where: {
              clientId: updatedClient.id,
            },
          });
          const contactWays = client.contactWays.map((contactWay) => ({
            ...contactWay,
            clientId: updatedClient.id,
          }));
          const contactWay = await tx.contactWay.createMany({
            data: contactWays,
          });
          return { updatedClient, contactWay };
        },
      );
      return { client: updatedClient, contactWay };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteClient(clientId: string) {
    try {
      const deletedClient = await this.prisma.client.delete({
        where: {
          id: clientId,
        },
      });
      return deletedClient;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getClientShipmentDetails(clientId: string, shipmentId: string) {
    try {
      const existClient = await this.prisma.client.findUnique({
        where: {
          id: clientId,
        },
      });
      if (!existClient) {
        throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
      }
      const existShipment = await this.prisma.shipment.findUnique({
        where: {
          id: shipmentId,
        },
      });
      if (!existShipment) {
        throw new HttpException('Shipment not found', HttpStatus.BAD_REQUEST);
      }
      const shipmentDetails = await this.prisma.shipment.findUnique({
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
      const shipmentNumber = shipmentDetails?.shipmentNumber;
      const wayPointsLength = shipmentDetails?.way.points.length || 0;
      const firstPoint = shipmentDetails?.way.points[0].name;
      const lastPoint = shipmentDetails?.way.points[wayPointsLength - 1].name;
      const shipmentStatus = shipmentDetails?.isCompleted
        ? SHIPMENT_STATUS.COMPLETED
        : shipmentDetails?.isPaused
          ? SHIPMENT_STATUS.PAUSED
          : SHIPMENT_STATUS.CURRENT;
      const companyName = shipmentDetails?.company.name;
      const _orderOfCurrentPoint =
        shipmentDetails?.way.points.findIndex((val) => {
          return val.id == shipmentDetails?.currentPointId;
        }) || 0;
      const reminderPoint =
        shipmentDetails?.way.points.reduce((pre, cur, idx) => {
          return _orderOfCurrentPoint < idx ? pre + 1 : pre;
        }, 0) || 0;
      const _countOfPrePoint = Math.round(wayPointsLength - reminderPoint);
      const percentageOfPoint = (_countOfPrePoint / wayPointsLength) * 100;
      const shipmentItem = shipmentDetails?.shipmentItems;
      const clientNameAndContactWay = shipmentDetails?.client[0];
      const allPointName = shipmentDetails?.way.points.map((val) => {
        return {
          name: val.name,
          isCurrent: val.id == shipmentDetails?.currentPointId,
        };
      });
      const companyEmployee = shipmentDetails?.company.users[0];
      const driverInfo = shipmentDetails?.driver;
      const nextPoint = shipmentDetails?.isCompleted
        ? null
        : shipmentDetails?.way.points[_orderOfCurrentPoint + 1];

      const responseData = {
        shipmentNumber,
        wayPointsLength,
        firstPoint,
        lastPoint,
        shipmentStatus,
        companyName,
        reminderPoint,
        percentageOfPoint,
        shipmentItem,
        clientNameAndContactWay,
        allPointName,
        companyEmployee,
        driverInfo,
        nextPoint,
      };
      return responseData;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
