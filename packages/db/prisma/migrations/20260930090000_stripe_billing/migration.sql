ALTER TABLE "users" ADD COLUMN "stripeCustomerId" TEXT, ADD COLUMN "stripeLivemode" BOOLEAN;
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");
ALTER TABLE "payments" ADD COLUMN "stripeCheckoutId" TEXT, ADD COLUMN "stripeCheckoutExpiresAt" TIMESTAMP(3), ADD COLUMN "stripeInvoiceId" TEXT, ADD COLUMN "stripePaymentIntentId" TEXT, ADD COLUMN "stripeAccessNotBeforeAt" TIMESTAMP(3), ADD COLUMN "stripeProductId" TEXT, ADD COLUMN "stripeLivemode" BOOLEAN;
CREATE UNIQUE INDEX "payments_stripeCheckoutId_key" ON "payments"("stripeCheckoutId");
CREATE UNIQUE INDEX "payments_stripeInvoiceId_key" ON "payments"("stripeInvoiceId");
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");
ALTER TABLE "subscriptions" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'ECPAY', ADD COLUMN "stripeSubscriptionId" TEXT, ADD COLUMN "stripeState" TEXT, ADD COLUMN "stripeCurrentPeriodEnd" TIMESTAMP(3);
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");
ALTER TABLE "refund_requests" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'ECPAY', ADD COLUMN "stripeRefundId" TEXT;
CREATE UNIQUE INDEX "refund_requests_stripeRefundId_key" ON "refund_requests"("stripeRefundId");
CREATE TABLE "stripe_webhook_events" (
  "id" TEXT PRIMARY KEY, "type" TEXT NOT NULL, "objectId" TEXT NOT NULL, "livemode" BOOLEAN NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "processedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0, "reviewRequired" BOOLEAN NOT NULL DEFAULT FALSE, "errorCode" TEXT
);
CREATE INDEX "stripe_webhook_events_processedAt_receivedAt_idx" ON "stripe_webhook_events"("processedAt", "receivedAt");
