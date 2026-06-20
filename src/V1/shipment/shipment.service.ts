import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { CreateShipmentItemDto } from './dto/create-shipment-item.dto';
import { UpdateShipmentItemDto } from './dto/update-shipment-item.dto';
import { ShipmentRepository } from './shipment.repository';
import { EmailService } from '../email/email.service';
import { driverAssignedShipmentEmail } from '../email/emails/driverAssignedShipmentEmail';
import { ClientRepository } from '../client/client.repository';
import { shipmentMovementEmail } from '../email/emails/shipmentMovementEmail';
import { SHIPMENT_STATUS } from 'src/Common/constant/enum-shipment-status';
import { shipmentPausedEmail } from '../email/emails/shipmentPausedEmail';
import { shipmentResumedEmail } from '../email/emails/shipmentResumedEmail';
import { GatewayService } from '../gateway/gateway.service';
import { ShipmentEvent } from './shipment.event';
import { ClientEvent } from '../client/cilent.event';

@Injectable()
export class ShipmentService {
  constructor(
    private shipmentRepository: ShipmentRepository,
    private emailService: EmailService,
    private clientRepository: ClientRepository,
    private gatewayService: GatewayService,
  ) {}
  async getCurrentShipments(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const shipments = await this.shipmentRepository.getAllShipment({
        companyId,
        page,
        limit,
        isCompleted: false,
        search,
      });
      const shipmentCount = await this.shipmentRepository.getCountOfShipment({
        companyId,
        isCompleted: false,
        search,
      });
      return { shipments, shipmentCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getFinishedShipments(
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const shipments = await this.shipmentRepository.getAllShipment({
        companyId,
        page,
        limit,
        isCompleted: true,
        search,
      });
      const shipmentCount = await this.shipmentRepository.getCountOfShipment({
        companyId,
        isCompleted: true,
        search,
      });
      return { shipments, shipmentCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getShipmentById(shipmentId: string, companyId: string) {
    try {
      const shipment = await this.shipmentRepository.getShipmentById(
        shipmentId,
        companyId,
      );
      if (!shipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      const clients =
        await this.shipmentRepository.getCountOfClientInShipment(shipmentId);
      const shipmentItem =
        await this.shipmentRepository.getCountOfShipmentItemInShipment(
          companyId,
          shipmentId,
        );
      const shipments = {
        ...shipment,
        clients,
        shipmentItem,
      };
      return shipments;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getShipmentItems(
    shipmentId: string,
    companyId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    try {
      const shipmentItems = await this.shipmentRepository.getShipmentItem(
        companyId,
        shipmentId,
        page,
        limit,
        search,
      );
      const shipmentItemsCount =
        await this.shipmentRepository.getCountOfShipmentItemInShipment(
          companyId,
          shipmentId,
        );

      return {
        shipmentItems,
        shipmentItemsCount,
      };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async addClientAndShipmentItem(
    shipmentId: string,
    createShipmenItem: CreateShipmentItemDto,
  ) {
    try {
      const { client, shipmentItem } =
        await this.shipmentRepository.addShipmentItem(
          shipmentId,
          createShipmenItem,
        );
      this.gatewayService.emit(
        ShipmentEvent.ADD_ITEM,
        shipmentItem,
        client.companyId,
      );
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipmentItem,
        client.companyId,
      );
      return { client, shipmentItem };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateShipmentItem(
    shipmentItemId: string,
    updateShipmenItem: UpdateShipmentItemDto,
    companyId: string,
  ) {
    try {
      const shipmentItem = await this.shipmentRepository.editShipmentItem(
        shipmentItemId,
        updateShipmenItem,
      );
      this.gatewayService.emit(
        ShipmentEvent.EDIT_ITEM,
        shipmentItem,
        companyId,
      );
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipmentItem,
        companyId,
      );
      return shipmentItem;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteShipmentItem(shipmentItemId: string, companyId: string) {
    try {
      const existShipmentItem =
        await this.shipmentRepository.isShipmentItemExist(shipmentItemId);
      if (!existShipmentItem) {
        throw new HttpException(
          'Shipment item not found',
          HttpStatus.NOT_FOUND,
        );
      }
      const shipmentItem =
        await this.shipmentRepository.deleteShipmentItem(shipmentItemId);
      this.gatewayService.emit(
        ShipmentEvent.DELETE_ITEM,
        shipmentItem,
        companyId,
      );
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipmentItem,
        companyId,
      );
      return shipmentItem;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createNewShipment(Shipment: CreateShipmentDto, companyId: string) {
    try {
      const { shipment } = await this.shipmentRepository.createNewShipment(
        Shipment,
        companyId,
      );
      await this.emailService.sendMail(
        driverAssignedShipmentEmail(
          shipment.driver?.email!,
          shipment.driver?.userName!,
          {
            id: shipment.id,
            way: shipment.way,
            launchDate: shipment.launchDate,
            shipmentNumber: shipment.shipmentNumber,
          },
        ),
      );
      this.gatewayService.emit(ShipmentEvent.ADD, shipment, companyId);
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async editShipment(
    shipmenId: string,
    Shipment: UpdateShipmentDto,
    companyId: string,
  ) {
    try {
      const existingShipment =
        await this.shipmentRepository.isShipmentExist(shipmenId);
      if (!existingShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      const shipment = await this.shipmentRepository.editShipment(
        companyId,
        shipmenId,
        Shipment,
      );
      this.gatewayService.emit(ShipmentEvent.EDIT, shipment, companyId);
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipment,
        companyId,
      );
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteShipment(shipmenId: string, companyId: string) {
    try {
      const existingShipment =
        await this.shipmentRepository.isShipmentExist(shipmenId);
      if (!existingShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      const shipment = await this.shipmentRepository.deleteShipment(
        companyId,
        shipmenId,
      );
      this.gatewayService.emit(ShipmentEvent.DELETE, shipment, companyId);
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipment,
        companyId,
      );
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  // Movement
  async MoveShipmentWithNotification(shipmenId: string, companyId: string) {
    try {
      const existingShipment =
        await this.shipmentRepository.isShipmentExist(shipmenId);
      if (!existingShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      const { shipment } = await this.shipmentRepository.MoveShipment(
        shipmenId,
        companyId,
        existingShipment.wayId,
      );
      const clients = await this.clientRepository.getAllClientInShipment(
        shipmenId,
        companyId,
      );
      // TEMP NOW WE SEND TO EMAIL ONLY
      const ClientSideDomain = process.env.CLIENT_SIDE_DOMAIN_URL;
      if (clients)
        await Promise.all(
          clients?.client.map((client) => {
            const email = client.contactWays.filter(
              (cw) => cw.contactType == 'email',
            )[0].text;
            return this.emailService.sendMail(
              shipmentMovementEmail(
                email,
                client.name,
                {
                  id: shipment.id,
                  shipmentNumber: shipment.shipmentNumber,
                  status: shipment.isCompleted
                    ? 'COMPLETE'
                    : shipment.isPaused
                      ? 'PAUSED'
                      : 'CURRENT',
                  way: { name: shipment.way.name },
                },
                client.id,
                ClientSideDomain!,
              ),
            );
          }),
        );
      this.gatewayService.emit(ShipmentEvent.MOVEMENT, shipment, companyId);
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipment,
        companyId,
      );
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async MoveShipmentWithoutNotification(shipmenId: string, companyId: string) {
    try {
      const existingShipment =
        await this.shipmentRepository.isShipmentExist(shipmenId);
      if (!existingShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      const { shipment } = await this.shipmentRepository.MoveShipment(
        shipmenId,
        companyId,
        existingShipment.wayId,
      );
      this.gatewayService.emit(ShipmentEvent.MOVEMENT, shipment, companyId);
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipment,
        companyId,
      );
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async pauseShipment(shipmentId: string, companyId: string) {
    try {
      const existingShipment =
        await this.shipmentRepository.isShipmentExist(shipmentId);
      if (!existingShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      // Check if Shipment is Completed
      const isShipmentComplete =
        await this.shipmentRepository.isShipmentComplete(companyId, shipmentId);
      if (isShipmentComplete) {
        throw new HttpException(
          'Shipment is already completed',
          HttpStatus.BAD_REQUEST,
        );
      }
      const shipment = await this.shipmentRepository.pauseShipment(
        companyId,
        shipmentId,
      );

      const clients = await this.clientRepository.getAllClientInShipment(
        shipmentId,
        companyId,
      );
      // TEMP NOW WE SEND TO EMAIL ONLY
      const ClientSideDomain = process.env.CLIENT_SIDE_DOMAIN_URL;
      if (clients)
        await Promise.all(
          clients?.client.map((client) => {
            const email = client.contactWays.filter(
              (cw) => cw.contactType == 'email',
            )[0].text;
            return this.emailService.sendMail(
              shipmentPausedEmail(
                email,
                client.name,
                {
                  id: shipment.id,
                  shipmentNumber: shipment.shipmentNumber,
                },
                client.id,
                ClientSideDomain!,
              ),
            );
          }),
        );
      this.gatewayService.emit(ShipmentEvent.PAUSE, shipment, companyId);
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipment,
        companyId,
      );
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async resumeShipment(shipmentId: string, companyId: string) {
    try {
      const existingShipment =
        await this.shipmentRepository.isShipmentExist(shipmentId);
      if (!existingShipment) {
        throw new HttpException('Shipment not found', HttpStatus.NOT_FOUND);
      }
      // Check if Shipment is Completed
      const isShipmentComplete =
        await this.shipmentRepository.isShipmentComplete(companyId, shipmentId);
      if (isShipmentComplete) {
        throw new HttpException(
          'Shipment is already completed',
          HttpStatus.BAD_REQUEST,
        );
      }
      const shipment = await this.shipmentRepository.resumeShipment(
        companyId,
        shipmentId,
      );
      const clients = await this.clientRepository.getAllClientInShipment(
        shipmentId,
        companyId,
      );
      // TEMP NOW WE SEND TO EMAIL ONLY
      const ClientSideDomain = process.env.CLIENT_SIDE_DOMAIN_URL;
      if (clients)
        await Promise.all(
          clients?.client.map((client) => {
            const email = client.contactWays.filter(
              (cw) => cw.contactType == 'email',
            )[0].text;
            return this.emailService.sendMail(
              shipmentResumedEmail(
                email,
                client.name,
                {
                  id: shipment.id,
                  shipmentNumber: shipment.shipmentNumber,
                },
                client.id,
                ClientSideDomain!,
              ),
            );
          }),
        );
      this.gatewayService.emit(ShipmentEvent.RESUME, shipment, companyId);
      this.gatewayService.emit(
        ClientEvent.SHIPMENT_DETAILS_FOR_CLIENT,
        shipment,
        companyId,
      );
      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
