# Stripe standby integration

## Status and plan

Implemented on 2026-09-30 for judge.tw's CPE/GPE practice platform. **Production continues using ECPay.** Stripe is disabled unless explicitly configured; no Stripe test key belongs in Railway production or Vercel.

The requested `stripe@openai-curated` plugin was installed. Its MCP server at `https://mcp.stripe.com` was reached with the supplied test key and `stripe_implementation_planner` produced an accepted plan, guide `iguide_61VUgGhgdU60M7o7j41AESN0t7LVq`. No fallback skill installation was necessary. Interactive OAuth is separate from the test-key-authenticated MCP session and may still require completion in a new Codex session.

Chosen architecture: hosted Checkout, flat monthly/yearly subscriptions, flexible billing, dynamic payment methods, custom cancellation/refund policy, and a restricted customer portal for payment methods and invoices. Uses `stripe` 22.6.2 and API `2026-08-26.dahlia`. Tax treatment is **unresolved**, not assumed exempt.

Implementation sequence completed:

1. Add provider fields to the existing payment/subscription/refund ledgers; preserve ECPay defaults.
2. Add Checkout, signed webhook processing, locked subscription prices, cancellation, refunds and operator diagnostics.
3. Add conditional frontend checkout/portal actions without changing the existing ECPay flow.
4. Verify PostgreSQL integration and real Stripe test-mode transactions; provide repeatable smoke commands below.

## Contract and safeguards

- `BILLING_PROVIDER` selects **new** checkout only. Existing payments always use their recorded provider for callbacks, cancellations and refunds. Old ECPay cards/subscriptions are never silently migrated to Stripe.
- The server calculates the quote and validates pricing version. Default unconfigured campaign prices remain NT$200/month and NT$2,000/year. Configured campaigns retain the existing site's NT$200/2,000 then NT$400/4,000 rules. Each subscription keeps its original amount; canceling and buying again uses the current quote.
- TWD API amounts use minor units: NT$200 → `20000`, NT$2,000 → `200000`. A subscription uses a price fixed at purchase, never a mutable current-price lookup on renewal.
- One active subscription per account across both providers. PostgreSQL advisory locking and Stripe idempotency keys prevent repeated clicks from creating multiple payable orders. Checkout reservations expire in one hour.
- Redirects do not grant Pro. Verified webhooks retrieve current Stripe objects, validate customer/product/currency/amount/interval, and require a successful actual PaymentIntent before granting the invoice's service period.
- Unique invoice IDs deduplicate delivery. Invoice service dates, rather than notification arrival time, prevent duplicate or reordered webhooks from adding extra months. Prepaid access at checkout is retained as a fixed entitlement offset.
- Canceling stops future Stripe charges immediately, without proration; local paid access remains through its expiry. Cancellation targets the specific subscription so a late old event cannot cancel a newer subscription.
- The first successful card/Stripe purchase across both providers is eligible for the existing seven-day, once-per-account refund policy. A successful full refund removes only the unused entitlement funded by that payment. A pending/failed refund does not falsely claim money was returned.
- Partial or unexpected external refunds require operator review. Full external refunds are synchronized, including refund-before-invoice notification order.
- Portal subscription changes/cancellation are disabled and verified at runtime. The site's own flow handles refunds and price-lock consequences. Portal links belong to the authenticated customer only.
- Webhook input stays as raw bytes, uses Stripe's signature/timestamp validation, rejects wrong test/live mode and Connect account events. Other authenticated mutations still require CSRF. Test mode is refused when `NODE_ENV=production`.
- Stripe checkout explicitly uses `managed_payments.enabled=false`. This is **standard Stripe Checkout**, not Stripe's merchant-of-record product. This test account defaults to Managed Payments, which otherwise rejects products without a tax code. Its account-wide settings were not changed.

