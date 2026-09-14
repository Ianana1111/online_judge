# GPE judge-case recovery — September 15, 2026

The [September 14 production finding](production-content-gaps.json) identified 16 problems with no local cases or remote judge route, blocking 42 of the 114 historical exams. This change supplies 69 reviewed cases, 16 independent C++ references, three accepted alternative-output references, and 32 deliberately wrong variants. It does not bypass exam admission checks or run the old bulk seed scripts.

## Content and judge behavior

- Deterministic Python oracles use algorithms independent from the C++ references. Public samples, boundary inputs, arithmetic overflow, repeated datasets, ordering, parsing and stress limits are covered. Run `PYTHONDONTWRITEBYTECODE=1 python3 scripts/author-gpe-recovery.py --check` to reproduce the committed artifacts.
- Corrected missing set-partition mathematics and clarified LMIS output counts. The archived Sudoku sample has multiple valid completions despite the original uniqueness claim; the statement now accepts any valid completion.
- Added bounded special checkers for Sudoku constraints, all LMIS sequences in any listing order, and CSV rows with equal sort keys in any order while retaining original spacing and multiplicity. API admission and worker dispatch share an exact-identity checker registry.
- LMIS coverage uses distinct input values, avoiding an unsupported interpretation of the archived statement's duplicate-value ambiguity. No claim is made about rejecting every possible incorrect program.
- Source interpretation was checked against the stored public statements/samples and the [NYCU official problem collection](https://www.cs.nycu.edu.tw/storage/upload/10705/CS.pdf) for the older parser, partition and LMIS problems. The public audit artifacts contain newly authored cases, not exported historical hidden cases or user data.

## Executed verification before release

- [Actual production evaluator in disposable Docker](gpe-recovery-judge-results.json): **19 correct/alternative solutions AC; 32 wrong variants WA; zero mismatches**. This is real compilation and execution, separate from synthetic exam scoring tests.
- Historical lifecycle tests: **114 archives plus one schema check passed**, including all 42 previously blocked GPE archives. They exercise admission, one active attempt per user, server time, submissions, scoring and completion using synthetic verdict fixtures; they do not execute all problems across every archive.
- Local unit/integration suite: **143 passed, 65 opt-in Docker tests skipped**. The full Docker suites are separately required in CI. Lint and typecheck pass. The guarded migration test verifies atomic rejection on changed statement/remote mapping/checker/resource assumptions, conflicting answers, preservation and idempotency.
- A fresh production backup was restored into disposable PostgreSQL 18 and the actual Prisma migration deployed: **57 → 58 migrations**, **1,188 → 1,257 cases**, **430 problems**, **429 samples**, **10 users**. All 1,188 original case rows and 33 business-table fingerprints were preserved. Exactly four problem metadata rows changed as reviewed. All 16 migrated case sets/checkers match the audited snapshot exactly.
- Backup: created `2026-09-14T16:45:28Z` (September 15 Taipei), 28,023,577 bytes, SHA-256 `acd7dff8668ca236addd58dda741745d2b06189f5aa9b5e9200372250d8ddca6`. Private local directory mode 0700 and dump mode 0600. This is a verified local release backup, not independent offsite backup coverage.
- [Content inventory](content-inventory.json) now describes that migrated production copy: **zero problem-route errors**, **83/430 problems with candidate manifests**; **347 remain**. Its one contest structural error is the pre-existing empty scheduled `group-test-session`, outside the 114 historical archives. This change does not modify that event.

## Release procedure and limits

The migration locks each target problem, checks its existing identity, source, resource limits, statement digest and checker, preserves all existing cases/samples, and appends only absent inputs. A same-input conflicting answer aborts the transaction. Missing target slugs are skipped for empty test databases; production verification must independently assert all 16 exist. Reapplication is idempotent.

Pause judge queues after confirming no active jobs, deploy the CI-passed API/migration and worker from the same commit, verify both healthy with all 16 local routes, then resume queues. Older workers cannot interpret the new three special checkers, so rolling back only the worker image is unsafe. Preserve the backup, verify content hashes after deployment and use a compatible forward fix or coordinated metadata/image rollback if necessary. Never replace the production database with the full rehearsal dump after accepting new user activity.

Live deployment IDs and domain checks are recorded after execution; the evidence above proves the local rehearsal, not a future deployment. Real payment/mail acceptance and Apple Pay prerequisites are listed in the [owner checklist](owner-acceptance.md).
