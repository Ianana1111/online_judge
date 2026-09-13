import { ConflictException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import argon2 from "argon2";
import { randomUUID } from "node:crypto";
import type Redis from "ioredis";
import { prisma } from "@oj/db";
import type { LoginDto, RegisterDto } from "@oj/shared";
import { isLaunchPromoActive, LAUNCH_PROMO } from "@oj/shared";
import { generateCsrfToken } from "../common/csrf.util";
import { REDIS_CLIENT } from "../common/redis.providers";
import { isUnlimited } from "../billing/billing.service";
import { NotificationsService } from "../notifications/notifications.service";
import { TokenService } from "./token.service";

/** Shared by both signup paths (password register + first-time Google login) so a brand new
 * account always sees the same launch-promo nudge in their notification bell, regardless of how
 * they signed up. No-ops once the promo window closes — never even shown after that. */
async function notifyNewUserOfLaunchPromo(notifications: NotificationsService, userId: string): Promise<void> {
  if (!isLaunchPromoActive()) return;
  await notifications.create(userId, {
    type: "promo",
    title: `🎉 Launch month: ${LAUNCH_PROMO.discountPct}% off Pro`,
    body: "judge.tw just launched — get Pro at half price for a limited time.",
    link: "/upgrade",
  });
}

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
    private readonly notifications: NotificationsService,
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
    await notifyNewUserOfLaunchPromo(this.notifications, user.id);
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

  /** Finds the linked Google identity or creates an account. An email match never silently links
   * an identity to an existing account. */
  async loginWithGoogle(googleId: string, email: string, suggestedHandle: string): Promise<IssuedSession> {
    let user = await prisma.user.findUnique({ where: { googleId } });
    if (!user) {
      const byEmail = await prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        throw new ConflictException("This email already has an account. Sign in with your existing method before linking Google.");
      } else {
        const handle = await this.uniqueHandleFrom(suggestedHandle);
        user = await prisma.user.create({ data: { handle, email, googleId, role: "USER" } });
        await notifyNewUserOfLaunchPromo(this.notifications, user.id);
      }
    }
    return this.issueSession(user.id, user.handle, user.email, user.role);
  }

  /** Deletion reauthentication proves an existing identity without creating an account or
   * rotating anyone's session. Google sub, rather than email, is the stable identity key. */
  async verifyGoogleReauthentication(userId: string, googleId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { googleId: true } });
    if (!user?.googleId || user.googleId !== googleId) throw new UnauthorizedException("Google reauthentication did not match the current account");
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

    const exists = await this.redis.getdel(`refresh:${payload.sub}:${payload.jti}`);
    if (!exists) throw new UnauthorizedException("Session has been revoked");

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException("User no longer exists");

    return this.issueSession(user.id, user.handle, user.email, user.role);
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    let payload;
    try {
      payload = this.tokens.verifyRefreshToken(refreshToken);
    } catch {
      return; // An invalid/expired refresh credential has no live session to revoke.
    }
    // Only invalid credentials are best-effort. A Redis failure must let the caller retry,
    // and an old logout must never erase a newer session's current-session pointer.
    await this.redis.eval(`redis.call('DEL', KEYS[1]); if redis.call('GET', KEYS[2]) == ARGV[1] then redis.call('DEL', KEYS[2]); end; return 1`, 2,
      `refresh:${payload.sub}:${payload.jti}`, `refresh:current:${payload.sub}`, payload.jti);
  }

  async me(userId: string): Promise<{
    id: string;
    handle: string;
    email: string;
    role: string;
    isStudent: boolean;
    plan: "FREE" | "PRO";
    settings: Record<string, unknown>;
    bio: string;
    avatarUrl: string | null;
    school: string | null;
    schoolEmail: string | null;
    schoolVerifiedAt: Date | null;
    hasPassword: boolean;
    deletionRequestedAt: Date | null;
    csrfToken: string;
    csrfMaxAgeMs: number;
  }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    // Stateless token (see csrf.util.ts) — safe to mint a fresh one on every /auth/me call so
    // the web app always has a working value in memory, including right after a hard refresh
    // when it can no longer read the cookie itself cross-domain.
    // ADMIN accounts report "PRO" here too — every Pro-gated frontend check reads this field
    // (NavBar's plan badge, ProblemFilterTable's CPE-appearance teaser, etc.), and admins should
    // never be blocked by a paywall they can already bypass server-side (see isUnlimited).
    const unlimited = isUnlimited(user);
    return {
      id: user.id,
      handle: user.handle,
      email: user.email,
      role: user.role,
      isStudent: user.isStudent,
      plan: unlimited ? "PRO" : "FREE",
      settings: (user.settings as Record<string, unknown>) ?? {},
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      school: user.school,
      // Unlike the public profile/leaderboard, /auth/me is the owner's own view of their account —
      // it shows the pending (unverified) state too, so Settings can render "verification sent to
      // X" instead of just silently looking identical to "never started."
      schoolEmail: user.schoolEmail,
      schoolVerifiedAt: user.schoolVerifiedAt,
      hasPassword: !!user.passwordHash,
      deletionRequestedAt: user.deletionRequestedAt,
      csrfToken: generateCsrfToken(),
      csrfMaxAgeMs: this.tokens.refreshTtlMs,
    };
  }

  /**
   * Issues a fresh access/refresh/csrf token triple and rotates the refresh session: the
   * previous jti (tracked via a `refresh:current:{userId}` pointer) is invalidated so only one
   * refresh token is valid per user at a time.
   *
   * Public (not just called from login/register/refresh above) so a sensitive account-mutation
   * endpoint — currently just changePassword — can rotate the session as its own side effect:
   * this revokes whatever refresh token existed before (e.g. one an attacker who guessed/reused
   * the old password might be holding) while seamlessly re-authenticating the caller who just
   * proved they know the new password, in the same request.
   */
  async issueSession(id: string, handle: string, email: string, role: string): Promise<IssuedSession> {
    const jti = randomUUID();
    const refreshTtlSec = Math.max(1, Math.round(this.tokens.refreshTtlMs / 1000));
    await this.redis.eval(`
      local previous = redis.call('GET', KEYS[1])
      if previous then redis.call('DEL', ARGV[1] .. previous) end
      redis.call('SET', KEYS[2], '1', 'EX', ARGV[3])
      redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
      return 1
    `, 2, `refresh:current:${id}`, `refresh:${id}:${jti}`, `refresh:${id}:`, jti, String(refreshTtlSec));

    const accessToken = this.tokens.signAccessToken({ sub: id, handle, role, sid: jti });
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
