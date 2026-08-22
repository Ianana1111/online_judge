// Next.js's own instrumentation hook (stable since Next 15, no experimental flag needed) — runs
// once per server/edge runtime at boot, before any request is handled. Sentry.init no-ops safely
// without a dsn, so this is a harmless no-op in local dev and any environment that hasn't been
// given a real Sentry project yet.

export async function register(): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({ dsn, environment: process.env.NODE_ENV ?? "development", tracesSampleRate: 0 });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({ dsn, environment: process.env.NODE_ENV ?? "development", tracesSampleRate: 0 });
  }
}
