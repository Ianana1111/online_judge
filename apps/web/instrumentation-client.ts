// Next.js's native client-instrumentation convention (stable since Next 15.3) — runs once in the
// browser before the app hydrates. NEXT_PUBLIC_SENTRY_DSN (not SENTRY_DSN, which the server/edge
// side in instrumentation.ts reads) because this file ships to the browser bundle: only
// NEXT_PUBLIC_-prefixed env vars are ever inlined into client code by Next.js, and a DSN is safe
// to expose publicly (it's a write-only ingest identifier, not a secret — this is Sentry's own
// documented model). No-ops safely when unset, same as the server side.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({ dsn, environment: process.env.NODE_ENV ?? "development", tracesSampleRate: 0 });
}
