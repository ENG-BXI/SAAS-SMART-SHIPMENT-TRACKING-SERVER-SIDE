-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phoneNumber" TEXT;

-- CreateTable
CREATE TABLE "shipment" (
    "id" TEXT NOT NULL,
    "shipmentNumber" TEXT NOT NULL,
    "launchDate" TIMESTAMP(3) NOT NULL,
    "wayId" TEXT NOT NULL,
    "currentPointId" TEXT,
    "driverId" TEXT,
    "companyId" TEXT NOT NULL,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipmentItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isBreakable" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,

    CONSTRAINT "shipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_clientToshipment" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_clientToshipment_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipment_shipmentNumber_key" ON "shipment"("shipmentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_shipmentNumber_companyId_key" ON "shipment"("shipmentNumber", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "shipmentItem_name_clientId_key" ON "shipmentItem"("name", "clientId");

-- CreateIndex
CREATE INDEX "_clientToshipment_B_index" ON "_clientToshipment"("B");

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_wayId_fkey" FOREIGN KEY ("wayId") REFERENCES "way"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_currentPointId_fkey" FOREIGN KEY ("currentPointId") REFERENCES "point"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipmentItem" ADD CONSTRAINT "shipmentItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipmentItem" ADD CONSTRAINT "shipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clientToshipment" ADD CONSTRAINT "_clientToshipment_A_fkey" FOREIGN KEY ("A") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_clientToshipment" ADD CONSTRAINT "_clientToshipment_B_fkey" FOREIGN KEY ("B") REFERENCES "shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
