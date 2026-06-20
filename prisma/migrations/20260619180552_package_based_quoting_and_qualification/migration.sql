-- AlterTable
ALTER TABLE "events" ADD COLUMN     "partyTheme" TEXT,
ADD COLUMN     "requestedCharacterId" UUID,
ADD COLUMN     "venueLat" DECIMAL(10,7),
ADD COLUMN     "venueLng" DECIMAL(10,7);

-- AlterTable
ALTER TABLE "packages" DROP COLUMN "priceCorporate",
DROP COLUMN "priceEducational",
DROP COLUMN "priceFamily",
ADD COLUMN     "basePrice" DECIMAL(12,2) NOT NULL;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "standaloneSellable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "quotes" ADD COLUMN     "selectedOptionId" UUID;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "depositMethod" TEXT,
ADD COLUMN     "depositPaidAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "priceRoundingTo" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "transportOriginLat" DECIMAL(10,7),
ADD COLUMN     "transportOriginLng" DECIMAL(10,7);

-- CreateTable
CREATE TABLE "quote_options" (
    "id" UUID NOT NULL,
    "quoteId" UUID NOT NULL,
    "packageId" UUID,
    "label" TEXT NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "quotedPrice" DECIMAL(12,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_option_extras" (
    "id" UUID NOT NULL,
    "optionId" UUID NOT NULL,
    "serviceId" UUID,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "quote_option_extras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quote_options_quoteId_idx" ON "quote_options"("quoteId");

-- CreateIndex
CREATE INDEX "quote_option_extras_optionId_idx" ON "quote_option_extras"("optionId");

-- CreateIndex
CREATE INDEX "events_requestedCharacterId_idx" ON "events"("requestedCharacterId");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_selectedOptionId_key" ON "quotes"("selectedOptionId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_requestedCharacterId_fkey" FOREIGN KEY ("requestedCharacterId") REFERENCES "catalog_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "quote_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_options" ADD CONSTRAINT "quote_options_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_options" ADD CONSTRAINT "quote_options_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_option_extras" ADD CONSTRAINT "quote_option_extras_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "quote_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_option_extras" ADD CONSTRAINT "quote_option_extras_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
