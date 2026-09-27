# Judge capacity and Run quota — September 27, 2026

The deployed target is 50 Submit jobs and 50 Run jobs across all worker replicas.
This is a concurrency ceiling, not a promise of 100 jobs completing per second.
A separate Redis lease pool limits live/closing Vercel sandboxes to 100; a lease
is released after a confirmed stop or after its sandbox deadline plus margin.

## Admission and cost protection

- Submit queue: at most 300 admitted jobs, including active jobs/outbox reservations.
- Run queue: at most 200 admitted jobs. Remote UVa queue: 20, concurrency 1.
- An account may have at most three unfinished jobs across Submit and Run.
- Both buttons have independent 10-second server-enforced cooldowns.
- Free accounts have 20 Run attempts per calendar month using the existing billing
  month convention. Effective Pro (including existing student/admin entitlements)
  has no monthly cap but retains cooldown, fairness and capacity restrictions.
- Redis atomically checks capacity, cooldown and quota before reserving a job.
  A rejected request does not increment Run quota. SE/ERROR refunds once in its
  original quota month; compilation/user-code errors consume an attempt.
- Stop admitting judge work when Redis is unavailable or its memory reaches 256 MiB.
  Redis memory warnings start at 220 MiB. Other page traffic has separate handling.
- Each local queue starts at most 20 jobs/second. Standby sandboxes default to zero.
- Three sandbox creation failures in 30 seconds open a 15-second admission pause.
  Already accepted jobs remain bounded and receive results or refundable errors.

## Recovery and resource bounds

- Submit remains a PostgreSQL outbox, with versioned durable result recovery.
- Run workers atomically store results directly in Redis before the API callback.
  An HTTP callback outage cannot overwrite or lose the stored verdict.
- Internal authenticated result callbacks are exempt from browser API throttling.
- Queue wait is limited to 10 minutes. A job that starts near that limit gets its
  own execution allowance; cleanup checks actual queue state/processedOn, not just
  the submission creation time. Overdue work reports a refundable service error.
- Pending Run ownership/refund metadata outlives the waiting budget (40 days).
  Completed results/ownership have a one-hour TTL and a global 1,000-result cap.
  Result JSON is at most 64 KiB; only display output is truncated, after comparison.
- Completed queue history retains 100 jobs/one hour; failures 200 jobs/one day.
- Hidden tests are read individually with a 192 MiB conservative buffer budget.
  Existing largest test case measured 10,030,896 bytes and fits this budget.
- Default Prisma pools use 10 connections with a 5-second pool wait limit.
  Explicit connection_limit/pool_timeout URL settings continue to take precedence.
- SSE uses one Pub/Sub Redis connection per API process, up to six result streams
  per account/process and 1,500 total, bounded lifetimes and response buffering.
- Existing sandbox network, privilege, compilation and per-language limits remain.

## Visibility

Admin Operations shows queue limits, waiting/active counts, live sandbox leases,
worker memory/heartbeat, Redis memory/connections, DB connection count and recent
P95 wait/processing times. Existing minute-by-minute operational log alerts also
cover missing workers, Run errors, circuit pause, long waits and Redis memory.
The current production Sentry DSN is not configured: this is not external pager
or email delivery. Budget notifications should also be enabled in Vercel.

## Evidence and scope

- Isolated Redis tests: 1,000 simultaneous admission attempts; queue bounds; two
  worker replicas reaching exactly 50 + 50 active jobs; cooldown; last quota slot;
  exactly-once refund; circuit outage; serialized-output bounds.
- Real local PostgreSQL/Redis: submission transactions, outbox recovery, historical
  exams, database test-data streaming, free/Pro quota enforcement and enqueue failure.
- Built API HTTP smoke tests: auth/CSRF, Pro editorial permissions, moderation,
  school routes and MFA; Docker sandbox isolation and Run/Submit verdict parity.
- Production opt-in drill: `CAPACITY_DRILL_PRODUCTION=1 CAPACITY_DRILL_USERS=5 node
  scripts/judge-capacity-drill.mjs`, then 50 users only if the small phase succeeds.
  Uses temporary fixture accounts, all four verified Hashmat implementations and
  the actual Railway API/worker/Vercel Sandbox. Cleans only its own accounts/jobs.
  Sanitized reports are written to `capacity-production-5.json` / `-50.json`.
  A bounded burst does not establish sustained capacity for all problem workloads.

The editorial fingerprint includes the new orchestration/data-loading helpers.
Old published evidence remains explicitly readable because compiler commands,
checker logic, test bytes/order and problem limits are unchanged; new publication
still requires evidence under the new revision. Old evidence is not relabeled.

## Production acceptance results

September 27: the 5-user phase passed 5 Submit AC + 5 Run sample AC, with all 10
SSE streams completed. The 50-user phase passed 50 Submit AC + 50 Run sample AC,
with all 100 SSE streams completed and no service errors. The latter burst finished
in 11 seconds; HTTP admission P95 was 691 ms. Observed peaks were 50 active Submit,
20 active Run, 95 live/closing Sandbox leases, worker RSS 245 MiB and Redis 3 MiB.
The isolated two-replica test separately reached 50 + 50 active jobs simultaneously.

Afterwards all three queues were empty, no Sandbox lease remained, Redis had 21
connections, PostgreSQL had 21 connections, and no operational alert was active.
Both test phases removed their own fixture users/jobs. These measurements concern
four verified solutions for Hashmat, and do not claim sustained capacity for every
large-input/slow problem. The Redis 7 Pub/Sub reconnect regression is covered by a
real HTTP test with 50 SSE readers and the six-stream per-account boundary.
