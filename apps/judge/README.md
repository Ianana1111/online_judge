# @oj/judge — remote-judge worker

Consumes `judge-submissions` BullMQ jobs and judges each one by proxying to the real UVa Online
Judge (see `src/remote/`), then reports the verdict back to the API via
`POST /internal/submissions/:id/result`. There is no local sandbox — nothing here compiles or
executes untrusted code.

See `src/remote/README.md` for how the UVa adapter actually works (login/submit/poll) and its
known limitations (it's markup-scraping, not an official API).

## Env vars

See `.env.example` at the repo root: `DATABASE_URL`, `REDIS_URL`, `API_INTERNAL_URL`,
`INTERNAL_SERVICE_TOKEN`, `JUDGE_CONCURRENCY`, `UVA_BOT_USERNAME`, `UVA_BOT_PASSWORD`.

## Local dev

`pnpm --filter @oj/judge dev` runs the worker directly — no special OS requirements (this used to
need Linux for cgroup-based sandboxing; that's gone now).