## Endpoints

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET /billing/plans` | Public | Current quote and `checkoutProvider` |
| `POST /billing/checkout` | Signed-in + CSRF | Select configured provider; server-validated price |
| `POST /billing/ecpay/create` | Signed-in + CSRF | Existing ECPay endpoint, blocked when new checkout selects Stripe |
| `POST /billing/stripe/webhook` | Stripe signature | Payment/subscription/refund synchronization |
| `POST /billing/stripe/portal` | Signed-in + CSRF | Payment-method and invoice management |
| `GET /billing/stripe/readiness` | Administrator | Non-secret configuration status and pending/review events |
| `POST /billing/subscription/cancel` | Signed-in + CSRF | Cancel using the recorded provider |
| `POST /billing/refund/request` | Signed-in + CSRF | Shared seven-day refund policy and durable processing |
| `POST /billing/dismiss-pending` | Signed-in + CSRF | Expire unpaid Stripe checkout before dismissing it |

Register snapshot events with the same API version: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `refund.updated`, `refund.failed`.

## Local test setup

Use disposable PostgreSQL `127.0.0.1:55432/oj_test` and Redis `127.0.0.1:56379`. The smoke script refuses other databases and live keys. It never loads the root production `.env`.

```sh
pnpm db:generate
DATABASE_URL='postgresql://oj_test:oj_test_local_only@127.0.0.1:55432/oj_test' pnpm --filter @oj/db exec prisma migrate deploy
pnpm --filter @oj/api build

DATABASE_URL='postgresql://oj_test:oj_test_local_only@127.0.0.1:55432/oj_test' \
REDIS_URL='redis://127.0.0.1:56379' \
STRIPE_SECRET_KEY_FILE=/absolute/path/to/private-test-key \
STRIPE_WRITE_LOCAL_ENV=1 \
node scripts/stripe/smoke.mjs
```

The key file must contain only the test secret and have restrictive permissions. Alternatively provide `STRIPE_SECRET_KEY` via a secret manager. Do not paste keys into tracked files or shell history.

The script creates/reuses a test Pro product and portal configuration, tests monthly and annual sessions, makes test-card subscription payments, delivers signed webhook requests to the built HTTP API, checks duplicate handling, cancels, refunds and cleans up its local users and Stripe customers. Test transaction history remains in Stripe; no real money is moved. It saves `.env.stripe.local` with mode `0600` only when requested. Git, Docker and Vercel exclude this file.

To start the backend for interactive testing:

```sh
node --env-file=.env.stripe.local apps/api/dist/main.js
```

In another terminal run the web app with both API origins pointing to `http://127.0.0.1:55440`, on port `55430`. The generated environment uses `NODE_ENV=test` to disable scheduled production processors. Pending refund retries can be exercised by calling `StripeBillingService.processRefund` in tests or by using an isolated development environment with the worker enabled.

**Webhook distinction:** the generated signing secret is only for local replay. For actual Stripe delivery, run `stripe listen --forward-to http://127.0.0.1:55440/billing/stripe/webhook`, replace `STRIPE_WEBHOOK_SECRET` with the listener's secret and restart the API. A deployed staging endpoint uses its own Dashboard endpoint signing secret. Never substitute the API secret for `whsec_...`.

## Evidence and remaining launch gates

Verified against actual test-mode Stripe APIs: hosted Checkout creation in TWD for both periods, restricted portal session creation, successful card capture, signed raw-body HTTP webhook processing, duplicate delivery, Pro activation, cancellation preserving paid access, full refund and entitlement removal. PostgreSQL integration tests additionally cover invalid signatures/modes, wrong totals, reordered renewals, failed renewals, seven-day eligibility, ECPay coexistence, transient retries and stale cancellation events.

The automated smoke uses Stripe's `pm_card_visa` fixture for capture after verifying/expiring the hosted session. It **does not claim** to have completed the external Checkout UI, 3DS challenges, public-network webhook delivery, or live-money transactions. Before switching live, complete those browser/staging checks, including cancellation and failed-card recovery.

