# Railway deployment reference

This documents the production Railway project's actual configuration (captured
2026-08-23 via `railway status --json` / `railway variables`), so the deploy
setup can be reconstructed from the repo instead of living only in Railway's
dashboard. **This is documentation, not a config file Railway reads** —
deliberately not a `railway.json`/`railway.toml`, since a file Railway actively
applies on deploy risks silently overriding the live dashboard settings if it
ever drifts out of sync with what this doc says. Update this file by hand
whenever a service's build/deploy settings change in the dashboard.

Project: `glistening-radiance` (Railway workspace "Ian, Lee's Projects"),
environment `production`, region `sfo`, 1 replica per service.

## Services

### `api`
- Builder: Dockerfile at `/docker/Dockerfile.api`
- Start command: `sh -c "pnpm --filter @oj/db exec prisma migrate deploy && node dist/main.js"`
  — **migrations run automatically as part of every deploy**, before the server
  starts. A schema change only needs its migration file committed; no separate
  manual `prisma migrate deploy` step against production is needed.
- Restart policy: `ON_FAILURE`, max 10 retries
- No healthcheck path configured

### `judge`
- Builder: Dockerfile at `/docker/Dockerfile.judge`
- Start command: image default (`pnpm exec tsx src/worker.ts`)
- Restart policy: `ON_FAILURE`, max 10 retries
- No healthcheck path configured. A `GET /health` endpoint exists on port
  `JUDGE_HEALTH_PORT` (default 4100) reporting queue depth and time since the
  last completed judge — see `apps/judge/src/health.ts`. Not currently wired
  into Railway's own healthcheck/restart mechanism: doing so needs a deliberate
  decision about what "unhealthy" should mean here, since a false positive
  would restart a judge worker that's actually still mid-task.

### `Redis`
- Managed Railway Redis (Railpack-built), persisted volume, `--save 60 1`
- Reachable via `REDIS_URL` (embeds auth) from `api` and `judge`

### `Postgres`
- Managed Railway Postgres (Railpack-built), persisted volume
- Reachable via `DATABASE_URL` from `api` and `judge`
- 500MB plan tier — see the storage-growth notes below

### `web`
Not on Railway — deployed separately on Vercel (Next.js). Not covered by this
document.

## Environment variables

Values live only in Railway's dashboard (`railway variables --service <name>`
to inspect, never printed here). Names, for reference:

**api**: `API_INTERNAL_URL`, `API_ORIGIN`, `API_PORT`, `COOKIE_DOMAIN`,
`CSRF_SECRET`, `DATABASE_URL`, `ECPAY_ENV`, `ECPAY_HASH_IV`, `ECPAY_HASH_KEY`,
`ECPAY_MERCHANT_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`GOOGLE_REDIRECT_URI`, `INTERNAL_SERVICE_TOKEN`, `JUDGE_CONCURRENCY`,
`JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_TTL`,
`NEXT_PUBLIC_API_URL`, `NODE_ENV`, `POSTGRES_DB`, `POSTGRES_PASSWORD`,
`POSTGRES_USER`, `REDIS_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
`SCHOOL_VERIFY_SECRET`, `WEB_ORIGIN`

**judge**: `API_INTERNAL_URL`, `API_PORT`, `CSRF_SECRET`, `DATABASE_URL`,
`INTERNAL_SERVICE_TOKEN`, `JUDGE_CONCURRENCY`, `JUDGE_SANDBOX_SNAPSHOT_ID`,
`JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_TTL`,
`NEXT_PUBLIC_API_URL`, `POSTGRES_DB`, `POSTGRES_PASSWORD`, `POSTGRES_USER`,
`REDIS_URL`, `UVA_BOT_PASSWORD`, `UVA_BOT_USERNAME`, `VERCEL_PROJECT_ID`,
`VERCEL_TEAM_ID`, `VERCEL_TOKEN`, `WEB_ORIGIN`

**New, optional, not yet set on either service**: `SENTRY_DSN` (error tracking
— see "Known gaps" below), `JUDGE_HEALTH_PORT` (judge only, defaults to 4100 if
unset). `web` (on Vercel, not Railway) additionally takes `NEXT_PUBLIC_SENTRY_DSN`.

See `.env.example` at the repo root for what each of these is for and a safe
local-dev value where one exists — this list exists to say *which secrets need
to be recreated on a new Railway project*, not to explain them.

## Known gaps (tracked from the pre-launch audit)

- **Error tracking (Sentry) is wired in code but not yet active anywhere** —
  `api`, `judge`, and `web` all call `Sentry.init()` gated on `SENTRY_DSN` /
  `NEXT_PUBLIC_SENTRY_DSN` being set, and safely no-op without one. Creating
  the actual Sentry account/project and setting those env vars is a manual
  step (an AI agent can't sign up for third-party services on your behalf).
  Once a real DSN exists, `middleware.ts`'s CSP `connect-src` also needs that
  DSN's ingest host added, or browser-side error reports will be silently
  dropped by CSP — see the TODO comment already left there.
- No `healthcheckPath` configured on any service — a hung `api` process has no
  automatic-restart signal beyond BullMQ/Postgres connections eventually
  erroring out. `judge` now exposes `GET /health` (queue depth + time since
  last completed judge, see `apps/judge/src/health.ts`) but it's deliberately
  not wired into Railway's own healthcheck/auto-restart yet — "stuck" vs.
  "genuinely idle" isn't reliably distinguishable from those numbers alone,
  and a false positive would restart a worker that's actually still mid-task.
  Revisit once real usage patterns make a safe threshold clearer.
- Postgres and Redis are both on Railway's 500MB tier. See the audit's storage
  findings (avatars stored inline as base64 on the `users` row, `page_views`
  growth — now bounded by `PageviewRetentionService` — and BullMQ job
  retention — now bounded via `defaultJobOptions` in `redis.providers.ts`).
- **No documented database restore drill has been performed**, and this
  couldn't be verified or completed from the CLI in this pass — Railway
  exposes Postgres backup/restore only through its web dashboard, not the
  `railway` CLI (no `railway backup` subcommand exists) or the GraphQL surface
  `railway status --json` reads from. Someone with dashboard access needs to
  confirm backups are actually enabled for this project (the Hobby plan does
  not necessarily include them by default) and, ideally, actually restore one
  into a separate throwaway database to confirm it works — a backup that has
  never been restored is not a confirmed backup.
