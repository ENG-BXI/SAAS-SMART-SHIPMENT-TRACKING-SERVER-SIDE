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
  Put,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateShipmentItemDto } from './dto/create-shipment-item.dto';

@Controller({ path: 'shipment', version: '1' })
@UseGuards(AuthGuard)
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}
  @Get('current')
  async getCurrentShipments(
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
  @Get('finished')
  async getFinishedShipment(
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
    const shipments = await this.shipmentService.getFinishedShipments(
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
  @Put(':id')
  async editShipment(
    @Param('id') shipmentId: string,
    @Body(new ValidationPipe()) shipmentDto: UpdateShipmentDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const shipment = await this.shipmentService.editShipment(
      shipmentId,
      shipmentDto,
      req.user.companyId,
    );
    return {
      data: shipment,
      message: 'Shipment updated successfully',
      status: HttpStatus.OK,
    };
  }
  @Delete(':id')
  async deleteShipment(@Param('id') shipmentId: string, @Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const shipment = await this.shipmentService.deleteShipment(
      shipmentId,
      req.user.companyId,
    );
    return {
      data: shipment,
      message: 'Shipment deleted successfully',
      status: HttpStatus.OK,
    };
  }
  ///
  ///
  /// Shipment Item
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
  @Post(':id/add-client-and-shipment-item')
  async addClientAndShipmentItem(
    @Param('id') shipmentId: string,
    @Body(new ValidationPipe()) createShipmenItem: CreateShipmentItemDto,
  ) {
    const shipmentItem = await this.shipmentService.addClientAndShipmentItem(
      shipmentId,
      createShipmenItem,
    );
    return {
      data: shipmentItem,
      message: 'Client and shipment item added successfully',
      status: HttpStatus.OK,
    };
  }

  //TODO: Edit Shipment Item

  //TODO: Delete Shipment Item

  // Movement
  @Put(':id/move-shipment-with-notification')
  async moveShipmentWithNotification(
    @Param('id') shipmentId: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const shipment = await this.shipmentService.MoveShipmentWithNotification(
      shipmentId,
      req.user.companyId,
    );
    return {
      data: shipment,
      message: 'Shipment moved successfully',
      status: HttpStatus.OK,
    };
  }
  @Put(':id/move-shipment-without-notification')
  async moveShipmentWithoutNotification(
    @Param('id') shipmentId: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const shipment = await this.shipmentService.MoveShipmentWithoutNotification(
      shipmentId,
      req.user.companyId,
    );
    return {
      data: shipment,
      message: 'Shipment moved successfully',
      status: HttpStatus.OK,
    };
  }
  @Put(':id/pause-shipment')
  async pauseShipment(@Param('id') shipmentId: string, @Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const shipment = await this.shipmentService.pauseShipment(
      shipmentId,
      req.user.companyId,
    );
    return {
      data: shipment,
      message: 'Shipment paused successfully',
      status: HttpStatus.OK,
    };
  }
  @Put(':id/resume-shipment')
  async resumeShipment(@Param('id') shipmentId: string, @Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const shipment = await this.shipmentService.resumeShipment(
      shipmentId,
      req.user.companyId,
    );
    return {
      data: shipment,
      message: 'Shipment resumed successfully',
      status: HttpStatus.OK,
    };
  }
}
