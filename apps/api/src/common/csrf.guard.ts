import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { verifyCsrfToken } from "./csrf.util";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const EXEMPT_PATHS = new Set(["/auth/login"]);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (!MUTATING_METHODS.has(req.method)) return true;
    // Service-to-service callback (apps/judge -> apps/api) uses x-internal-token, not cookies.
    if (typeof req.path === "string" && req.path.startsWith("/internal/")) return true;
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
