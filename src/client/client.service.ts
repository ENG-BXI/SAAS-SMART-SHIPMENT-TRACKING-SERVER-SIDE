import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}
  async addNewClient(client: CreateClientDto, companyId: string) {
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
  }
}
