-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "newTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_newTypeId_fkey" FOREIGN KEY ("newTypeId") REFERENCES "SubscriptionType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
