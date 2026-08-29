import { Body, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import {
  adminGrantPlanSchema,
  ecpayCreateSchema,
  effectivePriceNtd,
  isLaunchPromoActive,
  LAUNCH_PROMO,
  PLAN_PRICING,
  type AdminGrantPlanDto,
  type EcpayCreateDto,
} from "@oj/shared";
import { CurrentUser, Public, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { BillingService } from "./billing.service";

@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  /** Static pricing. Public so the pricing page renders for logged-out visitors too. */
  @Public()
  @Get("plans")
  plans() {
    const promoActive = isLaunchPromoActive();
    return {
      pricing: PLAN_PRICING,
      // The actual amount today's purchase charges per period (reflects the launch promo on
      // MONTHLY while it's active) — the frontend should always display/charge THIS, never
      // pricing[period].amountNtd directly, so a promo can never silently drift out of sync.
      effectivePricing: {
        MONTHLY: effectivePriceNtd("MONTHLY"),
        YEARLY: effectivePriceNtd("YEARLY"),
      },
      promo: promoActive ? { discountPct: LAUNCH_PROMO.discountPct, period: LAUNCH_PROMO.period, endsAt: LAUNCH_PROMO.endsAt } : null,
    };
  }

  @Get("me")
  status(@CurrentUser() user: RequestUser) {
    return this.billing.status(user.id);
  }

  @Post("cancel")
  cancel(@CurrentUser() user: RequestUser) {
    return this.billing.cancelPlan(user.id);
  }

  /** Self-service full refund of the user's first credit-card charge, within the refund window —
   * replaces the old free-trial claim. Same tight throttle reasoning as subscription/cancel: a
   * real ECPay action, no legitimate user needs more than a couple of attempts. */
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("refund/request")
  requestRefund(@CurrentUser() user: RequestUser) {
    return this.billing.requestRefund(user.id);
  }

  /** Immediate cancellation for an active recurring Subscription — distinct from /cancel above,
   * which only marks intent for a one-time-purchase period that's already fully paid for. */
  @Post("subscription/cancel")
  cancelSubscription(@CurrentUser() user: RequestUser) {
    return this.billing.cancelSubscription(user.id);
  }

  /** User backs out of their own pending order (e.g. an ATM transfer they no longer want) so the
   * checkout page stops showing it and they can pick a different plan/period/method. */
  @Post("dismiss-pending")
  dismissPending(@CurrentUser() user: RequestUser) {
    return this.billing.dismissPending(user.id);
  }

  /** Support tool: a user reports paying but never got upgraded — grant Pro directly without
   * requiring a Payment claim to exist first. */
  @Roles("ADMIN")
  @Post("admin/:userId/grant")
  grant(
    @Param("userId") userId: string,
    @Body(new ZodValidationPipe(adminGrantPlanSchema)) body: AdminGrantPlanDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.billing.adminGrant(userId, user.id, body.period);
  }

  /** Support tool: undo a grant made in error. */
  @Roles("ADMIN")
  @Post("admin/:userId/revoke")
  revoke(@Param("userId") userId: string) {
    return this.billing.adminRevoke(userId);
  }

  /** Credit-card orders where Pro was already granted on authorization but the capture (now a
   * manual step via ECPay's merchant backend) hasn't been confirmed yet — the "still owed" queue. */
  @Roles("ADMIN")
  @Get("admin/authorized-pending")
  authorizedPending() {
    return this.billing.listAuthorizedPending();
  }

  // --- ECPay (綠界) automated ATM virtual-account flow ---

  /** Starts an automated upgrade. Returns a form-post target + fields — the frontend auto-submits
   * a hidden <form> to ECPay's hosted checkout, which is how every ECPay integration works (not a
   * JSON API call: the browser itself must navigate there). */
  @Post("ecpay/create")
  createEcpayOrder(@Body(new ZodValidationPipe(ecpayCreateSchema)) body: EcpayCreateDto, @CurrentUser() user: RequestUser) {
    return this.billing.createEcpayOrder(user.id, body.period, body.method);
  }

  /** Webhook — ECPay POSTs here (form-urlencoded, not JSON) once it has issued an ATM virtual
   * account for an order, well before the customer has actually paid. No auth/CSRF: this is
   * server-to-server from ECPay's own infrastructure, authenticated by CheckMacValue instead. */
  // Generous, not tight: ECPay's own retries (up to 4/day) and legitimate bursts (many real
  // purchases during an exam-week spike) all share ECPay's small pool of server IPs — a low
  // limit here risks silently dropping real payment confirmations, which is worse than under-
  // throttling a cheap, signature-verified, already-idempotent handler.
  @Public()
  @Throttle({ default: { limit: 300, ttl: 60_000 } })
  @Post("ecpay/payment-info")
  async ecpayPaymentInfo(@Req() req: Request, @Res() res: Response) {
    await this.billing.handleEcpayPaymentInfo(req.body as Record<string, string>);
    // ECPay requires exactly this literal response to consider the notification delivered —
    // anything else (including a JSON body) makes it retry up to 4x/day.
    res.type("text/plain").send("1|OK");
  }

  /** Webhook — ECPay POSTs here once the customer has actually paid. Same auth model as above. */
  @Public()
  @Throttle({ default: { limit: 300, ttl: 60_000 } })
  @Post("ecpay/return")
  async ecpayReturn(@Req() req: Request, @Res() res: Response) {
    await this.billing.handleEcpayReturn(req.body as Record<string, string>);
    res.type("text/plain").send("1|OK");
  }

  /** Webhook — ECPay POSTs here after every recurring (定期定額) auto-charge from the 2nd cycle
   * onward; the 1st charge is confirmed via ecpay/return above. Same auth model as the others. */
  @Public()
  @Throttle({ default: { limit: 300, ttl: 60_000 } })
  @Post("ecpay/period-return")
  async ecpayPeriodReturn(@Req() req: Request, @Res() res: Response) {
    await this.billing.handleEcpayPeriodReturn(req.body as Record<string, string>);
    res.type("text/plain").send("1|OK");
  }
}
