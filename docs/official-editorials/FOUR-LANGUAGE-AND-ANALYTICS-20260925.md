# Four-language editorials and product analytics — 2026-09-25

## Current verified scope

- Canonical editorial inventory: 430 problems, 430 bilingual teaching texts, 430 reference programs. Language coverage is C++17 394, Python 3 36, C11 0, Java 17 0. Therefore **0/430 have all four languages**; 1,290 additional programs and matching Chinese/English code explanations remain.
- `pnpm check:editorials` now reports per-language coverage. `--require-four` fails until every canonical editorial has all four language keys. This is structure validation, not Judge execution.
- The page can select among *available verified* reference languages. It never displays a generated but unverified program.
- The existing publication gate (`scripts/editorials/publication.ts`) requires each displayed source hash to have full-case AC evidence on Docker and Vercel and Run evidence on both. A source change cannot reuse prose-only revision evidence (`content-revision.ts`). Each batch must add source and both code explanations, run all cases, obtain current oracle/toolchain evidence, then publish an immutable revision.

## Re-run status

- The historical September 22 evidence reports 430 accepted editorial references, 2,174 sample/hidden case files, and 430 ready releases. This request rechecked the archived evidence against today's source/content with its **historical** sandbox ID: 430 ready, 0 pending. That is an offline evidence check, **not a new Judge run or proof for the current sandbox**.
- This request's structural check passed (430/430 parse, 430/430 bilingual). Fresh full-case execution has **not** completed. Local PostgreSQL at `localhost:5432` is unavailable. Docker Desktop appears open, but the Docker API socket does not answer image inspection. The saved Vercel OIDC token had expired; `vercel env run` successfully renewed the context and a **single** Vercel spot check for `uva-439-knight-moves` passed (official AC, two wrong variants rejected). Its new private report is under `generated/editorial-audit-20260925-spotcheck/`. The current local sandbox snapshot ID differs from the historical evidence, so the old release gate correctly marks 430/430 as requiring review under current configuration.
- Do not claim four-language completion, fresh Judge validation, publication, or deployment from this checkpoint. Reconnect the sandbox and a current corpus snapshot before running the 430-problem audit. Never treat archived reports as new execution evidence.

## Admin dashboard in this change

- New admin-only `/analytics/product-dashboard` aggregates Taiwan-hour traffic, registrations, logged-in visitors, distinct solvers/AC users, submissions, exam starts, posts/comments, confirmed gross payments, NT$200/NT$2,000 purchases, active/cancelled subscriptions, refund statuses and recent payment/cancellation records.
- `/admin/analytics` renders the new dashboard alongside the existing daily traffic, popular pages, referrers and exam analytics. Confirmed gross excludes authorization holds and is explicitly labelled before refunds/fees. Anonymous unique visitors and true conversion funnels are not measured by the existing pageview model.
- Typecheck, lint, API build, web production build and 238 unit tests passed. Database-backed integration and a production billing reconciliation remain necessary before release; no live transaction was performed.
