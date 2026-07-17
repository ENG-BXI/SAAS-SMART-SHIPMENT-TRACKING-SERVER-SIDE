/*
  Warnings:

  - Added the required column `voucherPublicId` to the `subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voucherSecureUrl` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription" ADD COLUMN     "voucherPublicId" TEXT NOT NULL,
ADD COLUMN     "voucherSecureUrl" TEXT NOT NULL;
