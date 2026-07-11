import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { prisma } from "@oj/db";
import type { User } from "@oj/db";
import {
  FREE_SUBMIT_QUOTA,
  FREE_VIRTUAL_ATTEMPTS,
  PLAN_PRICING,
  type BillingRequestDto,
} from "@oj/shared";

/** PRO is only meaningful while it hasn't expired — a lapsed PRO account behaves as FREE until a
 * new payment extends it. Centralised so every enforcement point agrees on "is this user PRO now". */
export function isProActive(user: Pick<User, "plan" | "planExpiresAt">): boolean {
  return user.plan === "PRO" && user.planExpiresAt != null && user.planExpiresAt.getTime() > Date.now();
}

/** Admins are never subject to the free-tier caps, regardless of plan. */
function isUnlimited(user: Pick<User, "plan" | "planExpiresAt" | "role">): boolean {
  return user.role === "ADMIN" || isProActive(user);
}

@Injectable()
export class BillingService {
  /** Current plan + quota snapshot for the logged-in user (drives the pricing page and quota UI). */
  async status(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const pro = isProActive(user);
    const virtualUsed = await prisma.contestParticipant.count({ where: { userId } });
    const pending = await prisma.payment.findFirst({
      where: { userId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    return {
      plan: pro ? "PRO" : "FREE",
      planExpiresAt: pro ? user.planExpiresAt : null,
      submits: { used: user.submitQuotaUsed, limit: pro ? null : FREE_SUBMIT_QUOTA },
      virtualContests: { used: virtualUsed, limit: pro ? null : FREE_VIRTUAL_ATTEMPTS },
      pendingPayment: pending
        ? { id: pending.id, period: pending.period, amountNtd: pending.amountNtd, createdAt: pending.createdAt }
        : null,
    };
  }

  /** User submits a manual-payment claim. Creates a PENDING record for an admin to verify. */
  async requestUpgrade(userId: string, dto: BillingRequestDto) {
    const pricing = PLAN_PRICING[dto.period];
    const existingPending = await prisma.payment.findFirst({ where: { userId, status: "PENDING" } });
    if (existingPending) {
      throw new BadRequestException("You already have a payment awaiting review.");
    }
    const payment = await prisma.payment.create({
      data: {
        userId,
        period: dto.period,
        amountNtd: pricing.amountNtd,
        reference: dto.reference,
        method: "MANUAL",
        status: "PENDING",
      },
    });
    return { id: payment.id, status: payment.status };
  }

  /** Admin: every payment awaiting verification, newest first, with who it's from. */
  async listPending() {
    const rows = await prisma.payment.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { handle: true, email: true } } },
    });
    return rows.map((p) => ({
      id: p.id,
      handle: p.user.handle,
      email: p.user.email,
      period: p.period,
      amountNtd: p.amountNtd,
      reference: p.reference,
      createdAt: p.createdAt,
    }));
  }

  /** Admin: confirm the money arrived → mark APPROVED and extend the buyer's PRO window. Extends
   * from whichever is later (now, or their existing expiry) so paying early never loses days. */
  async approve(paymentId: string, adminId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status !== "PENDING") throw new BadRequestException("This payment is not pending.");

    const user = await prisma.user.findUnique({ where: { id: payment.userId } });
    if (!user) throw new NotFoundException("User not found");

    const days = PLAN_PRICING[payment.period].days;
    const base = user.planExpiresAt && user.planExpiresAt.getTime() > Date.now() ? user.planExpiresAt : new Date();
    const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: adminId },
      }),
      prisma.user.update({ where: { id: user.id }, data: { plan: "PRO", planExpiresAt: newExpiry } }),
    ]);
    return { ok: true, planExpiresAt: newExpiry };
  }

  async reject(paymentId: string, adminId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status !== "PENDING") throw new BadRequestException("This payment is not pending.");
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: adminId },
    });
    return { ok: true };
  }

  // --- Enforcement helpers, called from submissions / contests ---

  /** Throws if a FREE user has exhausted their lifetime submit quota. PRO users pass freely. */
  async assertCanSubmit(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    if (isUnlimited(user)) return;
    if (user.submitQuotaUsed >= FREE_SUBMIT_QUOTA) {
      throw new ForbiddenException(
        `Free plan submit limit reached (${FREE_SUBMIT_QUOTA}). Upgrade to Pro for unlimited submissions.`,
      );
    }
  }

  /** Throws if a FREE user has reached their virtual-contest cap. PRO users pass freely. */
  async assertCanStartVirtual(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    if (isUnlimited(user)) return;
    const count = await prisma.contestParticipant.count({ where: { userId } });
    if (count >= FREE_VIRTUAL_ATTEMPTS) {
      throw new ForbiddenException(
        `Free plan virtual-contest limit reached (${FREE_VIRTUAL_ATTEMPTS}). Upgrade to Pro for unlimited attempts.`,
      );
    }
  }
}
