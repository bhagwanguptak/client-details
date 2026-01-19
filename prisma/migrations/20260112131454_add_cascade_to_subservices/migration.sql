-- DropForeignKey
ALTER TABLE "SubService" DROP CONSTRAINT "SubService_serviceId_fkey";

-- AddForeignKey
ALTER TABLE "SubService" ADD CONSTRAINT "SubService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
