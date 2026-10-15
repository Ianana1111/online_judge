-- CONCURRENTLY — see 20260822202025_add_performance_indexes's own comment for why.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "submissions_createdAt_idx" ON "submissions"("createdAt");
