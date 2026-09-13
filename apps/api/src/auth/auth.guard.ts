import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type Redis from "ioredis";
import { REDIS_CLIENT } from "../common/redis.providers";
import { Reflector } from "@nestjs/core";
import { IS_OPTIONAL_AUTH_KEY, IS_PUBLIC_KEY } from "../common/decorators";
import { TokenService } from "./token.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
      if (!(await this.redis.exists(`refresh:${payload.sub}:${payload.sid}`))) throw new Error("Session revoked");
      const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, handle: true, role: true, deletionRequestedAt: true } });
      if (!user) throw new Error("Account missing");
      if (user.deletionRequestedAt && !["/auth/me", "/users/me/cancel-deletion"].includes(req.path)) {
        throw new ForbiddenException("Account deletion is pending");
      }
      req.user = { id: user.id, handle: user.handle, role: user.role };
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      if (isOptional) {
        req.user = null;
        return true;
      }
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
