import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller(':id/client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}
  @Post()
  addNewClient(@Body() client: CreateClientDto, @Param() params: {id: string}) {
    return this.clientService.addNewClient(client, params.id);
  }

}
