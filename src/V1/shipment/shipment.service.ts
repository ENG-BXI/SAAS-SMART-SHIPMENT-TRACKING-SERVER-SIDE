import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { CreateShipmentItemDto } from './dto/create-shipment-item.dto';
import { UpdateShipmentItemDto } from './dto/update-shipment-item.dto';
import { ShipmentRepository } from './shipment.repository';

@Injectable()
export class ShipmentService {
  constructor(
    private shipmentRepository: ShipmentRepository,
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
      const shipmentItem = await this.shipmentRepository.getCountOfShipmentItemInShipment(companyId,shipmentId)
      const shipments = {
        ...shipment,
        clients,
        shipmentItem
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
      return { client, shipmentItem };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateShipmentItem(
    shipmentItemId: string,
    updateShipmenItem: UpdateShipmentItemDto,
  ) {
    try {
      const shipmentItem = await this.shipmentRepository.editShipmentItem(
        shipmentItemId,
        updateShipmenItem,
      );
      return shipmentItem;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteShipmentItem(shipmentItemId: string) {
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
      // TODO Add Notification Implement
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

      return shipment;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
