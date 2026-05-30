import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionTypeDto } from './CreateSubscriptionType.dto';

export class UpdateSubscriptionTypeDto extends PartialType(CreateSubscriptionTypeDto) {}
