import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  ParseIntPipe,
  UnauthorizedException,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller({ path: 'shipment', version: '1' })
@UseGuards(AuthGuard)
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}
  @Get()
  async getAllShipments(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const shipments = await this.shipmentService.getCurrentShipments(
      req.user.companyId,
      page,
      limit,
      search,
    );
    const totalPages = Math.ceil(shipments.shipmentCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page !== 1;
    return {
      data: {
        data: shipments.shipments,
        totalCount: shipments.shipmentCount,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
      message: 'Shipments fetched successfully',
      status: HttpStatus.OK,
    };
  }
  @Get(':id')
  async getShipmentById(@Param('id') shipmentId: string, @Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const shipment = await this.shipmentService.getShipmentById(
      shipmentId,
      req.user.companyId,
    );
    return {
      data: shipment,
      message: 'Shipment fetched successfully',
      status: HttpStatus.OK,
    };
  }
  @Get(':id/items')
  async getShipmentItems(
    @Param('id') shipmentId: string,
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const shipmentItems = await this.shipmentService.getShipmentItems(
      shipmentId,
      req.user.companyId,
      page,
      limit,
      search,
    );
    const totalPages = Math.ceil(shipmentItems.shipmentItemsCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page !== 1;
    return {
      data: {
        data: shipmentItems.shipmentItems,
        totalCount: shipmentItems.shipmentItemsCount,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
      message: 'Shipment items fetched successfully',
      status: HttpStatus.OK,
    };
  }
  @Post()
  async createNewShipment(
    @Body(new ValidationPipe()) shipmentDto: CreateShipmentDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const shipment = await this.shipmentService.createNewShipment(
      shipmentDto,
      req.user.companyId,
    );
    return {
      data: shipment,
      message: 'Shipment created successfully',
      status: HttpStatus.OK,
    };
  }
}
