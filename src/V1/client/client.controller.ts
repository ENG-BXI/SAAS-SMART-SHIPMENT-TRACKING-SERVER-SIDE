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
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import type { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';

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
}
