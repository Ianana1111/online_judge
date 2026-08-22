-- CONCURRENTLY — see 20260822202025_add_performance_indexes's own comment for why. This is the
-- largest, most actively-written table in the schema, so keeping this one fully isolated in its
-- own migration (not batched with the smaller tables' indexes above) matters most here.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "submissions_userId_verdict_createdAt_idx" ON "submissions"("userId", "verdict", "createdAt");
