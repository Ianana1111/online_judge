CREATE TYPE "ContentReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED');
ALTER TABLE "posts" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'GENERAL', ADD COLUMN "publishedAt" TIMESTAMP(3), ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "discussions" ALTER COLUMN "problemId" DROP NOT NULL, ADD COLUMN "postId" TEXT, ADD COLUMN "publishedAt" TIMESTAMP(3), ADD COLUMN "deletedAt" TIMESTAMP(3);
-- Existing content was already public; retain it, while every new row starts unpublished.
UPDATE "posts" SET "publishedAt" = "createdAt", "category" = CASE WHEN "isOfficial" THEN 'ANNOUNCEMENT' ELSE 'GENERAL' END;
UPDATE "discussions" SET "publishedAt" = "createdAt";
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_one_parent" CHECK (num_nonnulls("problemId", "postId") = 1);
CREATE TABLE "content_revisions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT, "discussionId" TEXT, "submittedById" TEXT NOT NULL,
  "title" TEXT, "body" TEXT NOT NULL, "category" TEXT, "isOfficial" BOOLEAN NOT NULL DEFAULT false,
  "status" "ContentReviewStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3), "reviewedById" TEXT, "reason" TEXT,
  CONSTRAINT "content_revisions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "content_revisions_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "content_revisions_one_target" CHECK (num_nonnulls("postId", "discussionId") = 1)
);
CREATE INDEX "posts_publishedAt_id_idx" ON "posts"("publishedAt", "id");
CREATE INDEX "discussions_postId_createdAt_idx" ON "discussions"("postId", "createdAt");
CREATE INDEX "content_revisions_status_createdAt_id_idx" ON "content_revisions"("status", "createdAt", "id");
CREATE INDEX "content_revisions_postId_createdAt_idx" ON "content_revisions"("postId", "createdAt");
CREATE INDEX "content_revisions_discussionId_createdAt_idx" ON "content_revisions"("discussionId", "createdAt");
CREATE INDEX "content_revisions_submittedById_createdAt_idx" ON "content_revisions"("submittedById", "createdAt");
CREATE UNIQUE INDEX "content_revisions_one_pending_post" ON "content_revisions"("postId") WHERE "status" = 'PENDING';
CREATE UNIQUE INDEX "content_revisions_one_pending_discussion" ON "content_revisions"("discussionId") WHERE "status" = 'PENDING';
