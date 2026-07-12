import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";

/** Guards the internal apps/judge -> apps/api callback route. Service-to-service auth only. */
@Injectable()
export class InternalTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers["x-internal-token"];
    const expected = process.env.INTERNAL_SERVICE_TOKEN ?? "";
    if (!expected || typeof token !== "string" || !constantTimeEquals(token, expected)) {
      throw new UnauthorizedException("Invalid internal service token");
    }
    return true;
  }
}

// A plain !== comparison leaks how many leading bytes matched via response timing — this
// endpoint is reachable from the public internet (not just Railway's private network), so treat
// the shared secret as if timing attacks against it are practical, same as csrf.util.ts already
// does for the CSRF token signature.
function constantTimeEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}
