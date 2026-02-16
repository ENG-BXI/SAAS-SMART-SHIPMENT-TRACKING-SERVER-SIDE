import { ApiProperty } from '@nestjs/swagger';
import { $Enums, SubscriptionType } from 'generated/prisma/browser';
export class Subscription {
  id: string;
  typeId: string;
  status: $Enums.SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  companyId: string;
}
