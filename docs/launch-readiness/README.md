# Launch readiness implementation

**Latest status:** [September 13 second iteration](next-iteration.md) tracks the new account/MFA, reconciliation, school, monitoring, backup and UX work. The sections below preserve the first rollout's evidence; read historical open items with the latest record. This second batch is not yet deployed.

Execution record for the approved full-site plan. An unchecked gate is not a passed check. The owner authorized production deployment and a restricted local database backup; deployment and migrations completed on **2026-09-13**. See the [deployment and verification record](deployment-20260913.md). No real charge, refund, or email was performed by these deployment checks.

## Agreed product rules

- Public website; professional judge. branding; release only after quality gates pass.
- Capacity target: 100 online users and 20 submissions/minute sustained.
- Credit-card monthly NT$200 / yearly NT$2,000 subscriptions only. Wallets are outside the approved launch scope.
- First successful purchase per account: full refund requested within 168 hours of payment; renewals do not reset eligibility.
- No new annual bonus. Preserve already-earned entitlements and historical transaction terms.
- Articles, comments and edits require administrator approval before public visibility.

## Implemented and validated locally (2026-09-12)

| Area | Changes | Evidence / limit |
| --- | --- | --- |
| Payment/refunds | Versioned first-purchase policy, gateway payment time, idempotent first/recurring callbacks, calendar-boundary entitlements, durable refund recovery, paginated administrator queue/history with explicit errors and review details | 11 PostgreSQL concurrency/recovery/pagination tests; real gateway settlement and audited resolution command still required. See [reconciliation runbook](refund-reconciliation.md) |
| Exams | Per-user transaction locks, overlapping reservation protection, exact attempt membership, server clock, shared versioned scoring | 114 historical exams passed copied-content lifecycle tests (51 CPE, 63 GPE); verdicts are synthetic and do not certify each judge corpus |
| Submission delivery | Transactional quota + record, retry identity, durable dispatch and result recovery, evaluation version, ownership, bounded SSE with polling fallback | Real database/Redis tests with synthetic queues; real Vercel throughput not measured |
| Judge isolation | Dedicated unprivileged UID, no capabilities/no-new-privileges, clean environment, protected result artifacts, per-case cwd/scratch cleanup, exact subsecond deadline with forced kill, output/compiler limits, strict numeric checker | 12 Linux/checker fixtures passed, including C/C++/Python/Java; disposable Docker adapter runs actual production command scripts. Real Vercel snapshot remains a gate |
| Auth | Explicit JWT purpose/issuer/audience/algorithm, Redis session revocation, current DB role checks, verified Google email, no implicit email-account linking, browser-origin checks, account-scoped client updates/cache, atomic logout and Redis failure propagation; Google deletion reauthentication now preserves the existing session and checks only the linked subject | Backend/frontend race tests and normal/mismatched Google callback tests; password recovery/email verification/admin MFA still outstanding |
| Community | Everyone may submit posts, article comments and problem comments. Immutable revision text, administrator review/history UI, one pending revision per target, stale-review conflict, author-only edits, transactional decision + notification, bounded search/pagination | 10 integration/schema tests including >1,000-entry sitemap pagination/privacy; 6 desktop/mobile browser workflows passed with mocked API; built API HTTP publication/role checks passed |
| Schools | Full 149-entry MOE 114 roster plus 9 separately sourced military/police institutions; canonical names/aliases; 152 institutions with email-domain evidence, 6 require assistance; atomic resend/confirm/school-change protocol and one inbox per account ledger | 9 roster/domain/PostgreSQL tests passed. Delivery uses a fake sender; real inbox delivery not claimed. Keyboard picker/confirmation browser workflows passed |
| Home / FAQ / notifications | Interactive binary-search landing demo, searchable bilingual FAQ + matching JSON-LD, explicit notification read actions, unread/history pagination, responsive dropdown and full center | 18-test production browser suite passed, including 16 focused workflows and 2 full-site audits |
| Shared UI | Contrast tokens, focusable code/table scrolling, responsive admin navigation, compact account menu, skip link, keyboard school picker; primary-button state changes preserve contrast without interpolating foreground/background colors | 42 routes × desktop/mobile × light/dark = 168 checks passed using real local API fixtures. Includes mobile submission cards, long account names, labelled inputs/charts, stable profile hydration, submission dialog keyboard focus, populated refund queue/history. [Coverage evidence](browser-audit.json) |
| Dependencies/deployment | Next 15.5.25, Nest 11 / Express 5, patched transitive packages, Node 22 locked image installs, non-root app containers, no automatic demo-user seed, localhost-only local data-service ports, trusted-proxy CIDRs, strong separated production secrets | Production dependency audit reports 0 findings; build and runtime tests. Deployment configuration changes must be applied before rollout |
| CI | Database migrations, generated school catalog check, typecheck, unit/DB tests, app builds, API runtime, isolated judge fixtures, production browser tests, dependency audit | Workflow authored; GitHub execution not claimed |

