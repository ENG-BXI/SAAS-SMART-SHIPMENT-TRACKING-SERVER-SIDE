import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { StatisticsRepository } from './statistics.repository';
import { StatisticsMapper } from './statistics.mapper';
import { StatisticsEvent } from './statistics.event';
import { GatewayService } from '../gateway/gateway.service';
import { ShipmentRepository } from '../shipment/shipment.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class StatisticsService {
  constructor(
    private statisticsRepository: StatisticsRepository,
    private shipmentRepository: ShipmentRepository,
    private userRepository: UserRepository,
    private gatewayService: GatewayService,
  ) {}
  /*
    numberOfShipments,
    numberOfCurrentShipments,
    numberOfFinishedShipments,
    numberOfClients,
    numberOfWays
    */
  async getManagerStatistics(companyId: string) {
    const [
      numberOfShipments,
      numberOfCurrentShipments,
      numberOfFinishedShipments,
      numberOfClients,
      numberOfWays,
    ] = await Promise.all([
      this.statisticsRepository.getCountOfShipments({ companyId }),
      this.statisticsRepository.getCountOfShipments({
        companyId,
        isPaused: false,
        isCompleted: false,
      }),
      this.statisticsRepository.getCountOfShipments({
        companyId,
        isPaused: false,
        isCompleted: true,
      }),
      this.statisticsRepository.getCountOfClient(companyId),
      this.statisticsRepository.getCountOfWay(companyId),
    ]);
    return {
      numberOfShipments,
      numberOfCurrentShipments,
      numberOfFinishedShipments,
      numberOfClients,
      numberOfWays,
    };
  }

  /*
  numberOfCompanies
  numberOfVisited
  numberOfNotes
  numberOfWillSubscriptionFinish
  numberOfPausedCompanies

  LineChart => numberOfCompanyByMonth
  {
    month: string,
    count: number
  }
   */
  async getAdminStatistics() {
    const year = new Date().getFullYear();
    const [
      numberOfCompanies,
      numberOfSubscriptionRequest,
      numberOfVisited,
      numberOfNotes,
      numberOfWillSubscriptionFinish,
      numberOfPausedCompanies,
      CompanyByMonth,
    ] = await Promise.all([
      this.statisticsRepository.getCountOfCompany(),
      this.statisticsRepository.getCountOfSubscriptionRequestCompany(),
      this.statisticsRepository.getCountOfVisited(),
      this.statisticsRepository.getCountOfNote(),
      this.statisticsRepository.getCountOfExpireCompanySubscription(),
      this.statisticsRepository.getCountOfInActiveCompany(),
      this.statisticsRepository.getChartCompanyData(year),
    ]);

    const returnCompaniesByMonth = StatisticsMapper.toChartList(CompanyByMonth);
    return {
      numberOfCompanies,
      numberOfSubscriptionRequest,
      numberOfVisited: numberOfVisited?.value || 0,
      numberOfNotes,
      numberOfWillSubscriptionFinish,
      numberOfPausedCompanies,
      numberOfCompanyByMonth: returnCompaniesByMonth,
    };
  }

  async addVisit() {
    try {
      const isNumberOfVisitExist =
        await this.statisticsRepository.isVisitedTableIsNotEmpty();
      if (
        isNumberOfVisitExist &&
        isNumberOfVisitExist.name == 'NUMBER_OF_VISITOR'
      ) {
        const addedVisit =
          await this.statisticsRepository.IncreaseNumberOfVisit(
            isNumberOfVisitExist.value,
          );
        this.gatewayService.emit(StatisticsEvent.ADMIN, {});

        return addedVisit;
      } else {
        const addedVisit = await this.statisticsRepository.InitialVisitTable();
        this.gatewayService.emit(StatisticsEvent.ADMIN, {});
        return addedVisit;
      }
    } catch (error) {}
  }
  async getDriverStatistics(companyId: string, driverId: string) {
    try {
      const [user, shipmentDetails] = await Promise.all([
        this.userRepository.getInfoOfDriver(companyId, driverId),
        this.shipmentRepository.getShipmentInfoForDriver(driverId),
      ]);
      return { ...shipmentDetails, ...user };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
