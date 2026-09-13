CREATE TABLE "refund_resolutions" (
  "id" TEXT PRIMARY KEY,
  "requestId" TEXT NOT NULL REFERENCES "refund_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "clientRequestId" TEXT NOT NULL UNIQUE,
  "requestHash" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "evidenceReference" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "previousStatus" TEXT NOT NULL,
  "resultingStatus" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "refund_resolutions_requestId_createdAt_idx" ON "refund_resolutions"("requestId", "createdAt");
