import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { verifyCsrfToken } from "./csrf.util";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// Bootstrap auth routes have no CSRF token yet; validate their browser Origin instead.
// /analytics/pageview is exempt for the same chicken-and-egg reason: most requests are from
// anonymous visitors with no session/CSRF token at all, and a forged pageview event is low-stakes
// (it only pollutes traffic counts, no state affecting the requester or another user changes).
const EXEMPT_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/analytics/pageview", "/billing/ecpay/return", "/billing/ecpay/period-return"]);
const BROWSER_BOOTSTRAP_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/analytics/pageview"]);
for (const path of ["/auth/forgot-password", "/auth/reset-password", "/auth/email/verify", "/users/school/verify/confirm"]) { EXEMPT_PATHS.add(path); BROWSER_BOOTSTRAP_PATHS.add(path); }

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (!MUTATING_METHODS.has(req.method)) return true;
    // Service-to-service callback (apps/judge -> apps/api) uses x-internal-token, not cookies.
    if (typeof req.path === "string" && req.path.startsWith("/internal/")) return true;
    // ECPay's webhooks are server-to-server POSTs from ECPay's own infrastructure — there's no
    // browser session or CSRF token to present. Authenticity here comes from CheckMacValue
    // verification inside the handler instead (see billing.service's handleEcpay* methods).
    if (EXEMPT_PATHS.has(req.path)) {
      if (BROWSER_BOOTSTRAP_PATHS.has(req.path)) {
        const origin = req.headers?.origin;
        const allowed = (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",").map((s) => s.trim());
        if ((origin !== undefined && (typeof origin !== "string" || !allowed.includes(origin))) || (origin === undefined && req.headers?.["sec-fetch-site"] === "cross-site")) throw new ForbiddenException("Untrusted request origin");
      }
      return true;
    }

    const cookieToken: string | undefined = req.cookies?.csrf_token;
    const headerToken = req.headers["x-csrf-token"];

    if (
      !cookieToken ||
      !headerToken ||
      typeof headerToken !== "string" ||
      headerToken !== cookieToken ||
      !verifyCsrfToken(cookieToken)
    ) {
      throw new ForbiddenException("Missing or invalid CSRF token");
    }
    return true;
  }
}
