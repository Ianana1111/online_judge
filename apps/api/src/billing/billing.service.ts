import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { prisma, Prisma } from "@oj/db";
import type { User } from "@oj/db";
import {
  effectivePriceNtd,
  FREE_SUBMIT_QUOTA,
  FREE_VIRTUAL_ATTEMPTS,
  PLAN_PRICING,
  type BillingPeriod,
  type EcpayMethod,
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

/** Admins are never subject to the free-tier caps, regardless of plan. Exported (not just
 * isProActive) so anywhere displaying "is this account effectively Pro" — e.g. the admin users
 * table — agrees with what actually gates submissions, instead of showing an admin as "Free"
 * just because they've never had a real payment on file. */
export function isUnlimited(user: Pick<User, "plan" | "planExpiresAt" | "role" | "isStudent">): boolean {
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

// "YYYY-MM" in Asia/Taipei — the FREE tier's submit quota resets on this boundary, not UTC
// midnight, so a submission just after midnight Taiwan time (but still "yesterday" in UTC) rolls
// over correctly instead of a day early/late.
function currentMonthKey(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}`;
}

// The instant Asia/Taipei local midnight on the 1st of the current month occurred, expressed as a
// real UTC Date — used to scope the virtual-contest count to "this month" via a plain >= filter.
function currentMonthStart(d: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  // Asia/Taipei is a fixed UTC+8 with no DST, so this offset is always exactly correct.
  return new Date(`${get("year")}-${get("month")}-01T00:00:00+08:00`);
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
    await tx.user.update({
      where: { id: userId },
      data: { plan: "PRO", planExpiresAt: newExpiry, planCancelRequested: false },
    });
    return newExpiry;
  }

  /** Current plan + quota snapshot for the logged-in user (drives the pricing page and quota UI). */
  async status(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const pro = isProActive(user);
    // ADMIN accounts aren't necessarily on plan "PRO" but assertCanSubmit/assertCanStartVirtual
    // already treat them as unlimited (see isUnlimited) — this display must agree, or an admin
    // sees a FREE-tier quota banner for a cap that can never actually stop them.
    const unlimited = isUnlimited(user);
    // A user who hasn't submitted/started anything yet THIS month still has last month's leftover
    // submitQuotaMonth/submitQuotaUsed sitting in the row (the reset only happens lazily, inside
    // assertCanSubmit, on their next actual submission) — so displayed "used" must independently
    // check the month key rather than trusting the stored counter at rest.
    const submitsUsedThisMonth = user.submitQuotaMonth === currentMonthKey() ? user.submitQuotaUsed : 0;
    const virtualUsed = await prisma.contestParticipant.count({ where: { userId, startedAt: { gte: currentMonthStart() } } });
    const pending = await prisma.payment.findFirst({
      where: { userId, status: "PENDING", dismissedByUser: false },
      orderBy: { createdAt: "desc" },
    });

    return {
      // "plan" drives every Pro-gated UI check, so ADMIN reports "PRO" here too (see isUnlimited)
      // even though planExpiresAt/planCancelRequested below stay tied to a REAL subscription
      // (`pro`, not `unlimited`) — an admin never had one to expire or cancel.
      plan: unlimited ? "PRO" : "FREE",
      planExpiresAt: pro ? user.planExpiresAt : null,
      planCancelRequested: pro && user.planCancelRequested,
      submits: { used: unlimited ? user.submitQuotaUsed : submitsUsedThisMonth, limit: unlimited ? null : FREE_SUBMIT_QUOTA },
      virtualContests: { used: virtualUsed, limit: unlimited ? null : FREE_VIRTUAL_ATTEMPTS },
      pendingPayment: pending
        ? {
            id: pending.id,
            period: pending.period,
            amountNtd: pending.amountNtd,
            createdAt: pending.createdAt,
            method: pending.method,
            ecpayMethod: pending.ecpayMethod,
            bankCode: pending.bankCode,
            vAccount: pending.vAccount,
            expireDate: pending.expireDate,
          }
        : null,
    };
  }

  /** User chooses to downgrade back to Free. Since every payment is one-time (no auto-renewal
   * exists to cancel), this doesn't touch plan/planExpiresAt at all — access already lapses to
   * Free on its own once planExpiresAt passes. It only flags the choice so the UI can keep showing
   * "you're downgrading" across reloads instead of re-offering the same button every visit. */
  async cancelPlan(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    if (!isProActive(user)) throw new BadRequestException("You're not currently on Pro.");
    await prisma.user.update({ where: { id: userId }, data: { planCancelRequested: true } });
    return { ok: true };
  }

  /** User backs out of their own still-open order (e.g. an ATM transfer they no longer want) so
   * the checkout page stops showing it and they can start a fresh one. Idempotent/best-effort —
   * no-op if there's nothing pending. Deliberately doesn't touch `status`: if they go ahead and pay
   * the old virtual account anyway, the webhook still approves it normally (see the field's doc
   * comment on the Payment model). */
  async dismissPending(userId: string) {
    const pending = await prisma.payment.findFirst({
      where: { userId, status: "PENDING", dismissedByUser: false },
      orderBy: { createdAt: "desc" },
    });
    if (!pending) return { ok: true };
    await prisma.payment.update({ where: { id: pending.id }, data: { dismissedByUser: true } });
    return { ok: true };
  }

  /** Admin support tool: directly grant Pro without a Payment claim on file — for when someone
   * really did pay (e.g. a real bank transfer, or a webhook that failed to fire) but nothing in
   * our own records reflects it yet. Still leaves a Payment row (status APPROVED, method
   * ADMIN_GRANT, reviewedBy/reviewedAt set) so the grant has the same audit trail as a normal
   * approval, just without a preceding PENDING claim. Extends from the later of now or their
   * existing expiry, exactly like a real purchase would. */
  async adminGrant(userId: string, adminId: string, period: BillingPeriod) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const planExpiresAt = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          userId,
          period,
          amountNtd: effectivePriceNtd(period),
          status: "APPROVED",
          method: "ADMIN_GRANT",
          reference: "Manually granted by admin",
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      });
      return this.extendPlan(tx, userId, period);
    });
    return { plan: "PRO", planExpiresAt };
  }

  /** Admin support tool: the inverse — immediately drop someone back to Free (e.g. a grant made in
   * error). No Payment row: this isn't reversing a specific purchase, just correcting the user's
   * current state. */
  async adminRevoke(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    await prisma.user.update({
      where: { id: userId },
      data: { plan: "FREE", planExpiresAt: null, planCancelRequested: false },
    });
    return { plan: "FREE", planExpiresAt: null };
  }

  // --- ECPay (綠界) automated checkout flow (ATM virtual account + credit card) ---

  /** User starts an automated upgrade: creates a PENDING Payment tied to a fresh ECPay order and
   * returns the auto-submit form ECPay's AioCheckOut endpoint expects (form POST, not a JSON API —
   * this is how every ECPay integration works: the browser navigates to their hosted checkout).
   * `method` (validated to exactly "CREDIT" | "ATM" by ecpayCreateSchema before this is ever
   * called — never a raw string from the client) maps to ECPay's own ChoosePayment values, so
   * their hosted checkout opens directly on the channel the user picked on OUR page instead of
   * making them pick again on ECPay's. Both channels eventually confirm via the same ReturnURL
   * webhook (RtnCode "1" = paid), so handleEcpayReturn below needs no method-specific branching for
   * the final APPROVED transition — CREDIT just also passes through an AUTHORIZED stage first (see
   * markCreditAuthorized/EcpayAuthPollService), which grants Pro before that webhook ever arrives.
   * Only ATM issues a virtual account number, which arrives via the separate PaymentInfoURL webhook
   * (handleEcpayPaymentInfo) — that webhook simply never fires for a credit-card checkout, since
   * there's no virtual account to report. */
  async createEcpayOrder(userId: string, period: BillingPeriod, method: EcpayMethod) {
    const existingPending = await prisma.payment.findFirst({
      where: { userId, status: "PENDING", dismissedByUser: false },
    });
    if (existingPending) {
      throw new BadRequestException("You already have a payment awaiting review.");
    }

    // The amount that actually gets charged is always derived server-side (PLAN_PRICING plus
    // any active launch promo via effectivePriceNtd), never trusted from the client — the client
    // only chooses which of these two fixed plans.
    const pricing = PLAN_PRICING[period];
    const amountNtd = effectivePriceNtd(period);
    const merchantTradeNo = generateMerchantTradeNo();
    await prisma.payment.create({
      data: {
        userId,
        period,
        amountNtd,
        method: "ECPAY",
        ecpayMethod: method,
        status: "PENDING",
        merchantTradeNo,
      },
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
      TotalAmount: amountNtd,
      TradeDesc: "judge.tw Pro upgrade",
      ItemName: `judge.tw Pro (${pricing.label})`,
      ReturnURL: `${apiPublicUrl}/billing/ecpay/return`,
      PaymentInfoURL: `${apiPublicUrl}/billing/ecpay/payment-info`,
      ClientBackURL: `${webOrigin}/upgrade/checkout`,
      ChoosePayment: method === "CREDIT" ? "Credit" : "ATM",
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
      // Full body + our recomputed value, logged only on failure — without this we have zero
      // visibility into why a real ECPay webhook's signature didn't match ours. Nothing logged
      // here is secret (HashKey/HashIV are never included, only the fields ECPay itself sent).
      this.logger.warn(
        `ECPay payment-info webhook: invalid CheckMacValue for ${body.MerchantTradeNo}. ` +
          `received=${JSON.stringify(body)} expected=${await computeCheckMacValue(body, config)}`,
      );
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
      this.logger.warn(
        `ECPay return webhook: invalid CheckMacValue for ${body.MerchantTradeNo}. ` +
          `received=${JSON.stringify(body)} expected=${await computeCheckMacValue(body, config)}`,
      );
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
    if (payment.status === "APPROVED" || payment.status === "REJECTED") return; // already finalized — idempotent no-op

    // Belt-and-suspenders: TradeAmt is itself covered by the CheckMacValue signature above, so a
    // forged amount would already have failed verification — this only catches an internal bug
    // (e.g. a promo-price race between order creation and payment) where OUR OWN two numbers
    // disagree. Never auto-approves a mismatch; left as-is for manual investigation rather than
    // silently discarding or double-crediting a real payment.
    const paidAmount = Number(body.TradeAmt);
    if (!Number.isFinite(paidAmount) || paidAmount !== payment.amountNtd) {
      this.logger.error(
        `ECPay return webhook: amount mismatch for ${body.MerchantTradeNo} — expected ${payment.amountNtd}, ` +
          `TradeAmt was ${body.TradeAmt}. Payment left ${payment.status}, NOT approved.`,
      );
      return;
    }

    if (payment.status === "AUTHORIZED") {
      // Credit-card order: Pro was already granted the moment the authorization was detected (see
      // markCreditAuthorized) — this webhook only fires once the operator's manual capture (via
      // ECPay's own merchant backend) actually settles, so there's nothing left to grant, just the
      // record to reconcile off the "still owed" admin queue.
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: "ECPAY_AUTO" },
      });
      this.logger.log(`ECPay return webhook: capture confirmed for already-authorized payment ${payment.id}`);
      return;
    }

    // payment.status === "PENDING" here — an ATM transfer (no authorization step exists), or the
    // rare race where a credit-card capture webhook arrived before our authorization poll caught
    // up. Grant Pro now, exactly as if this were the only step.
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "APPROVED", reviewedAt: new Date(), reviewedBy: "ECPAY_AUTO" },
      });
      await this.extendPlan(tx, payment.userId, payment.period);
    });
    this.logger.log(`ECPay return webhook: approved payment ${payment.id} for user ${payment.userId}`);
  }

  /** Called by EcpayAuthPollService the moment ECPay confirms a credit-card order's authorization
   * succeeded (card hold placed, not yet captured). Grants Pro right away instead of waiting for
   * capture — capture is now done manually via ECPay's own merchant backend, at whatever pace the
   * operator chooses (see listAuthorizedPending for the queue this creates). Idempotent: a payment
   * no longer PENDING (already AUTHORIZED, or a race where the real capture webhook got there
   * first) is a silent no-op. */
  async markCreditAuthorized(merchantTradeNo: string, tradeId: string): Promise<void> {
    const payment = await prisma.payment.findUnique({ where: { merchantTradeNo } });
    if (!payment || payment.status !== "PENDING") return;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "AUTHORIZED",
          reviewedAt: new Date(),
          reviewedBy: "ECPAY_AUTO_AUTH",
          reference: `ECPay TradeID: ${tradeId}`,
        },
      });
      await this.extendPlan(tx, payment.userId, payment.period);
    });
    this.logger.log(`ECPay auth poll: granted Pro on authorization for payment ${payment.id} (user ${payment.userId})`);
  }

  /** Admin queue: credit-card orders where Pro was already granted on authorization but the actual
   * capture hasn't been confirmed yet — since capture is now a manual step in ECPay's own merchant
   * backend, this is what keeps one from silently getting forgotten (Pro granted, money never
   * collected). Oldest first, since those are the most urgent to go capture. */
  async listAuthorizedPending() {
    const payments = await prisma.payment.findMany({
      where: { status: "AUTHORIZED" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { handle: true, email: true } } },
    });
    return payments.map((p) => ({
      id: p.id,
      userId: p.userId,
      handle: p.user.handle,
      email: p.user.email,
      period: p.period,
      amountNtd: p.amountNtd,
      merchantTradeNo: p.merchantTradeNo,
      reference: p.reference,
      createdAt: p.createdAt,
    }));
  }

  // --- Enforcement helpers, called from submissions / contests ---

  /**
   * Atomically checks-and-consumes one unit of a FREE user's THIS-CALENDAR-MONTH submit quota
   * (Asia/Taipei, since this is a Taiwan-only service), then increments it — a single conditional
   * UPDATE, not a separate read-then-write, so concurrent requests can't all read "quota
   * available" before any of them commits (the race that let a user fire N parallel submissions
   * to get N free submissions past the cap). The CASE/WHERE together also handle the month
   * rollover atomically: a submit in a new month resets the counter to 1 in the same statement
   * that would otherwise have been a plain increment, so there's no separate reset job to run (or
   * to forget to run) at the start of each month. PRO/admin/student accounts still get the
   * counter bumped (for stats) but are never gated by it.
   */
  async assertCanSubmit(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    if (isUnlimited(user)) {
      await prisma.user.update({ where: { id: userId }, data: { submitQuotaUsed: { increment: 1 } } });
      return;
    }

    const monthKey = currentMonthKey();
    const rows = await prisma.$executeRaw`
      UPDATE users
      SET "submitQuotaUsed" = CASE WHEN "submitQuotaMonth" = ${monthKey} THEN "submitQuotaUsed" + 1 ELSE 1 END,
          "submitQuotaMonth" = ${monthKey}
      WHERE id = ${userId}
        AND ("submitQuotaMonth" IS DISTINCT FROM ${monthKey} OR "submitQuotaUsed" < ${FREE_SUBMIT_QUOTA})
    `;
    if (rows === 0) {
      throw new ForbiddenException(
        `Free plan submit limit reached (${FREE_SUBMIT_QUOTA}/month). Upgrade to Pro for unlimited submissions.`,
      );
    }
  }

  /**
   * Throws if a FREE user has reached their THIS-CALENDAR-MONTH virtual-contest cap. PRO users
   * pass freely. Must be called from inside the same transaction/advisory-lock scope as the
   * ContestParticipant insert (see contests.service.register) — otherwise this count-then-create
   * is itself racy the same way the old submit-quota check was.
   */
  async assertCanStartVirtual(userId: string, tx: Prisma.TransactionClient = prisma): Promise<void> {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");
    if (isUnlimited(user)) return;
    const monthStart = currentMonthStart();
    const count = await tx.contestParticipant.count({ where: { userId, startedAt: { gte: monthStart } } });
    if (count >= FREE_VIRTUAL_ATTEMPTS) {
      throw new ForbiddenException(
        `Free plan virtual-contest limit reached (${FREE_VIRTUAL_ATTEMPTS}/month). Upgrade to Pro for unlimited attempts.`,
      );
    }
  }
}
