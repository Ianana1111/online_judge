/** Preserve diagnostic stacks and correlation IDs without exporting credentials or source code. */
export function scrubTelemetryEvent<T>(event: T): T {
  const value = event as { message?: unknown; logentry?: unknown; exception?: { values?: { value?: string }[] }; user?: unknown; extra?: unknown; breadcrumbs?: unknown; request?: { url?: string; data?: unknown; cookies?: unknown; headers?: unknown; query_string?: unknown } };
  // Provider/ORM error messages can embed submitted code, connection strings or bearer tokens.
  // Keep error types and stack locations for diagnosis, but never export unstructured messages.
  delete value.message;
  delete value.logentry;
  for (const exception of value.exception?.values ?? []) delete exception.value;
  delete value.user;
  delete value.extra;
  delete value.breadcrumbs;
  if (value.request) {
    delete value.request.data;
    delete value.request.cookies;
    delete value.request.headers;
    delete value.request.query_string;
    if (value.request.url) {
      try {
        const url = new URL(value.request.url);
        url.username = ""; url.password = ""; url.search = ""; url.hash = "";
        value.request.url = url.toString();
      } catch { delete value.request.url; }
    }
  }
  return event;
}

export function sentryIngestOrigin(dsn: string | undefined): string | null {
  if (!dsn) return null;
  try { const url = new URL(dsn); return url.protocol === "https:" ? url.origin : null; }
  catch { return null; }
}
