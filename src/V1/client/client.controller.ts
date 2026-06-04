import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  Req,
  UseGuards,
  UnauthorizedException,
  ValidationPipe,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateClientDto } from './dto/update-client.dto';
import { IResponseWithPagination } from 'src/Common/interfaces/IResponseWithPagination.interface';

@Controller({ path: 'client', version: '1' })
export class ClientController {
  constructor(private readonly clientService: ClientService) {}
  @UseGuards(AuthGuard)
  @Get()
  async getAllClients(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) pageQuery: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limitQuery: number,
    @Query('search') search?: string,
  ): Promise<IResponseWithPagination> {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const page = pageQuery || 1;
    const limit = limitQuery || 10;
    const clients = await this.clientService.getAllClient(
      req.user.companyId,
      page,
      limit,
      search,
    );
    const totalPages = Math.ceil(clients.clientCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page !== 1;
    return {
      data: {
        data: clients.clients,
        totalCount: clients.clientCount,
        currentPage: page,
        pageSize: limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
      message: 'Clients fetched successfully',
      status: HttpStatus.OK,
    };
  }
  @UseGuards(AuthGuard)
  @Post()
  async addNewClient(
    @Body(new ValidationPipe()) client: CreateClientDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const newClient = await this.clientService.addNewClient(
      client,
      req.user.companyId,
    );
    return {
      data: newClient,
      message: 'Client created successfully',
      status: HttpStatus.OK,
    };
  }
  @UseGuards(AuthGuard)
  @Put(':id')
  async editClient(
    @Body(new ValidationPipe()) client: UpdateClientDto,
    @Param('id') clientId: string,
  ) {
    const updatedClient = await this.clientService.editClient(client, clientId);
    return {
      data: updatedClient,
      message: 'Client updated successfully',
      status: HttpStatus.OK,
    };
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteClient(@Param('id') clientId: string) {
    const deletedClient = await this.clientService.deleteClient(clientId);
    return {
      data: deletedClient,
      message: 'Client deleted successfully',
      status: HttpStatus.OK,
    };
  }
  // TODO: Add Client Shipment Details API (GET)
  @Get('/:clientId/shipment/:shipmentId')
  async getClientShipmentDetails(
    @Param('clientId') clientId: string,
    @Param('shipmentId') shipmentId: string,
  ) {
    const shipmentDetails = await this.clientService.getClientShipmentDetails(
      clientId,
      shipmentId,
    );
    return {
      data: shipmentDetails,
      message: 'Client shipment details fetched successfully',
      status: HttpStatus.OK,
    };
  }
}
