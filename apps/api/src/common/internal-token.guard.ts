import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

/** Guards the internal apps/judge -> apps/api callback route. Service-to-service auth only. */
@Injectable()
export class InternalTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers["x-internal-token"];
    const expected = process.env.INTERNAL_SERVICE_TOKEN ?? "";
    if (!expected || !token || token !== expected) {
      throw new UnauthorizedException("Invalid internal service token");
    }
    return true;
  }
}
