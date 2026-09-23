const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// When the API lives on a different domain than the web app (e.g. Railway + Vercel), the browser
// won't let this page's JS read a cookie set by the API's origin via document.cookie, so the API
// echoes the CSRF token in JSON response bodies (login/refresh/me) and we keep it here instead.
// Same-origin/local dev never needs this — readCookie() below still works there as a fallback.
let inMemoryCsrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  inMemoryCsrfToken = token;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function csrfHeader(): string {
  return inMemoryCsrfToken ?? readCookie("csrf_token") ?? "";
}

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "x-csrf-token": csrfHeader() },
    })
      .then(async (res) => {
        if (res.ok) {
          const body = (await res.json().catch(() => null)) as { csrfToken?: string } | null;
          if (body?.csrfToken) setCsrfToken(body.csrfToken);
        }
        return res.ok;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isRetry?: boolean;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const isMutating = method !== "GET" && method !== "HEAD";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isMutating) {
    headers["x-csrf-token"] = csrfHeader();
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (res.status === 401 && !opts.isRetry && !["/auth/refresh", "/auth/login", "/auth/mfa/verify", "/auth/reset-password"].includes(path)) {
    const refreshed = await doRefresh();
    if (refreshed) {
      return apiFetch<T>(path, { ...opts, isRetry: true });
    }
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const hasMessage = body !== null && typeof body === "object" && "message" in body;
    const message = hasMessage ? String((body as { message: unknown }).message) : res.statusText;
    const code = body && typeof body === "object" && "code" in body ? String(body.code) : "";
    if (typeof window !== "undefined" && ["MFA_REQUIRED", "MFA_ENROLLMENT_REQUIRED"].includes(code)) {
      const target = code === "MFA_REQUIRED" ? "/verify-mfa" : "/settings?section=security";
      if (window.location.pathname + window.location.search !== target) window.location.assign(target);
    }
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json() as T;
  // Several session endpoints rotate the CSRF cookie. Keep the cross-origin in-memory copy in
  // lockstep even when the caller is a background refresh rather than the auth store itself.
  if (data && typeof data === "object" && "csrfToken" in data) {
    const token = (data as { csrfToken?: unknown }).csrfToken;
    if (typeof token === "string" && token) setCsrfToken(token);
  }
  return data;
}

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

class RecoverableStatusStream extends EventTarget {
  onerror: ((event: Event) => void) | null = null;
  private readonly source: EventSource;
  private readonly abort = new AbortController();
  private readonly timer: ReturnType<typeof setInterval>;
  private readonly timeout: ReturnType<typeof setTimeout>;
  private closed = false;
  private polling = false;

  constructor(private readonly path: string, private readonly terminal: (value: Record<string, unknown>) => boolean) {
    super();
    this.source = new EventSource(apiUrl(`${path}/stream`), { withCredentials: true });
    this.source.addEventListener("status", (event) => {
      try { this.accept(JSON.parse((event as MessageEvent).data)); } catch { void this.poll(); }
    });
    this.source.onerror = () => void this.poll();
    this.timer = setInterval(() => void this.poll(), 5_000);
    this.timeout = setTimeout(() => { this.onerror?.(new Event("error")); this.close(); }, 16 * 60_000);
  }

  private accept(value: Record<string, unknown>) {
    if (this.closed) return;
    this.dispatchEvent(new MessageEvent("status", { data: JSON.stringify(value) }));
    if (this.terminal(value)) this.close();
  }

  private async poll() {
    if (this.closed || this.polling) return;
    this.polling = true;
    try { this.accept(await apiFetch<Record<string, unknown>>(this.path, { signal: this.abort.signal })); }
    catch (error) {
      if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
        this.onerror?.(new Event("error")); this.close();
      }
    } finally { this.polling = false; }
  }

  close() { this.closed = true; this.source.close(); this.abort.abort(); clearInterval(this.timer); clearTimeout(this.timeout); }
}

export function openSubmissionStream(submissionId: string) {
  return new RecoverableStatusStream(`/submissions/${submissionId}`, (value) => !["PENDING", "JUDGING"].includes(String(value.verdict)));
}

export function openRunStream(runId: string) {
  return new RecoverableStatusStream(`/runs/${runId}`, (value) => ["DONE", "COMPILE_ERROR", "ERROR"].includes(String(value.status)));
}
