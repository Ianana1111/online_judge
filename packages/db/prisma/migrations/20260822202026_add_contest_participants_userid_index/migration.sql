-- CONCURRENTLY — see 20260822202025_add_performance_indexes's own comment for why.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "contest_participants_userId_idx" ON "contest_participants"("userId");
