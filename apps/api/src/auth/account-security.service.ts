import { BadRequestException, Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { prisma } from "@oj/db";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import type Redis from "ioredis";
import { REDIS_CLIENT } from "../common/redis.providers";
import { escapeMailHtml, MailService } from "../common/mail.service";
import { digestToken, openSecret, sealSecret, securityKey } from "./security-crypto";

type Purpose = "PASSWORD_RESET" | "VERIFY_EMAIL";
const INVALID_LINK = "This link is invalid or expired. Please request a new link.";

@Injectable()
export class AccountSecurityService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AccountSecurityService.name);
  private timer?: ReturnType<typeof setInterval>;
  private delivering = false;

  constructor(private readonly mail: MailService, @Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.deliverPending().catch(() => this.logger.error("Account email delivery sweep failed")), 5_000);
    this.timer.unref();
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async requestReset(email: string): Promise<{ ok: true }> {
    // Configuration errors do not depend on whether an address belongs to an account.
    securityKey();
    this.mail.assertConfigured();
    const address = email.trim().toLowerCase();
    const budget = await this.redis.eval("local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],3600) end; return n", 1, `account-mail:${digestToken(address)}`);
    if (Number(budget) > 5) return { ok: true };
    // Legacy case-sensitive addresses are not merged. Ambiguous addresses cannot reset either account.
    const matches = await prisma.user.findMany({ where: { email: { equals: address, mode: "insensitive" } }, take: 2 });
    if (matches.length === 1 && matches[0].passwordHash && !matches[0].deletionRequestedAt) {
      await this.queueChallenge(matches[0].id, "PASSWORD_RESET");
    }
    // Sending happens in a durable worker, so provider timing/failure cannot enumerate addresses.
    return { ok: true };
  }

  async requestVerification(userId: string): Promise<{ ok: true }> {
    securityKey();
    this.mail.assertConfigured();
    await this.queueChallenge(userId, "VERIFY_EMAIL");
    return { ok: true };
  }

  private async queueChallenge(userId: string, purpose: Purpose) {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.deletionRequestedAt || (purpose === "VERIFY_EMAIL" && user.emailVerifiedAt)) return;
      const previous = await tx.authChallenge.findUnique({ where: { userId_purpose: { userId, purpose } } });
      const now = new Date();
      if (previous && previous.createdAt.getTime() > now.getTime() - 60_000) return;
      const token = randomBytes(32).toString("base64url");
      const data = {
        tokenHash: digestToken(token), tokenEncrypted: sealSecret(token, `${purpose}:${userId}`),
        targetEmail: user.email, authVersion: user.authVersion, expiresAt: new Date(now.getTime() + (purpose === "PASSWORD_RESET" ? 30 : 60) * 60_000),
        createdAt: now, consumedAt: null, sentAt: null, deliveryAttempts: 0, nextDeliveryAt: now, leaseUntil: null,
      };
      await tx.authChallenge.upsert({ where: { userId_purpose: { userId, purpose } }, create: { userId, purpose, ...data }, update: data });
    });
  }

  async resetPassword(token: string, password: string): Promise<{ ok: true }> {
    const tokenHash = digestToken(token);
    const candidate = await prisma.authChallenge.findUnique({ where: { tokenHash } });
    if (!candidate || candidate.purpose !== "PASSWORD_RESET" || candidate.consumedAt || candidate.expiresAt <= new Date()) throw new BadRequestException(INVALID_LINK);
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${candidate.userId} FOR UPDATE`;
      const challenge = await tx.authChallenge.findUnique({ where: { tokenHash } });
      const user = await tx.user.findUnique({ where: { id: candidate.userId } });
      if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date() || !user?.passwordHash || user.deletionRequestedAt || user.email !== challenge.targetEmail || user.authVersion !== challenge.authVersion) throw new BadRequestException(INVALID_LINK);
      await tx.user.update({ where: { id: user.id }, data: { passwordHash, authVersion: { increment: 1 }, emailVerifiedAt: user.emailVerifiedAt ?? new Date() } });
      await tx.authChallenge.updateMany({ where: { userId: user.id }, data: { consumedAt: new Date(), tokenEncrypted: null } });
      await tx.securityEvent.create({ data: { userId: user.id, kind: "PASSWORD_RESET" } });
    });
    // DB authVersion is authoritative: Redis cleanup failure cannot revive an old session.
    // No automatic login and no MFA removal, even after proving mailbox ownership.
    return { ok: true };
  }

  async verifyEmail(token: string): Promise<{ ok: true }> {
    const tokenHash = digestToken(token), candidate = await prisma.authChallenge.findUnique({ where: { tokenHash } });
    if (!candidate || candidate.purpose !== "VERIFY_EMAIL") throw new BadRequestException(INVALID_LINK);
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${candidate.userId} FOR UPDATE`;
      const challenge = await tx.authChallenge.findUnique({ where: { tokenHash } });
      const user = await tx.user.findUnique({ where: { id: candidate.userId } });
      if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date() || !user || user.deletionRequestedAt || user.email !== challenge.targetEmail || user.authVersion !== challenge.authVersion) throw new BadRequestException(INVALID_LINK);
      await tx.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
      await tx.authChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date(), tokenEncrypted: null } });
      await tx.securityEvent.create({ data: { userId: user.id, kind: "EMAIL_VERIFIED" } });
    });
    return { ok: true };
  }

  async history(userId: string) {
    return prisma.securityEvent.findMany({ where: { userId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 20, select: { id: true, kind: true, createdAt: true } });
  }

  /** Lease + hash compare prevents a replaced challenge's worker from consuming the replacement. */
  async deliverPending() {
    if (this.delivering) return;
    this.delivering = true;
    try {
      const now = new Date();
      // Expired bearer material need not remain in backups indefinitely.
      await prisma.authChallenge.deleteMany({ where: { expiresAt: { lt: now } } });
      const jobs = await prisma.authChallenge.findMany({ where: { sentAt: null, consumedAt: null, tokenEncrypted: { not: null }, deliveryAttempts: { lt: 5 }, nextDeliveryAt: { lte: now }, OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }] }, take: 20, orderBy: { createdAt: "asc" } });
      for (const job of jobs) {
        const claim = await prisma.authChallenge.updateMany({ where: { id: job.id, tokenHash: job.tokenHash, sentAt: null, consumedAt: null, OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }] }, data: { leaseUntil: new Date(Date.now() + 120_000), deliveryAttempts: { increment: 1 } } });
        if (!claim.count) continue;
        try {
          const user = await prisma.user.findUnique({ where: { id: job.userId } });
          if (!user || user.deletionRequestedAt || user.authVersion !== job.authVersion || user.email !== job.targetEmail) throw new UnauthorizedException();
          const origin = new URL((process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim());
          if (process.env.NODE_ENV === "production" && origin.protocol !== "https:") throw new Error("HTTPS required");
          const reset = job.purpose === "PASSWORD_RESET";
          const link = new URL(reset ? "/reset-password" : "/verify-email", origin);
          // Fragments do not enter access logs or Referer headers, and GET never consumes a link.
          link.hash = new URLSearchParams({ token: openSecret(job.tokenEncrypted!, `${job.purpose}:${job.userId}`) }).toString();
          const title = reset ? "重設密碼 / Reset your password" : "驗證帳號信箱 / Verify your email";
          await this.mail.send({ to: job.targetEmail, subject: `judge.tw — ${title}`, html: `<p>${title}</p><p><a href="${escapeMailHtml(link.toString())}">${title}</a></p><p>此連結僅能使用一次，${reset ? "30" : "60"} 分鐘後失效。若非你本人提出，請忽略此信。</p><p>This one-use link expires in ${reset ? "30" : "60"} minutes. If you did not request it, ignore this email.</p>`, idempotencyKey: `auth-${job.tokenHash}` });
          await prisma.authChallenge.updateMany({ where: { id: job.id, tokenHash: job.tokenHash }, data: { sentAt: new Date(), tokenEncrypted: null, leaseUntil: null } });
        } catch {
          await prisma.authChallenge.updateMany({ where: { id: job.id, tokenHash: job.tokenHash }, data: { leaseUntil: null, nextDeliveryAt: new Date(Date.now() + 30_000 * 2 ** job.deliveryAttempts) } });
          this.logger.warn(`Account email delivery failed (attempt ${job.deliveryAttempts + 1}/5)`);
        }
      }
    } finally { this.delivering = false; }
  }
}
