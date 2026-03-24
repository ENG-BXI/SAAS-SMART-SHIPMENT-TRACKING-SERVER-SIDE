-- AlterTable
ALTER TABLE "contactWay" ADD CONSTRAINT "contactWay_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user" ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "user_id_key";

-- CreateTable
CREATE TABLE "way" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "way_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "wayId" TEXT NOT NULL,

    CONSTRAINT "point_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "point_wayId_name_key" ON "point"("wayId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "point_wayId_order_key" ON "point"("wayId", "order");

-- AddForeignKey
ALTER TABLE "way" ADD CONSTRAINT "way_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point" ADD CONSTRAINT "point_wayId_fkey" FOREIGN KEY ("wayId") REFERENCES "way"("id") ON DELETE CASCADE ON UPDATE CASCADE;
