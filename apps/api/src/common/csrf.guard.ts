import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { verifyCsrfToken } from "./csrf.util";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// /auth/refresh is exempt too: it's already gated by an unforgeable HttpOnly refresh_token
// cookie, and cross-domain (web + API on different origins) the client has no CSRF token to
// present yet on a fresh page load until *after* a successful refresh/me call hands it one -
// requiring CSRF here would be a chicken-and-egg deadlock, not meaningful extra protection.
const EXEMPT_PATHS = new Set(["/auth/login", "/auth/register", "/auth/refresh"]);

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
    if (typeof req.path === "string" && req.path.startsWith("/billing/ecpay/")) return true;
    if (EXEMPT_PATHS.has(req.path)) return true;

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
