import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SubscriptionStatus } from 'generated/prisma/enums';
import { CompanyRepository } from './company.repository';
import { hashPassword } from 'src/Common/lib';
import { SubscriptionRepository } from '../subscription/subscription.repository';
import { EmailService } from '../email/email.service';
import { subscriptionEmail } from '../email/emails/subscription.email';
import { adminCreatedCompanyEmail } from '../email/emails/adminCreatedCompanyEmail';
import { companyPausedEmail } from '../email/emails/companyPausedEmail';
import { companyActivatedEmail } from '../email/emails/companyActivatedEmail';
import { GatewayService } from '../gateway/gateway.service';
import { CompanyEvent } from './company.event';
import { StatisticsEvent } from '../statistics/statistics.event';
@Injectable()
export class CompanyService {
  constructor(
    private companyRepository: CompanyRepository,
    private subscriptionRepository: SubscriptionRepository,
    private emailService: EmailService,
    private gatewayService: GatewayService,
  ) {}
  async getAllCompany({
    page,
    limit,
    search,
    filter,
  }: {
    page: number;
    limit: number;
    search: string;
    filter: string;
  }) {
    try {
      const companies = await this.companyRepository.getAllCompanies(
        page,
        limit,
        search,
      );
      const companiesNumber =
        await this.companyRepository.getCountOfAllCompanies();
      return { companies, companiesNumber };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getCompanyById(id: string) {
    try {
      const company = await this.companyRepository.getCompanyById(id);
      if (!company) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      return company;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async pauseCompanySubscription(id: string) {
    try {
      const company = await this.companyRepository.isCompanyExist({
        companyId: id,
      });
      if (!company) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      const CompanySubscriptionStatus =
        await this.companyRepository.CompanySubscriptionStatus(id);

      if (CompanySubscriptionStatus?.status !== SubscriptionStatus.active) {
        throw new HttpException(
          'This Company Subscription Not Active For disActive',
          HttpStatus.BAD_REQUEST,
        );
      }
      const email = await this.companyRepository.getEmailForCompany(id);
      const disActiveCompany =
        await this.companyRepository.disActiveCompany(id);
      this.emailService.sendMail(
        companyPausedEmail(email!.users[0].email, company.name),
      );
      this.gatewayService.emit(CompanyEvent.PAUSE, company);
      this.gatewayService.emit(StatisticsEvent.ADMIN, {});
      return disActiveCompany;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async activeCompanySubscription(id: string) {
    try {
      const company = await this.companyRepository.isCompanyExist({
        companyId: id,
      });
      if (!company) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      const isSubscriptionStatusInActive =
        await this.companyRepository.CompanySubscriptionStatus(id);
      if (
        isSubscriptionStatusInActive?.status !== SubscriptionStatus.inactive
      ) {
        throw new HttpException(
          'This Company Subscription Not InActive For Activation Subscription',
          HttpStatus.BAD_REQUEST,
        );
      }
      const ActiveCompany = await this.companyRepository.activeCompany(id);
      const ClientSideDomain = process.env.CLIENT_SIDE_DOMAIN_URL;
      const email = await this.companyRepository.getEmailForCompany(id);
      this.emailService.sendMail(
        companyActivatedEmail(
          email!.users[0].email,
          company.name,
          ClientSideDomain!,
        ),
      );
      this.gatewayService.emit(CompanyEvent.RESUME, company);
      this.gatewayService.emit(StatisticsEvent.ADMIN, {});
      return ActiveCompany;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async RequestSubscriptionCompany(createCompanyDto: CreateCompanyDto) {
    try {
      const existingCompany = await this.companyRepository.isCompanyExist({
        companyEmail: createCompanyDto.companyEmail,
        companyName: createCompanyDto.name,
      });
      const emailOfCompany = await this.companyRepository.getEmailForCompany(
        existingCompany?.id,
      );
      if (existingCompany) {
        const message =
          emailOfCompany?.users[0].email === createCompanyDto.companyEmail
            ? 'Company with this email already exists'
            : 'Company with this name already exists';
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      const hashedPassword = hashPassword(createCompanyDto.companyPassword);

      const subscriptionType =
        await this.subscriptionRepository.getSubscriptionType({
          id: createCompanyDto.subscriptionType,
        });
      if (!subscriptionType)
        throw new HttpException(
          'Cannot Find Subscription Type',
          HttpStatus.BAD_REQUEST,
        );
      const { company, user, subscription } =
        await this.companyRepository.createCompanyAndManagerAndSubscriptionWhenCompanyRequest(
          createCompanyDto,
          hashedPassword,
          subscriptionType.id,
        );
      // Send Email
      this.emailService.sendMail(
        subscriptionEmail(createCompanyDto.companyEmail, company.name),
      );
      this.gatewayService.emit(CompanyEvent.REQUEST, company);
      this.gatewayService.emit(StatisticsEvent.ADMIN, {});
      return { company, user, subscription };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getAllRequestSubscriptionCompanies({
    page,
    limit,
    search,
    filter,
  }: {
    page: number;
    limit: number;
    search: string;
    filter: string;
  }) {
    try {
      const [companies, pendingCompanyCount, changeCompanyCount] =
        await Promise.all([
          await this.companyRepository.getAllRequestSubscriptionCompanies(
            page,
            limit,
            search,
          ),
          await this.companyRepository.getPendingCompanyCount(),
          await this.companyRepository.getChangeCompanyCount(),
        ]);

      return { companies, pendingCompanyCount, changeCompanyCount };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async createCompany(createCompanyDto: CreateCompanyDto) {
    try {
      const existingCompany = await this.companyRepository.isCompanyExist({
        companyEmail: createCompanyDto.companyEmail,
        companyName: createCompanyDto.name,
      });
      const emailOfCompany = await this.companyRepository.getEmailForCompany(
        existingCompany?.id,
      );

      if (existingCompany) {
        const message =
          emailOfCompany?.users[0].email === createCompanyDto.companyEmail
            ? 'Company with this email already exists'
            : 'Company with this name already exists';
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      const hashedPassword = hashPassword(createCompanyDto.companyPassword);
      const subscriptionType =
        await this.subscriptionRepository.getSubscriptionType({
          id: createCompanyDto.subscriptionType,
        });
      if (!subscriptionType)
        throw new HttpException(
          'Cannot Find Subscription Type',
          HttpStatus.BAD_REQUEST,
        );
      const { company, user, subscription } =
        await this.companyRepository.createCompanyFormAdminDashboard(
          createCompanyDto,
          hashedPassword,
          subscriptionType.durationByMonth,
        );
      const ClientSideDomain = process.env.CLIENT_SIDE_DOMAIN_URL;
      await this.emailService.sendMail(
        adminCreatedCompanyEmail(
          createCompanyDto.companyEmail,
          company.name,
          ClientSideDomain!,
        ),
      );
      // TODO improve this
      this.gatewayService.emit(CompanyEvent.ADD, company);
      this.gatewayService.emit(StatisticsEvent.ADMIN, {});
      return { company, user, subscription };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    try {
      const existingCompany =
        await this.companyRepository.getCompanyWithUsersWithSubscriptionInfo(
          id,
        );
      if (!existingCompany) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }

      const existingCompanyWithSameEmail =
        await this.companyRepository.isEmailUsedInAnotherCompany(
          id,
          updateCompanyDto.companyEmail,
          updateCompanyDto.name,
        );

      if (existingCompanyWithSameEmail) {
        const message =
          existingCompanyWithSameEmail.email === updateCompanyDto.companyEmail
            ? 'Company with this email already exists'
            : 'Company with this name already exists';
        throw new HttpException(message, HttpStatus.BAD_REQUEST);
      }
      const subscriptionType =
        await this.subscriptionRepository.getSubscriptionType({
          id: updateCompanyDto.subscriptionType,
        });

      if (!subscriptionType)
        throw new HttpException(
          'Cannot Find Subscription Type',
          HttpStatus.BAD_REQUEST,
        );

      const isChangeSubscription =
        existingCompany.subscription?.typeId !== updateCompanyDto.companyEmail;

      let hashedPassword;
      if (updateCompanyDto.companyPassword) {
        hashedPassword = hashPassword(updateCompanyDto.companyPassword);
      }
      const { company, user, subscription } =
        await this.companyRepository.updateCompanyWitManagerWithSubscriptionIfEdited(
          id,
          updateCompanyDto,
          hashedPassword,
          subscriptionType.durationByMonth,
          existingCompany.users[0].id,
          existingCompany.subscription?.id,
          isChangeSubscription,
        );
      // TODO
      this.gatewayService.emit(CompanyEvent.EDIT, company);
      return { company, user, subscription };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async deleteCompany(id: string) {
    try {
      const existCompany = await this.companyRepository.isCompanyExist({
        companyId: id,
      });
      if (!existCompany) {
        throw new HttpException('Company not found', HttpStatus.NOT_FOUND);
      }
      const company = await this.companyRepository.deleteCompany(id);
      this.gatewayService.emit(CompanyEvent.DELETE, company);
      this.gatewayService.emit(StatisticsEvent.ADMIN, {});
      return company;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
