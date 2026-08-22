import * as Sentry from "@sentry/node";

// Unset in local dev and any environment that hasn't been given a real Sentry project yet —
// Sentry.init no-ops safely without a dsn, so Sentry.captureException calls elsewhere in this
// worker are always safe to leave in place regardless of whether this is ever configured.
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0,
  });
}
