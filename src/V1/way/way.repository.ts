import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWayDto } from './dto/create-way.dto';
import { UpdateWayDto } from './dto/update-way.dto';

@Injectable()
export class WayRepository {
  constructor(private prisma: PrismaService) {}

  async getWays(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    const ways = await this.prisma.way.findMany({
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
        points: {
          select: {
            id: true,
            name: true,
            order: true,
            lat: true,
            lng: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    return ways;
  }
  async getCountOfWays(companyId: string, search?: string) {
    const wayCount = await this.prisma.way.count({
      where: {
        AND: [
          { companyId: companyId },
          search ? { name: { contains: search, mode: 'insensitive' } } : {},
        ],
      },
    });
    return wayCount;
  }
  async createWay(way: CreateWayDto, companyId: string) {
    const newWay = await this.prisma.$transaction(async (tx) => {
      const newWay = await tx.way.create({
        data: {
          name: way.name,
          companyId: companyId,
        },
      });
      const Points = way.points.map((point) => ({
        ...point,
        wayId: newWay.id,
      }));
      await tx.point.createMany({
        data: Points,
      });
      return await tx.way.findFirstOrThrow({
        where: { id: newWay.id, companyId },
        include: { points: true },
      });
    });
    return newWay;
  }
  async getWayById(wayId: string, companyId: string) {
    const way = await this.prisma.way.findUnique({
      where: { id: wayId, companyId: companyId },
    });
    return way;
  }
  async updateWay(way: UpdateWayDto, wayId: string, companyId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const updatedWay = await tx.way.update({
        where: { id: wayId, companyId },
        data: { name: way.name },
        select: { id: true, points: { select: { id: true } } },
      });
      if (way.points) {
        const existingIds = new Set(updatedWay.points.map((p) => p.id));
        const incomingIds = new Set(
          way.points.filter((p) => p.id).map((p) => p.id as string),
        );

        const idsToDelete = [...existingIds].filter(
          (id) => !incomingIds.has(id),
        );

        if (idsToDelete.length) {
          await tx.point.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        await Promise.all(
          way.points.map((point) => {
            if (point.id && existingIds.has(point.id)) {
              return tx.point.update({
                where: { id: point.id },
                data: {
                  name: point.name,
                  order: point.order,
                  lat: point.lat,
                  lng: point.lng,
                },
              });
            }
            return tx.point.create({
              data: {
                name: point.name,
                order: point.order,
                lat: point.lat,
                lng: point.lng,
                wayId: updatedWay.id,
              },
            });
          }),
        );
      }

      return tx.way.findFirstOrThrow({
        where: { id: wayId },
        include: { points: true },
      });
    });
  }
  async deleteWay(wayId: string, companyId: string) {
    const deletedWay = await this.prisma.way.delete({
      where: { id: wayId, companyId: companyId },
    });
    return deletedWay;
  }
}
