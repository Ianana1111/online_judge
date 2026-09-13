CREATE TABLE "school_domain_requests" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "school" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "officialUrl" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED', 'REVOKED')),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "school_domain_requests_userId_createdAt_idx" ON "school_domain_requests"("userId", "createdAt");
CREATE INDEX "school_domain_requests_school_status_idx" ON "school_domain_requests"("school", "status");
CREATE UNIQUE INDEX "school_domain_one_pending_per_user" ON "school_domain_requests"("userId") WHERE "status" = 'PENDING';
CREATE UNIQUE INDEX "school_domain_one_approved_domain" ON "school_domain_requests"("domain") WHERE "status" = 'APPROVED';
CREATE TABLE "school_domain_decisions" (
  "id" TEXT PRIMARY KEY,
  "requestId" TEXT NOT NULL REFERENCES "school_domain_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "actorId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "school_domain_decisions_requestId_createdAt_idx" ON "school_domain_decisions"("requestId", "createdAt");
