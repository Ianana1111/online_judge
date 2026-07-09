-- AlterTable
ALTER TABLE "contest_problems" ADD COLUMN     "attempted" INTEGER,
ADD COLUMN     "correct" INTEGER,
ADD COLUMN     "submissions" INTEGER;

-- AlterTable
ALTER TABLE "contests" ADD COLUMN     "totalCandidates" INTEGER;
