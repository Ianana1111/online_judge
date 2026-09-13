# Production hardening and experience iteration — 2026-09-13

Authorized: implement all remaining recommendations. This is the second batch after production commit `2a6a5f7`. Code, local tests, CI and live acceptance are separate states. This batch has not replaced production.

| Workstream | Status | Acceptance |
| --- | --- | --- |
| CI before production | Implemented; platform settings read back | Railway Wait for CI and Vercel production alias check require `verify`. Independent `readiness/**` branches run the same job. Exact-commit release and failed-release exercise remain. |
| Encrypted backups | Implemented and tested locally | restic/PostgreSQL image, six-hour cron config, retention, independent freshness command and guarded restore. Unicode/JSON round trip, wrong password, short password file and failed producer tested. Private offsite storage and schedule not activated. |
| Account recovery and email | Implemented and tested locally | Single-use expiring tokens, encrypted durable mail delivery, explicit POST confirmation, rate limits and credential-generation revocation. Real provider/inbox acceptance remains. |
| MFA | Implemented and tested locally | Encrypted TOTP, replay rejection, one-use recovery codes, password/Google reauthentication and restricted sessions. Production key, owner enrollment and mandatory administrator enforcement remain. |
| Payment reconciliation | Implemented and tested locally | Exact order/amount/provider evidence, immutable operator decisions, stale-state checks, idempotency and worker fencing. Real charge, renewal, cancellation and refund acceptance remain. |
| Judge coverage | Six more problems validated | Six independent references and twelve wrong variants produce 18 expected Docker verdicts, zero mismatches. Six regression inputs and guarded Maximum Product formatting correction. **67/430 manifests; 363 still missing**, plus four remote-only and two OBSERVE investigations. |
| Exam lifecycle | Historical state tests and real fixture judging pass | All 114 historical lifecycle tests use synthetic verdicts. Real HTTP/BullMQ load drill separately proves admission exclusivity and late score callbacks for a fixture exam; it does not certify all historical corpora. |
| School verification | Implemented and tested locally | Assisted exact-domain approval/rejection/revocation, audit history, applicant notifications and explicit confirmation. Official 115 roster: 163 records map to 158 institutions, including five continuing-college parent mappings. Name coverage does not prove every real mailbox. |
| Load and monitoring | Local load completed; monitoring implemented | 100 users / 180s: 3,660 requests, 60/60 AC, zero errors, API P95 31ms, judge P95 1,517ms. Admin dashboard, queue/SE/mail/refund alerts, private diagnostics and public health workflow. Production capacity, trusted edge CIDRs and external alert delivery remain. |
| Cross-browser and lint | Enforced in CI | Real ESLint with zero warnings, Chromium desktop/mobile and Firefox/WebKit/iPhone-sized workflow projects. Physical iPhone testing remains separate. |
| Learning and page UX | Implemented with browser regression | Per-language drafts, custom-case recovery, visible storage errors, recent-practice resumption, community save status, keyboard resizing, new security/school/refund pages and FAQ. Fixed mobile viewport clipping and collapsed editor. Covers 49 route/page states in both themes on desktop/mobile. |
| Wallets | Official-provider analysis completed | ECPay/TapPay/Apple recurring-payment limits documented. Merchant eligibility and product decision precede integration. Existing recurring credit-card terms preserved; no Apple Pay activation claimed. |

External acceptance dependencies: real payment instruments, real owner mailboxes, authenticator enrollment and a configured private offsite storage destination. Their absence must not prevent independent implementation or be reported as a passed check.

## Evidence and release preparation

