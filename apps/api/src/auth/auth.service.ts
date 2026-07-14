import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import argon2 from "argon2";
import { randomUUID } from "node:crypto";
import type Redis from "ioredis";
import { prisma } from "@oj/db";
import type { LoginDto, RegisterDto } from "@oj/shared";
import { generateCsrfToken } from "../common/csrf.util";
import { REDIS_CLIENT } from "../common/redis.providers";
import { isProActive } from "../billing/billing.service";
import { TokenService } from "./token.service";

export interface IssuedSession {
  user: { id: string; handle: string; email: string; role: string };
  accessToken: string;
  accessMaxAgeMs: number;
  refreshToken: string;
  refreshMaxAgeMs: number;
  csrfToken: string;
}

// A fixed, precomputed argon2id hash of an arbitrary string — not tied to any real account. When
// the handle doesn't exist (or is a Google-only account with no password), login() still runs a
// verify against this instead of short-circuiting, so both cases cost the same argon2 work and a
// timing side-channel can't be used to enumerate which handles have a real password account.
const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$Vyv5rJ7cZaZ7JWxzpshT/g$0a8GDprgON73CWFPJdJAMVt9iMWDOLv0oCy+IqYnFu8";

@Injectable()
export class AuthService {
  constructor(
    private readonly tokens: TokenService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async register(dto: RegisterDto): Promise<IssuedSession> {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ handle: dto.handle }, { email: dto.email }] },
    });
    if (existing) throw new ConflictException("Handle or email already in use");

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await prisma.user.create({
      data: { handle: dto.handle, email: dto.email, passwordHash, role: "USER" },
    });
    return this.issueSession(user.id, user.handle, user.email, user.role);
  }

  async login(dto: LoginDto): Promise<IssuedSession> {
    const user = await prisma.user.findUnique({ where: { handle: dto.handle } });
    // Always run an argon2 verify, even when there's no real hash to check against — a real user
    // costs one verify either way, so a missing-handle or Google-only account can no longer be
    // distinguished from a wrong password by response timing (argon2 is deliberately slow, which
    // is exactly what makes the timing gap measurable if we skip it here).
    const ok = await argon2.verify(user?.passwordHash ?? DUMMY_PASSWORD_HASH, dto.password);
    if (!user || !user.passwordHash || !ok) throw new UnauthorizedException("Invalid handle or password");
    return this.issueSession(user.id, user.handle, user.email, user.role);
  }

  /** Finds an existing account by googleId, links Google to an existing password account with
   * the same email, or creates a brand new account — then issues a normal session either way. */
  async loginWithGoogle(googleId: string, email: string, suggestedHandle: string): Promise<IssuedSession> {
    let user = await prisma.user.findUnique({ where: { googleId } });
    if (!user) {
      const byEmail = await prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        user = await prisma.user.update({ where: { id: byEmail.id }, data: { googleId } });
      } else {
        const handle = await this.uniqueHandleFrom(suggestedHandle);
        user = await prisma.user.create({ data: { handle, email, googleId, role: "USER" } });
      }
    }
    return this.issueSession(user.id, user.handle, user.email, user.role);
  }

  private async uniqueHandleFrom(base: string): Promise<string> {
    const cleaned = base.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user";
    let candidate = cleaned;
    let suffix = 0;
    while (await prisma.user.findUnique({ where: { handle: candidate } })) {
      suffix += 1;
      candidate = `${cleaned}${suffix}`;
    }
    return candidate;
  }

  async refresh(refreshToken: string | undefined): Promise<IssuedSession> {
    if (!refreshToken) throw new UnauthorizedException("Missing refresh token");

    let payload;
    try {
      payload = this.tokens.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const exists = await this.redis.exists(`refresh:${payload.sub}:${payload.jti}`);
    if (!exists) throw new UnauthorizedException("Session has been revoked");

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException("User no longer exists");

    return this.issueSession(user.id, user.handle, user.email, user.role);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = this.tokens.verifyRefreshToken(refreshToken);
      await this.redis.del(`refresh:${payload.sub}:${payload.jti}`);
      const current = await this.redis.get(`refresh:current:${payload.sub}`);
      if (current === payload.jti) {
        await this.redis.del(`refresh:current:${payload.sub}`);
      }
    } catch {
      // Best-effort cleanup; an invalid/expired refresh token on logout is not an error.
    }
  }

  async me(userId: string): Promise<{
    id: string;
    handle: string;
    email: string;
    role: string;
    isStudent: boolean;
    plan: "FREE" | "PRO";
    settings: Record<string, unknown>;
    csrfToken: string;
    csrfMaxAgeMs: number;
  }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    // Stateless token (see csrf.util.ts) — safe to mint a fresh one on every /auth/me call so
    // the web app always has a working value in memory, including right after a hard refresh
    // when it can no longer read the cookie itself cross-domain.
    const proActive = isProActive(user);
    return {
      id: user.id,
      handle: user.handle,
      email: user.email,
      role: user.role,
      isStudent: user.isStudent,
      plan: proActive ? "PRO" : "FREE",
      settings: (user.settings as Record<string, unknown>) ?? {},
      csrfToken: generateCsrfToken(),
      csrfMaxAgeMs: this.tokens.refreshTtlMs,
    };
  }

  /**
   * Issues a fresh access/refresh/csrf token triple and rotates the refresh session: the
   * previous jti (tracked via a `refresh:current:{userId}` pointer) is invalidated so only one
   * refresh token is valid per user at a time.
   */
  private async issueSession(id: string, handle: string, email: string, role: string): Promise<IssuedSession> {
    const previousJti = await this.redis.get(`refresh:current:${id}`);
    if (previousJti) {
      await this.redis.del(`refresh:${id}:${previousJti}`);
    }

    const jti = randomUUID();
    const refreshTtlSec = Math.max(1, Math.round(this.tokens.refreshTtlMs / 1000));
    await this.redis.set(`refresh:${id}:${jti}`, "1", "EX", refreshTtlSec);
    await this.redis.set(`refresh:current:${id}`, jti, "EX", refreshTtlSec);

    const accessToken = this.tokens.signAccessToken({ sub: id, handle, role });
    const refreshToken = this.tokens.signRefreshToken({ sub: id, jti });
    const csrfToken = generateCsrfToken();

    return {
      user: { id, handle, email, role },
      accessToken,
      accessMaxAgeMs: this.tokens.accessTtlMs,
      refreshToken,
      refreshMaxAgeMs: this.tokens.refreshTtlMs,
      csrfToken,
    };
  }
}
