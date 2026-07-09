import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";

export interface RequestUser {
  id: string;
  handle: string;
  role: string;
}

/** Route requires no authentication at all; AuthGuard never touches req.user. */
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Route works for both anonymous and authenticated callers; req.user is set if a valid
 * access_token cookie is present, otherwise null. Never throws 401. */
export const IS_OPTIONAL_AUTH_KEY = "isOptionalAuth";
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser | null => {
  const req = ctx.switchToHttp().getRequest();
  return req.user ?? null;
});
