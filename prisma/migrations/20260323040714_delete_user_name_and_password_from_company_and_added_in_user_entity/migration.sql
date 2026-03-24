/*
  Warnings:

  - You are about to drop the column `companyEmail` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `companyPassword` on the `company` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "company_companyEmail_key";

-- AlterTable
ALTER TABLE "company" DROP COLUMN "companyEmail",
DROP COLUMN "companyPassword";
