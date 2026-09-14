# Production deployment gates

Configured and read back on 2026-09-13:

- Railway API trigger `a0164af0-9bb6-4faf-a9a5-2fd4a4fde92a`: branch `main`, `checkSuites=true` (Wait for CI).
- Railway judge trigger `b7e034db-d936-4067-ba0b-dca436a38af5`: branch `main`, `checkSuites=true`.
- Vercel project `judges`: check `chk_7193442e-f625-4002-a198-1512e4c0f1dd`, GitHub check name `verify`, production only, blocks `deployment-alias`, timeout 3600 seconds.

The required GitHub job name is `verify` in `.github/workflows/readiness.yml`. Keep it unique. If renamed, update the Vercel check before releasing. Vercel can build while CI runs, but the custom domain must not move until the check passes. Railway waits for GitHub workflows before deployment. The next production release must verify these behaviors against the exact commit, plus all service health and migration results; configuration readback alone is not a failed-release exercise.

On September 14, configuration was read back again and the normal `main` release of `a5134a4` was observed: Railway API/judge stayed WAITING and the Vercel production build stayed off the `judge.tw` alias while [main CI](https://github.com/Ianana1111/online_judge/actions/runs/34815070564) ran. After `verify` passed, Railway deployed and the production alias moved to the matching web deployment. See the [release record](deployment-20260914.md). This observed successful transition does not substitute for an intentionally failed-release exercise.

CI now includes static lint, encrypted backup/restore validation and Chromium/Firefox/WebKit workflows in the same required job. No production credentials are exposed to the test job. Manual force-promotion or CLI deployment is an operator bypass and must be accompanied by the same commit's successful CI and migration/rollback review.

For rollback, record the prior web/API/judge deployment IDs and the database migration state before rollout. Use a prior image only when its schema and protocol remain compatible. A database restore is a separate incident procedure that loses writes after the snapshot; do not use it as an automatic application rollback. See [backup operations](backup-operations.md).

Sources: [Railway Wait for CI](https://docs.railway.com/deployments/github-autodeploys), [Vercel deployment checks](https://vercel.com/docs/deployment-checks).
