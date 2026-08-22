-- CONCURRENTLY, not a plain CREATE INDEX: these tables (submissions especially) already hold real
-- production data and are under continuous write load from the judge worker — a normal CREATE
-- INDEX takes an ACCESS EXCLUSIVE lock for the whole build, blocking every write to the table
-- until it finishes. CONCURRENTLY avoids that at the cost of a longer build and (Postgres
-- requirement) each statement running outside a transaction block, which is why every other
-- migration.sql in this project runs one statement per file — Prisma detects CONCURRENTLY and
-- executes it outside its usual per-migration transaction wrapper automatically.

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "collection_problems_problemId_idx" ON "collection_problems"("problemId");
