-- DropForeignKey
ALTER TABLE "contactWay" DROP CONSTRAINT "contactWay_clientId_fkey";

-- AddForeignKey
ALTER TABLE "contactWay" ADD CONSTRAINT "contactWay_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
