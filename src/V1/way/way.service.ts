import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWayDto } from './dto/create-way.dto';
import { UpdateWayDto } from './dto/update-way.dto';
import { WayRepository } from './way.repository';

@Injectable()
export class WayService {
  constructor(
    private wayRepository: WayRepository,
  ) {}
  async getAllWays(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const [ways, wayCount] = await Promise.all([
        this.wayRepository.getWays(companyId, page, limit, search),
        this.wayRepository.getCountOfWays(companyId, search),
      ]);
      return { ways, wayCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createWay(way: CreateWayDto, companyId: string) {
    try {
      const newWay = await this.wayRepository.createWay(way, companyId);
      return newWay;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editWay(way: UpdateWayDto, wayId: string, companyId: string) {
    try {
      const existingWay = this.wayRepository.getWayById(wayId, companyId);
      // Check if way is used in any shipment
      if (!existingWay) {
        throw new HttpException('Way not found', HttpStatus.BAD_REQUEST);
      }
      const updatedWay = await this.wayRepository.updateWay(way, wayId);
      return { updatedWay };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteWay(wayId: string, companyId: string) {
    try {
      // Check if way is used in any shipment
      const existingWay = await this.wayRepository.getWayById(wayId, companyId);
      if (!existingWay) {
        throw new HttpException('Way not found', HttpStatus.BAD_REQUEST);
      }
      const deletedWay = await this.wayRepository.deleteWay(wayId, companyId);
      return deletedWay;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
