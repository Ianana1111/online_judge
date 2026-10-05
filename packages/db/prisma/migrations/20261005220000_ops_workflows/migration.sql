CREATE TABLE "AgentOpsTask" (
  "id" TEXT NOT NULL, "requestKey" TEXT NOT NULL, "kind" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "title" TEXT NOT NULL, "sourceRunId" TEXT, "payload" JSONB NOT NULL, "events" JSONB NOT NULL DEFAULT '[]',
  "result" JSONB, "resultHash" TEXT, "credentialId" TEXT, "leaseHash" TEXT, "leaseUntil" TIMESTAMP(3), "deadlineAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0, "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "errorCode" TEXT,
  "approvalDigest" TEXT, "approvedById" TEXT, "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completedAt" TIMESTAMP(3), CONSTRAINT "AgentOpsTask_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AgentOpsTask_requestKey_key" ON "AgentOpsTask"("requestKey");
CREATE INDEX "AgentOpsTask_status_availableAt_createdAt_idx" ON "AgentOpsTask"("status", "availableAt", "createdAt");
CREATE INDEX "AgentOpsTask_kind_createdAt_idx" ON "AgentOpsTask"("kind", "createdAt");