- [Judge results](judge-iteration-results.json): actual production evaluator in isolated Docker for six new problems; original reports preserved.
- [Load results](load-drill.json): real HTTP, BullMQ and four languages on local infrastructure, not Railway/Vercel production capacity.
- `scripts/verify-iteration-migration.ts` seeds six original content fixtures, runs the actual migration SQL twice, verifies six additions and three corrected output fields, and cleans its fixtures. Five new migrations pass on the isolated database (56 total).
- `tests/historical-exams.integration.test.ts`: all 114 archive cases plus schema validation pass with the private content snapshot and synthetic judge results.
- Final local unit/integration suite: **136 passed, 11 skipped** (platform/explicit opt-in suites). Lint, typecheck, production API/web builds, actual HTTP authentication/security checks and dependency audit pass. The independent historical run passed all 114 archives plus its schema test.
- Full browser suite initially passed 89/91 and found the mobile editor defect. After fixing it, all **12 affected browser tests** passed, including 49 route/page states × two themes × desktop/mobile = **196** page checks with no page errors, horizontal overflow or axe violations. Other cross-browser workflows were unchanged; CI reruns the entire suite on Linux. Physical-device and full WCAG conformance are not claimed.
- Four backup tests pass: the real encrypted round trip restores 56 migrations plus exact Unicode/JSON fixtures in 2.19 seconds. Concurrent isolated historical fixtures were present in this dump (432 test problems, three synthetic users); this is not a production RTO measurement.
- No finite suite proves universal judge correctness or that a site cannot be compromised.
- The explicit Linux Docker isolation suite also passes **13/13**, including four languages, privilege isolation, no inherited secrets, cleanup, deadlines, output bounds and denied HTTPS. GitHub CI has not run for this batch because its push was rejected.
- Rehearsal against the **previously authorized local production backup** passes: 45 → 56 migrations, 10 users and 430 problems preserved, 1,170 → 1,187 cases across the previous and current migrations, and 25 business-table fingerprints unchanged. This reused the earlier backup and performed no production connection/export; a fresh backup remains required before rollout.
- Added `.dockerignore` to keep local environment files, dependency folders, browser artifacts and backups out of Docker build contexts. Production images are built locally for verification, not published.
- Final API and judge Node 22/Linux images built and started successfully as UID 1000 with a dedicated disposable Redis; both pass health checks. The API image also rejects anonymous operations access and contains no local environment files. Test containers were removed. Public web/API health checks both return 200; this confirms the prior deployment remains available, not that the new batch is live.
- Judge infrastructure failures now return a generic retry message instead of exposing provider/ORM exception text as compiler output. Sentry drops unstructured exception/log messages while retaining exception types and diagnostic stack locations; privacy tests include embedded connection-string and source-code canaries.

## Production activation

Automatic approval review rejected a preparation action before execution: adding `ACCOUNT_SECURITY_KEY` to the production Railway API and exporting production data to `/private/tmp/oj-iteration-prod-backup-20260913/before.dump`. It stated that existing authorization did not explicitly cover the sensitive payload, destination and persistent encryption configuration. No key or new production backup was created by that action. Keep the release on its independent branch until a fresh authorized backup and migration rehearsal are complete.

Push was also rejected. Read-only verification confirmed `origin` is `git@github.com:Ianana1111/online_judge.git`, the repository is public, and remote `main` matches the previously authorized `2a6a5f7`. Review nevertheless requires explicit permission to publish this new security implementation to that public repository. The committed batch remains local on `readiness/20260913-account-and-launch`; it is neither pushed nor deployed.

1. Configure an independent random 32-byte API encryption key without printing it; retain an owner-controlled recovery copy. Never rotate an existing key blindly.
2. Create the authorized local production backup (directory 0700, file 0600), restore into isolated PostgreSQL 18, rehearse five migrations and verify unchanged business records.
3. Promote the passing revision to `main`; verify CI, deployment IDs, migrations and real-domain smoke checks, then remove only synthetic fixtures.
4. Owner confirms real mail receipt, enrolls an authenticator and saves recovery codes; enable required administrator MFA afterward.
5. Provision private offsite storage plus an independent freshness alert, and complete real payment/renewal/cancel/refund and school-inbox acceptance.

The remaining 363 judge batteries, actual judging across historical corpora, four remote UVa cases and two OBSERVE variants are unfinished engineering work, not external-credential blockers.

Runbooks: [account security](account-security.md), [refund reconciliation](refund-reconciliation.md), [school review](school-domain-review.md), [backup operations](backup-operations.md), [deployment gates](deployment-gates.md), [monitoring](monitoring.md), [wallet analysis](wallet-analysis.md).
