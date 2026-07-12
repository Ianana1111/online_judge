import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { prisma, Prisma } from "@oj/db";
import type { User } from "@oj/db";
import {
  FREE_SUBMIT_QUOTA,
  FREE_VIRTUAL_ATTEMPTS,
  PLAN_PRICING,
  type BillingPeriod,
  type BillingRequestDto,
} from "@oj/shared";
import { computeCheckMacValue, ecpayConfig, verifyCheckMacValue } from "./ecpay.util";

/** PRO is only meaningful while it hasn't expired — a lapsed PRO account behaves as FREE until a
 * new payment extends it. Centralised so every enforcement point agrees on "is this user PRO now".
 * Students (marked by an admin, see users.service.setIsStudent) are always treated as PRO — they
 * don't pay, but shouldn't be capped either. */
export function isProActive(user: Pick<User, "plan" | "planExpiresAt" | "isStudent">): boolean {
  if (user.isStudent) return true;
  return user.plan === "PRO" && user.planExpiresAt != null && user.planExpiresAt.getTime() > Date.now();
}

/** Admins are never subject to the free-tier caps, regardless of plan. */
function isUnlimited(user: Pick<User, "plan" | "planExpiresAt" | "role" | "isStudent">): boolean {
  return user.role === "ADMIN" || isProActive(user);
}

