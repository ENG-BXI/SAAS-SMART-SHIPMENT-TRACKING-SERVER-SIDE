import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientRepository } from './client.repository';
import { ShipmentRepository } from '../shipment/shipment.repository';
import { ClientMapper } from './client.mapper';
import { GatewayService } from '../gateway/gateway.service';
import { ClientEvent } from './cilent.event';
import { StatisticsEvent } from '../statistics/statistics.event';

@Injectable()
export class ClientService {
  constructor(
    private clientRepository: ClientRepository,
    private shipmentRepository: ShipmentRepository,
    private gatewayService: GatewayService,
  ) {}
  async getAllClient(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const clients = await this.clientRepository.getAllClient(
        companyId,
        page,
        limit,
        search,
      );
      const clientCount = await this.clientRepository.getCountOfClient(
        companyId,
        search,
      );
      return { clients, clientCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async addNewClient(client: CreateClientDto, companyId: string) {
    try {
      const { newClient, contactWay } = await this.clientRepository.addClient(
        client,
        companyId,
      );
      this.gatewayService.emit(ClientEvent.ADD, newClient, companyId);
      this.gatewayService.emit(StatisticsEvent.MANAGER, {}, companyId);

      return { client: newClient, contactWay };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editClient(client: UpdateClientDto, clientId: string) {
    try {
      const existClient = await this.clientRepository.isClientExist(clientId);
      if (!existClient) {
        throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
      }
      const { updatedClient, contactWay } =
        await this.clientRepository.editClient(client, clientId);
      this.gatewayService.emit(
        ClientEvent.ADD,
        { client: updatedClient, contactWay },
        existClient.companyId,
      );
      return { client: updatedClient, contactWay };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteClient(clientId: string) {
    try {
      const existClient = await this.clientRepository.isClientExist(clientId);
      if (!existClient) {
        throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
      }
      const deletedClient = await this.clientRepository.deleteClient(clientId);
      this.gatewayService.emit(
        ClientEvent.ADD,
        deletedClient,
        deletedClient.companyId,
      );
      this.gatewayService.emit(StatisticsEvent.MANAGER, {}, deletedClient.companyId);
      return deletedClient;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getClientShipmentDetails(clientId: string, shipmentId: string) {
    try {
      const existClient = await this.clientRepository.isClientExist(clientId);

      if (!existClient) {
        throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
      }
      const existShipment =
        await this.shipmentRepository.isShipmentExist(shipmentId);
      if (!existShipment) {
        throw new HttpException('Shipment not found', HttpStatus.BAD_REQUEST);
      }
      const shipmentDetails =
        await this.shipmentRepository.getShipmentWithShipmentItemWithWatWithCompanyWithClientWithDriver(
          shipmentId,
          clientId,
        );
      const responseData = ClientMapper.formatted(shipmentDetails);
      return responseData;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
