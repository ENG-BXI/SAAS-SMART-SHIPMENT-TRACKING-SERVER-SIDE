-- DropForeignKey
ALTER TABLE "shipment" DROP CONSTRAINT "shipment_currentPointId_fkey";

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_currentPointId_fkey" FOREIGN KEY ("currentPointId") REFERENCES "point"("id") ON DELETE SET NULL ON UPDATE CASCADE;
