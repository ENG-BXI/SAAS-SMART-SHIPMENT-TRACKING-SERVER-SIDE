import { SHIPMENT_STATUS } from 'src/Common/constant/enum-shipment-status';
import { IShipmentDetails } from './interfaces/shipment-details.interface';

export class ClientMapper {
  static formatted(shipmentDetails: IShipmentDetails | null) {
    const shipmentNumber = shipmentDetails?.shipmentNumber;
    const wayPointsLength = shipmentDetails?.way.points.length || 0;
    const firstPoint = shipmentDetails?.way.points[0].name;
    const lastPoint = shipmentDetails?.way.points[wayPointsLength - 1].name;
    const shipmentStatus = shipmentDetails?.isCompleted
      ? SHIPMENT_STATUS.COMPLETED
      : shipmentDetails?.isPaused
        ? SHIPMENT_STATUS.PAUSED
        : SHIPMENT_STATUS.CURRENT;
    const companyName = shipmentDetails?.company.name;
    const _orderOfCurrentPoint =
      shipmentDetails?.way.points.findIndex((val) => {
        return val.id == shipmentDetails?.currentPointId;
      }) || 0;
    const reminderPoint =
      shipmentDetails?.way.points.reduce((pre, cur, idx) => {
        return _orderOfCurrentPoint < idx ? pre + 1 : pre;
      }, 0) || 0;
    const _countOfPrePoint = Math.round(wayPointsLength - reminderPoint);
    const percentageOfPoint = (_countOfPrePoint / wayPointsLength) * 100;
    const shipmentItem = shipmentDetails?.shipmentItems;
    const clientNameAndContactWay = shipmentDetails?.client[0];
    const allPointName = shipmentDetails?.way.points.map((val) => {
      return {
        name: val.name,
        isCurrent: val.id == shipmentDetails?.currentPointId,
      };
    });
    const companyEmployee = shipmentDetails?.company.users[0];
    const driverInfo = shipmentDetails?.driver;
    const nextPoint = shipmentDetails?.isCompleted
      ? null
      : shipmentDetails?.way.points[_orderOfCurrentPoint + 1];

    const responseData = {
      shipmentNumber,
      wayPointsLength,
      firstPoint,
      lastPoint,
      shipmentStatus,
      companyName,
      reminderPoint,
      percentageOfPoint,
      shipmentItem,
      clientNameAndContactWay,
      allPointName,
      companyEmployee,
      driverInfo,
      nextPoint,
    };
    return responseData;
  }
}
