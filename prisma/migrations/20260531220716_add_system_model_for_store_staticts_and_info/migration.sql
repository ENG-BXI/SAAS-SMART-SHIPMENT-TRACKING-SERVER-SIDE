-- CreateEnum
CREATE TYPE "systemType" AS ENUM ('NUMBER_OF_VISITOR');

-- CreateTable
CREATE TABLE "system" (
    "id" TEXT NOT NULL,
    "name" "systemType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "system_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_id_key" ON "system"("id");

-- CreateIndex
CREATE UNIQUE INDEX "system_name_key" ON "system"("name");
