import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateClientDto } from './dto/update-client.dto';

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
            text: contactWay.text,
            isPrimary: contactWay.isPrimary,
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
}
