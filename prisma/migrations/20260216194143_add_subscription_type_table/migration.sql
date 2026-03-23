/*
  Warnings:

  - You are about to drop the column `type` on the `subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[typeId]` on the table `subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typeId` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "type",
ADD COLUMN     "typeId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "SubscriptionType";

-- CreateTable
CREATE TABLE "SubscriptionType" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SubscriptionType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionType_type_key" ON "SubscriptionType"("type");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_typeId_key" ON "subscription"("typeId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "SubscriptionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
