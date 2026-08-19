-- AlterTable
ALTER TABLE "users" ADD COLUMN     "schoolEmail" TEXT,
ADD COLUMN     "schoolVerificationSentAt" TIMESTAMP(3),
ADD COLUMN     "schoolVerifiedAt" TIMESTAMP(3);
