import { ApiProperty } from '@nestjs/swagger';
import { Subscription } from '../entities/subscription.entity';
import { ApiResponseDto } from 'src/Common/api-response.dto';

export class SubscriptionResponseDto extends ApiResponseDto<Subscription> {
  @ApiProperty({ type: Subscription })
  declare data: Subscription;
}

export class SubscriptionListResponseDto extends ApiResponseDto<
  Subscription[]
> {
  @ApiProperty({ type: [Subscription] })
  declare data: Subscription[];
}
