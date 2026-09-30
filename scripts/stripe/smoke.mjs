/** Real Stripe TEST API + built HTTP API. Never loads the project's production .env. */
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { readFile, writeFile, chmod } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const database = new URL(process.env.DATABASE_URL ?? "invalid:");
if (database.hostname !== "127.0.0.1" || database.port !== "55432" || database.pathname !== "/oj_test" || process.env.REDIS_URL !== "redis://127.0.0.1:56379") throw new Error("Only disposable local test services are allowed");
const key = process.env.STRIPE_SECRET_KEY_FILE ? (await readFile(process.env.STRIPE_SECRET_KEY_FILE, "utf8")).trim() : process.env.STRIPE_SECRET_KEY;
if (!/^(sk|rk)_test_[a-zA-Z0-9]+$/.test(key ?? "")) throw new Error("A test-mode Stripe key is required; live keys are forbidden");
const requireApi = createRequire(new URL("../../apps/api/package.json", import.meta.url));
const Stripe = requireApi("stripe"), { PrismaClient } = requireApi("@prisma/client");
const stripe = new Stripe(key, { apiVersion: "2026-08-26.dahlia", maxNetworkRetries: 2, timeout: 15000 });
const prisma = new PrismaClient({ errorFormat: "minimal" });
const product = (await stripe.products.list({ active: true, limit: 100 })).data.find(p => p.metadata.judgeSetup === "standby-pro-v1") ?? await stripe.products.create({ name: "judge.tw Pro", metadata: { application: "judge.tw", judgeSetup: "standby-pro-v1" } });
assert.equal(product.livemode, false);
const portal = (await stripe.billingPortal.configurations.list({ active: true, limit: 100 })).data.find(p => p.metadata?.judgeSetup === "standby-pro-v1") ?? await stripe.billingPortal.configurations.create({
  business_profile: { headline: "Manage your judge.tw payment details" }, metadata: { judgeSetup: "standby-pro-v1" },
  features: { customer_update: { enabled: false }, invoice_history: { enabled: true }, payment_method_update: { enabled: true }, subscription_cancel: { enabled: false }, subscription_update: { enabled: false } },
});
const signingSecret = `whsec_${randomBytes(32).toString("hex")}`;
const env = { NODE_ENV: "test", BILLING_PROVIDER: "stripe", STRIPE_ENABLED: "true", STRIPE_MODE: "test", STRIPE_SECRET_KEY: key,
  STRIPE_WEBHOOK_SECRET: signingSecret, STRIPE_PRO_PRODUCT_ID: product.id, STRIPE_PORTAL_CONFIGURATION_ID: portal.id,
  DATABASE_URL: process.env.DATABASE_URL, REDIS_URL: process.env.REDIS_URL, WEB_ORIGIN: "http://127.0.0.1:55430", API_HOST: "127.0.0.1", API_PORT: "55440",
  ECPAY_ENV: "sandbox", SENTRY_DSN: "", RESEND_API_KEY: "", ACCOUNT_SECURITY_KEY: randomBytes(32).toString("hex"), ADMIN_MFA_REQUIRED: "false",
  LAUNCH_PROMO_STARTS_AT: "", LAUNCH_PROMO_ENDS_AT: "", PRO_REGULAR_YEARLY_PRICE_NTD: "" };
