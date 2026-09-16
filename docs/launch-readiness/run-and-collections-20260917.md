# Run consistency and collection redesign — 2026-09-17

## Findings and repairs

The read-only production snapshot contains 430 visible problems, 429 sample rows and 1,257 hidden cases. Its content SHA-256 is `55c63c24ba8a028f2f36455dd8ea0f9ae2d189483f976fb2b6aac0d11a12f9c7`.

Run previously compared editable sample inputs against the original expected answer in the browser, using different whitespace normalization from Submit. Results also remained current-looking after code, language or input edits. Official sample references now resolve on the server; Run uses Submit's output checker and runtime-error classification. Edited/custom inputs have no fabricated expected answer. Comparison happens before display truncation, and changed editor inputs invalidate the displayed results. The sandbox lifetime matches Submit's 90 seconds. Sample reference membership, problem visibility, duplicate case IDs and ownership are checked. A SHA-256 revision of the displayed input and expected answer is checked at both enqueue and execution time, so sample corrections during an open editor or queued job require a reload rather than displaying a misleading comparison.

The content review covers all 430 problems: 414 cached source PDFs (including the CPE variants identified by each problem's source URL), plus 16 reviewed GPE originals. PDF page headers and layout gaps were reviewed separately from meaningful input whitespace. No blanket whitespace stripping is applied to stored data.

| Problem | Confirmed issue | Repair |
| --- | --- | --- |
| UVa 10405 | Sample replaced with 928,003 characters / 743 cases, every answer off by +1 | Restore the five published sample pairs and answers; add sample and independent boundary/random LCS regressions |
| GPE 10679 / UVa 10179 | Missing sample | Add the published sample |
| GPE 10600 / UVa 793 | Missing case separators in input and output | Restore required blank lines |
| CPE variant of UVa 10188 | The third standard-output block lost a meaningful space, contradicting its published character count and PE result | Restore one explicit trailing space in that block; preserve CPE's visible-character comparison and character-count output; add a matching hidden regression |
| UVa 10443 | One hidden expected answer omitted the required blank line between boards | Correct that exact captured hidden row |

10188 is intentionally the **modified CPE version**, not the different UVa numeric-character comparison. Its PDF extraction cannot preserve the invisible space's original location; the repaired sample explicitly includes one trailing space in the third standard block, making the published `Presentation Error 34` deterministic under the displayed problem statement.

Five old reference candidates were incorrectly labeled `correct`: 10099 omitted the guide's seat; 1056 ignored unnamed isolated vertices; 11094 hardcoded the land letter; 13211 reused destroyed intermediate vertices; 798 prohibited tile rotation. Preserve those as negative candidates and provide corrected references.

The 83 existing reference problems passed **281 sample/hidden-case executions** against the proposed repaired data in a local macOS sandbox using g++-14. Network, file writes and user-data reads were denied, with a clean environment and bounded execution. This is semantic verification, not verification of Linux/Vercel timing or memory limits. The other 347 problems received source/data checks without an independent executable reference. Of the 430 problems, 362 use local judging and 68 use UVa relay. Passing samples does not establish that all hidden tests pass, nor prove every incorrect program is rejected.

Evidence: `packages/db/audit/sample-audit-20260917.json`, `sample-reference-results-20260917.json`, and `sample-repairs-20260917.json`. The latter is embedded verbatim in the guarded migration.

## Collections and discussions

- Rename legacy category labels to 考試專區 / 主題專區 at the API boundary, retaining old collection URLs and curated memberships.
- Add `cpe-before-exam` / 考前必刷 from each public, non-future CPE exam's first three original slots, then exclude private problems and deduplicate. The snapshot has **51 exams, 138 unique problems: 92 one-star and 46 two-star**.
- Add nonempty missing collections from the 12 canonical topic tags; six new topic collections complement the six existing curated ones. New public tagged problems enter generated collections automatically.
- Add responsive cards, featured exam collection, topic search, empty/error/retry states, accessible progress and account-specific progress cache keys. Private problems cannot leak through collection counts or detail.
- Fix the undefined `oj-btn-ghost` style on discussion actions, consistent action heights, mobile wrapping, long titles, review reasons and card footers on 我的投稿.
- Fix anonymous auth hydration clearing mounted public queries, which could leave collections loading indefinitely.

## Validation

- Type checks, lint, checker/resource parity and schema/visibility/ownership tests.
- Independent dynamic-programming verification of the authored LCS answers.
- Migration integration test verifies guarded revisions, atomic rollback on concurrent changes, idempotence and preservation of unrelated hidden cases. Requires the disposable PostgreSQL CI service.
- 40 local Playwright checks passed across Chromium desktop/mobile, Firefox, WebKit and iOS WebKit, covering both themes, visual captures, search/retry/detail navigation, long submissions and WCAG AA checks.
- Full-site Run regression uses an isolated database and mocked execution transport; it verifies unchanged sample references, edited input, in-flight edits and language changes. No user code is sent to an external judge by that test.

## Backup and deployment

Before pushing the content migration, a fresh read-only snapshot was exported to `/private/tmp/oj-run-consistency/before-deploy-content.json` (0600 permissions, 117,466,717 bytes). File SHA-256: `34401a8ceeeb705321aa67a5a9a349e876c0b09fc0c3bdf8149595dffab7f870`. All five target preconditions match the backup. This is a **content backup**, covering affected sample/test rows and all public problem/exam data; account/payment tables are outside this mutation's scope.

Migration `20260917010000_sample_run_consistency` locks each target problem, checks identity/checker and captured input/output hashes, repairs only reviewed rows, and appends regressions. A conflicting edit aborts the entire DO block. Expected totals after applying: 430 samples and 1,260 hidden cases. Existing account/payment/submission records are untouched.

For rollback, use the private snapshot to restore only the four affected sample sets and the single corrected hidden output in one reviewed transaction, and remove only the three regression rows identified by the migration's deterministic IDs. Check each current row still equals the deployed repair before restoring; never overwrite subsequent author edits or replace the entire live database. Code can be rolled back separately because the new result fields are optional and old custom-input jobs remain supported.

After CI succeeds, verify the API, judge and web deployment commit, the five content repairs, generated collection membership, and public page rendering. Do not treat a successful push as deployment proof.
