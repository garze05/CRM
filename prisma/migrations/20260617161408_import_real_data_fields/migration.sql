-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ClientType" ADD VALUE 'SHOPPING_CENTER';
ALTER TYPE "ClientType" ADD VALUE 'ADVERTISING_AGENCY';

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyPhone" TEXT,
ADD COLUMN     "responsibleId" UUID;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "surchargeAgencyPercent" DECIMAL(5,2) NOT NULL DEFAULT 15,
ADD COLUMN     "surchargeShoppingCenterPercent" DECIMAL(5,2) NOT NULL DEFAULT 10;

-- CreateIndex
CREATE INDEX "clients_responsibleId_idx" ON "clients"("responsibleId");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
