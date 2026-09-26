# Judge Sandbox incident — 2026-09-26

## Confirmed findings

- The owner reported Run failure on UVa 100, The 3n + 1 problem. Production logs at 07:52 UTC (15:52 Asia/Taipei) show C++17 Run failing before sandbox creation completed: `createMs=0`, `compileMs=0`, no cases executed. Submit for UVa 100 failed shortly afterward. Earlier failures affected another problem as well.
- The public API health endpoint returned HTTP 200. Railway API, Judge, Redis and PostgreSQL deployments all reported SUCCESS. The worker processed the request, so this is not evidence of a stopped worker or a source-code/sample mismatch.
- Two empty, short-lived sandbox-creation probes using the actual production Judge credentials returned HTTP 402. The provider error code was `payment_required`; its response referenced the Hobby plan. No sandbox was created and no user source was sent by either probe.
- A read-only Vercel team lookup confirmed `billing.plan=hobby` and `billing.status=active`. Authentication and missing snapshot were not the reported rejection categories. The exact exhausted usage metric and reset date were not obtained; inspect the team's Sandbox Usage dashboard rather than assuming CPU, memory, or creation count.

## Recovery

Vercel's [Sandbox pricing and quotas](https://vercel.com/docs/sandbox/pricing) states that Hobby sandbox creation pauses after its included usage is exceeded. Upgrade the affected team to Pro to continue, or wait for its usage cycle to reset. Review usage and spending controls before enabling paid usage. No plan change, payment, quota override, or account migration was performed.

The outage affects both Run and local Submit because both create sandboxes through the same provider credentials. Production and editorial external verification share this quota context; local Docker verification does not restore production capacity. A provider capacity change must be followed by actual Run and Submit checks before claiming recovery. Do not execute untrusted programs in the Railway application container as a workaround.

## Diagnostic fix

The existing sanitized logger read `error.status` / `error.statusCode`, while the installed Sandbox SDK stores HTTP status in `error.response.status`. Consequently production logged `status: null`, masking the provider's 402.

The logger now recognizes the SDK Response status while retaining support for the existing flat error shapes. It logs a validated numeric HTTP status and application context, never provider bodies, user source, or credentials. The initial ten focused privacy/status tests, Judge TypeScript checks and focused lint passed. This diagnostics change alone did not remove the provider quota restriction.

## Recovery verification after owner upgrade

- A read-only lookup confirmed the actual production Vercel team is now `pro`, with active billing. Snapshot sandbox creation and a direct isolated C++ compile/sample run using the production credentials succeeded.
- The first production API Run still failed before sandbox creation completed, with no HTTP status, after approximately 25 seconds. This was a separate failure from the earlier confirmed 402. Its exact transport cause was not captured; do not claim that Pro alone immediately restored the worker.
- Commit `f073d37` added a fixed allowlist of nested network error codes to sanitized diagnostics. Eleven focused tests, Judge typecheck and focused lint passed. The diagnostic deployment restarted the worker. Subsequent production checks succeeded; no new matching Sandbox failure logs were returned by the final check. No SSH key or new management access was added.
- The [recovery evidence](judge-recovery-20260926.json) records 16 successful checks: UVa 100 plus randomly selected UVa 10783 and 679. All three were tested with C++ Run and full production Submit; UVa 10783 also passed in C, Python and Java. Wrong output produced WA in Run and Submit, and invalid source produced COMPILE_ERROR / CE respectively.
- Initial Submit polls returned `JUDGING` for correct programs. Their final AC results were independently observed through read-only queries scoped to the exact temporary test account before cleanup; the report preserves both observations. No unfinished verdict is treated as acceptance.
- The temporary FREE account and its dependent records were removed using exact ID, handle, email, role, plan and creation-time guards. This was a bounded spot check, not a fresh audit of all 430 problems or a guarantee against future provider/transport outages.
