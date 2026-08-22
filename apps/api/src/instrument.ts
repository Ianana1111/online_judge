import * as Sentry from "@sentry/node";

// Unset in local dev and (unless someone explicitly adds it) any environment that hasn't been
// given a real Sentry project yet — Sentry.init no-ops safely without a dsn, so every
// Sentry.captureException call elsewhere in this app is always safe to leave in place regardless
// of whether this ever actually gets configured.
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    // Errors on a judge/billing/auth backend are low-volume enough that sampling would just mean
    // occasionally missing the one report that mattered — capture all of them at this app's scale
    // rather than trying to save quota on a service processing at most a few requests per second.
    tracesSampleRate: 0,
  });
}
