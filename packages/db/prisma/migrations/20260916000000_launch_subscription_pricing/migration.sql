-- Preserve all existing amounts and distinguish new launch orders from legacy subscriptions.
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "pricingVersion" TEXT NOT NULL DEFAULT 'legacy-v1';
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "pricingVersion" TEXT NOT NULL DEFAULT 'legacy-v1';
