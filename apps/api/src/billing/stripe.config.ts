export const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;
export const STRIPE_EVENTS = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.expired", "checkout.session.async_payment_failed", "invoice.paid", "invoice.payment_failed", "customer.subscription.updated", "customer.subscription.deleted", "charge.refunded", "refund.updated", "refund.failed"] as const;
export function checkoutProvider(env: NodeJS.ProcessEnv = process.env): "ecpay" | "stripe" {
  const value = env.BILLING_PROVIDER || "ecpay";
  if (value !== "ecpay" && value !== "stripe") throw new Error("BILLING_PROVIDER must be ecpay or stripe");
  return value;
}
export function stripeConfig(env: NodeJS.ProcessEnv = process.env) {
  const enabled = env.STRIPE_ENABLED === "true";
  if (env.STRIPE_ENABLED && !["true", "false"].includes(env.STRIPE_ENABLED)) throw new Error("STRIPE_ENABLED must be true or false");
  if (checkoutProvider(env) === "stripe" && !enabled) throw new Error("Enable Stripe before selecting it for new checkout");
  if (!enabled) return null;
  const mode = env.STRIPE_MODE;
  if (mode !== "test" && mode !== "live") throw new Error("Set STRIPE_MODE explicitly to test or live");
  if (env.NODE_ENV === "production" && mode !== "live") throw new Error("Stripe test mode requires an isolated non-production environment");
  if (!new RegExp(`^(sk|rk)_${mode}_[a-zA-Z0-9]+$`).test(env.STRIPE_SECRET_KEY ?? "")) throw new Error("Stripe key does not match configured mode");
  if (!/^whsec_[a-zA-Z0-9]+$/.test(env.STRIPE_WEBHOOK_SECRET ?? "")) throw new Error("Stripe webhook signing secret is required");
  if (!/^prod_[a-zA-Z0-9]+$/.test(env.STRIPE_PRO_PRODUCT_ID ?? "")) throw new Error("Stripe Pro product is required");
  const origin = (env.WEB_ORIGIN || "http://localhost:3000").split(",")[0].trim();
  const url = new URL(origin);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" || (url.protocol !== "https:" && !(mode === "test" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))) throw new Error("Stripe checkout requires a trusted website origin");
  return { livemode: mode === "live", key: env.STRIPE_SECRET_KEY!, webhookSecret: env.STRIPE_WEBHOOK_SECRET!, productId: env.STRIPE_PRO_PRODUCT_ID!, origin: url.origin, portalConfigurationId: env.STRIPE_PORTAL_CONFIGURATION_ID };
}
