import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_OPTIONAL_AUTH_KEY, IS_PUBLIC_KEY } from "../common/decorators";
import { TokenService } from "./token.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isOptional = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const req = context.switchToHttp().getRequest();
    const token: string | undefined = req.cookies?.access_token;

    if (!token) {
      if (isOptional) {
        req.user = null;
        return true;
      }
      throw new UnauthorizedException("Authentication required");
    }

    try {
      const payload = this.tokens.verifyAccessToken(token);
      req.user = { id: payload.sub, handle: payload.handle, role: payload.role };
      return true;
    } catch {
      if (isOptional) {
        req.user = null;
        return true;
      }
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
