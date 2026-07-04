-- DropForeignKey
ALTER TABLE "shipment" DROP CONSTRAINT "shipment_driverId_fkey";

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