Latest full local unit/integration run: **99 passed, 10 Linux-container tests skipped** (those 10 passed separately with `RUN_SANDBOX_TESTS=1`; 2 checker tests run in both, for 12 total Linux/checker fixtures). **51 migrations** applied successfully to an isolated PostgreSQL instance. The guarded content migration test confirms replay safety and preservation of unrelated custom answers. API, judge and web production builds passed. Type checks passed for all three apps. The rebuilt API passed HTTP checks for authentication, logout, current administrator permissions, refund query validation and published-only sitemap metadata.

After final administrator translation refinements, **4 additional browser checks passed** against the final production build, covering refund API failure/recovery, pagination, deleted-account records, empty history, accessibility and the absence of any bank mutation requests in both themes on desktop/mobile. The earlier full-site pass and these focused checks are recorded separately; screenshots are local test artifacts. The button contrast regression also passed 9 consecutive mobile community checks before the full-site run.

## Baseline and unfinished release gates

- Original inventory: 38 Next.js page entrypoints; Next.js / NestJS / PostgreSQL / Redis / BullMQ / Vercel Sandbox. New routes add notifications, writing, own posts and moderation.
- Repository judge inventory: 414 oracle-backed entries (2 verified-match, 412 unchecked), 16 no-oracle entries unchecked; 61 candidate battery manifests. These are repository snapshots, not fresh proof of production data.
- The user's two pre-existing reference images and 11 battery manifests were preserved without content edits and recorded in a separate Git commit during the requested version-control handoff.
- [ ] Every public problem has versioned inputs/outputs, independent correct solutions and relevant wrong-solution coverage, executed against the deployed judge.
- [x] All 114 historical exams in the read-only snapshot have valid visible/gradeable membership and passed local lifecycle evidence. Real deployed judge execution remains a separate gate.
- [x] Real Vercel toolchain snapshot rebuilt; 13 live isolation/checker fixtures passed. The deployed worker also passed C, C++, Python and Java runs plus controlled AC/WA submissions.
- [ ] Owner-controlled real credit-card payment/refund/cancellation reconciled with ECPay; ambiguous refund operator workflow completed.
- [x] Every current page entrypoint received Chromium desktop/mobile and light/dark checks with local API fixtures. This does not cover all application states or prove full WCAG conformance.
- [ ] Live paid workflows, remaining authentication recovery flows and Safari/Firefox browser behavior receive end-to-end review.
- [ ] Password recovery, account email verification and administrator MFA completed.
- [ ] Static linting configured and run. The existing web `next lint` script has no installed ESLint/configuration; type checking and successful builds do not substitute for a lint pass.
- [ ] Sustained load, monitoring, backup restore and application rollback verified.
- [ ] Production migration, reverse proxy configuration, secrets and privacy retention reviewed against a staging mirror before release.

Deployment evidence narrows the last two gates: a fresh production backup was restored into isolated PostgreSQL 18, six migrations passed there and in production, and the original fields in 26 existing tables matched their pre-migration fingerprints. Production runtime configuration and matching internal-service credentials were verified. Sustained load, application rollback, privacy-retention review and an authoritative trusted-proxy configuration remain open. `TRUSTED_PROXY_CIDRS` remains unset, so unauthenticated clients sharing a proxy peer can share rate-limit budgets.

