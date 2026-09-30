CREATE TABLE "external_service_records" (
  "key" TEXT PRIMARY KEY,
  "plan" TEXT NOT NULL DEFAULT '',
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "billingCycle" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "amountMinor" INTEGER,
  "budgetMinor" INTEGER,
  "renewsAt" TIMESTAMP(3),
  "notes" TEXT NOT NULL DEFAULT '',
  "managementUrl" TEXT,
  "billingSnapshot" JSONB,
  "billingCheckedAt" TIMESTAMP(3),
  "updatedById" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "external_service_currency" CHECK ("currency" IN ('USD', 'TWD')),
  CONSTRAINT "external_service_cycle" CHECK ("billingCycle" IN ('UNKNOWN', 'MONTHLY', 'YEARLY', 'USAGE', 'FREE')),
  CONSTRAINT "external_service_amount" CHECK ("amountMinor" IS NULL OR "amountMinor" >= 0),
  CONSTRAINT "external_service_budget" CHECK ("budgetMinor" IS NULL OR "budgetMinor" > 0)
);
