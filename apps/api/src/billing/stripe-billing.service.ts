import { createHash, randomUUID } from "node:crypto";
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import Stripe from "stripe";
import { prisma, type Payment, type Prisma } from "@oj/db";
import { accessAfterRefund, refundDeadline, REFUND_POLICY_VERSION, type BillingPeriod, type EcpayCreateDto } from "@oj/shared";
import { StripeGateway } from "./stripe.gateway";
import { STRIPE_EVENTS } from "./stripe.config";
import { currentBillingCatalog } from "./pricing.config";

const idOf = (value: string | { id: string } | null | undefined) => typeof value === "string" ? value : value?.id;
const terminal = (s: Stripe.Subscription) => ["canceled", "incomplete_expired"].includes(s.status);
const lockUser = (tx: Prisma.TransactionClient, id: string) => tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('billing_order'), hashtext(${id}))`;
export class StripeReviewError extends Error { constructor(readonly code: string) { super(code); } }
@Injectable()
export class StripeBillingService {
  private readonly logger = new Logger(StripeBillingService.name);
  constructor(private readonly gateway: StripeGateway) {}

  async createCheckout(userId: string, period: BillingPeriod, quote: Pick<EcpayCreateDto, "expectedAmountNtd" | "pricingVersion">) {
    const config = this.gateway.config();
    const order = await prisma.$transaction(async tx => {
      await lockUser(tx, userId);
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      if (user.deletionRequestedAt || user.role === "ADMIN" || user.isStudent) throw new BadRequestException("This account cannot purchase Pro");
      const catalog = currentBillingCatalog(), amountNtd = catalog.effectivePricing[period];
      if (quote.expectedAmountNtd !== amountNtd || quote.pricingVersion !== catalog.pricingVersion) throw new ConflictException({ code: "PRICE_CHANGED", message: "Pricing changed. Review the current price and confirm again." });
      if (await tx.subscription.findFirst({ where: { userId, status: "ACTIVE" } })) throw new ConflictException("You already have an active subscription.");
      if (await tx.refundRequest.findFirst({ where: { userId, status: { not: "COMPLETED" } } })) throw new ConflictException("Resolve the pending refund before purchasing again.");
      const pending = await tx.payment.findFirst({ where: { userId, status: "PENDING", dismissedByUser: false } });
      if (pending) {
        if (pending.method !== "STRIPE" || pending.period !== period || pending.amountNtd !== amountNtd || pending.pricingVersion !== catalog.pricingVersion || pending.stripeLivemode !== config.livemode) throw new ConflictException("Finish or cancel your existing checkout first.");
        return pending;
      }
      return tx.payment.create({ data: { userId, period, amountNtd, pricingVersion: catalog.pricingVersion, method: "STRIPE", isRecurring: true,
        merchantTradeNo: `ST${randomUUID().replaceAll("-", "").slice(0, 18)}`, stripeProductId: config.productId, stripeLivemode: config.livemode,
        stripeAccessNotBeforeAt: user.planExpiresAt, stripeCheckoutExpiresAt: new Date(Date.now() + 3600000), refundPolicyVersion: REFUND_POLICY_VERSION } });
    });
    return this.checkoutFor(order);
  }

  private async customer(userId: string) {
    const config = this.gateway.config(), api = this.gateway.client();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.stripeCustomerId) {
      if (user.stripeLivemode !== config.livemode) throw new ConflictException("Stripe customer belongs to a different environment");
      return user.stripeCustomerId;
    }
    const customer = await api.customers.create({ email: user.email, metadata: { application: "judge.tw", userId } }, { idempotencyKey: `judge:customer:${userId}` });
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customer.id, stripeLivemode: config.livemode } });
    return customer.id;
  }

  private async checkoutFor(order: Payment) {
    const config = this.gateway.config(), api = this.gateway.client();
    if (order.stripeLivemode !== config.livemode) throw new ConflictException("Stripe checkout environment mismatch");
    if (order.stripeCheckoutId) {
      const session = await api.checkout.sessions.retrieve(order.stripeCheckoutId);
      if (session.status === "expired") { await this.expireOrder(session); throw new ConflictException("Checkout expired. Please start again."); }
      if (session.status !== "open" || !session.url) throw new ConflictException("Payment is processing. Refresh your subscription status.");
      return { provider: "stripe" as const, url: session.url, sandbox: !config.livemode };
    }
    // Never recreate an uncertain session after Stripe's idempotency window. Its fixed expiry
    // also prevents retries from silently extending a checkout's price reservation.
    if (!order.stripeCheckoutExpiresAt || +order.stripeCheckoutExpiresAt - Date.now() < 1800000) throw new ConflictException("Checkout creation needs reconciliation. Contact support.");
    const customer = await this.customer(order.userId);
    const suffix = [...createHash("sha256").update(order.id).digest().subarray(0, 8)].map(n => String.fromCharCode(97 + n % 26)).join("");
    try {
      const session = await api.checkout.sessions.create({ mode: "subscription", customer,
        // This integration uses standard Checkout + our own billing/refund policy, not
        // Stripe's separate merchant-of-record product (which some accounts default to).
        managed_payments: { enabled: false },
        client_reference_id: order.id, metadata: { application: "judge.tw", paymentId: order.id },
        integration_identifier: `judge-pro-${suffix}`,
        line_items: [{ quantity: 1, price_data: { currency: "twd", unit_amount: order.amountNtd * 100, product: order.stripeProductId!, recurring: { interval: order.period === "YEARLY" ? "year" : "month" } } }],
        subscription_data: { billing_mode: { type: "flexible" }, metadata: { application: "judge.tw", paymentId: order.id, userId: order.userId } },
        expires_at: Math.floor(+order.stripeCheckoutExpiresAt / 1000),
        success_url: `${config.origin}/upgrade/checkout?period=${order.period}&provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.origin}/upgrade/checkout?period=${order.period}&provider=stripe&cancelled=1`,
      }, { idempotencyKey: `judge:checkout:${order.id}` });
      await prisma.payment.update({ where: { id: order.id }, data: { stripeCheckoutId: session.id } });
      if (!session.url) throw new ServiceUnavailableException("Stripe checkout is unavailable");
      return { provider: "stripe" as const, url: session.url, sandbox: !config.livemode };
    } catch (error) {
      this.logger.warn({ event: "stripe_checkout_failed", paymentId: order.id,
        code: error instanceof Stripe.errors.StripeError ? error.code ?? error.type : "LOCAL_PERSISTENCE_FAILED",
        requestId: error instanceof Stripe.errors.StripeError ? error.requestId : undefined });
      if (error instanceof Stripe.errors.StripeInvalidRequestError) await prisma.payment.updateMany({ where: { id: order.id, status: "PENDING", stripeCheckoutId: null }, data: { status: "REJECTED" } });
      throw new ServiceUnavailableException("Could not prepare Stripe checkout. Please retry or contact support.");
    }
  }

  async dismiss(order: Payment) {
    if (!order.stripeCheckoutId) { await this.checkoutFor(order); order = await prisma.payment.findUniqueOrThrow({ where: { id: order.id } }); }
    const api = this.gateway.client(), session = await api.checkout.sessions.retrieve(order.stripeCheckoutId!);
    if (session.status === "complete") throw new ConflictException("Payment is processing and cannot be dismissed.");
    const expired = session.status === "expired" ? session : await api.checkout.sessions.expire(session.id);
    await this.expireOrder(expired);
    return { ok: true };
  }
  private async expireOrder(session: Stripe.Checkout.Session) {
    if (session.status !== "expired") return;
    await prisma.payment.updateMany({ where: { stripeCheckoutId: session.id, method: "STRIPE", status: "PENDING" }, data: { status: "REJECTED", dismissedByUser: true } });
  }

  /** End renewal at Stripe immediately, without proration; keep already-paid local access. */
  async cancelSubscription(userId: string) {
    const sub = await prisma.subscription.findFirst({ where: { userId, provider: "STRIPE", status: "ACTIVE" } });
    if (!sub?.stripeSubscriptionId) throw new NotFoundException("No active Stripe subscription found.");
    return this.cancelSpecificSubscription(sub.id, userId, sub.stripeSubscriptionId);
  }

  private async cancelSpecificSubscription(localId: string, userId: string, stripeId: string) {
    const api = this.gateway.client(), remote = await api.subscriptions.retrieve(stripeId);
    const context = await this.subscriptionContext(remote);
    if (!context || context.order.userId !== userId) throw new StripeReviewError("SUBSCRIPTION_OWNER_MISMATCH");
    const canceled = terminal(remote) ? remote : await api.subscriptions.cancel(remote.id, { invoice_now: false, prorate: false });
    if (!terminal(canceled)) throw new ServiceUnavailableException("Stripe cancellation is not confirmed");
    const user = await prisma.$transaction(async tx => {
      await lockUser(tx, userId);
      await tx.subscription.update({ where: { id: localId }, data: { status: "CANCELLED", stripeState: canceled.status, cancelledAt: new Date() } });
      const otherActive = await tx.subscription.count({ where: { userId, status: "ACTIVE" } });
      return tx.user.update({ where: { id: userId }, data: { planCancelRequested: otherActive === 0 } });
    });
    return { plan: "PRO" as const, planExpiresAt: user.planExpiresAt };
  }

  async portal(userId: string) {
    const config = this.gateway.config(), api = this.gateway.client();
    if (!config.portalConfigurationId) throw new ServiceUnavailableException("Stripe customer portal is not configured");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.stripeCustomerId || user.stripeLivemode !== config.livemode) throw new NotFoundException("No Stripe customer found");
    // Refuse dashboard configurations that could silently break grandfathered prices or our
    // first-payment refund policy. Cancellation stays in the site's shared billing workflow.
    const portal = await api.billingPortal.configurations.retrieve(config.portalConfigurationId);
    if (!portal.active || portal.features.subscription_update.enabled || portal.features.subscription_cancel.enabled) throw new ServiceUnavailableException("Stripe portal configuration needs review");
    return api.billingPortal.sessions.create({ customer: user.stripeCustomerId, configuration: portal.id, return_url: `${config.origin}/upgrade` }).then(s => ({ url: s.url }));
  }

  async webhook(raw: Buffer, signature: string) {
    const config = this.gateway.config(), api = this.gateway.client();
    let event: Stripe.Event;
    try { event = api.webhooks.constructEvent(raw, signature, config.webhookSecret); }
    catch { throw new BadRequestException("Invalid Stripe webhook signature"); }
    if (event.livemode !== config.livemode || event.account) throw new BadRequestException("Stripe webhook environment mismatch");
    if (!(STRIPE_EVENTS as readonly string[]).includes(event.type)) return { received: true };
    const objectId = (event.data.object as { id: string }).id;
    const receipt = await prisma.stripeWebhookEvent.upsert({ where: { id: event.id }, create: { id: event.id, type: event.type, objectId, livemode: event.livemode }, update: {} });
    if (receipt.processedAt) return { received: true };
    await prisma.stripeWebhookEvent.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } });
    try {
      if (event.type.startsWith("checkout.session.")) {
        const session = await api.checkout.sessions.retrieve(objectId);
        if (session.metadata?.application === "judge.tw") {
          if (session.status === "expired") await this.expireOrder(session);
          const subId = idOf(session.subscription);
          if (subId) { await this.syncSubscription(subId); const sub = await api.subscriptions.retrieve(subId); const invoiceId = idOf(sub.latest_invoice); if (invoiceId) await this.syncInvoice(invoiceId); }
        }
      } else if (event.type.startsWith("customer.subscription.")) await this.syncSubscription(objectId);
      else if (event.type === "invoice.paid") await this.syncInvoice(objectId);
      else if (event.type === "invoice.payment_failed") {
        const invoice = await api.invoices.retrieve(objectId), sub = idOf(invoice.parent?.subscription_details?.subscription);
        if (sub) await this.syncSubscription(sub);
      } else if (event.type === "charge.refunded") await this.syncChargeRefund(objectId);
      else if (event.type === "refund.updated" || event.type === "refund.failed") {
        const refund = await api.refunds.retrieve(objectId); const charge = idOf(refund.charge);
        if (charge) await this.syncChargeRefund(charge);
        if (refund.status === "failed" || refund.status === "canceled") throw new StripeReviewError("REFUND_FAILED");
      }
      await prisma.stripeWebhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date(), errorCode: null } });
    } catch (error) {
      // Persist only controlled codes, never a Stripe response/customer payload or API key.
      const review = error instanceof StripeReviewError;
      await prisma.stripeWebhookEvent.update({ where: { id: event.id }, data: { errorCode: review ? error.code : "PROCESSING_FAILED", reviewRequired: review, ...(review ? { processedAt: new Date() } : {}) } });
      if (!review) throw new ServiceUnavailableException("Stripe event processing is pending. Retry delivery.");
    }
    return { received: true };
  }

  private async subscriptionContext(remote: Stripe.Subscription) {
    if (remote.metadata.application !== "judge.tw" || !remote.metadata.paymentId) return null;
    const order = await prisma.payment.findUnique({ where: { id: remote.metadata.paymentId } });
    if (!order || order.method !== "STRIPE") throw new StripeReviewError("ORDER_NOT_FOUND");
    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (!user || user.stripeCustomerId !== idOf(remote.customer) || order.stripeLivemode !== remote.livemode || remote.livemode !== this.gateway.config().livemode || remote.metadata.userId !== order.userId) throw new StripeReviewError("SUBSCRIPTION_OWNER_MISMATCH");
    return { order, user };
  }
  async syncSubscription(id: string) {
    const remote = await this.gateway.client().subscriptions.retrieve(id), context = await this.subscriptionContext(remote);
    if (!context) return;
    const { order } = context;
    await prisma.$transaction(async tx => {
      await lockUser(tx, order.userId);
      const existing = await tx.subscription.findUnique({ where: { stripeSubscriptionId: id } });
      if (existing?.status === "CANCELLED" && !terminal(remote)) return; // An older in-flight read cannot revive a canceled subscription.
      const other = await tx.subscription.findFirst({ where: { userId: order.userId, status: "ACTIVE", OR: [{ stripeSubscriptionId: null }, { stripeSubscriptionId: { not: id } }] } });
      if (other && !terminal(remote)) throw new StripeReviewError("DUPLICATE_SUBSCRIPTION");
      const values = { provider: "STRIPE", stripeSubscriptionId: id, stripeState: remote.status, stripeCurrentPeriodEnd: remote.items.data[0] ? new Date(remote.items.data[0].current_period_end * 1000) : null,
        status: terminal(remote) ? "CANCELLED" as const : "ACTIVE" as const, cancelledAt: terminal(remote) ? new Date((remote.canceled_at ?? remote.created) * 1000) : null };
      const sub = await tx.subscription.upsert({ where: { stripeSubscriptionId: id }, create: { ...values, userId: order.userId, period: order.period, amountNtd: order.amountNtd, pricingVersion: order.pricingVersion, merchantTradeNo: order.merchantTradeNo! }, update: values });
      await tx.payment.update({ where: { id: order.id }, data: { subscriptionId: sub.id } });
      if (remote.status === "incomplete_expired") await tx.payment.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "REJECTED", dismissedByUser: true } });
      if (terminal(remote) && !other) await tx.user.update({ where: { id: order.userId }, data: { planCancelRequested: true } });
    });
  }

  async syncInvoice(id: string) {
    const api = this.gateway.client(), invoice = await api.invoices.retrieve(id);
    const subscriptionId = idOf(invoice.parent?.subscription_details?.subscription);
    if (!subscriptionId || invoice.status !== "paid") return;
    const remote = await api.subscriptions.retrieve(subscriptionId), context = await this.subscriptionContext(remote);
    if (!context) return;
    const { order } = context, lines = await api.invoices.listLineItems(id, { limit: 2 });
    const line = lines.data[0], priceId = idOf(line?.pricing?.price_details?.price);
    if (!line || lines.has_more || lines.data.length !== 1 || !priceId || line.quantity !== 1 || line.parent?.subscription_item_details?.proration) throw new StripeReviewError("INVOICE_LINES_MISMATCH");
    const price = await api.prices.retrieve(priceId);
    const expected = order.amountNtd * 100;
    if (invoice.livemode !== order.stripeLivemode || invoice.currency !== "twd" || invoice.total !== expected || invoice.amount_paid !== expected || invoice.amount_remaining !== 0 ||
      idOf(invoice.customer) !== context.user.stripeCustomerId || line.amount !== expected || price.unit_amount !== expected || price.currency !== "twd" || idOf(price.product) !== order.stripeProductId ||
      price.recurring?.interval !== (order.period === "YEARLY" ? "year" : "month") || price.recurring?.interval_count !== 1 || line.period.end <= line.period.start) throw new StripeReviewError("INVOICE_TERMS_MISMATCH");
    const payments = await api.invoicePayments.list({ invoice: id, status: "paid", limit: 2 });
    const paid = payments.data[0], piId = idOf(paid?.payment.payment_intent);
    if (!paid || payments.has_more || payments.data.length !== 1 || !piId || paid.amount_paid !== expected || paid.currency !== "twd") throw new StripeReviewError("INVOICE_PAYMENT_MISMATCH");
    const pi = await api.paymentIntents.retrieve(piId), chargeId = idOf(pi.latest_charge);
    if (pi.status !== "succeeded" || pi.amount_received !== expected || pi.currency !== "twd" || idOf(pi.customer) !== context.user.stripeCustomerId || !chargeId) throw new StripeReviewError("PAYMENT_NOT_CONFIRMED");
    const charge = await api.charges.retrieve(chargeId);
    if (charge.amount_refunded > 0 && charge.amount_refunded < expected) throw new StripeReviewError("PARTIAL_REFUND_REQUIRES_REVIEW");
    await this.syncSubscription(subscriptionId);
    await prisma.$transaction(async tx => {
      await lockUser(tx, order.userId);
      if (await tx.payment.findUnique({ where: { stripeInvoiceId: id } })) return;
      const sub = await tx.subscription.findUniqueOrThrow({ where: { stripeSubscriptionId: subscriptionId } });
      const first = await tx.payment.findUniqueOrThrow({ where: { id: order.id } });
      const isFirst = invoice.billing_reason === "subscription_create";
      if (!isFirst && invoice.billing_reason !== "subscription_cycle") throw new StripeReviewError("UNEXPECTED_INVOICE_REASON");
      if (isFirst && first.stripeInvoiceId && first.stripeInvoiceId !== id) throw new StripeReviewError("FIRST_INVOICE_MISMATCH");
      // Use the actual invoice service interval, not webhook arrival time. A fixed pre-existing
      // access offset preserves an early renewal without extending twice on reordered invoices.
      const offset = Math.max(0, +(order.stripeAccessNotBeforeAt ?? new Date(0)) - remote.start_date * 1000);
      const start = new Date(line.period.start * 1000 + offset), end = new Date(line.period.end * 1000 + offset);
      const paidAt = new Date((invoice.status_transitions.paid_at ?? invoice.created) * 1000);
      const refunded = charge.amount_refunded >= expected;
      const data = { stripeInvoiceId: id, stripePaymentIntentId: piId, subscriptionId: sub.id, status: refunded ? "REFUNDED" as const : "APPROVED" as const,
        paidAt, refundDeadlineAt: refundDeadline(paidAt), entitlementStartsAt: start, entitlementEndsAt: end, reviewedAt: new Date(), reviewedBy: "STRIPE_WEBHOOK", dismissedByUser: false };
      if (isFirst) await tx.payment.update({ where: { id: order.id }, data });
      else await tx.payment.create({ data: { ...data, userId: order.userId, period: order.period, amountNtd: order.amountNtd, pricingVersion: order.pricingVersion, method: "STRIPE", isRecurring: true, stripeLivemode: order.stripeLivemode, stripeProductId: order.stripeProductId, refundPolicyVersion: REFUND_POLICY_VERSION } });
      if (!refunded) {
        await tx.$executeRaw`SELECT 1 FROM users WHERE id = ${order.userId} FOR UPDATE`;
        const user = await tx.user.findUniqueOrThrow({ where: { id: order.userId } });
        const expiry = new Date(Math.max(+(user.planExpiresAt ?? new Date(0)), +end));
        const active = await tx.subscription.count({ where: { userId: user.id, status: "ACTIVE" } });
        await tx.user.update({ where: { id: user.id }, data: { plan: +expiry > Date.now() ? "PRO" : user.plan, planExpiresAt: expiry, planCancelRequested: active === 0 } });
      }
      await tx.subscription.update({ where: { id: sub.id }, data: { totalSuccessTimes: { increment: 1 } } });
    });
    // A refund may reach us before invoice.paid, when the PaymentIntent isn't mapped yet.
    // Now that it is mapped, also stop this specific subscription's future charges.
    if (charge.amount_refunded >= expected) await this.syncChargeRefund(chargeId);
  }

  async processRefund(id: string) {
    const token = randomUUID();
    const claimed = await prisma.refundRequest.updateMany({ where: { id, provider: "STRIPE", status: "REQUESTED", nextAttemptAt: { lte: new Date() } }, data: { status: "PROCESSING", processingToken: token, attempts: { increment: 1 } } });
    if (!claimed.count) return;
    const request = await prisma.refundRequest.findUniqueOrThrow({ where: { id } });
    try {
      const api = this.gateway.client(), payment = await prisma.payment.findUniqueOrThrow({ where: { id: request.paymentId } });
      if (payment.method !== "STRIPE" || !payment.stripePaymentIntentId || payment.amountNtd !== request.amountNtd || payment.stripeLivemode !== this.gateway.config().livemode) throw new StripeReviewError("REFUND_PAYMENT_MISMATCH");
      const sub = payment.subscriptionId ? await prisma.subscription.findUnique({ where: { id: payment.subscriptionId } }) : null;
      if (!sub?.stripeSubscriptionId) throw new StripeReviewError("REFUND_SUBSCRIPTION_MISSING");
      await this.cancelSpecificSubscription(sub.id, payment.userId, sub.stripeSubscriptionId);
      await prisma.refundRequest.update({ where: { id }, data: { cancellationConfirmedAt: new Date() } });
      let refund: Stripe.Refund | null = request.stripeRefundId ? await api.refunds.retrieve(request.stripeRefundId) : null;
      if (!refund) {
        const existing = await api.refunds.list({ payment_intent: payment.stripePaymentIntentId, limit: 100 });
        refund = existing.data.find(r => r.metadata?.judgeRefundId === id) ?? null;
        if (!refund && (existing.data.length || existing.has_more)) throw new StripeReviewError("EXISTING_REFUND_REQUIRES_REVIEW");
        if (!refund) {
          if (Date.now() - +request.requestedAt > 23 * 3600000 && request.attempts > 1) throw new StripeReviewError("REFUND_IDEMPOTENCY_WINDOW_EXPIRED");
          await prisma.refundRequest.update({ where: { id }, data: { inFlightAction: "STRIPE_REFUND" } });
          refund = await api.refunds.create({ payment_intent: payment.stripePaymentIntentId, amount: request.amountNtd * 100, metadata: { application: "judge.tw", judgeRefundId: id } }, { idempotencyKey: `judge:refund:${id}` });
        }
      }
      await prisma.refundRequest.update({ where: { id }, data: { stripeRefundId: refund.id, inFlightAction: null } });
      if (refund.status === "failed" || refund.status === "canceled") throw new StripeReviewError("REFUND_FAILED");
      if (refund.status !== "succeeded") {
        await prisma.refundRequest.updateMany({ where: { id, status: "PROCESSING", processingToken: token }, data: { status: "REQUESTED", nextAttemptAt: new Date(Date.now() + 60000), processingToken: null } }); return;
      }
      const chargeId = idOf(refund.charge); if (!chargeId) throw new StripeReviewError("REFUND_CHARGE_MISSING");
      await this.syncChargeRefund(chargeId);
    } catch (error) {
      const review = error instanceof StripeReviewError;
      await prisma.refundRequest.updateMany({ where: { id, status: "PROCESSING", processingToken: token }, data: { status: review ? "NEEDS_REVIEW" : "REQUESTED", nextAttemptAt: new Date(Date.now() + 60000), processingToken: null, lastError: review ? error.code : "Stripe refund pending; retrying safely" } });
    }
  }

  private async syncChargeRefund(id: string) {
    const api = this.gateway.client(), charge = await api.charges.retrieve(id), piId = idOf(charge.payment_intent);
    if (!piId || charge.amount_refunded === 0) return;
    const payment = await prisma.payment.findUnique({ where: { stripePaymentIntentId: piId } });
    if (!payment) return; // invoice.paid independently checks the charge before granting access.
    if (charge.livemode !== payment.stripeLivemode || charge.currency !== "twd" || charge.amount_refunded !== payment.amountNtd * 100) throw new StripeReviewError("PARTIAL_REFUND_REQUIRES_REVIEW");
    const sub = payment.subscriptionId ? await prisma.subscription.findUnique({ where: { id: payment.subscriptionId } }) : null;
    if (sub?.stripeSubscriptionId) await this.cancelSpecificSubscription(sub.id, payment.userId, sub.stripeSubscriptionId);
    await prisma.$transaction(async tx => {
      await lockUser(tx, payment.userId);
      await tx.$executeRaw`SELECT 1 FROM users WHERE id = ${payment.userId} FOR UPDATE`;
      const current = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
      if (current.status !== "REFUNDED") {
        const user = await tx.user.findUniqueOrThrow({ where: { id: payment.userId } });
        if (!payment.entitlementStartsAt || !payment.entitlementEndsAt) throw new StripeReviewError("REFUND_ENTITLEMENT_MISSING");
        if (user.planExpiresAt) await tx.user.update({ where: { id: user.id }, data: { ...accessAfterRefund(user.planExpiresAt, payment.entitlementStartsAt, payment.entitlementEndsAt, new Date()), planCancelRequested: false } });
        await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED", reviewedAt: new Date(), reviewedBy: "STRIPE_REFUND" } });
      }
      await tx.refundRequest.updateMany({ where: { paymentId: payment.id, provider: "STRIPE", status: { not: "COMPLETED" } }, data: { status: "COMPLETED", completedAt: new Date(), refundConfirmedAt: new Date(), cancellationConfirmedAt: new Date(), processingToken: null, inFlightAction: null, lastError: null } });
    });
  }
}