if (process.env.STRIPE_WRITE_LOCAL_ENV === "1") {
  const path = new URL("../../.env.stripe.local", import.meta.url);
  await writeFile(path, "# TEST ONLY. Webhook secret below is for signed local replay, not a registered endpoint.\n" + Object.entries(env).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join("\n") + "\n", { mode: 0o600 });
  await chmod(path, 0o600);
}
const child = spawn(process.execPath, ["dist/main.js"], { cwd: fileURLToPath(new URL("../../apps/api/", import.meta.url)), env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
let logs = "";
child.stdout.on("data", d => { logs = (logs + d).slice(-5000); });
child.stderr.on("data", d => { logs = (logs + d).slice(-5000); });
const base = "http://127.0.0.1:55440", users = [], customers = [], subscriptions = [], sessions = [], eventIds = [];
async function request(path, { method = "GET", body, account, signed } = {}) {
  const response = await fetch(base + path, { method, headers: { "content-type": "application/json", ...(account ? { cookie: account.cookie, "x-csrf-token": account.csrf } : {}), ...(signed ? { "stripe-signature": signed } : {}) },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body), signal: AbortSignal.timeout(45000) });
  if (account) {
    const cookies = new Map(account.cookie.split("; ").filter(Boolean).map(c => { const i = c.indexOf("="); return [c.slice(0, i), c.slice(i + 1)]; }));
    for (const value of response.headers.getSetCookie()) { const c = value.split(";")[0], i = c.indexOf("="); cookies.set(c.slice(0, i), c.slice(i + 1)); }
    account.cookie = [...cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  return response;
}
async function emit(type, objectId, eventId = `evt_local_${randomUUID().replaceAll("-", "")}`) {
  eventIds.push(eventId);
  const body = JSON.stringify({ id: eventId, type, livemode: false, data: { object: { id: objectId } } });
  const response = await request("/billing/stripe/webhook", { method: "POST", body, signed: stripe.webhooks.generateTestHeaderString({ payload: body, secret: signingSecret }) });
  assert.equal(response.status, 200, `Webhook HTTP status for ${type}`);
  const ledger = await prisma.stripeWebhookEvent.findUniqueOrThrow({ where: { id: eventId } });
  assert.equal(ledger.errorCode, null, `Webhook ledger: ${ledger.errorCode}`);
}
try {
  let healthy = false;
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`API startup failed: ${logs.replaceAll(key, "[redacted]")}`);
    try { healthy = (await request("/health")).ok; } catch {}
    if (healthy) break; await delay(200);
  }
  assert.ok(healthy, "API startup timed out");
  assert.equal((await request("/billing/stripe/webhook", { method: "POST", body: "{}", signed: "forged" })).status, 400);
  assert.equal((await request("/billing/stripe/readiness")).status, 401);
  const plans = await (await request("/billing/plans")).json(); assert.equal(plans.checkoutProvider, "stripe");
  for (const period of ["MONTHLY", "YEARLY"]) {
    const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
    const registered = await request("/auth/register", { method: "POST", body: { handle: `stripe_${suffix}`, email: `${suffix}@example.test`, password: `Test_${randomUUID()}!` } });
    assert.equal(registered.status, 201); const user = await registered.json(); users.push(user.id);
    const account = { cookie: registered.headers.getSetCookie().map(c => c.split(";")[0]).join("; "), csrf: "" };
    account.csrf = (await (await request("/auth/me", { account })).json()).csrfToken;
    assert.equal((await request("/billing/stripe/readiness", { account })).status, 403);
    assert.equal((await request("/billing/stripe/portal", { method: "POST", account: { ...account, csrf: "" } })).status, 403);
    const checkout = await request("/billing/checkout", { method: "POST", account, body: { period, expectedAmountNtd: plans.effectivePricing[period], pricingVersion: plans.pricingVersion } });
    assert.equal(checkout.status, 201, `Checkout HTTP status: ${await checkout.clone().text()}`);
    const target = await checkout.json(); assert.equal(new URL(target.url).hostname, "checkout.stripe.com");
    const order = await prisma.payment.findFirstOrThrow({ where: { userId: user.id } });
    const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutId); sessions.push(session.id);
    assert.equal(session.livemode, false); assert.equal(session.amount_total, plans.effectivePricing[period] * 100);
    const line = (await stripe.checkout.sessions.listLineItems(session.id)).data[0];
    assert.equal(line.price.recurring.interval, period === "YEARLY" ? "year" : "month");
    const customer = (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).stripeCustomerId; customers.push(customer);
    assert.equal((await request("/billing/stripe/portal", { method: "POST", account })).status, 201);
    // Hosted session creation is tested above. Card capture below uses Stripe's test fixture API;
    // browser Checkout/SCA and externally delivered webhooks remain a separate staging gate.
    assert.equal((await request("/billing/dismiss-pending", { method: "POST", account })).status, 201);
    assert.equal((await stripe.checkout.sessions.retrieve(session.id)).status, "expired");
    const pm = await stripe.paymentMethods.attach("pm_card_visa", { customer });
    await stripe.customers.update(customer, { invoice_settings: { default_payment_method: pm.id } });
    const sub = await stripe.subscriptions.create({ customer, items: [{ price_data: { currency: "twd", product: product.id, unit_amount: order.amountNtd * 100, recurring: { interval: period === "YEARLY" ? "year" : "month" } } }], billing_mode: { type: "flexible" }, payment_behavior: "error_if_incomplete",
      metadata: { application: "judge.tw", paymentId: order.id, userId: user.id } }); subscriptions.push(sub.id);
    assert.equal(sub.livemode, false); assert.equal(sub.status, "active");
    const invoiceId = typeof sub.latest_invoice === "string" ? sub.latest_invoice : sub.latest_invoice.id;
    const eventId = `evt_local_${randomUUID().replaceAll("-", "")}`;
    await emit("invoice.paid", invoiceId, eventId); await emit("invoice.paid", invoiceId, eventId);
    const paid = await prisma.payment.findUniqueOrThrow({ where: { id: order.id } }); assert.equal(paid.status, "APPROVED");
    const before = await prisma.user.findUniqueOrThrow({ where: { id: user.id } }); assert.equal(before.plan, "PRO");
    assert.equal((await request("/billing/subscription/cancel", { method: "POST", account })).status, 201);
    assert.equal((await stripe.subscriptions.retrieve(sub.id)).status, "canceled");
    assert.deepEqual((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).planExpiresAt, before.planExpiresAt);
    const refunded = await request("/billing/refund/request", { method: "POST", account }); assert.equal(refunded.status, 201);
    assert.equal((await refunded.json()).status, "COMPLETED");
    const refund = await prisma.refundRequest.findUniqueOrThrow({ where: { userId: user.id } });
    assert.equal((await stripe.refunds.retrieve(refund.stripeRefundId)).status, "succeeded");
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).plan, "FREE");
    console.log(`${period}: hosted Checkout/portal, test card charge, signed HTTP webhook, duplicate delivery, cancel and full refund passed.`);
  }
  console.log("Stripe sandbox smoke passed. No production data or live payments used. Browser/SCA and public webhook delivery were not exercised.");
} finally {
  if (child.exitCode === null) { const exited = once(child, "exit"); child.kill("SIGTERM"); await exited; }
  for (const id of sessions) { try { if ((await stripe.checkout.sessions.retrieve(id)).status === "open") await stripe.checkout.sessions.expire(id); } catch { console.error(`Cleanup required for test session ${id}`); } }
  for (const id of subscriptions) { try { if ((await stripe.subscriptions.retrieve(id)).status !== "canceled") await stripe.subscriptions.cancel(id, { invoice_now: false, prorate: false }); } catch { console.error(`Cleanup required for test subscription ${id}`); } }
  const created = await prisma.user.findMany({ where: { id: { in: users } }, select: { stripeCustomerId: true } });
  for (const id of new Set([...customers, ...created.map(u => u.stripeCustomerId).filter(Boolean)])) { try { await stripe.customers.del(id); } catch { console.error(`Cleanup required for test customer ${id}`); } }
  await prisma.stripeWebhookEvent.deleteMany({ where: { id: { in: eventIds } } });
  await prisma.refundRequest.deleteMany({ where: { userId: { in: users } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.$disconnect();
}
