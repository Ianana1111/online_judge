# judge.tw

An online judge for Taiwan's CPE and GPE programming exams. Students practice past exam problems, take timed virtual exams, and get verdicts streamed back live.

Live site: [judge.tw](https://judge.tw)

## Features

- **430 problems** from past CPE/GPE exams, each with reference solutions in C11, C++17, Java 17 and Python 3
- **Submit and Run**: full judging against hidden tests, or a quick run against samples and custom input
- **Live verdicts** over Server-Sent Events, including a site-wide live feed of practice submissions
- **Virtual exams** with per-attempt time windows and scoreboards
- **Editorials, discussion, leaderboard** and user profiles
- **Accounts**: email/password (argon2id) and Google sign-in, with optional TOTP MFA
- **Pro plan** billing through ECPay and Stripe
- **Admin dashboards** for traffic, submissions, payments and moderation
- **JudgeOps**: monitoring plus agent-assisted incident triage and repair (see [docs/judgeops.md](docs/judgeops.md))

## Architecture

```mermaid
flowchart LR
  Browser[Browser<br/>Next.js on Vercel] -->|HTTPS| API[API<br/>NestJS on Railway]
  API --> PG[(PostgreSQL)]
  API --> Redis[(Redis<br/>BullMQ, rate limits, Pub/Sub)]
  Redis --> Judge[Judge worker<br/>BullMQ consumer]
  Judge -->|one microVM per job| Sandbox[Vercel Sandbox<br/>Firecracker, no network]
  Judge -->|problems without local tests| UVa[UVa Online Judge]
  Judge -->|result callback| API
  API -->|SSE| Browser
```

How a submission is judged:

1. The API writes the submission (`PENDING`) inside a transaction that also enforces per-user limits and idempotency. The committed row acts as an outbox: if enqueueing fails, a dispatcher retries it.
2. A judge worker claims the job, compiles and runs the code in a fresh network-isolated microVM as an unprivileged user, and compares output against each hidden test.
3. The worker saves the verdict to the database before calling back to the API, so a failed callback never loses a result.
4. The API applies the result only if the submission is still unfinished (so retries can't overwrite a final verdict) and publishes it over Redis Pub/Sub to the user's SSE stream.

## Repository layout

| Path | What it is |
|---|---|
| `apps/web` | Next.js (App Router) frontend |
| `apps/api` | NestJS REST API, auth, billing, SSE streams |
| `apps/judge` | BullMQ worker: local sandbox judging and the UVa relay |
| `apps/ops-monitor`, `apps/ops-runner` | JudgeOps monitoring and incident runner |
| `packages/db` | Prisma schema, migrations and seed |
| `packages/shared` | Types, schemas and judging logic shared across apps |
| `packages/config` | Shared TypeScript config |
| `content/editorials` | Editorials and reference solutions |
| `tests` | Vitest unit/integration tests and Playwright E2E tests |
| `docs` | Deployment, operations and launch-readiness records |

## Tech stack

TypeScript, Next.js 15, React 18, NestJS 11, Prisma 5, PostgreSQL 16, Redis 7, BullMQ, Vercel Sandbox, Turborepo and pnpm. Tested with Vitest and Playwright.

## Local development

Requirements: Node.js 20+, pnpm 10, and Docker.

```bash
pnpm install
cp .env.example .env            # then fill in the secrets
docker compose up -d postgres redis

set -a; source .env; set +a     # export DATABASE_URL etc. for the commands below
pnpm db:migrate
ALLOW_LOCAL_DEMO_SEED=1 pnpm db:seed   # creates admin/Admin123! and demo/Demo1234!

pnpm dev                        # web on :3000, API on :4000, judge worker
```

Local judging runs in Vercel Sandbox, so it needs `JUDGE_SANDBOX_SNAPSHOT_ID` and a Vercel token (see `.env.example`). Without them, submissions finish with a system error (`SE`), but the rest of the site works.

## Testing

```bash
pnpm typecheck
pnpm lint
pnpm test                       # unit tests; database tests are skipped by default
```

Database integration tests run against a disposable PostgreSQL and Redis:

```bash
docker compose -p oj-test -f compose.test.yml up -d --wait
export DATABASE_URL=postgresql://oj_test:oj_test_local_only@127.0.0.1:55432/oj_test \
       REDIS_URL=redis://127.0.0.1:56379 RUN_DB_TESTS=1
pnpm --filter @oj/db exec prisma migrate deploy
pnpm test
```

End-to-end tests use Playwright (`pnpm test:e2e`). See `.github/workflows/readiness.yml` for the full CI sequence.

## Deployment

- **API and judge** run on Railway and deploy from `main` after CI passes. Migrations run automatically on each API deploy.
- **Web** runs on Vercel. Each push builds a deployment, and `judge.tw` moves to it only after the `verify` CI job passes.

Details: [docs/railway-deployment.md](docs/railway-deployment.md) and [docs/launch-readiness/deployment-gates.md](docs/launch-readiness/deployment-gates.md).
