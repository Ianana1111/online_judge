# @oj/judge — sandbox worker

Consumes `judge-submissions` BullMQ jobs, compiles/runs the submitted code inside an `isolate`
sandbox per test case, compares output, and reports the verdict back to the API via
`POST /internal/submissions/:id/result`.

## Container requirements (for whoever wires docker-compose)

`isolate` needs to create and manage cgroups and Linux namespaces for each sandboxed run. That
requires the **container itself** to run with elevated privileges — this worker process is a
trusted host-side process that *builds* the sandbox boundary around the untrusted submission, it is
not itself sandboxed. The standard recipe used by other containerized OJs (DOMjudge judgehosts,
HydroOJ, etc.):

- Run the service with `privileged: true` (simplest, and what most of these projects do in
  practice), **or** at minimum:
  - `cap_add: [SYS_ADMIN, SYS_PTRACE, NET_ADMIN]`
  - a writable cgroup v2 mount (`/sys/fs/cgroup`) — on Docker Desktop (macOS) the underlying
    LinuxKit VM uses cgroup v2 unified hierarchy, which `isolate --cg` targets.
- No published ports needed; put this service on an isolated Docker network with **no route to
  the internet** (isolate already denies network access to the sandboxed process itself since we
  never pass `--share-net`, but the worker process/image should still have no reason to reach out
  except to the API and Redis/Postgres/MinIO on the internal compose network).
- Needs read access to Postgres (`DATABASE_URL`), Redis (`REDIS_URL`), MinIO (`MINIO_*`), and the
  API's internal endpoint (`API_INTERNAL_URL`, `INTERNAL_SERVICE_TOKEN`).

This is a deliberate, documented trade-off: the worker container is privileged so that `isolate`
can build a strong boundary *around each submission*. Defense-in-depth beyond this (running the
whole worker inside gVisor or a Firecracker microVM) is a later hardening milestone (plan §9 M7),
not required for the sandbox to be meaningfully safe today — the actual untrusted code never gets
network access, is capped on cpu/wall-time/memory/fsize/process-count, and runs in its own
namespace with `isolate`'s restricted filesystem view.

## Env vars

See `.env.example` at the repo root: `DATABASE_URL`, `REDIS_URL`, `MINIO_*`, `API_INTERNAL_URL`,
`INTERNAL_SERVICE_TOKEN`, `JUDGE_CONCURRENCY`.

## Local dev without Docker

`isolate` is Linux-only (cgroups) — this worker cannot run natively on macOS. Use
`docker compose up judge` once the compose file exists, or develop the non-sandbox logic
(comparators, queue wiring) with `pnpm --filter @oj/judge dev` on Linux/WSL.
