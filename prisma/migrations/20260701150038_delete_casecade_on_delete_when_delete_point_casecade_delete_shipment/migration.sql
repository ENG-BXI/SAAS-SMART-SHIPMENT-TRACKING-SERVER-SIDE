-- DropForeignKey
ALTER TABLE "shipment" DROP CONSTRAINT "shipment_currentPointId_fkey";

-- DropForeignKey
ALTER TABLE "shipment" DROP CONSTRAINT "shipment_driverId_fkey";

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_currentPointId_fkey" FOREIGN KEY ("currentPointId") REFERENCES "point"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
