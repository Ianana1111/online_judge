-- AlterTable
ALTER TABLE "users" ADD COLUMN     "streakFreezeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "streakFreezeGrantMonth" TEXT;

-- CreateTable
CREATE TABLE "streak_freeze_days" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streak_freeze_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "streak_freeze_days_userId_date_key" ON "streak_freeze_days"("userId", "date");

-- AddForeignKey
ALTER TABLE "streak_freeze_days" ADD CONSTRAINT "streak_freeze_days_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
