/*
  Warnings:

  - A unique constraint covering the columns `[durationByMonth]` on the table `SubscriptionType` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `durationByMonth` to the `SubscriptionType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionType" ADD COLUMN     "durationByMonth" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionType_durationByMonth_key" ON "SubscriptionType"("durationByMonth");
