import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllClient(companyId: string) {
    try {
      const clients = await this.prisma.client.findMany({
        where: { companyId: companyId },
        select: {
          name: true,
          contactWays: {
            where: { isPrimary: true },
            select: { text: true },
          },
        },
      });
      return clients;
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
}
