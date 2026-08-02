-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastLoginDate" TEXT,
ADD COLUMN     "loginStreak" INTEGER NOT NULL DEFAULT 0;
