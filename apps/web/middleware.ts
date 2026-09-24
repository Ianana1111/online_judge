import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sentryIngestOrigin } from "@oj/shared/telemetryPrivacy";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "https://api.judge.tw";
const SENTRY_ORIGIN = sentryIngestOrigin(process.env.NEXT_PUBLIC_SENTRY_DSN);

/**
 * CSP has to be built per-request (not in next.config.mjs's static headers()) because a nonce
 * must be a fresh random value every time — reusing one would let an attacker who ever observed
 * it forge future inline scripts.
 *
 * No more cdn.jsdelivr.net anywhere below: Monaco now self-hosts from this app's own /vs (see
 * scripts/copy-monaco.js and lib/monacoLoader.ts), closing both the reliability problem (jsDelivr
 * is intermittently unreachable from some Taiwanese/campus networks) and the supply-chain one (the
 * CDN allowlist meant a compromised jsDelivr could run arbitrary JS on the exact page where users
 * type and submit code — the 2026-07-17 incident this allowlist entry used to have a comment about
 * was CSP *breaking* the CDN-loaded editor, not this risk, but removing the CDN dependency
 * entirely closes both at once). `script-src` still doesn't use 'strict-dynamic': with the CDN
 * gone there's no longer a live reason to reach for it, and the nonce alone already covers every
 * inline script this app renders.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""} https://accounts.google.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${API_ORIGIN} https://accounts.google.com${SENTRY_ORIGIN ? ` ${SENTRY_ORIGIN}` : ""}`,
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
  // Next's renderer reads the request CSP to nonce its own hydration scripts.
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
