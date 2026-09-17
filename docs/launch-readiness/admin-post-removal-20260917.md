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
