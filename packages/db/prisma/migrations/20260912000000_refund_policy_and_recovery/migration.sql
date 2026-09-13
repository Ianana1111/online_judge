ALTER TABLE "payments" ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "refundPolicyVersion" TEXT NOT NULL DEFAULT 'legacy-30d',
  ADD COLUMN "refundDeadlineAt" TIMESTAMP(3),
  ADD COLUMN "ecpayTradeNo" TEXT,
  ADD COLUMN "cycleNumber" INTEGER,
  ADD COLUMN "entitlementStartsAt" TIMESTAMP(3),
  ADD COLUMN "entitlementEndsAt" TIMESTAMP(3);

-- Preserve the exact previously advertised eligibility deadline on historical purchases.
-- reviewedAt is the only historical confirmation timestamp; it is not gateway proof.
UPDATE "payments" SET "paidAt" = COALESCE("reviewedAt", "createdAt"),
  "refundDeadlineAt" = "createdAt" + INTERVAL '30 days'
WHERE "method" = 'ECPAY' AND "ecpayMethod" = 'CREDIT'
  AND "status" IN ('APPROVED', 'AUTHORIZED', 'REFUNDED');
ALTER TABLE "payments" ALTER COLUMN "refundPolicyVersion" SET DEFAULT 'first-charge-7d-v1';
CREATE UNIQUE INDEX "payments_ecpayTradeNo_key" ON "payments"("ecpayTradeNo");
CREATE UNIQUE INDEX "payments_subscriptionId_cycleNumber_key" ON "payments"("subscriptionId", "cycleNumber");

CREATE TYPE "RefundRequestStatus" AS ENUM ('REQUESTED', 'PROCESSING', 'NEEDS_REVIEW', 'COMPLETED');
CREATE TABLE "refund_requests" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "paymentId" TEXT NOT NULL UNIQUE,
  "amountNtd" INTEGER NOT NULL,
  "merchantTradeNo" TEXT NOT NULL,
  "status" "RefundRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "inFlightAction" TEXT,
  "cancellationConfirmedAt" TIMESTAMP(3),
  "refundConfirmedAt" TIMESTAMP(3)
);
CREATE INDEX "refund_requests_status_nextAttemptAt_idx" ON "refund_requests"("status", "nextAttemptAt");
