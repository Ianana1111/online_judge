ALTER TABLE "submissions" ADD COLUMN "clientRequestId" TEXT,
  ADD COLUMN "queuedAt" TIMESTAMP(3), ADD COLUMN "quotaMonth" TEXT,
  ADD COLUMN "quotaRefundedAt" TIMESTAMP(3), ADD COLUMN "evaluationVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "submissions" ADD COLUMN "pendingJudgeResult" JSONB;
CREATE UNIQUE INDEX "submissions_userId_clientRequestId_key" ON "submissions"("userId", "clientRequestId");
UPDATE "submissions" SET "queuedAt" = "createdAt", "quotaMonth" = to_char("createdAt" + INTERVAL '8 hours', 'YYYY-MM');
ALTER TABLE "contest_participants" ADD COLUMN "scoringVersion" TEXT NOT NULL DEFAULT 'legacy-v1';
ALTER TABLE "contest_participants" ALTER COLUMN "scoringVersion" SET DEFAULT 'icpc-v2';
