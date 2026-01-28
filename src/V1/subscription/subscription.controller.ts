import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import {
  SubscriptionResponseDto,
  SubscriptionListResponseDto,
} from './dto/subscription-response.dto';

@ApiTags('Subscription')
@Controller({ path: 'subscription', version: '1' })
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully.',
    type: SubscriptionResponseDto,
  })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'List of subscriptions.',
    type: SubscriptionListResponseDto,
  })
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subscription by ID' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription details.',
    type: SubscriptionResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully.',
    type: SubscriptionResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subscription' })
  @ApiParam({ name: 'id', description: 'Subscription ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully.',
    type: SubscriptionResponseDto,
  })
  remove(@Param('id') id: string) {
    return this.subscriptionService.remove(+id);
  }
}