No finite test suite proves that all wrong programs will be rejected or that a site cannot be compromised. Release decisions must use executed evidence and unresolved risks.

## Executed content evidence

- Read-only repeatable-read snapshot of the local project database: **430 visible problems, 1,511 cases, 115 contests**. No account/payment/submission records exported. Hidden inputs/outputs stay in a private temporary file; `content-inventory.json` contains structural findings and hashes. The source database was not migrated or seeded.
- All 114 historical exams were copied to the disposable database and exercised through registration, repeat registration, admission, clock elapsed time, accepted submissions, wrong-then-correct scoring, termination, stale-attempt rejection and a clean second attempt. **115 tests passed** including schema checks. This uses controlled synthetic verdicts. The remaining public demonstration contest was empty and had invalid timing; empty contests are now excluded and invalid new configurations/admissions rejected.
- Original candidate battery: **57 locally judged problems / 174 programs / 27 raw expectation mismatches** (`judge-battery-results.json`). Four remote-only problems were explicitly skipped. This baseline is preserved.
- Reviewed regression battery: **57 problems / 177 programs / 0 mismatches**, with **2 OBSERVE candidates** that remain unresolved portability/correctness investigations (`judge-regression-results.json`). Source-hash-bound expectation corrections document legitimately accepted variants and faulty reference programs; no original battery manifest was overwritten.
- Added boundary cases for 11 problems, fixed the known UVa 10099 guide-seat answer from 4 to 5 trips, and supplied corrected references for 10099, 1056 and 11094. UVa 10150 uses a trusted semantic checker accepting any shortest valid word chain, covered by independently derived random graph checks.
- **369 problems still lack a candidate battery**, and the 4 remote problems have not been executed against UVa. Structural inventory and this partial battery do not certify all 430 problems.

## Reproduction

Use `compose.test.yml` with project `oj-readiness`; it exposes only local ports 55432 (PostgreSQL) and 56379 (Redis), uses temporary storage and never needs production credentials.

```sh
pnpm db:generate
python3 scripts/generate-school-catalog.py --check
pnpm typecheck
# Set DATABASE_URL and REDIS_URL to the disposable services from compose.test.yml:
RUN_DB_TESTS=1 pnpm test
pnpm --filter @oj/api build
pnpm test:runtime
pnpm --filter @oj/judge build
docker build --tag oj-readiness-sandbox-fixture tests/sandbox
RUN_SANDBOX_TESTS=1 pnpm exec vitest run tests/sandbox-isolation.test.ts
# Build web with local test API URLs, then:
RUN_FULL_SITE_E2E=1 PLAYWRIGHT_PRODUCTION=1 pnpm test:e2e
pnpm audit --prod --audit-level high
# With a privately captured read-only content snapshot:
CONTENT_SNAPSHOT_PATH=/private/tmp/oj-readiness-content-20260912.json RUN_DB_TESTS=1 pnpm exec vitest run tests/historical-exams.integration.test.ts
node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/audit-judge-batteries.ts /private/tmp/oj-readiness-content-20260912.json --regressions
```

## External evidence

- ECPay AIO refund: https://developers.ecpay.com.tw/2885/
- ECPay cancellation: https://developers.ecpay.com.tw/2900/
- ECPay detail lookup and query fallback: https://developers.ecpay.com.tw/2894/
- ECPay monthly/yearly calendar rules: https://developers.ecpay.com.tw/2868/
- Google identity/re-authentication: https://developers.google.com/identity/openid-connect/openid-connect (use the stable `sub` identity rather than email; deletion reauthentication must not perform a general login).
- MOE roster: https://udb.moe.edu.tw/ulist/Resource (snapshot 2025-10-15, export 2026-01-08, retrieved 2026-09-12). Institution/email evidence is retained in `packages/shared/data/taiwan-school-catalog.json`; the roster's personal contact addresses are not copied into the app.
- Security baseline: https://github.com/OWASP/ASVS/tree/v5.0.0
- Accessibility: https://www.w3.org/TR/WCAG22/
- Dependency report: `dependency-audit.json` alongside this file.
