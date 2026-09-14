# Production hardening and experience iteration — 2026-09-13

Authorized: implement all remaining recommendations. This is the second batch after production commit `2a6a5f7`. Code, local tests, CI and live acceptance are separate states. This batch has not replaced production.

| Workstream | Status | Acceptance |
| --- | --- | --- |
| CI before production | Implemented; platform settings read back | Railway Wait for CI and Vercel production alias check require `verify`. Independent `readiness/**` branches run the same job. Exact-commit release and failed-release exercise remain. |
| Encrypted backups | Implemented and tested locally | restic/PostgreSQL image, six-hour cron config, retention, independent freshness command and guarded restore. Unicode/JSON round trip, wrong password, short password file and failed producer tested. Private offsite storage and schedule not activated. |
| Account recovery and email | Implemented and tested locally | Single-use expiring tokens, encrypted durable mail delivery, explicit POST confirmation, rate limits and credential-generation revocation. Real provider/inbox acceptance remains. |
| MFA | Implemented; production encryption key configured | Encrypted TOTP, replay rejection, one-use recovery codes, password/Google reauthentication and restricted sessions. Owner enrollment and mandatory administrator enforcement remain. |
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
- The explicit Linux Docker isolation suite initially passed **13/13**, including four languages, privilege isolation, no inherited secrets, cleanup, deadlines, output bounds and denied HTTPS. GitHub [run 34812034913](https://github.com/Ianana1111/online_judge/actions/runs/34812034913) passed every step at `b3ee642`, including all 91 browser checks. Its backup fixture now runs as the CI runner's UID/GID so encrypted repository cleanup also works on GitHub's non-1000 user.
- Rehearsal against the **previously authorized local production backup** passes: 45 → 56 migrations, 10 users and 430 problems preserved, 1,170 → 1,187 cases across the previous and current migrations, and 25 business-table fingerprints unchanged. This reused the earlier backup and performed no production connection/export; a fresh backup remains required before rollout.
- Added `.dockerignore` to keep local environment files, dependency folders, browser artifacts and backups out of Docker build contexts. Production images are built locally for verification, not published.
- Final API and judge Node 22/Linux images built and started successfully as UID 1000 with a dedicated disposable Redis; both pass health checks. The API image also rejects anonymous operations access and contains no local environment files. Test containers were removed. Public web/API health checks both return 200; this confirms the prior deployment remains available, not that the new batch is live.
- Judge infrastructure failures now return a generic retry message instead of exposing provider/ORM exception text as compiler output. Sentry drops unstructured exception/log messages while retaining exception types and diagnostic stack locations; privacy tests include embedded connection-string and source-code canaries.

## Production activation

The owner explicitly authorized public GitHub publication, then approved the scoped production backup, encryption configuration and deployment on September 14. The earlier approval-review blockers are resolved. The readiness branch is pushed; production activation still requires the final corrected revision's CI and live checks.

- Configured a new random 32-byte `ACCOUNT_SECURITY_KEY` through Railway stdin with deployment disabled. Readback matched; no existing key was rotated, and no value was printed or stored in the repository. Required administrator MFA remains disabled pending owner enrollment.
- Fresh authorized backup: `/private/tmp/oj-iteration-prod-backup-20260913/before.dump`, created September 14 at 06:15 UTC, 27,995,001 bytes, SHA-256 `437b03ae80ad227bd6b997c61b60eed9a8edd44cba61c5aa75b524126793f028`. Directory 0700, file 0600. Restored from scratch into disposable PostgreSQL 18; six pending migrations produce 57 total, preserve 28 business-table fingerprints, 10 users and 430 problems, and increase cases from 1,181 to 1,188. Existing case inputs/outputs are unchanged on this production snapshot; the conditional Maximum Product corrections do not match its existing rows.
- Executing the six new batteries against this fresh production restore found an order-sensitive Conformity mutant that the earlier local corpus rejected but production still accepted. The original permutation-only dataset returned the same total for ordered and unordered grouping. An additional append-only migration mixes reordered duplicates with singleton groups. After applying it, [all six references and twelve wrong variants meet expectations](judge-production-rehearsal-results.json), with zero mismatches. The new migration's idempotency/preservation check and all 16 sandbox/checker cases pass locally; the three Conformity variants now run in required CI as well.

1. Keep the verified backup and encryption key available through owner-controlled storage; configure independent encrypted offsite storage separately.
2. Require CI success on the corrected revision before rollout. Deploy the exact Git commit to the API and judge, verify health/migrations, then promote it to `main` for the web release.
3. Verify deployment IDs and real-domain smoke checks, then remove only synthetic fixtures.
4. Owner confirms real mail receipt, enrolls an authenticator and saves recovery codes; enable required administrator MFA afterward.
5. Provision private offsite storage plus an independent freshness alert, and complete real payment/renewal/cancel/refund and school-inbox acceptance.

The remaining 363 judge batteries, actual judging across historical corpora, four remote UVa cases and two OBSERVE variants are unfinished engineering work, not external-credential blockers.

Runbooks: [account security](account-security.md), [refund reconciliation](refund-reconciliation.md), [school review](school-domain-review.md), [backup operations](backup-operations.md), [deployment gates](deployment-gates.md), [monitoring](monitoring.md), [wallet analysis](wallet-analysis.md).
