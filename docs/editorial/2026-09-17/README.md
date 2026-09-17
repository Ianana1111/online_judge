# judge. 官方快報 — 2026-09-17

Six original Traditional Chinese news discussions, requested by the site owner. Sources checked on 2026-09-17 Asia/Taipei. Each article separates reported facts from judge. commentary and invites discussion. The source publication date is distinct from the site's publication timestamp; the GitHub availability article additionally identifies the August incident period.

| Article | Post ID | Source date |
| --- | --- | --- |
| [Node.js benchmarks](01-node-benchmark.md) | `official-news-20260917-node-benchmark` | 2026-09-16 |
| [Python release candidate](02-python-release.md) | `official-news-20260917-python-release` | 2026-09-01 |
| [Chrome security update](03-chrome-security.md) | `official-news-20260917-chrome-security` | 2026-09-15 |
| [GitHub AI Scan](04-ai-scan.md) | `official-news-20260917-ai-scan` | 2026-09-16 |
| [Reviewing AI-generated code](05-copilot-review.md) | `official-news-20260917-copilot-review` | 2026-09-10 |
| [GitHub availability report](06-github-reliability.md) | `official-news-20260917-github-reliability` | 2026-09-09 |

Publication uses the existing `judge-team` official account, `ANNOUNCEMENT` category and `isOfficial: true`. The Markdown H1 becomes the post title; the remaining Markdown becomes its body. Store an approved `ContentRevision` alongside each post for moderation history. Use actual publication timestamps, no backdating or artificial comments/views.

The one-time publishing operation must be atomic, create-only and idempotent: identical previously published rows can be skipped; changed, deleted or conflicting content must abort rather than be overwritten. Back up existing official content before publishing. Public API verification must compare all six bodies and verify the official badge, author, category and publication state. This content update requires no application rebuild.

## Publication verification

Published all six articles on 2026-09-17 at 10:00 Asia/Taipei, using the existing official author and owner administrator as reviewer. All six public API responses match the reviewed Markdown exactly; official-category filtering includes every article. A subsequent read-only check confirmed all six approved revisions and no duplicates. Chrome inspection confirmed the list, official filter, article navigation, headings, source link and existing moderated comment form.

Private operational evidence is excluded from Git: `generated/verifications/official-news-20260917/`. The pre-publication official-content backup is stored with restricted permissions in `generated/backups/official-news-20260917/`. Existing articles were preserved.
