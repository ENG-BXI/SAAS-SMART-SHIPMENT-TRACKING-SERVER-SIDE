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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';

import { IResponseWithPagination } from 'src/Common/interfaces/IResponseWithPagination.interface';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@ApiTags('Subscription')
@Controller({ path: 'subscription', version: '1' })
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @Get('/')
  async getAllSubscription(): Promise<IResponseWithPagination> {
    const subscription = await this.subscriptionService.getAllSubscription();
    return {
      data: {
        data: subscription,
        currentPage: 0,
        pageSize: 0,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      message: 'Get Subscription successfully',
      status: HttpStatus.OK,
    };
  }
  @Post('/:companyId')
  async addSubscription(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body(new ValidationPipe()) SubscriptionDto: CreateSubscriptionDto,
  ) {
    const newSubscription = await this.subscriptionService.addSubscription(
      companyId,
      SubscriptionDto,
    );
    return {
      data: newSubscription,
      message: 'Add Subscription successfully',
      status: HttpStatus.OK,
    };
  }
}
