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
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller({ path: 'client', version: '1' })
@UseGuards(AuthGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}
  @Get()
  async getAllClients(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const clients = await this.clientService.getAllClient(req.user.companyId);
    return {
      data: clients,
      message: 'Clients fetched successfully',
      status: HttpStatus.OK,
    };
  }
  @Post()
  async addNewClient(@Body(new ValidationPipe()) client: CreateClientDto, @Req() req: Request) {
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
  @Put(':id')
  async editClient(
    @Body(new ValidationPipe()) client: UpdateClientDto,
    @Param('id') clientId: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const updatedClient = await this.clientService.editClient(
      client,
      clientId,
      req.user.companyId,
    );
    return {
      data: updatedClient,
      message: 'Client updated successfully',
      status: HttpStatus.OK,
    };
  }
  @Delete(':id')
  async deleteClient(
    @Param('id') clientId: string,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const deletedClient = await this.clientService.deleteClient(
      clientId,
      req.user.companyId,
    );
    return {
      data: deletedClient,
      message: 'Client deleted successfully',
      status: HttpStatus.OK,
    };
  }
}
