/** Preserve diagnostic stacks and correlation IDs without exporting credentials or source code. */
export function scrubTelemetryEvent<T>(event: T): T {
  const value = event as { user?: unknown; extra?: unknown; breadcrumbs?: unknown; request?: { url?: string; data?: unknown; cookies?: unknown; headers?: unknown; query_string?: unknown } };
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