// yyyy/MM/dd HH:mm:ss in Asia/Taipei, regardless of the server's own timezone (Railway runs UTC) —
// ECPay is a Taiwan-only service and expects Taiwan local time in every timestamp field.
function formatEcpayDate(d: Date): string {
  // hourCycle: "h23" (not hour12: false) — with just hour12:false, Node/ICU represents midnight
  // as "24:mm:ss" instead of "00:mm:ss" (a real bug this caught in testing: an order placed at
  // midnight Taiwan time would ship an invalid hour and ECPay would silently reject it).
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}/${get("month")}/${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

// ECPay requires a merchant-unique order id, <=20 chars, alphanumeric.
function generateMerchantTradeNo(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JT${Date.now().toString(36).toUpperCase()}${rand}`.slice(0, 20);
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  /** Shared by manual-approve and the ECPay auto-approve webhook: extends from whichever is later
   * (now, or the user's existing expiry) so paying/renewing early never loses days. Takes a
   * transaction client so the Payment status flip and this User update commit atomically —
   * money's involved, so a crash between the two writes must never leave them inconsistent. */
  private async extendPlan(tx: Prisma.TransactionClient, userId: string, period: BillingPeriod): Promise<Date> {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    const days = PLAN_PRICING[period].days;
    const base = user.planExpiresAt && user.planExpiresAt.getTime() > Date.now() ? user.planExpiresAt : new Date();
    const newExpiry = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    await tx.user.update({ where: { id: userId }, data: { plan: "PRO", planExpiresAt: newExpiry } });
    return newExpiry;
  }

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
        ? {
            id: pending.id,
            period: pending.period,
            amountNtd: pending.amountNtd,
            createdAt: pending.createdAt,
            method: pending.method,
            bankCode: pending.bankCode,
            vAccount: pending.vAccount,
            expireDate: pending.expireDate,
          }
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

  /** Admin: confirm the money arrived → mark APPROVED and extend the buyer's PRO window. */
  async approve(paymentId: string, adminId: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status !== "PENDING") throw new BadRequestException("This payment is not pending.");

    const planExpiresAt = await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: adminId },
      });
      return this.extendPlan(tx, payment.userId, payment.period);
    });
    return { ok: true, planExpiresAt };
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

  // --- ECPay (綠界) automated ATM virtual-account flow ---

  /** User starts an automated upgrade: creates a PENDING Payment tied to a fresh ECPay order and
   * returns the auto-submit form ECPay's AioCheckOut endpoint expects (form POST, not a JSON API —
   * this is how every ECPay integration works: the browser navigates to their hosted checkout). */
  async createEcpayOrder(userId: string, period: BillingPeriod) {
    const existingPending = await prisma.payment.findFirst({ where: { userId, status: "PENDING" } });
    if (existingPending) {
      throw new BadRequestException("You already have a payment awaiting review.");
    }

    const pricing = PLAN_PRICING[period];
    const merchantTradeNo = generateMerchantTradeNo();
    await prisma.payment.create({
      data: { userId, period, amountNtd: pricing.amountNtd, method: "ECPAY", status: "PENDING", merchantTradeNo },
    });

    const config = ecpayConfig();
    const apiPublicUrl =
      process.env.API_PUBLIC_URL ||
      (process.env.RAILWAY_SERVICE_API_URL ? `https://${process.env.RAILWAY_SERVICE_API_URL}` : "http://localhost:4000");
    const webOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim();

    const params: Record<string, string | number> = {
      MerchantID: config.merchantId,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: formatEcpayDate(new Date()),
      PaymentType: "aio",
      TotalAmount: pricing.amountNtd,
      TradeDesc: "judge.tw Pro upgrade",
      ItemName: `judge.tw Pro (${pricing.label})`,
      ReturnURL: `${apiPublicUrl}/billing/ecpay/return`,
      PaymentInfoURL: `${apiPublicUrl}/billing/ecpay/payment-info`,
      ClientBackURL: `${webOrigin}/pricing`,
      ChoosePayment: "ATM",
      EncryptType: 1,
    };
    const CheckMacValue = await computeCheckMacValue(params, config);

    return { actionUrl: config.checkoutUrl, fields: { ...params, CheckMacValue }, sandbox: config.isSandbox };
  }

  /** Webhook: ECPay tells us the ATM virtual account number it issued for an order (fires right
   * after order creation, well before the customer actually pays). Store it so the pricing page
   * can show it even if the user navigated away from ECPay's own confirmation page. */
  async handleEcpayPaymentInfo(body: Record<string, string>): Promise<void> {
    const config = ecpayConfig();
    if (!(await verifyCheckMacValue(body, config))) {
      this.logger.warn(`ECPay payment-info webhook: invalid CheckMacValue for ${body.MerchantTradeNo}`);
      return;
    }
    const payment = await prisma.payment.findUnique({ where: { merchantTradeNo: body.MerchantTradeNo } });
    if (!payment) {
      this.logger.warn(`ECPay payment-info webhook: unknown MerchantTradeNo ${body.MerchantTradeNo}`);
      return;
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: { bankCode: body.BankCode, vAccount: body.vAccount, expireDate: body.ExpireDate },
    });
  }

  /** Webhook: ECPay confirms the customer actually paid. Idempotent — ECPay retries this call up
   * to 4x/day until it gets back the literal string "1|OK", so a payment already APPROVED (by an
   * earlier delivery of the same notification) is a silent no-op, not an error. */
  async handleEcpayReturn(body: Record<string, string>): Promise<void> {
    const config = ecpayConfig();
    if (!(await verifyCheckMacValue(body, config))) {
      this.logger.warn(`ECPay return webhook: invalid CheckMacValue for ${body.MerchantTradeNo}`);
      return;
    }
    if (body.RtnCode !== "1") {
      this.logger.log(`ECPay return webhook: non-success RtnCode ${body.RtnCode} for ${body.MerchantTradeNo}`);
      return;
    }
    const payment = await prisma.payment.findUnique({ where: { merchantTradeNo: body.MerchantTradeNo } });
    if (!payment) {
      this.logger.warn(`ECPay return webhook: unknown MerchantTradeNo ${body.MerchantTradeNo}`);
      return;
    }
    if (payment.status !== "PENDING") return; // already processed — idempotent no-op

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: "ECPAY_AUTO" },
      });
      await this.extendPlan(tx, payment.userId, payment.period);
    });
    this.logger.log(`ECPay return webhook: approved payment ${payment.id} for user ${payment.userId}`);
  }

  // --- Enforcement helpers, called from submissions / contests ---

  /**
   * Atomically checks-and-consumes one unit of a FREE user's lifetime submit quota, then
   * increments it — a single conditional UPDATE, not a separate read-then-write, so concurrent
   * requests can't all read "quota available" before any of them commits (the race that let a
   * user fire N parallel submissions to get N free submissions past the cap). PRO/admin/student
   * accounts still get the counter bumped (for stats) but are never gated by it.
   */
  async assertCanSubmit(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    if (isUnlimited(user)) {
      await prisma.user.update({ where: { id: userId }, data: { submitQuotaUsed: { increment: 1 } } });
      return;
    }

    const result = await prisma.user.updateMany({
      where: { id: userId, submitQuotaUsed: { lt: FREE_SUBMIT_QUOTA } },
      data: { submitQuotaUsed: { increment: 1 } },
    });
    if (result.count === 0) {
      throw new ForbiddenException(
        `Free plan submit limit reached (${FREE_SUBMIT_QUOTA}). Upgrade to Pro for unlimited submissions.`,
      );
    }
  }

  /**
   * Throws if a FREE user has reached their virtual-contest cap. PRO users pass freely. Must be
   * called from inside the same transaction/advisory-lock scope as the ContestParticipant insert
   * (see contests.service.register) — otherwise this count-then-create is itself racy the same
   * way the old submit-quota check was.
   */
  async assertCanStartVirtual(userId: string, tx: Prisma.TransactionClient = prisma): Promise<void> {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    if (isUnlimited(user)) return;
    const count = await tx.contestParticipant.count({ where: { userId } });
    if (count >= FREE_VIRTUAL_ATTEMPTS) {
      throw new ForbiddenException(
        `Free plan virtual-contest limit reached (${FREE_VIRTUAL_ATTEMPTS}). Upgrade to Pro for unlimited attempts.`,
      );
    }
  }
}