Account inspection on 2026-09-30 reported country **JP**, `charges_enabled=false`, `payouts_enabled=false`, `details_submitted=false`. Confirm the account's business country/entity matches your actual Stripe-eligible business and finish onboarding before live activation. Do not change countries merely to bypass eligibility.

Tax registrations, product classification, included/excluded tax and invoicing obligations must be confirmed before live collection. Current totals are fixed and no automatic tax configuration was invented. Enabling an additional tax amount or discounts without changing/validating invoice checks will route those payments to review rather than grant incorrect access. This is a launch gate, not a claim that no tax is due. The merchant-of-record alternative requires a separate approved design and validation.

## Controlled cutover / rollback

1. Back up the database and deploy the additive migration while retaining `BILLING_PROVIDER=ecpay`, `STRIPE_ENABLED=false`.
2. Finish isolated Stripe staging acceptance. Existing ECPay behavior must still pass regression tests.
3. When live onboarding and tax/payment policy are confirmed, configure live API credentials, live Pro product, restricted portal and a live webhook endpoint on Railway. Use a dedicated least-privilege key with permissions for the resources this integration uses; never expose it through `NEXT_PUBLIC_*`. Hosted Checkout does not require the supplied publishable key.
4. Set `STRIPE_ENABLED=true`, `STRIPE_MODE=live`, keep `BILLING_PROVIDER=ecpay`, deploy, and inspect `/billing/stripe/readiness` as administrator. Verify the correct webhook endpoint secret and API version.
5. After live acceptance is explicitly authorized, set `BILLING_PROVIDER=stripe`. The frontend discovers it from `/billing/plans` and uses hosted Checkout. Existing ECPay renewals/cancellations/refunds keep working.
6. Rollback new purchases with `BILLING_PROVIDER=ecpay`. **Keep Stripe enabled and its webhook alive while Stripe subscriptions/payments exist.** Never remove ECPay credentials while ECPay recurring agreements remain.

## Operations and reconciliation

- `/billing/stripe/readiness` exposes only booleans, mode/API version and controlled event codes. Review `pendingEvents`, `reviewEvents`, and `pendingRefunds`; match event/invoice IDs against Stripe Workbench.
- Temporary API/DB failures return HTTP 503 for Stripe redelivery. Contract mismatches are recorded as `reviewRequired=true` and acknowledged to avoid an infinite retry loop. They do not grant Pro. Investigate customer, amount, product and invoice evidence before changing anything.
- After fixing the underlying cause of a review event, an operator may clear **only that reviewed event's** `processedAt`, `reviewRequired` and `errorCode` in a backed-up database, then resend it through Stripe Workbench. Never invent a browser payment confirmation or edit entitlement blindly.
- A checkout created remotely but not saved locally retries with the same idempotency key and expiry. If reconciliation is requested after the safe creation window, look up Checkout by `client_reference_id`/`metadata.paymentId` in Stripe, save the verified session ID and expire it before clearing the pending order. Do not create a second payable session blindly.
- Refunds persist Stripe IDs and idempotency keys. Interrupted workers go to the existing administrator reconciliation queue; an old uncertain retry is not blindly repeated after Stripe's idempotency retention window. Verify actual refund/cancellation evidence first. Partial refunds require a deliberate entitlement decision.
- Configure Stripe failed-payment emails and Smart Retries in its Dashboard before launch. Failed renewal does not extend local paid access. Monitor disputes in Stripe Dashboard; this release does not automate dispute decisions.

References: [Checkout subscriptions](https://docs.stripe.com/billing/subscriptions/build-subscriptions), [webhook signatures and delivery](https://docs.stripe.com/webhooks), [Stripe MCP](https://docs.stripe.com/mcp), [Managed Payments eligibility](https://docs.stripe.com/payments/managed-payments/eligibility), [Stripe Tax setup](https://docs.stripe.com/tax/set-up).
