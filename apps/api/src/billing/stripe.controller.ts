import { Controller, Get, Header, HttpCode, Post, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import { prisma } from "@oj/db";
import { CurrentUser, Public, Roles, type RequestUser } from "../common/decorators";
import { StripeBillingService } from "./stripe-billing.service";
import { checkoutProvider, STRIPE_API_VERSION, STRIPE_EVENTS } from "./stripe.config";
@Controller("billing/stripe")
export class StripeController {
  constructor(private readonly stripe: StripeBillingService) {}
  @Public() @Post("webhook") @HttpCode(200)
  @Throttle({ default: { limit: 300, ttl: 60000 } })
  webhook(@Req() req: Request) {
    const signature = req.headers["stripe-signature"];
    return this.stripe.webhook(Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0), typeof signature === "string" ? signature : "");
  }
  @Post("portal") @Throttle({ default: { limit: 5, ttl: 60000 } })
  portal(@CurrentUser() user: RequestUser) { return this.stripe.portal(user.id); }
  @Roles("ADMIN") @Get("readiness") @Header("Cache-Control", "private, no-store")
  async readiness() {
    const [pendingEvents, reviewEvents, refunds] = await Promise.all([
      prisma.stripeWebhookEvent.count({ where: { processedAt: null } }),
      prisma.stripeWebhookEvent.findMany({ where: { reviewRequired: true }, select: { id: true, type: true, errorCode: true, receivedAt: true }, orderBy: { receivedAt: "desc" }, take: 20 }),
      prisma.refundRequest.count({ where: { provider: "STRIPE", status: { not: "COMPLETED" } } }),
    ]);
    return { provider: checkoutProvider(), enabled: process.env.STRIPE_ENABLED === "true", mode: process.env.STRIPE_MODE ?? "unconfigured", apiVersion: STRIPE_API_VERSION,
      configured: { key: !!process.env.STRIPE_SECRET_KEY, webhook: !!process.env.STRIPE_WEBHOOK_SECRET, product: !!process.env.STRIPE_PRO_PRODUCT_ID, portal: !!process.env.STRIPE_PORTAL_CONFIGURATION_ID },
      requiredEvents: STRIPE_EVENTS, pendingEvents, reviewEvents, pendingRefunds: refunds };
  }
}
