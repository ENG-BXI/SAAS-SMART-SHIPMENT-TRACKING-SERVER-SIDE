import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
  Query,
  ParseIntPipe,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { WayService } from './way.service';
import { CreateWayDto } from './dto/create-way.dto';
import { UpdateWayDto } from './dto/update-way.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';
import { IResponseWithPagination } from 'src/Common/interfaces/IResponseWithPagination.interface';

@Controller({ path: 'way', version: '1' })
@UseGuards(AuthGuard)
export class WayController {
  constructor(private readonly wayService: WayService) {}
  @Get()
  async getAllWays(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
  ): Promise<IResponseWithPagination> {
    if (!req.user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const ways = await this.wayService.getAllWays(
      req.user.companyId,
      page,
      limit,
      search,
    );
    const totalPages = Math.ceil(ways.wayCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page !== 1;
    return {
      data: {
        data: ways.ways,
        totalCount: ways.wayCount,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
      message: 'Ways fetched successfully',
      status: HttpStatus.OK,
    };
  }
  @Post()
  async createWay(
    @Body(new ValidationPipe()) way: CreateWayDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const newWay = await this.wayService.createWay(way, req.user.companyId);
    return {
      data: newWay,
      message: 'Way created successfully',
      status: HttpStatus.OK,
    };
  }
  @Put(':id')
  async editWay(
    @Body(new ValidationPipe()) way: UpdateWayDto,
    @Param('id') wayId: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const updatedWay = await this.wayService.editWay(
      way,
      wayId,
      req.user.companyId,
    );
    return {
      data: updatedWay,
      message: 'Way updated successfully',
      status: HttpStatus.OK,
    };
  }
  @Delete(':id')
  async deleteWay(@Param('id') wayId: string, @Req() req: Request) {
    if (!req.user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    const deletedWay = await this.wayService.deleteWay(
      wayId,
      req.user.companyId,
    );
    return {
      data: deletedWay,
      message: 'Way deleted successfully',
      status: HttpStatus.OK,
    };
  }
}
