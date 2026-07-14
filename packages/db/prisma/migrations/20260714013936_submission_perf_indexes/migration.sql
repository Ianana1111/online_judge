-- DropIndex
DROP INDEX "submissions_contestId_userId_idx";

-- CreateIndex
CREATE INDEX "submissions_contestId_userId_createdAt_idx" ON "submissions"("contestId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "submissions_verdict_createdAt_idx" ON "submissions"("verdict", "createdAt");
