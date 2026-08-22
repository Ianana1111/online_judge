-- CONCURRENTLY — see 20260822202025_add_performance_indexes's own comment for why.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "payments_userId_status_idx" ON "payments"("userId", "status");
