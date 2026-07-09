import { SubscriptionStatus } from 'generated/prisma/enums';
export interface JwtUser {
  id: string;
  companyId: string;
  role: string;
  status: SubscriptionStatus;
}
