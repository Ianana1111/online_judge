-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "bankCode" TEXT,
ADD COLUMN     "expireDate" TEXT,
ADD COLUMN     "merchantTradeNo" TEXT,
ADD COLUMN     "vAccount" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payments_merchantTradeNo_key" ON "payments"("merchantTradeNo");

