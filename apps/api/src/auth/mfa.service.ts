import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { prisma } from "@oj/db";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import type Redis from "ioredis";
import { Secret, TOTP } from "otpauth";
import type { RequestUser } from "../common/decorators";
import { REDIS_CLIENT } from "../common/redis.providers";
import { AuthService } from "./auth.service";
import { digestToken, openSecret, sealSecret, securityKey } from "./security-crypto";
import { TokenService } from "./token.service";

export function totpFor(secret: string, label = "judge.tw") {
  return new TOTP({ issuer: "judge.tw", label, algorithm: "SHA1", digits: 6, period: 30, secret: Secret.fromBase32(secret) });
}

export function acceptedStep(secret: string, code: string, lastStep: number | null, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const delta = totpFor(secret).validate({ token: code, window: 1, timestamp: now });
  if (delta === null) return null;
  const step = Math.floor(now / 30_000) + delta;
  return lastStep !== null && step <= lastStep ? null : step;
}

@Injectable()
export class MfaService {
  constructor(private readonly auth: AuthService, private readonly tokens: TokenService, @Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private async attempt(userId: string) {
    const count = await this.redis.eval("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],300) end; return n", 1, `mfa:attempts:${userId}`);
    if (Number(count) > 10) throw new ForbiddenException("Too many attempts. Try again in five minutes.");
  }

  private async proveIdentity(actor: RequestUser, password?: string, googleProof?: string) {
    if (!actor.sid) throw new UnauthorizedException();
    const user = await prisma.user.findUnique({ where: { id: actor.id } });
    if (!user || user.deletionRequestedAt || user.authVersion !== actor.authVersion) throw new UnauthorizedException();
    if (user.passwordHash) {
      if (!password || !await argon2.verify(user.passwordHash, password)) throw new UnauthorizedException("Current password is incorrect");
    } else {
      try {
        const proof = this.tokens.verifySecurityReauthToken(googleProof ?? "");
        if (proof.sub !== user.id || proof.sid !== actor.sid) throw new Error();
      } catch { throw new UnauthorizedException("Sign in with Google again to change security settings."); }
    }
    return user;
  }

  async setup(actor: RequestUser, password?: string, googleProof?: string) {
    securityKey();
    await this.attempt(actor.id);
    const user = await this.proveIdentity(actor, password, googleProof);
    if (user.mfaEnabledAt) throw new BadRequestException("Two-factor authentication is already enabled.");
    const secret = new Secret({ size: 20 }).base32;
    const context = `mfa:pending:${user.id}:${actor.sid}:${user.authVersion}`;
    await this.redis.set(context, sealSecret(secret, context), "EX", 600);
    return { secret, uri: totpFor(secret, user.handle).toString(), expiresInSeconds: 600 };
  }

  async enable(actor: RequestUser, code: string) {
    await this.attempt(actor.id);
    const context = `mfa:pending:${actor.id}:${actor.sid}:${actor.authVersion}`;
    const pending = await this.redis.get(context);
    if (!pending) throw new BadRequestException("Setup expired. Please start again.");
    const secret = openSecret(pending, context), step = acceptedStep(secret, code, null);
    if (step === null) throw new BadRequestException("Invalid code. Check your authenticator and try again.");
    const codes = Array.from({ length: 10 }, () => randomBytes(10).toString("hex").match(/.{5}/g)!.join("-"));
    const user = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${actor.id} FOR UPDATE`;
      const current = await tx.user.findUnique({ where: { id: actor.id } });
      if (!current || current.authVersion !== actor.authVersion || current.mfaEnabledAt || current.deletionRequestedAt) throw new UnauthorizedException("Security settings changed. Start again.");
      const updated = await tx.user.update({ where: { id: actor.id }, data: { mfaEnabledAt: new Date(), mfaSecretEncrypted: sealSecret(secret, `mfa:${actor.id}`), mfaLastStep: step, mfaRecoveryHashes: codes.map((value) => digestToken(value.replace(/-/g, ""))), authVersion: { increment: 1 } } });
      await tx.securityEvent.create({ data: { userId: actor.id, kind: "MFA_ENABLED" } });
      return updated;
    });
    await this.redis.del(context);
    const session = await this.auth.issueSession(user.id, user.handle, user.email, user.role, user.authVersion, Date.now());
    return { session, recoveryCodes: codes };
  }

  private async consumeCode(actor: RequestUser, code: string) {
    await this.attempt(actor.id);
    return prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${actor.id} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: actor.id } });
      if (!user?.mfaEnabledAt || !user.mfaSecretEncrypted || user.authVersion !== actor.authVersion || user.deletionRequestedAt) throw new UnauthorizedException();
      const normalized = code.replace(/-/g, "").toLowerCase(), hash = digestToken(normalized);
      if (/^[a-f\d]{20}$/.test(normalized) && user.mfaRecoveryHashes.includes(hash)) {
        await tx.user.update({ where: { id: user.id }, data: { mfaRecoveryHashes: user.mfaRecoveryHashes.filter((value) => value !== hash) } });
        await tx.securityEvent.create({ data: { userId: actor.id, kind: "MFA_RECOVERY_CODE_USED" } });
      } else {
        const step = acceptedStep(openSecret(user.mfaSecretEncrypted, `mfa:${user.id}`), code, user.mfaLastStep);
        if (step === null) throw new UnauthorizedException("Invalid or already-used code. Try the next code or a recovery code.");
        await tx.user.update({ where: { id: user.id }, data: { mfaLastStep: step } });
      }
      return user;
    });
  }

  async verify(actor: RequestUser, code: string) {
    if (!actor.sid) throw new UnauthorizedException();
    await this.consumeCode(actor, code);
    // A reset after consumeCode still invalidates this session through authVersion.
    await this.redis.set(`mfa:session:${actor.id}:${actor.sid}`, String(Date.now()), "EX", 12 * 60 * 60);
    return { ok: true };
  }

  async disable(actor: RequestUser, code: string, password?: string, googleProof?: string) {
    if (actor.role === "ADMIN" && process.env.ADMIN_MFA_REQUIRED === "true") throw new ForbiddenException("Administrators must keep two-factor authentication enabled.");
    await this.proveIdentity(actor, password, googleProof);
    const user = await this.consumeCode(actor, code);
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({ where: { id: actor.id, authVersion: user.authVersion, mfaSecretEncrypted: user.mfaSecretEncrypted }, data: { mfaSecretEncrypted: null, mfaEnabledAt: null, mfaLastStep: null, mfaRecoveryHashes: [], authVersion: { increment: 1 } } });
      if (!result.count) throw new UnauthorizedException("Security settings changed. Start again.");
      await tx.securityEvent.create({ data: { userId: actor.id, kind: "MFA_DISABLED" } });
      return tx.user.findUniqueOrThrow({ where: { id: actor.id } });
    });
    return this.auth.issueSession(updated.id, updated.handle, updated.email, updated.role, updated.authVersion);
  }

  async regenerate(actor: RequestUser, code: string, password?: string, googleProof?: string) {
    await this.proveIdentity(actor, password, googleProof);
    const user = await this.consumeCode(actor, code);
    const recoveryCodes = Array.from({ length: 10 }, () => randomBytes(10).toString("hex").match(/.{5}/g)!.join("-"));
    await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({ where: { id: actor.id, authVersion: user.authVersion, mfaSecretEncrypted: user.mfaSecretEncrypted }, data: { mfaRecoveryHashes: recoveryCodes.map((value) => digestToken(value.replace(/-/g, ""))), authVersion: { increment: 1 } } });
      if (!updated.count) throw new UnauthorizedException("Security settings changed. Start again.");
      await tx.securityEvent.create({ data: { userId: actor.id, kind: "MFA_RECOVERY_CODES_REPLACED" } });
    });
    const session = await this.auth.issueSession(user.id, user.handle, user.email, user.role, user.authVersion + 1, Date.now());
    return { session, recoveryCodes };
  }
}
