-- Allow a user to attempt an individual/virtual contest more than once. Each attempt gets its own
-- ContestParticipant row (attemptNumber 1, 2, 3, ...) instead of one row per (contest, user) ever.

-- AlterTable: attemptNumber, default 1 so every existing row becomes "attempt 1" for free.
ALTER TABLE "contest_participants" ADD COLUMN "attemptNumber" INTEGER NOT NULL DEFAULT 1;

-- AlterTable: submissions now record which specific attempt they were made under — contestId alone
-- is no longer enough once a contest can have multiple attempts per user.
ALTER TABLE "submissions" ADD COLUMN "contestParticipantId" TEXT;

-- Backfill: at this point every contest_participants row is still attemptNumber 1 (the column was
-- just added), so contestId+userId still uniquely identifies one participant row — safe to backfill
-- every pre-existing contest submission's contestParticipantId from that 1:1 relationship.
UPDATE "submissions" s
SET "contestParticipantId" = cp."id"
FROM "contest_participants" cp
WHERE s."contestId" = cp."contestId"
  AND s."userId" = cp."userId"
  AND s."contestParticipantId" IS NULL;

-- DropIndex: the old "one participant ever" uniqueness no longer holds.
DROP INDEX "contest_participants_contestId_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "contest_participants_contestId_userId_attemptNumber_key" ON "contest_participants"("contestId", "userId", "attemptNumber");

-- CreateIndex: fast "find this user's attempts at this contest, latest first" lookups.
CREATE INDEX "contest_participants_contestId_userId_idx" ON "contest_participants"("contestId", "userId");

-- CreateIndex
CREATE INDEX "submissions_contestParticipantId_idx" ON "submissions"("contestParticipantId");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_contestParticipantId_fkey" FOREIGN KEY ("contestParticipantId") REFERENCES "contest_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
