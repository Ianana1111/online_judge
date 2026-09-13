# Production deployment — 2026-09-13

The owner authorized deployment, then explicitly authorized a local production-database backup and isolated restore/migration verification. The new API, judge worker and web frontend are deployed at https://judge.tw and https://api.judge.tw.

## Deployed versions

| Component | Version / deployment |
| --- | --- |
| Source bundle | `aef460298cbf4fc269ab5d81b14f016471d5a7ce0880a6888f7a0031849dc647` |
| Railway API | `d0db7711-bd46-4c8a-80e5-5d29f4bbda26` — SUCCESS |
| Railway judge | `c7e33e5c-f2ae-42fb-8a34-c0aa8200b1a4` — SUCCESS |
| Vercel web | `dpl_k6254SMSYVQEUncWTnhLvyQDdVXh` — READY, promoted to the production domains |
| Vercel judge snapshot | `snap_KVcPE9btGP5SUmCybXlL64WeVUAk` |
| Database | 51 successful migrations, through `20260912050000_tourist_guide_answer` |

The initial deployment used a 465-file local source bundle, checked against its manifest and the corresponding workspace files with no differences. The owner subsequently requested Git handoff: the deployed application source, migrations, tests and evidence are recorded in the commit containing this document. Existing battery files and project reference images are preserved in a separate preceding commit. TypeScript incremental build caches are excluded from version control. Previous application deployment identifiers are retained in [the September 12 record](deployment-20260912.md).

## Backup and data verification

- Restricted backup: `/private/tmp/oj-prod-backup-20260912/before.dump`, created **September 13** despite the earlier preparation directory name. Directory mode 0700; file mode 0600.
- Size: **27,973,330 bytes**. SHA-256: `dab4494030ce902a95bc908d1b0b7a11949b1db327450f4a18cd2c504ef5deb7`.
- `pg_dump` ran with a read-only transaction setting. The full custom-format dump restored successfully into an independent local PostgreSQL 18 instance using `pg_restore --exit-on-error --no-owner --no-acl`.
- All six new migrations passed on the restored copy before production deployment. No seed scripts ran.
- Original field fingerprints matched across **26 existing tables**, both on the migrated copy and on production immediately after rollout. New fields and the intentional school-name normalization were excluded from those fingerprints; problem and case content were checked separately through the guarded migration and counts.
- Users remained **10**; problems remained **430**; cases increased from **1,170 to 1,181**. All 11 reviewed regression cases were added. UVa 10150 uses the SPECIAL checker.
- Restored-data assertions found zero unpublished legacy posts/comments, zero invalid historical credit-card refund deadlines and zero changed legacy exam scoring versions. New moderation and refund tables started empty.

This is a successful backup restore and forward-migration rehearsal. It does not demonstrate an application rollback after new production writes; any rollback must preserve and reconcile new payment, revision and outbox records. The backup remains in a local temporary directory and is not a scheduled or off-device backup service.

## Deployment coordination and settings

- Fixed the empty resolved `DATABASE_URL` for API and judge with references to the existing private Postgres variables. No database credential rotation was performed.
- Set judge `NODE_ENV=production` and the tested snapshot ID. Prepared configuration passed the production validators; the resulting Railway configuration was checked without saving or printing its credentials.
- Added `/health` deployment checks to both services, with ports 4000/4100, 180-second timeouts, zero configured overlap and 60-second draining. Both services reached SUCCESS and their start logs confirmed the expected processes.
- Paused the local-submission, UVa-submission and test-run queues before upload. All had zero active or waiting jobs. After API and judge became healthy, the prepared frontend was promoted and all three queues were resumed. No queued jobs were deleted during the transition.
- `judge.tw` was independently inspected and confirmed to resolve to the new Vercel deployment. The actual `/health`, paginated `/posts`, and `/posts/sitemap` API endpoints responded successfully.
- Railway documents `X-Real-IP`, but no stable trusted socket-peer allowlist was established. `TRUSTED_PROXY_CIDRS` was left unset; no arbitrary proxy addresses were trusted. This preserves header-spoofing resistance but can make anonymous users behind a shared peer share rate-limit budgets. See [Railway networking specifications](https://docs.railway.com/networking/public-networking/specs-and-limits).

The complete environment-variable export was rejected by automatic approval review. The deployment continued using platform-side variable references and transient in-memory checks that output only validation results; no further full environment export was needed.

## Live verification

- Real account registration, password login/logout and refresh succeeded using disposable synthetic accounts; secure HttpOnly access/refresh cookies were verified on the actual API domain.
- Foreign-origin registration was rejected; missing CSRF was rejected; anonymous notification access returned 401; a normal account could not access moderation. Own-post and notification pagination returned the expected shapes.
- **C11, C++17, Python 3 and Java 17** each compiled/executed through the deployed worker and returned the expected custom-case output through the API callback. Anonymous access to those run results was denied.
- A correct UVa 100 program received **AC**; an intentionally incorrect program received **WA** through local judging. Repeating each submission request identity returned the same submission ID. The submission cooldown also rejected an overly rapid separate submission with 429.
- The test harness was corrected to follow refreshed CSRF tokens; the remaining WA/session checks ran separately after the initial pass reached the cooldown. These are combined executed checks, not a claim that an unchanged full script passed in a single run.
- **8 production pages × desktop/mobile = 16 page checks** passed without horizontal overflow, uncaught page errors or HTTP 5xx responses. Routes: `/`, `/problems`, `/contests`, `/discussion`, `/faq`, `/notifications`, `/settings`, `/login`.
- The real interactive landing demo moved from Wrong Answer to Accepted on both viewports. Screenshots were visually inspected; the production response included CSP.
- Final cleanup confirmed **10 original accounts, zero remaining synthetic deployment-check accounts, zero in-flight submissions**, and all three queues resumed with zero waiting/active/failed jobs. Temporary test-account database records were deleted using exact IDs, synthetic email/handle checks and creation-time guards. Short-lived run caches follow their normal expiry.
- The API and judge deployment-log queries returned no error-level entries. This is a deployment smoke check, not continuous monitoring.
- Removed the disposable PostgreSQL restore container and its anonymous volume, plus eight deployment-only temporary credential files. The authorized mode-0600 backup remains available at the path above.

Broader launch-readiness gaps remain in the [README](README.md): full problem-battery coverage, live payment/refund reconciliation, authentication recovery/MFA, sustained load and cross-browser review. Existing sessions without the new session identifier require users to sign in again. No real payment, refund, email, school-verification delivery or UVa remote submission was performed during this deployment verification.
