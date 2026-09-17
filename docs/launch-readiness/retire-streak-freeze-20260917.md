# Retire streak protection and clarify school verification — 2026-09-17

Remove monthly inventory grants, seven-day login bonuses, the spend endpoint and all protection UI. Daily visits still record consecutive UTC check-ins. Solve streaks on the homepage and leaderboard use actual AC submission dates only; yesterday's streak remains active while today is still open. Historical protection no longer bridges missed days or adds a day to the displayed streak.

Old database columns and `streak_freeze_days` rows are deliberately retained as inactive history for safe rolling deployment and rollback. No destructive schema migration is required. The API no longer reads or writes them, and no protection fields appear in daily or leaderboard responses. The leaderboard cache namespace changes so an older calculation cannot leak into new responses.

Validation covers month/year boundaries, a missed UTC day, distinct solved-problem counts, unchanged legacy inventory, login milestones, and matching dashboard/leaderboard streaks. The API runtime check seeds legacy inventory/history and verifies that daily stats ignore them and the removed POST endpoint returns 404. Browser checks cover desktop/mobile and both themes, including stale legacy response fields.

Add a bilingual question under Account, school and notifications: each school mailbox can complete verification for only one account, and deletion does not make it reusable. An incomplete verification with an expired link may still request a replacement. This documents the existing `UsedSchoolEmail` behavior; it does not change identity or email logic.

Also revise the existing official update post `cms7hucge0001k9sqnhg9i28w` after deployment so it no longer promotes the retired feature. Back up the original post and revisions; preserve its author, original publication time, comments and other update sections. Record the content correction as an approved revision.
