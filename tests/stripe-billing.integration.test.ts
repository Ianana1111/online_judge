import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "../packages/db/src/index";
import { StripeBillingService } from "../apps/api/src/billing/stripe-billing.service";
import { BillingService } from "../apps/api/src/billing/billing.service";
import { currentBillingCatalog } from "../apps/api/src/billing/pricing.config";
import { stripeConfig, checkoutProvider } from "../apps/api/src/billing/stripe.config";
const Stripe = createRequire(new URL("../apps/api/package.json", import.meta.url))("stripe");
const sdk = new Stripe("sk_test_fixture"), secret = "whsec_fixture";
const accounts: string[] = [], events: string[] = [];
it("keeps Stripe off by default and fails closed on wrong environments or key modes", () => {
  expect(checkoutProvider({})).toBe("ecpay"); expect(stripeConfig({})).toBeNull();
  expect(() => stripeConfig({ BILLING_PROVIDER: "stripe" })).toThrow();
  expect(() => stripeConfig({ STRIPE_ENABLED: "true", STRIPE_MODE: "test", NODE_ENV: "production" })).toThrow();
  expect(() => stripeConfig({ STRIPE_ENABLED: "true", STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_test_fixture" })).toThrow();
});
describe.skipIf(process.env.RUN_DB_TESTS !== "1")("Stripe ledger with isolated PostgreSQL", () => {
  beforeAll(() => { const url = new URL(process.env.DATABASE_URL!); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable DB required"); });
  afterEach(() => vi.unstubAllEnvs());
  afterAll(async () => { await prisma.stripeWebhookEvent.deleteMany({ where: { id: { in: events } } }); await prisma.refundRequest.deleteMany({ where: { userId: { in: accounts } } }); await prisma.user.deleteMany({ where: { id: { in: accounts } } }); await prisma.$disconnect(); });
  async function fixture() {
    const suffix = randomUUID().replaceAll("-", ""), customerId = `cus_${suffix}`, subId = `sub_${suffix}`, start = Math.floor(Date.now() / 1000), end = start + 30 * 86400;
    const user = await prisma.user.create({ data: { handle: `st_${suffix}`, email: `${suffix}@example.test`, stripeCustomerId: customerId, stripeLivemode: false } }); accounts.push(user.id);
    const catalog = currentBillingCatalog();
    const order = await prisma.payment.create({ data: { userId: user.id, method: "STRIPE", period: "MONTHLY", amountNtd: 200, merchantTradeNo: `ST${suffix}`, stripeLivemode: false, stripeProductId: "prod_fixture", pricingVersion: catalog.pricingVersion } });
    const remote = { id: subId, metadata: { application: "judge.tw", paymentId: order.id, userId: user.id }, customer: customerId, livemode: false, status: "active", created: start, start_date: start, canceled_at: null as number | null, items: { data: [{ current_period_end: end }] } };
    const makeInvoice = (id: string, first = true) => ({ id, status: "paid", billing_reason: first ? "subscription_create" : "subscription_cycle", parent: { subscription_details: { subscription: subId } }, currency: "twd", total: 20000, amount_paid: 20000, amount_remaining: 0, livemode: false, customer: customerId, created: start, status_transitions: { paid_at: start } });
    const invoices: Record<string, ReturnType<typeof makeInvoice>> = { first: makeInvoice(`in_${suffix}`), renewal: makeInvoice(`in_renew_${suffix}`, false) };
    let refunded = 0;
    const api = {
      webhooks: sdk.webhooks,
      subscriptions: { retrieve: vi.fn(async () => remote), cancel: vi.fn(async () => { remote.status = "canceled"; remote.canceled_at = start; return remote; }) },
      invoices: { retrieve: vi.fn(async (id: string) => Object.values(invoices).find(i => i.id === id)), listLineItems: vi.fn(async (id: string) => ({ has_more: false, data: [{ amount: 20000, quantity: 1, pricing: { price_details: { price: "price_fixture" } }, parent: { subscription_item_details: { proration: false } }, period: id === invoices.first.id ? { start, end } : { start: end, end: end + 30 * 86400 } }] })) },
      prices: { retrieve: vi.fn(async () => ({ unit_amount: 20000, currency: "twd", product: "prod_fixture", recurring: { interval: "month", interval_count: 1 } })) },
      invoicePayments: { list: vi.fn(async ({ invoice }: { invoice: string }) => ({ has_more: false, data: [{ status: "paid", amount_paid: 20000, currency: "twd", payment: { type: "payment_intent", payment_intent: `pi_${invoice}` } }] })) },
      paymentIntents: { retrieve: vi.fn(async (id: string) => ({ status: "succeeded", amount_received: 20000, currency: "twd", customer: customerId, latest_charge: `ch_${id}` })) },
      charges: { retrieve: vi.fn(async (id: string) => ({ id, payment_intent: id.slice(3), currency: "twd", livemode: false, amount_refunded: refunded })) },
      refunds: { list: vi.fn(async () => ({ data: [], has_more: false })), create: vi.fn(async ({ payment_intent }: { payment_intent: string }) => { refunded = 20000; return { id: `re_${suffix}`, status: "succeeded", charge: `ch_${payment_intent}` }; }) },
      checkout: { sessions: { retrieve: vi.fn(), create: vi.fn(), expire: vi.fn() } },
    };
    const service = new StripeBillingService({ client: () => api, config: () => ({ livemode: false, webhookSecret: secret, productId: "prod_fixture", origin: "https://judge.test" }) } as never);
    const billing = new BillingService(service);
    async function event(type: string, id: string, opts: { eventId?: string; live?: boolean } = {}) {
      const eventId = opts.eventId ?? `evt_${randomUUID().replaceAll("-", "")}`; events.push(eventId);
      const payload = JSON.stringify({ id: eventId, type, livemode: opts.live ?? false, data: { object: { id } } });
      return service.webhook(Buffer.from(payload), sdk.webhooks.generateTestHeaderString({ payload, secret }));
    }
    return { user, order, remote, invoices, api, service, billing, event, start, end, refund: (n: number) => { refunded = n; } };
  }
  it("rejects forged signatures and wrong-mode events before any ledger writes", async () => {
    const f = await fixture();
    await expect(f.service.webhook(Buffer.from("{}"), "forged")).rejects.toThrow("Invalid Stripe webhook signature");
    await expect(f.event("invoice.paid", f.invoices.first.id, { live: true })).rejects.toThrow("environment mismatch");
    expect(f.api.invoices.retrieve).not.toHaveBeenCalled();
  });
  it("deduplicates concurrent deliveries, preserves locked price and handles renewal-before-initial order", async () => {
    const f = await fixture();
    await f.event("invoice.paid", f.invoices.renewal.id);
    const eventId = `evt_${randomUUID()}`;
    await Promise.all([f.event("invoice.paid", f.invoices.first.id, { eventId }), f.event("invoice.paid", f.invoices.first.id, { eventId })]);
    expect(await prisma.payment.count({ where: { userId: f.user.id, status: "APPROVED" } })).toBe(2);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).planExpiresAt?.getTime()).toBe((f.end + 30 * 86400) * 1000);
    vi.stubEnv("LAUNCH_PROMO_STARTS_AT", "2020-01-01T00:00:00Z"); vi.stubEnv("LAUNCH_PROMO_ENDS_AT", "2020-02-01T00:00:00Z"); vi.stubEnv("PRO_REGULAR_YEARLY_PRICE_NTD", "4000");
    await f.event("invoice.paid", f.invoices.renewal.id);
    expect((await prisma.subscription.findUniqueOrThrow({ where: { stripeSubscriptionId: f.remote.id } })).amountNtd).toBe(200);
    expect(await prisma.payment.count({ where: { userId: f.user.id, status: "APPROVED" } })).toBe(2);
  });
  it("flags wrong amounts for operator review without giving Pro", async () => {
    const f = await fixture(); f.invoices.first.amount_paid = 199;
    await f.event("invoice.paid", f.invoices.first.id);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).plan).toBe("FREE");
    expect(await prisma.stripeWebhookEvent.count({ where: { objectId: f.invoices.first.id, reviewRequired: true } })).toBe(1);
  });
  it("cancels renewal through Stripe and preserves access; retries never resurrect it", async () => {
    const f = await fixture(); await f.event("invoice.paid", f.invoices.first.id);
    const before = await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } });
    await f.billing.cancelSubscription(f.user.id);
    expect(f.api.subscriptions.cancel).toHaveBeenCalledWith(f.remote.id, { invoice_now: false, prorate: false });
    await f.event("invoice.paid", f.invoices.first.id);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } });
    expect(after.planExpiresAt).toEqual(before.planExpiresAt); expect(after.planCancelRequested).toBe(true);
    expect((await f.billing.status(f.user.id)).subscription).toBeNull();
  });
  it("refunds the first payment once, immediately removes its access and stops renewal", async () => {
    const f = await fixture(); await f.event("invoice.paid", f.invoices.first.id);
    const r = await f.billing.requestRefund(f.user.id);
    expect(r.status).toBe("COMPLETED"); expect(f.api.refunds.create).toHaveBeenCalledTimes(1);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).plan).toBe("FREE");
    await f.billing.requestRefund(f.user.id); await f.event("charge.refunded", `ch_pi_${f.invoices.first.id}`);
    expect(f.api.refunds.create).toHaveBeenCalledTimes(1);
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: f.order.id } })).status).toBe("REFUNDED");
  });
  it("rejects late refunds and retains access after unpaid renewal failure", async () => {
    const f = await fixture(); await f.event("invoice.paid", f.invoices.first.id);
    await prisma.payment.update({ where: { id: f.order.id }, data: { refundDeadlineAt: new Date(Date.now() - 1000) } });
    await expect(f.billing.requestRefund(f.user.id)).rejects.toThrow("refund window");
    f.remote.status = "past_due"; await f.event("invoice.payment_failed", f.invoices.renewal.id);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).planExpiresAt?.getTime()).toBe(f.end * 1000);
  });
  it("does not grant a refunded invoice delivered after the refund event", async () => {
    const f = await fixture(); f.refund(20000);
    await f.event("charge.refunded", `ch_pi_${f.invoices.first.id}`); await f.event("invoice.paid", f.invoices.first.id);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).plan).toBe("FREE");
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: f.order.id } })).status).toBe("REFUNDED");
    expect(f.api.subscriptions.cancel).toHaveBeenCalledTimes(1);
  });
  it("does not let Stripe adoption create a second active ECPay subscription", async () => {
    const f = await fixture(); await prisma.subscription.create({ data: { userId: f.user.id, period: "MONTHLY", amountNtd: 200, merchantTradeNo: `EC${randomUUID()}` } });
    await f.event("invoice.paid", f.invoices.first.id);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).plan).toBe("FREE");
    expect(await prisma.stripeWebhookEvent.count({ where: { objectId: f.invoices.first.id, errorCode: "DUPLICATE_SUBSCRIPTION" } })).toBe(1);
  });
  it("partial external refunds require review and do not revoke a whole paid period", async () => {
    const f = await fixture(); await f.event("invoice.paid", f.invoices.first.id); f.refund(10000);
    await f.event("charge.refunded", `ch_pi_${f.invoices.first.id}`);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).plan).toBe("PRO");
    expect(await prisma.stripeWebhookEvent.count({ where: { objectId: `ch_pi_${f.invoices.first.id}`, reviewRequired: true } })).toBe(1);
  });
  it("retries transient webhook failures without consuming the event", async () => {
    const f = await fixture(), eventId = `evt_${randomUUID()}`;
    f.api.invoices.retrieve.mockRejectedValueOnce(new Error("Network unavailable"));
    await expect(f.event("invoice.paid", f.invoices.first.id, { eventId })).rejects.toThrow("Retry delivery");
    expect((await prisma.stripeWebhookEvent.findUniqueOrThrow({ where: { id: eventId } })).processedAt).toBeNull();
    await f.event("invoice.paid", f.invoices.first.id, { eventId });
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).plan).toBe("PRO");
  });
  it("an old cancellation cannot mark a newer active subscription as canceled", async () => {
    const f = await fixture(); await f.event("invoice.paid", f.invoices.first.id);
    await f.billing.cancelSubscription(f.user.id);
    await prisma.subscription.create({ data: { userId: f.user.id, period: "MONTHLY", amountNtd: 400, merchantTradeNo: `EC${randomUUID()}` } });
    await prisma.user.update({ where: { id: f.user.id }, data: { planCancelRequested: false } });
    await f.event("customer.subscription.deleted", f.remote.id);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: f.user.id } })).planCancelRequested).toBe(false);
  });
  it("does not authorize Stripe orders through the ECPay poller", async () => {
    const f = await fixture(); await f.billing.markCreditAuthorized(f.order.merchantTradeNo!, "external");
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: f.order.id } })).status).toBe("PENDING");
  });
  it("rejects changed quotes and reuses one pending checkout for repeated clicks", async () => {
    const f = await fixture(); await prisma.payment.delete({ where: { id: f.order.id } });
    const catalog = currentBillingCatalog(), quote = { pricingVersion: catalog.pricingVersion, expectedAmountNtd: catalog.effectivePricing.MONTHLY };
    await expect(f.service.createCheckout(f.user.id, "MONTHLY", { ...quote, expectedAmountNtd: 1 })).rejects.toThrow("Pricing changed");
    const session = { id: `cs_${randomUUID()}`, status: "open", url: "https://checkout.stripe.com/c/pay/test_fixture" };
    f.api.checkout.sessions.create.mockResolvedValue(session); f.api.checkout.sessions.retrieve.mockResolvedValue(session);
    await Promise.all([f.service.createCheckout(f.user.id, "MONTHLY", quote), f.service.createCheckout(f.user.id, "MONTHLY", quote)]);
    expect(await prisma.payment.count({ where: { userId: f.user.id } })).toBe(1);
    const calls = f.api.checkout.sessions.create.mock.calls;
    expect(new Set(calls.map(call => call[1].idempotencyKey)).size).toBe(1);
    expect(calls[0][0].line_items[0].price_data.unit_amount).toBe(quote.expectedAmountNtd * 100);
    expect(calls[0][0]).not.toHaveProperty("payment_method_types");
    expect(calls[0][0].subscription_data.billing_mode.type).toBe("flexible");
    expect(calls[0][0].integration_identifier).toMatch(/^judge-pro-[a-z]{8}$/);
  });
});
