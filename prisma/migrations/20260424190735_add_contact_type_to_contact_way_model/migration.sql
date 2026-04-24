-- CreateEnum
CREATE TYPE "contactType" AS ENUM ('phoneNumber', 'email');

-- AlterTable
ALTER TABLE "contactWay" ADD COLUMN     "contactType" "contactType" NOT NULL DEFAULT 'phoneNumber';
