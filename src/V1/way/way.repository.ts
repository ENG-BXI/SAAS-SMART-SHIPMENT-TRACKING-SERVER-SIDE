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
            name: true,
            order: true,
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
        name: point.name,
        order: point.order,
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
  async updateWay(way: UpdateWayDto, wayId: string) {
    const updatedWay = await this.prisma.$transaction(async (tx) => {
      const updatedWay = await tx.way.update({
        where: { id: wayId },
        data: {
          name: way.name,
        },
      });
      const Points = way.points?.map((point) => ({
        name: point.name,
        order: point.order,
        wayId: updatedWay.id,
      }));
      if (Points) {
        await tx.point.deleteMany({
          where: { wayId: updatedWay.id },
        });
        await tx.point.createMany({
          data: Points,
        });
      }
      return await tx.way.findFirstOrThrow({
        where: { id: wayId },
        include:{points:true}
      })
    });
    return updatedWay;
  }
  async deleteWay(wayId: string, companyId: string) {
    const deletedWay = await this.prisma.way.delete({
      where: { id: wayId, companyId: companyId },
    });
    return deletedWay;
  }
}
