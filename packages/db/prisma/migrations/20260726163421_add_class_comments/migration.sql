-- CreateTable
CREATE TABLE "class_comments" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_comments_classId_createdAt_idx" ON "class_comments"("classId", "createdAt");

-- AddForeignKey
ALTER TABLE "class_comments" ADD CONSTRAINT "class_comments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_comments" ADD CONSTRAINT "class_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
