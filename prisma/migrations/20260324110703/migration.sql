/*
  Warnings:

  - A unique constraint covering the columns `[name,companyId]` on the table `way` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "way_name_companyId_key" ON "way"("name", "companyId");
