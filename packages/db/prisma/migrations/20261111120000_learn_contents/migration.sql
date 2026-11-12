CREATE TABLE "learn_contents" (
  "slug" TEXT NOT NULL, "version" TEXT NOT NULL, "content" JSONB NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "learn_contents_pkey" PRIMARY KEY ("slug")
);
