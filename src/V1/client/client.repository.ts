import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ClientRepository {
  constructor(private prisma: PrismaService) {}
  async getAllClient(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    return this.prisma.client.findMany({
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
  }
  async getCountOfClient(companyId: string, search?: string) {
    return await this.prisma.client.count({
      where: {
        AND: [
          { companyId: companyId },
          search ? { name: { contains: search, mode: 'insensitive' } } : {},
        ],
      },
    });
  }
  async addClient(client: CreateClientDto, companyId: string) {
    return await this.prisma.$transaction(async (tx) => {
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
    });
  }
  async isClientExist(clientId: string) {
    return await this.prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });
  }
  async editClient(client: UpdateClientDto, clientId: string) {
    return await this.prisma.$transaction(async (tx) => {
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
    });
  }
  async deleteClient(clientId: string) {
    return await this.prisma.client.delete({
      where: {
        id: clientId,
      },
    });
  }
}
