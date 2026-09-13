import { randomBytes } from "node:crypto";
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { prisma, Prisma } from "@oj/db";
import type { User } from "@oj/db";
import {
  effectivePriceNtd,
  billingCycleEnd,
  parseEcpayPaymentDate,
  refundDeadline,
  withinRefundWindow,
  REFUND_POLICY_VERSION,
  FREE_SUBMIT_QUOTA,
  FREE_VIRTUAL_ATTEMPTS,
  PLAN_PRICING,
  type BillingPeriod,
  type AdminRefundListDto,
} from "@oj/shared";
import {
  cancelEcpayPeriod,
  computeCheckMacValue,
  doCreditCardAction,
  ecpayConfig,
  queryEcpayCreditTrade,
  queryEcpayOrder,
  refundActions,
  verifyCheckMacValue,
} from "./ecpay.util";

// ECPay has no "forever" recurring option — ExecTimes must be finite. These are the max values
// ECPay allows for each PeriodType (999 for day/month, 99 for year), which is functionally
// indefinite for any real subscriber; billing.service.cancelSubscription is how it actually ends.
const RECURRING_EXEC_TIMES: Record<BillingPeriod, number> = { MONTHLY: 999, YEARLY: 99 };
const RECURRING_PERIOD_TYPE: Record<BillingPeriod, "M" | "Y"> = { MONTHLY: "M", YEARLY: "Y" };

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
  const rand = randomBytes(5).toString("hex").toUpperCase();
  return `JT${Date.now().toString(36).toUpperCase()}${rand}`.slice(0, 20);
}

