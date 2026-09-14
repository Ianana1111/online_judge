# Production deployment — 2026-09-14

The owner explicitly authorized public Git publication, the restricted production backup, account-encryption configuration and deployment. Application commit `a5134a41ca066d89caca7ef5de4eff11a99aaa2c` is pushed to `main` and deployed to https://judge.tw and https://api.judge.tw.

## Verified application release

| Component | Deployment |
| --- | --- |
| Railway API | `a341c3fa-3a5b-4375-baea-f83aac12b40e` — SUCCESS |
| Railway judge | `90bb6931-305f-4d91-a0bd-b528e57f28d6` — SUCCESS |
| Vercel web | `dpl_PvEWytyfn99ebnSvDidwp7vd8nrv` — READY and independently confirmed as the `judge.tw` alias target |
| Database | 57 successful migrations, through `20260914000000_conformity_order_regression` |
| Judge snapshot | Existing verified `snap_KVcPE9btGP5SUmCybXlL64WeVUAk` retained |

The exact revision passed [readiness CI](https://github.com/Ianana1111/online_judge/actions/runs/34814034449) before deployment and [main CI](https://github.com/Ianana1111/online_judge/actions/runs/34815070564) before automatic production promotion. Both complete jobs passed, including backups, database/runtime tests, Docker isolation, dependency audit and the full browser suite.

The API and judge were first deployed directly from the same Git commit after its successful readiness CI, using deployments `f02893b1-42d1-4a23-999d-ac66ceaea98a` and `a353c020-cd6d-4d9c-b9d2-358053cdc917`. Queues were paused with zero active/waiting jobs, then resumed after both services and production data checks passed. The `main` push subsequently exercised the normal automatic pipeline. Railway remained WAITING and Vercel kept the old domain target while main CI ran; after success, both Railway services deployed and the web alias advanced. This proves the observed pending-to-success release sequence, not a deliberately failed production-release exercise.

Previous production baseline: commit `2a6a5f7`; API `6660c3cc-61c8-409f-b695-b2e4cbe37ef4`, judge `2b43a8e9-ea2c-48c7-a4bd-f2fb080d4b93`, web `dpl_4s5mYbV7xsKBtW6WdkxPjRLkF9oE`. Application rollback still requires schema/protocol compatibility review; restoring a database would discard later writes and is not an automatic rollback.

## Backup and production data

- `/private/tmp/oj-iteration-prod-backup-20260913/before.dump` was created **September 14 at 06:15 UTC**, despite the preparation directory's September 13 name. Directory 0700, dump 0600; 27,995,001 bytes.
- SHA-256: `437b03ae80ad227bd6b997c61b60eed9a8edd44cba61c5aa75b524126793f028`.
- Read-only `pg_dump`, successful PostgreSQL 18 restore and full migration rehearsal from the fresh backup. The final rehearsal took 12.41 seconds on local disposable infrastructure; this is not a production recovery-time promise.
- Six pending migrations moved 51 → 57. Users remained 10 and problems 430; cases increased 1,181 → 1,188, samples remained 429. Original-field fingerprints matched across **28 business tables** immediately after production migration. Complete case/sample fingerprints matched the rehearsed dataset.
- Conditional Maximum Product output corrections changed **zero** existing rows in this production snapshot. Earlier fixture/local-corpus corrections are separate evidence.
- `ACCOUNT_SECURITY_KEY` was created through Railway stdin without printing its value or rotating an existing key. Mandatory administrator MFA remains off until the owner enrolls and stores recovery codes. Real mail-provider/inbox acceptance remains outstanding.

This backup remains local temporary storage. Scheduled private offsite backups, key recovery custody and independent freshness alerts still require activation.

## Executed live checks

- **19 API smoke checks passed** using one synthetic account: secure HttpOnly cookies, registration/session/refresh, foreign-origin and missing-CSRF rejection, private/admin authorization, notification pagination, invalid recovery/school links, MFA enrollment/session invalidation, restricted login, one-use recovery codes and identity-proven MFA disable.
- C11, C++17, Python 3 and Java 17 ran through the production worker and callbacks. A correct UVa 100 submission received AC; an incorrect submission received WA; duplicate request IDs returned the same submission.
- The fresh production-copy battery exposed a Conformity order-sensitive mutant that the earlier local corpus rejected. An append-only migration now distinguishes mixed reordered duplicates and singleton groups. All **6 references + 12 wrong variants** pass expected Docker verdicts. Separate live Conformity submissions received **AC / WA / WA** through Vercel.
- **36 live page checks** passed: Chromium desktop dark, Chromium mobile light and WebKit mobile dark, each with 12 routes. Browser login, the landing interaction, security settings, notifications and usable editor height passed. Screenshots were visually reviewed. The scoped axe checks found no violations; this does not establish full accessibility conformance or physical-device testing.
- WebKit's initial login navigation timed out. A narrower fresh-context diagnostic confirmed login and account HTTP 200 and successful homepage navigation without reading cookies. A focused retry then exposed a test navigation race: the next page load began before the client-side homepage navigation had finished. After waiting for the authenticated homepage heading and network idle, all 12 WebKit routes passed, including the same MFA enable/disable history. These are [combined executed checks](production-smoke-20260914.json), not an unchanged single-run pass. The initial diagnostic permission requests timed out or hit reviewer-model capacity; the narrower diagnostic was subsequently approved.
- Initial API and judge deployment-log queries returned zero error-level entries. No real charge, refund, email or school inbox verification was performed.

## Production content finding

The fresh production-copy historical suite passes **72 archive lifecycles plus one schema test**, but **42 GPE archive admissions are rejected** because 16 existing problems have no local test cases or remote judge mapping. These missing cases predate this deployment. Earlier 114/114 lifecycle passes used a different local corpus and synthetic verdicts.

The [complete affected-problem and exam list](production-content-gaps.json) records this discrepancy without publishing hidden case contents. Restore service by independently checking each corpus against its statement and references, appending verified missing cases through a guarded migration, and rerunning both archive lifecycle and actual judge batteries. Do not bypass the admission guard or bulk-run seed scripts against production.

Additional unfinished work: 363 missing candidate batteries, four remote UVa cases, two OBSERVE investigations, owner MFA enforcement, real payment/mail/school acceptance, offsite backup activation, external alerts and production capacity testing. This deployment does not certify the whole launch checklist.

## Closeout

Both synthetic accounts were deleted with exact ID/handle/email/USER-role/creation-time guards. Before removing the second account, a read-only preflight confirmed that the predicate matched exactly one account and every other user matched the backup. Final production verification returned 10 users, 430 problems, 1,188 cases, 429 samples, 57 migrations and zero in-flight submissions. Full case/sample fingerprints still matched the migration rehearsal.

Of the 28 business tables, only `page_views` differs from the backup: it has 37 additional records after the live checks. Every original page-view record was checked by ID and its complete original-field fingerprint matched; these new analytics records were retained. All three judge queues are unpaused with zero active, waiting, delayed or failed jobs. Public web and API health checks returned HTTP 200, and deployment/alias readback still matched the application release above.

The successful backup's hash and 0700/0600 permissions were rechecked. Its incomplete earlier attempt was removed, temporary database credential files were removed, and the disposable local PostgreSQL restore container was deleted after final verification. The successful backup remains available at the restricted local path above. Earlier review-service capacity failures delayed cleanup; the guarded cleanup and local-container removal subsequently executed successfully.
