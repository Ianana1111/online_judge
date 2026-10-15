CREATE TABLE "site_counters" (
  "key" TEXT NOT NULL, "value" BIGINT NOT NULL DEFAULT 0, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_counters_pkey" PRIMARY KEY ("key")
);
