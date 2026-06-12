import { Injectable } from '@nestjs/common';
import { StatisticsRepository } from './statistics.repository';
import { StatisticsMapper } from './statistics.mapper';

@Injectable()
export class StatisticsService {
  constructor(private statisticsRepository: StatisticsRepository) {}
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
        return addedVisit;
      } else {
        const addedVisit = await this.statisticsRepository.InitialVisitTable();
        return addedVisit;
      }
    } catch (error) {}
  }
}
