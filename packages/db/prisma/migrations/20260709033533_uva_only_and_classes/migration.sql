-- DropForeignKey
ALTER TABLE "submission_test_results" DROP CONSTRAINT "submission_test_results_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "submission_test_results" DROP CONSTRAINT "submission_test_results_testCaseId_fkey";

-- DropForeignKey
ALTER TABLE "test_cases" DROP CONSTRAINT "test_cases_problemId_fkey";

-- AlterTable
ALTER TABLE "problems" DROP COLUMN "isRemoteOnly";

-- AlterTable
ALTER TABLE "submissions" ALTER COLUMN "judgedOn" SET DEFAULT 'REMOTE';

-- DropTable
DROP TABLE "submission_test_results";

-- DropTable
DROP TABLE "test_cases";

-- CreateTable
CREATE TABLE "class_sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "contentMd" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_homework" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "ord" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "class_homework_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_sessions_studentId_number_key" ON "class_sessions"("studentId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "class_homework_classId_problemId_key" ON "class_homework"("classId", "problemId");

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_homework" ADD CONSTRAINT "class_homework_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_homework" ADD CONSTRAINT "class_homework_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

