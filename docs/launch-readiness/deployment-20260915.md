# GPE recovery production release — September 15, 2026

The 16 missing GPE judge corpora and all 42 affected archive routes are restored in production. Application commit `edff6178ec12d1b2194f5aac42dedf7059260ce6` passed [the complete readiness pipeline](https://github.com/Ianana1111/online_judge/actions/runs/34871622729) before the database/API/worker rollout, including unit/integration checks, 67 sandbox/checker cases, builds, dependency audit, backup drill and cross-browser workflows.

## Executed release

| Component | Verified initial release |
| --- | --- |
| Railway API | `b492ea3a-4088-44d2-8e34-720bd99cd1d3`, SUCCESS, `edff617` |
| Railway judge | `f11ff4b9-1264-4ff2-b021-8f6e41906217`, SUCCESS, `edff617` |
| PostgreSQL | 58 completed migrations; 430 problems, 1,257 cases, 429 samples |
| Backup | Fresh production dump restored and migrated successfully; [hash and preservation evidence](gpe-recovery.md) |
| Release sequencing | Three queues paused with zero active jobs; API/migration and worker updated together; all three queues resumed |

Immediately after the migration, all problem, test-case and sample fingerprints matched the verified rehearsal. All 33 other table fingerprints still matched the fresh production backup; no existing case or business data was overwritten.

## Actual production verification

The [sanitized live report](gpe-recovery-live-results.json) records checks against `https://api.judge.tw`, the real Railway worker and Vercel sandbox:

- All **16 problems** return the reviewed statements/checkers and `LOCAL` judge mode.
- All **42 affected GPE archives** return ready judge routes, while unauthenticated pre-exam statements remain hidden.
- **10 real submissions: 7 AC and 3 WA**, all expected. The Sudoku, LMIS and CSV alternate legal outputs pass; deliberately incorrect variants fail. Parser, partition, large recurrence and the stairs reference including `n=100` also pass. Duplicate submission requests return the same submission without consuming another quota slot.
- A real attempt of `gpe-2019-04-29-10045` starts with its 180-minute server deadline; another active exam is rejected with 409; reopening preserves the deadline; the clock advances; one accepted problem produces solved count 1 and penalty 0; ending the attempt preserves its score. Only one normal disposable account and its free-tier allowance were used.

The separate [51-program Docker audit](gpe-recovery-judge-results.json) covers all 16 new corpora; the [114-archive lifecycle run](gpe-recovery.md) uses synthetic verdicts. These scopes must not be confused with executing every submission of every historical exam on production.

The disposable account and its dependent submissions/attempt were removed with exact identity and creation-time guards. Cleanup preflight confirmed every other user still matched the backup. The final database check returns 10 original users, zero in-flight submissions, the exact rehearsed problem/case/sample fingerprints, and 32 unchanged business-table fingerprints. All original page-view rows also match; only three new anonymous page-view records were added by inspection. All queues are resumed and empty.

## Display correction and release promotion

Live page inspection found a pre-existing unbroken source URL in the recovered Sudoku statement that overflowed a phone screen. `.prose-statement a` now wraps long URLs. The identical candidate CSS was applied in isolated browsers against actual production content: all three revised statement pages passed Chromium desktop/dark, Chromium phone/light and WebKit phone/dark checks (nine page checks), with no page errors, viewport overflow or KaTeX errors. Phone screenshots were visually reviewed; restored partition mathematics is legible.

The follow-up CSS and this evidence record are promoted with the recovery to `main`. Railway Wait for CI and the Vercel production-alias verification gate remain enabled; the resulting deployment may have a later commit/ID than the initial content release above. Final public-domain checks must use the deployed CSS without browser style injection.

## Remaining acceptance

No real charge, renewal, refund or email was performed. Resend's domain-list request returned `401 restricted_api_key`, explicitly identifying a sending-only key, not an invalid key; retain its limited permissions and verify the sender domain in the owner dashboard. Follow the [owner acceptance checklist](owner-acceptance.md) for real mailbox/card operations and Apple Pay merchant requirements. Apple Pay is not activated.

There are still **347/430 problems without a reference/wrong-candidate manifest**, four remote UVa investigations and two existing OBSERVE variants. The unrelated empty scheduled `group-test-session` remains unchanged. No finite test suite proves universal judge correctness or absolute security.