// "YYYY-MM" in Asia/Taipei — every FREE-tier monthly quota (submit, virtual attempts, runs) resets
// on this boundary, not UTC midnight, so an action just after midnight Taiwan time (but still
// "yesterday" in UTC) rolls over correctly instead of a day early/late. Exported so other quota
// enforcement points (e.g. RunsService) share the exact same month-boundary definition.
export function currentMonthKey(d: Date = new Date()): string {
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

  /** Shared base for every "grant/extend Pro" path (real payments, admin grants, and the
   * yearly-subscription first-charge bonus): extends from whichever is later (now, or the user's
   * existing expiry) so paying/renewing/claiming early never loses days. Takes a transaction
   * client so the caller's own writes (a Payment status flip, a Subscription upsert, ...) commit
   * atomically with this User update — real money is involved, so a crash between the two writes
   * must never leave them inconsistent.
   *
   * A single atomic UPDATE (not a SELECT then a separate UPDATE) deliberately — two of these
   * running concurrently for the same user (e.g. a first-charge webhook racing a renewal webhook,
   * or two admin actions) would otherwise both read the same pre-extension planExpiresAt before
   * either commits, and the later write would silently clobber the earlier one's days. Postgres
   * evaluates GREATEST/make_interval against each row version as it acquires that row's lock, so
   * a second concurrent call for the same user simply waits and then computes from the
   * already-updated value instead of stepping on it. */
  private async extendPlanByDays(tx: Prisma.TransactionClient, userId: string, days: number): Promise<Date> {
    const rows = await tx.$queryRaw<{ planExpiresAt: Date }[]>`
      UPDATE users
      SET "planExpiresAt" = GREATEST(now(), COALESCE("planExpiresAt", now())) + make_interval(days => ${days}::int),
          plan = 'PRO',
          "planCancelRequested" = false
      WHERE id = ${userId}
      RETURNING "planExpiresAt"
    `;
    if (rows.length === 0) throw new NotFoundException("User not found");
    return rows[0].planExpiresAt;
  }

  private async extendPlan(tx: Prisma.TransactionClient, userId: string, period: BillingPeriod): Promise<Date> {
    return this.extendPlanByDays(tx, userId, PLAN_PRICING[period].days);
  }

  /** Refund eligibility for the logged-in user — see requestRefund for the actual action. Whether
   * they're eligible depends on having a first CREDIT charge that's both unrefunded and still
   * within REFUND_WINDOW_MS; `deadline` is only meaningful when `eligible` is true. Takes an
   * optional transaction client so requestRefund can run this same check again *inside* its
   * advisory-locked transaction, seeing any REFUNDED write a just-finished concurrent call made,
   * rather than a plain `prisma` read that could still see pre-lock state. */
  private async findRefundableFirstPayment(userId: string, db: Prisma.TransactionClient | typeof prisma = prisma, receivedAt = new Date()) {
    const first = await db.payment.findFirst({
      where: { userId, method: "ECPAY", ecpayMethod: "CREDIT", paidAt: { not: null } },
      orderBy: [{ paidAt: "asc" }, { id: "asc" }],
    });
    if (!first || !["APPROVED", "AUTHORIZED"].includes(first.status)) return null;
    return withinRefundWindow(first.paidAt, first.refundDeadlineAt, receivedAt) ? first : null;
  }

  private async grantPaymentPeriod(tx: Prisma.TransactionClient, payment: { id: string; userId: string; period: BillingPeriod }, paidAt: Date,
    recurring?: { anchor: Date; firstEntitlementStart: Date; cycle: number }) {
    await tx.$executeRaw`SELECT 1 FROM users WHERE id = ${payment.userId} FOR UPDATE`;
    const user = await tx.user.findUniqueOrThrow({ where: { id: payment.userId } });
    // Each successful cycle contributes its original calendar duration, even when callbacks
    // arrive out of order. Starting each renewal at its own paidAt would count missing gaps twice.
    const start = new Date(Math.max(+(recurring?.firstEntitlementStart ?? paidAt), user.planExpiresAt?.getTime() ?? 0));
    const duration = recurring
      ? +billingCycleEnd(recurring.anchor, payment.period, recurring.cycle) - +billingCycleEnd(recurring.anchor, payment.period, recurring.cycle - 1)
      : +billingCycleEnd(paidAt, payment.period) - +paidAt;
    const end = new Date(+start + duration);
    await tx.payment.update({ where: { id: payment.id }, data: { entitlementStartsAt: start, entitlementEndsAt: end } });
    await tx.user.update({ where: { id: payment.userId }, data: { plan: "PRO", planExpiresAt: end, planCancelRequested: false } });
  }

  private async verifyWebhook(body: Record<string, string>) {
    const config = ecpayConfig();
    if (body.MerchantID !== config.merchantId || !(await verifyCheckMacValue(body, config)) ||
      (!config.isSandbox && body.SimulatePaid === "1")) {
      throw new BadRequestException("Invalid payment notification");
    }
    if (!/^[a-zA-Z0-9]{1,20}$/.test(body.MerchantTradeNo ?? "")) throw new BadRequestException("Invalid payment order");
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
    const subscription = await prisma.subscription.findFirst({ where: { userId, status: "ACTIVE" } });
    const firstCharge = subscription ? await prisma.payment.findUnique({ where: { merchantTradeNo: subscription.merchantTradeNo } }) : null;
    const refundablePayment = await this.findRefundableFirstPayment(userId);
    const refundRequest = await prisma.refundRequest.findUnique({ where: { userId } });

    return {
      // "plan" drives every Pro-gated UI check, so ADMIN reports "PRO" here too (see isUnlimited)
      // even though planExpiresAt/planCancelRequested below stay tied to a REAL subscription
      // (`pro`, not `unlimited`) — an admin never had one to expire or cancel.
      plan: unlimited ? "PRO" : "FREE",
      planExpiresAt: pro ? user.planExpiresAt : null,
      planCancelRequested: pro && user.planCancelRequested,
      refundEligibleUntil: !refundRequest ? refundablePayment?.refundDeadlineAt ?? null : null,
      refundRequest: refundRequest ? { id: refundRequest.id, status: refundRequest.status, requestedAt: refundRequest.requestedAt, completedAt: refundRequest.completedAt } : null,
      subscription: subscription ? { period: subscription.period, amountNtd: subscription.amountNtd,
        nextChargeAt: firstCharge?.paidAt ? billingCycleEnd(firstCharge.paidAt, subscription.period, subscription.totalSuccessTimes) : null } : null,
      submits: { used: submitsUsedThisMonth, limit: unlimited ? null : FREE_SUBMIT_QUOTA },
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
   * current state.
   *
   * Also best-effort cancels any active ECPay Subscription — without this, the next scheduled
   * auto-charge would still succeed and its webhook (handleEcpayPeriodReturn) would silently
   * re-grant Pro, undoing the revoke a period later with no admin action in between. Deliberately
   * doesn't block the revoke itself on ECPay being reachable (unlike the user-initiated
   * cancelSubscription, which must not claim success while ECPay might still charge them) — an
   * admin correcting their own mistake needs the access pulled now; a failed ECPay cancel here is
   * logged so it doesn't silently keep charging with zero trace. */
  async adminRevoke(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const subscription = await prisma.subscription.findFirst({ where: { userId, status: "ACTIVE" } });
    if (subscription) {
      try {
        const config = ecpayConfig();
        const result = await cancelEcpayPeriod(subscription.merchantTradeNo, config);
        if (result.RtnCode === 1) {
          await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
        } else {
          this.logger.error(`adminRevoke: ECPay declined to cancel subscription ${subscription.id} for user ${userId}: ${result.RtnMsg}`);
        }
      } catch (err) {
        this.logger.error(`adminRevoke: failed to cancel ECPay subscription ${subscription.id} for user ${userId}: ${String(err)}`);
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { plan: "FREE", planExpiresAt: null, planCancelRequested: false },
    });
    return { plan: "FREE", planExpiresAt: null };
  }

  // --- ECPay (綠界) automated checkout flow (credit-card subscriptions only — ATM was removed) ---

  /** User starts an automated upgrade: creates a PENDING Payment tied to a fresh ECPay order and
   * returns the auto-submit form ECPay's AioCheckOut endpoint expects (form POST, not a JSON API —
   * this is how every ECPay integration works: the browser navigates to their hosted checkout).
   *
   * Always a credit-card ECPay recurring (定期定額) order — PeriodAmount/PeriodType/Frequency/
   * ExecTimes below turn this into a real subscription that ECPay auto-charges every period on its
   * own, not a one-time purchase. (ATM used to be the alternative here — a one-time bank transfer,
   * no auto-renewal, no API-driven refund path — but that meant maintaining two entirely different
   * payment lifecycles for one product; removed rather than kept as unused flexibility.) Confirms
   * this first charge via the ReturnURL webhook (RtnCode "1" = paid); handleEcpayReturn spins up
   * the Subscription row there. */
  async createEcpayOrder(userId: string, period: BillingPeriod) {
    const config = ecpayConfig();
    const apiPublicUrl = process.env.API_PUBLIC_URL || (process.env.RAILWAY_SERVICE_API_URL ? `https://${process.env.RAILWAY_SERVICE_API_URL}` : "http://localhost:4000");
    const webOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim();
    if (!config.isSandbox && [apiPublicUrl, webOrigin].some((value) => {
      const url = new URL(value);
      return url.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(url.hostname);
    })) throw new BadRequestException("Production checkout requires public HTTPS URLs");
    // The amount that actually gets charged is always derived server-side (PLAN_PRICING plus
    // any active launch promo via effectivePriceNtd), never trusted from the client — the client
    // only chooses which of these two fixed plans.
    const pricing = PLAN_PRICING[period];
    const amountNtd = effectivePriceNtd(period);
    const merchantTradeNo = generateMerchantTradeNo();

    // A Postgres advisory lock scoped to this user (namespaced separately from the unrelated
    // per-user lock in contests.service.register, so the two features never block each other)
    // serializes concurrent createEcpayOrder calls by the same user — without it, two rapid
    // clicks/requests could both pass the "no existing pending payment" check before either one's
    // insert commits, producing two live payable orders for the same upgrade (and, worse, two
    // active recurring subscriptions on a double-click). See contests.service.ts's own use of this
    // pattern for the reference this mirrors.
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('billing_order'), hashtext(${userId}))`;

      const existingPending = await tx.payment.findFirst({
        where: { userId, status: "PENDING", dismissedByUser: false },
      });
      if (existingPending) {
        throw new BadRequestException("You already have a payment awaiting review.");
      }

      const existingSubscription = await tx.subscription.findFirst({ where: { userId, status: "ACTIVE" } });
      if (existingSubscription) {
        throw new BadRequestException("You already have an active subscription.");
      }

      await tx.payment.create({
        data: {
          userId,
          period,
          amountNtd,
          method: "ECPAY",
          ecpayMethod: "CREDIT",
          status: "PENDING",
          merchantTradeNo,
          isRecurring: true,
          refundPolicyVersion: REFUND_POLICY_VERSION,
        },
      });
    });

    const params: Record<string, string | number> = {
      MerchantID: config.merchantId,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: formatEcpayDate(new Date()),
      PaymentType: "aio",
      TotalAmount: amountNtd,
      TradeDesc: "judge.tw Pro upgrade",
      ItemName: `judge.tw Pro (${pricing.label})`,
      ReturnURL: `${apiPublicUrl}/billing/ecpay/return`,
      ClientBackURL: `${webOrigin}/upgrade/checkout`,
      ChoosePayment: "Credit",
      IgnorePayment: "ApplePay",
      NeedExtraPaidInfo: "Y",
      EncryptType: 1,
      PeriodAmount: amountNtd,
      PeriodType: RECURRING_PERIOD_TYPE[period],
      Frequency: 1,
      ExecTimes: RECURRING_EXEC_TIMES[period],
      PeriodReturnURL: `${apiPublicUrl}/billing/ecpay/period-return`,
    };
    const CheckMacValue = await computeCheckMacValue(params, config);

    return { actionUrl: config.checkoutUrl, fields: { ...params, CheckMacValue }, sandbox: config.isSandbox };
  }

  /** Webhook: ECPay confirms the customer actually paid. Idempotent — ECPay retries this call up
   * to 4x/day until it gets back the literal string "1|OK", so a payment already APPROVED (by an
   * earlier delivery of the same notification) is a silent no-op, not an error. */
  async handleEcpayReturn(body: Record<string, string>): Promise<void> {
    await this.verifyWebhook(body);
    if (body.RtnCode !== "1") {
      this.logger.log(`ECPay return webhook: non-success RtnCode ${body.RtnCode} for ${body.MerchantTradeNo}`);
      return;
    }
    const payment = await prisma.payment.findUnique({ where: { merchantTradeNo: body.MerchantTradeNo } });
    if (!payment) {
      throw new NotFoundException("Payment order not found");
    }
    if (["APPROVED", "REJECTED", "REFUNDED"].includes(payment.status)) return; // already finalized — idempotent no-op

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
      throw new BadRequestException("Payment amount mismatch");
    }
    if (!/^[a-zA-Z0-9]{1,20}$/.test(body.TradeNo ?? "")) throw new BadRequestException("Invalid gateway trade number");
    const paidAt = parseEcpayPaymentDate(body.PaymentDate);
    const deadline = payment.refundDeadlineAt ?? (payment.refundPolicyVersion === "legacy-30d"
      ? new Date(+paidAt + 30 * 86400_000) : refundDeadline(paidAt));

    if (payment.status === "AUTHORIZED") {
      // Credit-card order: Pro was already granted the moment the authorization was detected (see
      // markCreditAuthorized) — this webhook only fires once the operator's manual capture (via
      // ECPay's own merchant backend) actually settles, so there's nothing left to grant, just the
      // record to reconcile off the "still owed" admin queue.
      //
      // updateMany with the status still in its WHERE (not a plain update after the status check
      // above) so two near-simultaneous deliveries of the same webhook can't both pass the earlier
      // read and both think they're the one claiming this transition — Postgres serializes
      // concurrent UPDATEs to the same row, so only the first actually matches count=1; a second
      // redelivery arriving a moment later sees count=0 and is a no-op instead of double-approving.
      const claimed = await prisma.payment.updateMany({
        where: { id: payment.id, status: "AUTHORIZED" },
        data: { status: "APPROVED", paidAt: payment.paidAt ?? paidAt, refundDeadlineAt: deadline, ecpayTradeNo: body.TradeNo, reviewedAt: new Date(), reviewedBy: "ECPAY_AUTO" },
      });
      if (claimed.count === 0) return; // already claimed by a concurrent delivery of this same webhook
      this.logger.log(`ECPay return webhook: capture confirmed for already-authorized payment ${payment.id}`);
      return;
    }

    // payment.status === "PENDING" here — an ATM transfer (no authorization step exists), a
    // recurring credit-card order (excluded from the auth-poll/manual-capture path entirely, since
    // ECPay auto-captures those itself every cycle), or the rare race where a one-time capture
    // webhook arrived before our authorization poll caught up. Grant Pro now.
    const approved = await prisma.$transaction(async (tx) => {
      // Same conditional-claim reasoning as the AUTHORIZED branch above: this is the operation
      // that actually gates extendPlan running, so it — not the read at the top of this method —
      // is what must be race-proof.
      const claimed = await tx.payment.updateMany({
        where: { id: payment.id, status: "PENDING" },
        data: { status: "APPROVED", paidAt: payment.paidAt ?? paidAt, refundDeadlineAt: deadline, ecpayTradeNo: body.TradeNo, reviewedAt: new Date(), reviewedBy: "ECPAY_AUTO" },
      });
      if (claimed.count === 0) return false; // already claimed by a concurrent delivery of this same webhook
      await this.grantPaymentPeriod(tx, payment, paidAt);

      if (payment.isRecurring) {
        // First successful charge of a recurring order — spin up the Subscription row that
        // handleEcpayPeriodReturn will extend on every future auto-charge, and that
        // cancelSubscription calls ECPay's Cancel action against. Guard on the unique
        // merchantTradeNo rather than an existence check first: idempotent even if ECPay somehow
        // redelivers this notification after a retry raced the transaction.
        const subscription = await tx.subscription.upsert({
          where: { merchantTradeNo: payment.merchantTradeNo! },
          create: {
            userId: payment.userId,
            period: payment.period,
            amountNtd: payment.amountNtd,
            merchantTradeNo: payment.merchantTradeNo!,
            status: "ACTIVE",
            totalSuccessTimes: 1,
          },
          update: {},
        });
        await tx.payment.update({ where: { id: payment.id }, data: { subscriptionId: subscription.id, cycleNumber: 1 } });
        // Only pre-migration checkout orders retain an already-promised annual bonus.
        if (payment.refundPolicyVersion === "legacy-30d" && payment.period === "YEARLY") {
          await this.extendPlanByDays(tx, payment.userId, 30);
        }
      }
      return true;
    });
    if (approved) this.logger.log(`ECPay return webhook: approved payment ${payment.id} for user ${payment.userId}`);
  }

  /** Webhook: ECPay confirms a recurring order's Nth (N>=2) auto-charge succeeded or failed — the
   * first charge is confirmed via the regular ReturnURL/handleEcpayReturn above, which is also what
   * creates the Subscription row this correlates against. Idempotent the same way the docs require:
   * ECPay's only progress marker is TotalSuccessTimes (cumulative successful-charge count), so a
   * notification is only acted on when it's strictly greater than what we've already recorded. */
  async handleEcpayPeriodReturn(body: Record<string, string>): Promise<void> {
    await this.verifyWebhook(body);
    const subscription = await prisma.subscription.findUnique({ where: { merchantTradeNo: body.MerchantTradeNo } });
    if (!subscription) {
      throw new NotFoundException("Subscription notification arrived before its first payment; retry required");
    }
    if (body.RtnCode !== "1") {
      // ECPay retries on its own and auto-cancels the recurring order after 6 consecutive
      // failures — nothing for us to actively do here beyond a record of it.
      this.logger.log(`ECPay period-return webhook: non-success RtnCode ${body.RtnCode} for ${body.MerchantTradeNo}`);
      return;
    }
    const cycle = Number(body.TotalSuccessTimes);
    const amount = Number(body.amount ?? body.PeriodAmount ?? body.TradeAmt);
    if (!Number.isSafeInteger(cycle) || cycle < 1 || amount !== subscription.amountNtd ||
      !/^[a-zA-Z0-9]{1,20}$/.test(body.TradeNo ?? "")) throw new BadRequestException("Invalid renewal identity or amount");
    const paidAt = parseEcpayPaymentDate(body.PaymentDate ?? body.process_date);
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT 1 FROM subscriptions WHERE id = ${subscription.id} FOR UPDATE`;
      const existing = await tx.payment.findFirst({ where: { OR: [
        { ecpayTradeNo: body.TradeNo }, { subscriptionId: subscription.id, cycleNumber: cycle },
      ] } });
      if (existing) return;
      // Historical renewals had no cycle identity. Do not credit their old callbacks again.
      const original = await tx.payment.findUnique({ where: { merchantTradeNo: subscription.merchantTradeNo } });
      if (original?.refundPolicyVersion === "legacy-30d" && cycle <= subscription.totalSuccessTimes) return;
      if (cycle === 1) return;
      const payment = await tx.payment.create({ data: {
        userId: subscription.userId, period: subscription.period, amountNtd: amount,
        status: "APPROVED", method: "ECPAY", ecpayMethod: "CREDIT", paidAt,
        ecpayTradeNo: body.TradeNo, cycleNumber: cycle, subscriptionId: subscription.id,
        reference: `Recurring renewal #${cycle}`, reviewedAt: new Date(), reviewedBy: "ECPAY_AUTO",
      } });
      await this.grantPaymentPeriod(tx, payment, paidAt, original?.paidAt ? {
        anchor: original.paidAt, firstEntitlementStart: original.entitlementStartsAt ?? original.paidAt, cycle,
      } : undefined);
      await tx.subscription.updateMany({ where: { id: subscription.id, totalSuccessTimes: { lt: cycle } }, data: { totalSuccessTimes: cycle } });
      if (subscription.status === "CANCELLED") this.logger.error(`Charge received after cancellation: ${payment.id}; reconciliation required`);
    });
  }

  /** User-initiated cancellation of their active Subscription: stops future ECPay auto-charges,
   * but — like cancelPlan below — leaves Pro access running until the already-paid planExpiresAt
   * naturally lapses, rather than cutting it off today. The first charge already paid for a full
   * period (extendPlan ran when it was approved), so an immediate downgrade would forfeit days
   * the user already paid for; ending at period-end is what "cancel" means for every other
   * subscription product. Calls ECPay's Cancel action FIRST and only touches our own records if
   * that actually succeeds — never mark a subscription cancelled while ECPay might still go on to
   * auto-charge it. */
  async cancelSubscription(userId: string): Promise<{ plan: "PRO"; planExpiresAt: Date | null }> {
    const subscription = await prisma.subscription.findFirst({ where: { userId, status: "ACTIVE" } });
    if (!subscription) throw new NotFoundException("No active subscription found.");

    const config = ecpayConfig();
    const result = await cancelEcpayPeriod(subscription.merchantTradeNo, config);
    if (result.RtnCode !== 1) {
      throw new BadRequestException(`Could not cancel with ECPay: ${result.RtnMsg}`);
    }

    const user = await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      return tx.user.update({ where: { id: userId }, data: { planCancelRequested: true } });
    });
    this.logger.log(
      `Subscription ${subscription.id} cancelled by user ${userId} — stays Pro until ${user.planExpiresAt?.toISOString()}, won't auto-renew.`,
    );
    return { plan: "PRO", planExpiresAt: user.planExpiresAt };
  }

  /** Accept eligibility durably before contacting ECPay. Retries preserve the original deadline. */
  async requestRefund(userId: string) {
    const receivedAt = new Date();
    const request = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('billing_refund'), hashtext(${userId}))`;
      const existing = await tx.refundRequest.findUnique({ where: { userId } });
      if (existing) return existing;
      const payment = await this.findRefundableFirstPayment(userId, tx, receivedAt);
      if (!payment?.merchantTradeNo) throw new BadRequestException("Your first-payment refund window has ended or this payment is not eligible.");
      return tx.refundRequest.create({ data: { userId, paymentId: payment.id, requestedAt: receivedAt,
        amountNtd: payment.amountNtd, merchantTradeNo: payment.merchantTradeNo } });
    });
    return { id: request.id, status: request.status };
  }

  async pendingRefunds(query: AdminRefundListDto = {}) {
    let after: Prisma.RefundRequestWhereInput = {};
    if (query.cursor) {
      try {
        const cursor = JSON.parse(Buffer.from(query.cursor, "base64url").toString());
        if (typeof cursor.id !== "string" || !/^[a-z0-9]{1,100}$/.test(cursor.id) || typeof cursor.at !== "string") throw new Error();
        const at = new Date(cursor.at);
        if (!Number.isFinite(+at) || at.toISOString() !== cursor.at) throw new Error();
        after = { OR: [{ requestedAt: { gt: at } }, { requestedAt: at, id: { gt: cursor.id } }] };
      } catch { throw new BadRequestException("Invalid page cursor"); }
    }
    const [rows, grouped] = await Promise.all([
      prisma.refundRequest.findMany({ where: { status: query.status ?? { not: "COMPLETED" }, ...after },
        orderBy: [{ requestedAt: "asc" }, { id: "asc" }], take: 26 }),
      prisma.refundRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);
    const items = rows.slice(0, 25);
    // Refund references survive deletion. Join only currently existing accounts/payments;
    // don't add personal information to the retained financial ledger.
    const [users, payments] = await Promise.all([
      prisma.user.findMany({ where: { id: { in: items.map((item) => item.userId) } }, select: { id: true, handle: true, email: true } }),
      prisma.payment.findMany({ where: { id: { in: items.map((item) => item.paymentId) } }, select: { id: true, ecpayTradeNo: true } }),
    ]);
    const accounts = new Map(users.map((user) => [user.id, user]));
    const trades = new Map(payments.map((payment) => [payment.id, payment.ecpayTradeNo]));
    const last = items.at(-1);
    return {
      items: items.map((item) => ({ ...item, user: accounts.get(item.userId) ?? null, ecpayTradeNo: trades.get(item.paymentId) ?? null })),
      nextCursor: rows.length > 25 && last ? Buffer.from(JSON.stringify({ at: last.requestedAt.toISOString(), id: last.id })).toString("base64url") : null,
      counts: Object.fromEntries(["REQUESTED", "PROCESSING", "NEEDS_REVIEW", "COMPLETED"].map((status) => [status, grouped.find((group) => group.status === status)?._count._all ?? 0])),
    };
  }

  /** One worker claim at a time across API replicas. Unknown card actions are never repeated. */
  async processRefund(id: string): Promise<void> {
    const processingToken = randomBytes(16).toString("hex");
    const claim = await prisma.refundRequest.updateMany({ where: { id, status: "REQUESTED", nextAttemptAt: { lte: new Date() } },
      data: { status: "PROCESSING", processingToken, attempts: { increment: 1 } } });
    if (!claim.count) return;
    const request = await prisma.refundRequest.findUniqueOrThrow({ where: { id } });
    const payment = await prisma.payment.findUnique({ where: { id: request.paymentId } });
    try {
      if (!payment?.merchantTradeNo) throw new Error("Payment missing; manual reconciliation required");
      const config = ecpayConfig();
      if (config.isSandbox) throw new Error("Real credit refunds cannot be verified in the ECPay test environment");
      // Confirm the gateway identity independently; TradeID is an authorization number, not TradeNo.
      const order = await queryEcpayOrder(payment.merchantTradeNo, config);
      if (Number(order.TradeAmt) !== payment.amountNtd || !order.TradeNo || (payment.ecpayTradeNo && payment.ecpayTradeNo !== order.TradeNo)) {
        throw new Error("Gateway amount or transaction mismatch");
      }
      const credit = await queryEcpayCreditTrade(payment.merchantTradeNo, config);
      if (credit.RtnMsg || credit.Amount !== payment.amountNtd) throw new Error("Credit transaction could not be verified");
      const subscription = await prisma.subscription.findUnique({ where: { merchantTradeNo: payment.merchantTradeNo } });
      if (!request.cancellationConfirmedAt && subscription?.status === "ACTIVE") {
        await prisma.refundRequest.update({ where: { id, status: "PROCESSING", processingToken }, data: { inFlightAction: "CANCEL_SUBSCRIPTION" } });
        const result = await cancelEcpayPeriod(subscription.merchantTradeNo, config);
        if (result.RtnCode !== 1) throw new Error(`Cancellation declined (${result.RtnCode})`);
        await prisma.$transaction([
          prisma.subscription.update({ where: { id: subscription.id }, data: { status: "CANCELLED", cancelledAt: new Date() } }),
          prisma.refundRequest.update({ where: { id, status: "PROCESSING", processingToken }, data: { cancellationConfirmedAt: new Date(), inFlightAction: null } }),
        ]);
      }
      if (!request.refundConfirmedAt) {
        if ((credit.CloseData ?? []).some((row) => row.Amount < 0)) throw new Error("Existing refund activity requires reconciliation");
        const lastPositive = (credit.CloseData ?? []).filter((row) => row.Amount > 0).at(-1);
        for (const action of refundActions(lastPositive?.Status ?? credit.Status ?? "")) {
          await prisma.refundRequest.update({ where: { id, status: "PROCESSING", processingToken }, data: { inFlightAction: action } });
          const result = await doCreditCardAction(payment.merchantTradeNo, order.TradeNo, action, payment.amountNtd, config);
          if (result.RtnCode !== 1) throw new Error(`Credit action declined (${result.RtnCode})`);
          await prisma.refundRequest.update({ where: { id, status: "PROCESSING", processingToken }, data: { inFlightAction: null,
            ...(action === "N" || action === "R" ? { refundConfirmedAt: new Date() } : {}) } });
        }
      }
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM refund_requests WHERE id = ${id} FOR UPDATE`;
        const current = await tx.refundRequest.findUniqueOrThrow({ where: { id } });
        if (current.status !== "PROCESSING" || current.processingToken !== processingToken) return;
        if (!current.refundConfirmedAt) throw new Error("Refund is not confirmed");
        await tx.$executeRaw`SELECT 1 FROM users WHERE id = ${request.userId} FOR UPDATE`;
        const user = await tx.user.findUniqueOrThrow({ where: { id: request.userId } });
        if (payment.entitlementStartsAt && payment.entitlementEndsAt && user.planExpiresAt) {
          const remaining = Math.min(+payment.entitlementEndsAt - +payment.entitlementStartsAt, Math.max(0, +payment.entitlementEndsAt - Date.now()));
          const expires = new Date(Math.max(Date.now(), +user.planExpiresAt - remaining));
          await tx.user.update({ where: { id: user.id }, data: { plan: +expires > Date.now() ? "PRO" : "FREE", planExpiresAt: expires, planCancelRequested: false } });
        } else {
          // No ledger means even a single historical purchase cannot distinguish an admin grant.
          throw new Error("Historical entitlement allocation requires review; refund already confirmed");
        }
        await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED", reviewedAt: new Date(), reviewedBy: "USER_REFUND" } });
        await tx.refundRequest.update({ where: { id }, data: { status: "COMPLETED", completedAt: new Date(), lastError: null, processingToken: null } });
      });
    } catch (error) {
      const current = await prisma.refundRequest.findUniqueOrThrow({ where: { id } });
      if (current.status !== "PROCESSING" || current.processingToken !== processingToken) return;
      const review = !!current.inFlightAction || !!current.refundConfirmedAt || current.attempts >= 3;
      await prisma.refundRequest.updateMany({ where: { id, status: "PROCESSING", processingToken }, data: {
        status: review ? "NEEDS_REVIEW" : "REQUESTED", nextAttemptAt: new Date(Date.now() + 600_000),
        processingToken: null,
        lastError: error instanceof Error ? error.message.slice(0, 300) : "Refund processing failed",
      } });
      this.logger.error(`Refund ${id} ${review ? "requires reconciliation" : "will retry"}`);
    }
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
      const claimed = await tx.payment.updateMany({
        where: { id: payment.id, status: "PENDING" },
        data: {
          status: "AUTHORIZED",
          paidAt: new Date(),
          refundDeadlineAt: refundDeadline(new Date()),
          reviewedAt: new Date(),
          reviewedBy: "ECPAY_AUTO_AUTH",
          reference: `ECPay TradeID: ${tradeId}`,
        },
      });
      if (claimed.count) await this.grantPaymentPeriod(tx, payment, new Date());
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
  async assertCanSubmit(userId: string, tx: Prisma.TransactionClient = prisma): Promise<void> {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const monthKey = currentMonthKey();
    const rows = await tx.$executeRaw`
      UPDATE users
      SET "submitQuotaUsed" = CASE WHEN "submitQuotaMonth" = ${monthKey} THEN "submitQuotaUsed" + 1 ELSE 1 END,
          "submitQuotaMonth" = ${monthKey}
      WHERE id = ${userId}
        AND (${isUnlimited(user)} OR "submitQuotaMonth" IS DISTINCT FROM ${monthKey} OR "submitQuotaUsed" < ${FREE_SUBMIT_QUOTA})
    `;
    if (rows === 0) {
      throw new ForbiddenException(
        `Free plan submit limit reached (${FREE_SUBMIT_QUOTA}/month). Upgrade to Pro for unlimited submissions.`,
      );
    }
  }

  /**
   * Used only by StuckSubmissionReaperService: a submission that never got a real judge result
   * shouldn't have permanently consumed the user's monthly quota for it. Conditional on still
   * being the same month the original submission consumed (`submitQuotaMonth = monthKey AND
   * submitQuotaUsed > 0`) — if the month has since rolled over, the counter it would need to
   * decrement no longer exists/means something else, so this is deliberately a no-op rather than
   * touching the new month's count. That's an acceptable, narrow edge case (a submission would
   * need to sit stuck for the reaper's 15-minute threshold to still be open right at a month
   * boundary) — not worth a more complex mechanism to close.
   */
  async refundSubmitQuota(userId: string, monthKey = currentMonthKey(), tx: Prisma.TransactionClient = prisma): Promise<void> {
    await tx.$executeRaw`
      UPDATE users
      SET "submitQuotaUsed" = "submitQuotaUsed" - 1
      WHERE id = ${userId} AND "submitQuotaMonth" = ${monthKey} AND "submitQuotaUsed" > 0
    `;
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
