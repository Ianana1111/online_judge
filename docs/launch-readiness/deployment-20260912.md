# Deployment attempt — 2026-09-12

Historical attempt record. The owner authorized the restricted local backup on September 13; the blocker was resolved and the rollout continued. See [the completed deployment record](deployment-20260913.md).

The owner explicitly authorized deployment. Production cutover has **not** occurred: a fresh database backup is blocked. No production database migration, Railway variable update, service replacement, or Vercel domain promotion was performed during this attempt.

## Prepared and verified

- Production web and API responded successfully before rollout.
- An isolated source bundle was staged at `/private/tmp/oj-release-20260912`, with source manifest SHA-256 `aef460298cbf4fc269ab5d81b14f016471d5a7ce0880a6888f7a0031849dc647`.
- Vercel production-target candidate build is READY: `dpl_k6254SMSYVQEUncWTnhLvyQDdVXh`, https://judges-2ylkq5ffe-ianana1111s-projects.vercel.app. It was created with `--skip-domain`; `judge.tw` still points to the previous deployment.
- New judge sandbox snapshot: `snap_KVcPE9btGP5SUmCybXlL64WeVUAk`. The live isolation/checker suite passed **13/13** fixtures against this snapshot, including filesystem/process separation, resource bounds, checker behavior, and blocked external HTTPS. A successful raw TCP handshake alone is not an adequate application-egress test because the provider may accept a connection before filtering it.
- API and judge production runtime configuration validators passed against locally prepared settings. These private files have mode 0600 and were not applied to Railway.
- Read-only production aggregates: PostgreSQL 18.6; 45 applied migrations; 10 users; 430 problems; 1,170 cases; zero in-flight submissions at the time checked. Counts must be refreshed immediately before rollout.

## Backup blocker

Automatic approval review rejected exporting the entire production database to `/private/tmp/oj-prod-backup-20260912/before.dump`: deployment authorization did not specifically authorize transferring potentially sensitive account, payment, and submission records to that local destination. The export did not execute.

The safer same-provider alternative was investigated through both the Railway API and the owner's existing logged-in dashboard. Backup creation returned `Not Authorized`; the dashboard explains that backups and PITR require a Pro plan. No subscription upgrade was made. The existing native backup (`013ac529-3637-4685-8159-3c7b2ba9a142`) dates from August 23 and is too old for this rollout.

Explicit permission for a restricted local production backup, or a fresh operator-created provider backup, is required before continuing with production migrations. A restore rehearsal against an isolated database has not been performed with current production data.

## Resume sequence

1. Obtain the permitted fresh backup; verify it by restoring into a disposable isolated PostgreSQL 18 instance. Run the six new migrations through `20260912050000_tourist_guide_answer` and compare aggregate counts and invariants. Never seed or replace production content from the different local content snapshot.
2. Correct the empty resolved `DATABASE_URL` for both Railway application services using the existing private Postgres connection. Stage variable updates with `--skip-deploys`; set judge `NODE_ENV=production` and `JUDGE_SANDBOX_SNAPSHOT_ID` to the tested snapshot above. Validate the fetched resulting settings without printing credentials. Investigate provider socket-peer trust before enabling forwarded client-IP tracking.
3. Coordinate the worker transition and API migrations with queued submissions and community writes. Record each deployment ID and verify API and worker health before promoting the prepared Vercel deployment.
4. Verify actual domain cookies, CORS, CSRF, public and authenticated flows, and a controlled judge smoke test. Do not perform real payments or send user messages as smoke tests.
5. Record final deployment IDs and results. The broader launch-readiness gaps in the README remain separate from deployment success; these checks do not establish complete judge-content coverage or immunity from compromise.

## Previous versions retained for incident response

| Service | Deployment |
| --- | --- |
| Vercel web | `dpl_CVcFKdYG3Zzu91b2nPKyFejH93vQ` — https://judges-1f8n1beyq-ianana1111s-projects.vercel.app |
| Railway API | `08ee5d98-25d0-4935-8371-f1dfda4ec67d` |
| Railway judge | `7006c7fb-8562-4bb8-82a0-03f6eccad2a8` |

These identifiers locate previous application versions; they are not evidence of a tested data rollback. New moderation/outbox/payment records must be preserved and reconciled when choosing a compatible rollback.
