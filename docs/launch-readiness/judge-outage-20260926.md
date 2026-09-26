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

The logger now recognizes the SDK Response status while retaining support for the existing flat error shapes. It still logs only a validated numeric HTTP status and application context, never provider bodies, user source, or credentials. Ten focused privacy/status tests, Judge TypeScript checks and focused lint passed. This diagnostics change does not remove the provider quota restriction; production recovery remains pending.
