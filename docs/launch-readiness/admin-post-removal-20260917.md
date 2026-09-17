# Administrator article removal — 2026-09-17

Administrators could already call `DELETE /posts/:id`, but the article and review screens provided no action for removing another author's post. Both screens now expose **刪除文章 / Delete post** to authenticated administrators. The review action works on pending submissions and review history; the article action returns to discussions after success.

The confirmation identifies the whole article by its current published title (or draft title if unpublished) and author. It explains that published content, pending edits and access to comments will be removed. Cancel receives initial focus; Escape and Cancel dismiss without a request. The modal confines keyboard focus and disables repeat submission/dismissal while deletion is pending. Errors retain the dialog for retry. Chinese/English copy and both themes are supported.

## Authorization and data

- The API retains its server-side owner-or-administrator check, authentication, CSRF and MFA guards. Showing/hiding a button does not confer permission. Ordinary authors retain their existing delete action in My posts.
- Removal remains a soft deletion. An additive, nullable migration records `Post.deletedById` and `deletedByRole` with the existing `deletedAt` in the same transaction. The first actor/time survives retries; historical removals keep null actor fields instead of fabricating an identity. This is retained with the post, subject to existing account/content deletion policy.
- Advisory locking serializes article approval, edits and removal. Pending article revisions become superseded. Existing approved snapshots remain unchanged; removed posts cannot be read, edited or approved again. Their comments stop being accessible through the public/author endpoints and review queue.
- Authorized duplicate DELETE requests return success without changing the original removal record. Unauthorized callers still receive 404, including for removed posts.
- Successful UI removal cancels old article reads and invalidates community/review queries. Article metadata and structured data now fetch without the shared 15-second cache; the public detail response uses `Cache-Control: no-store`.

## Verification and rollout

- Local typecheck, lint, API build and production web build passed. The unit suite passed 133 checks, with 153 database/sandbox opt-in checks skipped locally. Database integration and built-API authorization tests run against CI's disposable PostgreSQL/Redis, because the local Docker database is unresponsive.
- Browser coverage includes administrator vs ordinary-reader/author visibility, title/author confirmation, keyboard focus, cancellation, both themes, stale-list invalidation, failed deletion and retry, one in-flight request, and both review tabs. Runs use mocked articles; production articles are never deleted as a test.
- Final production-build browser run: **55/55 passed** across desktop/mobile Chromium, Firefox, desktop WebKit and iOS WebKit. It caught and verified fixes for modal focus wrapping and Safari's pointer-focus return behavior. Screenshots were inspected for desktop dark and mobile light layouts; accessibility checks passed.
- Database regressions cover foreign deletion denial, administrator deletion, preserved approved revisions and first-actor audit, hidden comments/list/sitemap/own-post access, retry safety and concurrent approval/removal. Runtime checks exercise authentication, CSRF, forged client role fields and an actual administrator DELETE route.
- Before rollout, 10 existing production posts and 7 post revisions were exported read-only to `generated/backups/admin-post-removal-20260917/posts-before-migration.json.gz`. The restricted local backup was decompressed and SHA-256 verified: `026fffdeabeb94939f43f4ca06aaecbbfb0cec886449045ff8f61b47cda2f527`. It is excluded from Git and deployment uploads.
- Production migration runs through Railway's existing start command after CI succeeds. Check the final commit on API, judge and the live Vercel domain before reporting deployment complete; a ready preview alone is insufficient.

## CI measurement correction

The first full run for this change passed 298/300 browser cases. The two failures were the existing mobile Chromium/iOS WebKit WA Run/Submit alignment check, before either Run or Submit was pressed. The CI screenshots show adjacent buttons. Trace frames show the statement loading placeholder being replaced by its one-line text between two separate `boundingBox()` calls, moving the entire action row up by 233.25 px; the test compared different layout frames.

Both button rectangles are now read synchronously in a single browser evaluation. The original vertical-alignment and horizontal-gap assertions remain intact, with no skipped tests, retries or relaxed thresholds. CI artifact SHA-256: `34a9747884202f87619e7e5f1454fe60db3c98765a8f6e02b8f713759d5c4db6` (run `35233771570`).

The first 50-case repetition caught an additional iOS WebKit click during lazy statement/editor initialization (49 passed). Its trace shows scroll anchoring changing the document offset from 583 to 350 while the click is in progress. The test now waits for the actual statement text and Monaco textbox to attach before measuring and interacting. This models reading the statement and entering code; it does not add a fixed delay or force clicks. Monaco's native EditContext textbox can have no visible dimensions in Chromium, so readiness uses attachment rather than a visibility assertion on that internal control.

Final production-build repetition: **50/50 passed** (AC and WA workflows, five repetitions on each of five browser targets); lint and whitespace checks passed. Full CI must pass on the follow-up commit before the deployment gates release it.
