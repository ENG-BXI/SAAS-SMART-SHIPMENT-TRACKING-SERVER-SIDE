import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  Query,
  Search,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

import { IResponseWithPagination } from 'src/Common/interfaces/IResponseWithPagination.interface';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';
import { CreateSubscriptionTypeDto } from './dto/CreateSubscriptionType.dto';
import { UpdateSubscriptionTypeDto } from './dto/UpdateSubscriptionType.dto';

@ApiTags('Subscription')
@Controller({ path: 'subscription', version: '1' })
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @Get('/')
  async getAllSubscription(
    @Query('page') page?: number,
    @Query('search') search?: string,
  ): Promise<IResponseWithPagination> {
    const currentPage = page || 1;
    const pageSize = 10;
    const subscription = await this.subscriptionService.getAllSubscription(
      currentPage,
      search,
    );
    const totalCount = subscription.count;
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;
    const data = subscription.data;
    return {
      data: {
        data,
        currentPage,
        pageSize,
        totalCount,
        totalPages,
        hasNext,
        hasPrevious,
      },
      message: 'Get Subscription successfully',
      status: HttpStatus.OK,
    };
  }
  @Post('company/:companyId')
  // Add and Accept Company when it request subscription
  async addSubscription(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body(new ValidationPipe()) SubscriptionDto: CreateSubscriptionDto,
  ) {
    const newSubscription =
      await this.subscriptionService.AcceptSubscriptionFromRequestCompany(
        companyId,
        SubscriptionDto,
      );
    return {
      data: newSubscription,
      message: 'Add Subscription successfully',
      status: HttpStatus.OK,
    };
  }
  @Get('subscriptionType')
  async getSubscriptionType() {
    const subscriptionType =
      await this.subscriptionService.getSubscriptionType();
    return {
      data: subscriptionType,
      message: 'Get Subscription Type Successful',
      status: HttpStatus.OK,
    };
  }
  @Post('subscriptionType')
  async AddSubscriptionType(
    @Body(new ValidationPipe())
    createSubscriptionTypeDto: CreateSubscriptionTypeDto,
  ) {
    const subscriptionType = await this.subscriptionService.addSubscriptionType(
      createSubscriptionTypeDto,
    );
    return {
      data: subscriptionType,
      message: 'Create Subscription Type Successful',
      status: HttpStatus.OK,
    };
  }
  @Patch('subscriptionType/:id')
  async UpdateSubscriptionType(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ValidationPipe())
    updateSubscriptionTypeDto: UpdateSubscriptionTypeDto,
  ) {
    const subscriptionType =
      await this.subscriptionService.updateSubscriptionType(
        id,
        updateSubscriptionTypeDto,
      );
    return {
      data: subscriptionType,
      message: 'Update Subscription Type Successful',
      status: HttpStatus.OK,
    };
  }
  @Delete('subscriptionType/:id')
  async DeleteSubscriptionType(@Param('id', ParseUUIDPipe) id: string) {
    const subscriptionType =
      await this.subscriptionService.deleteSubscriptionType(id);
    return {
      data: subscriptionType,
      message: 'Delete Subscription Type Successful',
      status: HttpStatus.OK,
    };
  }
  @UseGuards(AuthGuard)
  @Get('company')
  async getSubscription(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const subscription = await this.subscriptionService.getSubscription(
      req.user.companyId,
    );
    return {
      data: subscription,
      message: 'Get Subscription Successful',
      status: HttpStatus.OK,
    };
  }
  @UseGuards(AuthGuard)
  @Patch('company/:subscriptionTypeId')
  // Change Subscription Type For Company For Company Dashboard For Review a Request
  async editCompanySubscription(
    @Req() req: Request,
    @Param('subscriptionTypeId', ParseUUIDPipe) subscriptionTypeId: string,
  ) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }
    const editedSubscription =
      await this.subscriptionService.editCompanySubscription(
        req.user.companyId,
        subscriptionTypeId,
      );
    return {
      data: editedSubscription,
      message: 'Edit Company Subscription Successful',
      status: HttpStatus.OK,
    };
  }
}
