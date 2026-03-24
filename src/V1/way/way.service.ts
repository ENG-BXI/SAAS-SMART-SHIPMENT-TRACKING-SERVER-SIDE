import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWayDto } from './dto/create-way.dto';
import { UpdateWayDto } from './dto/update-way.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WayService {
  constructor(private prisma: PrismaService) {}
  async getAllWays(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
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
      const wayCount = await this.prisma.way.count({
        where: {
          AND: [
            { companyId: companyId },
            search ? { name: { contains: search, mode: 'insensitive' } } : {},
          ],
        },
      });
      return { ways, wayCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createWay(way: CreateWayDto, companyId: string) {
    try {
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
        return newWay;
      });
      return newWay;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editWay(way: UpdateWayDto, wayId: string, companyId: string) {
    try {
      const updatedWay = await this.prisma.$transaction(async (tx) => {
        const existingWay = await tx.way.findUnique({
          where: { id: wayId, companyId: companyId },
        });
        // Check if way is used in any shipment
        if (!existingWay) {
          throw new HttpException('Way not found', HttpStatus.BAD_REQUEST);
        }

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
        return updatedWay;
      });
      return { updatedWay };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteWay(wayId: string, companyId: string) {
    try {
      // Check if way is used in any shipment
      const existingWay = await this.prisma.way.findUnique({
        where: { id: wayId, companyId: companyId },
      });
      if (!existingWay) {
        throw new HttpException('Way not found', HttpStatus.BAD_REQUEST);
      }
      const deletedWay = await this.prisma.way.delete({
        where: { id: wayId, companyId: companyId },
      });
      return deletedWay;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
