import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "https://api.judge.tw";
// Kept in sync with the same constant's history in next.config.mjs (where the static, non-CSP
// security headers still live): @monaco-editor/react's default loader fetches the editor itself
// from jsDelivr at runtime rather than bundling it — whitelisted here after a 2026-07-17 prod
// incident where enforcing CSP broke the editor. Self-hosting Monaco (removing the CDN dependency
// entirely) is a tracked follow-up, not done here.
const MONACO_CDN = "https://cdn.jsdelivr.net";

/**
 * CSP has to be built per-request (not in next.config.mjs's static headers()) because a nonce
 * must be a fresh random value every time — reusing one would let an attacker who ever observed
 * it forge future inline scripts. `script-src` deliberately keeps the pre-existing host allowlist
 * (accounts.google.com, jsDelivr) rather than switching to 'strict-dynamic': that would change how
 * Monaco's CDN-loaded script is authorized, which is exactly the mechanism the 2026-07-17 incident
 * above was already about — not something to risk touching in the same change that removes
 * 'unsafe-inline'. Only 'unsafe-inline' is removed and replaced with the nonce; every other
 * source stays exactly as it already was.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://accounts.google.com ${MONACO_CDN}`,
    `style-src 'self' 'unsafe-inline' ${MONACO_CDN}`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    // TODO once a real Sentry project exists (see instrumentation-client.ts): browser-side error
    // reports are a fetch() to Sentry's ingest host, which this connect-src doesn't allow yet —
    // add it here once the DSN reveals which host that is (varies by org/region, e.g.
    // https://oXXXXX.ingest.us.sentry.io), or reports will silently fail with a CSP violation.
    `connect-src 'self' ${API_ORIGIN} https://accounts.google.com ${MONACO_CDN}`,
    "worker-src 'self' blob:",
    "form-action 'self' https://accounts.google.com https://payment.ecpay.com.tw https://payment-stage.ecpay.com.tw",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");

  // Forwarded as a request header so Server Components can read their own copy via
  // headers().get("x-nonce") (see app/layout.tsx) — Next.js separately auto-detects the nonce it
  // needs for its own internally-injected scripts straight from the response's CSP header below,
  // but doesn't expose that parsed value back to userland any other way.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
