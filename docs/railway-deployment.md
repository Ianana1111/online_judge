# Railway deployment reference

This documents the production Railway project's actual configuration (captured
2026-09-14 via deployment manifests and transient variable checks), so the deploy
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
- Deployment healthcheck: `/health`, 180-second timeout, port 4000.
- Zero configured overlap and 60-second draining; production deployments wait for CI.

### `judge`
- Builder: Dockerfile at `/docker/Dockerfile.judge`
- Start command: image default (`pnpm exec tsx src/worker.ts`)
- Restart policy: `ON_FAILURE`, max 10 retries
- Deployment healthcheck: `/health`, 180-second timeout, port 4100.
- Zero configured overlap and 60-second draining; production deployments wait for CI.
- The health endpoint reports Redis/worker state. Railway's deployment check
  controls rollout readiness; it is not a continuous restart or alerting service.

### `Redis`
- Managed Railway Redis 8.2.9, persisted volume, `--save 60 1`
- Reachable via `REDIS_URL` (embeds auth) from `api` and `judge`

### `Postgres`
- Managed Railway PostgreSQL 18, persisted volume
- Reachable via `DATABASE_URL` from `api` and `judge`
- Check current volume allocation and growth in Railway before changing retention.

### `web`
Not on Railway — deployed separately on Vercel (Next.js). Not covered by this
document.

## Environment variables

Values live only in Railway's dashboard (`railway variables --service <name>`
to inspect, never printed here). Names, for reference:

**api**: `ACCOUNT_SECURITY_KEY`, `API_INTERNAL_URL`, `API_ORIGIN`, `API_PORT`, `COOKIE_DOMAIN`,
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
`NEXT_PUBLIC_API_URL`, `NODE_ENV`, `POSTGRES_DB`, `POSTGRES_PASSWORD`, `POSTGRES_USER`,
`REDIS_URL`, `UVA_BOT_PASSWORD`, `UVA_BOT_USERNAME`, `VERCEL_PROJECT_ID`,
`VERCEL_TEAM_ID`, `VERCEL_TOKEN`, `WEB_ORIGIN`

**Operational options**: `ADMIN_MFA_REQUIRED` (enable only after owner enrollment),
`TRUSTED_PROXY_CIDRS`, `SENTRY_DSN`, `JUDGE_HEALTH_PORT` (judge only, default 4100).
`web` additionally takes `NEXT_PUBLIC_SENTRY_DSN`. An implemented integration
does not prove that its external delivery is active.

The API encryption key was configured on September 14 without printing it or
rotating an existing key. Keep an owner-controlled recovery copy; changing it
can invalidate encrypted MFA secrets and pending email material. Mandatory
administrator MFA remains off until the owner enrolls and saves recovery codes.

See `.env.example` at the repo root for what each of these is for and a safe
local-dev value where one exists — this list exists to say *which secrets need
to be recreated on a new Railway project*, not to explain them.

## Operations and remaining acceptance

- Both services are connected to GitHub `main` with Wait for CI enabled. The
  Vercel production alias also requires the `verify` check. See
  [deployment gates](launch-readiness/deployment-gates.md).
- Fresh production backups were restored successfully on September 13 and 14.
  The September 14 rehearsal and production rollout preserve 28 original
  business-table fingerprints and apply 57 migrations. This does not establish
  scheduled offsite backups or an application rollback after new writes. See
  [backup operations](launch-readiness/backup-operations.md).
- Structured monitoring, privacy-filtered telemetry and a scheduled public
  health workflow are implemented. External alert delivery and sustained
  production capacity still require acceptance.
- `TRUSTED_PROXY_CIDRS` remains unset until a trusted socket-peer allowlist is
  established. Anonymous clients sharing a proxy peer can share rate budgets.
- Real email, school-inbox, charge, renewal, cancellation and refund acceptance
  remain separate from deployment smoke tests.
- Review [production content gaps](launch-readiness/production-content-gaps.json):
  16 existing GPE problems have no judge route, blocking 42 archive exams.
  Earlier local-corpus lifecycle results do not certify this production corpus.
