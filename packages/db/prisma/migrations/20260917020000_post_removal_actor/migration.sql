-- Additive audit metadata: retain existing content and historical removal timestamps.
ALTER TABLE "posts"
  ADD COLUMN "deletedById" TEXT,
  ADD COLUMN "deletedByRole" "Role";
