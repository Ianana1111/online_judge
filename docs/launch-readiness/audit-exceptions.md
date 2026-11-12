# Dependency audit exceptions

CI runs `pnpm audit --prod --audit-level high` and fails on any high or critical advisory. An advisory
may be ignored only through `pnpm.auditConfig.ignoreGhsas` in the root `package.json`, one GHSA ID at a
time, with an entry here. Remove the ID as soon as the fix lands.

| Advisory | Package | Why it is ignored | Exit condition |
|---|---|---|---|
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) (high) | `zod` 3.25.76 (API, shared), 4.4.3 (via `@vercel/sandbox`) | Memory exhaustion when validating oversized constrained collections. Every API request body is capped at 1 MB (`apps/api/src/main.ts`), which bounds the size of any collection Zod validates. The only fixed release line is Zod 4 (`>= 4.6.6`); moving the API and `packages/shared` (42 files) from Zod 3 to Zod 4 is a separate migration. Added 2026-11-12. | Upgrade to `zod >= 4.6.6` (and a `@vercel/sandbox` release that depends on it), then delete the ID. |

The same audit run on 2026-11-12 also reported `next`, `@sentry/nextjs`, `dompurify`, `multer`,
`body-parser` and `undici`; those were fixed by upgrading, not ignored.
