# Pro launch pricing and renewal protection

Current owner decision (2026-09-16): genuine fixed one-month enrollment campaign with **NT$200/month or NT$2,000/year for every renewal** of that same uninterrupted subscription. After enrollment ends, new subscriptions cost **NT$400/month or NT$4,000/year**, also fixed for their renewals. Cancellation and resubscription use the price then available. This supersedes perpetual public discount advertising and the subsequently withdrawn first-cycle-only proposal. Existing saved agreements remain unchanged. ECPay AIO supports this because first and recurring amounts are equal.

## Customer terms

- During one fixed calendar month, new orders offer NT$200/month or NT$2,000/year. The comparison is explicitly **monthly price after the offer: NT$400**, not a claim that NT$400 was historically charged.
- Eligibility is recorded when the subscription order is created before the published Taiwan-time deadline. The first successful payment activates the saved subscription terms. Existing payable orders keep their saved amount even when the first callback arrives later.
- Every uninterrupted renewal of that same subscription and billing period uses its original amount. No campaign expiry or configuration change reprices existing orders or subscriptions.
- Cancellation or a refund that terminates the subscription ends that subscription's price lock. Switching month/year currently requires cancellation and a new subscription at the then-current price; there is no automatic transfer of eligibility. Cancellation preserves already-paid access, subject to the refund policy.
- Gateway payment retries do not change the saved amount. Gateway-terminated subscriptions need operator reconciliation. This change does not implement card replacement or gateway subscription-status synchronization.
- The public launch advertisement expires. Qualified active subscribers continue to see their saved amount and launch price-lock badge. Existing legacy subscriptions also retain their amount, without being relabelled as launch purchases.

## Campaign activation

Set all three API variables together after verifying both deployed applications. The campaign starts at activation and runs one Taipei calendar month; save these exact dates once:

| Variable | Required value |
| --- | --- |
| `LAUNCH_PROMO_STARTS_AT` | Fixed ISO timestamp with timezone; fixed activation timestamp |
| `LAUNCH_PROMO_ENDS_AT` | Fixed ISO timestamp with timezone, strictly after `LAUNCH_PROMO_STARTS_AT` |
| `PRO_REGULAR_YEARLY_PRICE_NTD` | 4000 |

The regular monthly price is NT$400. A completely empty configuration keeps current pricing. Partial/invalid configuration returns 503 for the catalog and new checkout; existing payment callbacks and renewals continue using stored terms. Do not reset dates on deployments or remove the configuration at expiry: doing so would restore legacy pricing for new orders.

`LAUNCH_PROMO_ENDS_AT` is validated only as "a real ISO instant after start" — it is not required to be exactly one calendar month after `LAUNCH_PROMO_STARTS_AT`. To extend an already-running campaign's deadline, set only `LAUNCH_PROMO_ENDS_AT` to the new later instant and leave `LAUNCH_PROMO_STARTS_AT` untouched: changing `startsAt` on a live campaign would move it into the future and flip the catalog to "not started yet" for new checkout until that date arrives. Setting `LAUNCH_PROMO_ENDS_AT` to anything on or before `LAUNCH_PROMO_STARTS_AT`, or to a non-ISO value, is invalid configuration and returns 503 — verify the new value against `GET /billing/plans` immediately after the resulting redeploy.

Deploy migration `20260916000000_launch_subscription_pricing` before the new API. It adds `pricingVersion` to payments and subscriptions, with `legacy-v1` for existing rows, and does not change any saved amount. Back up the production database before applying. Deploy API and web with the campaign unset, verify both, then configure the approved schedule. Old clients may still create an unquoted order only while the catalog is entirely unconfigured at unchanged legacy prices. Once a campaign is configured, an old client must reload and acknowledge the current quote.

## Engineering safeguards

- The catalog, checkout and registration notification use the same server-side campaign evaluation, with inclusive start and exclusive end. Catalog responses use `Cache-Control: no-store`.
- New checkout evaluates pricing after acquiring the per-user PostgreSQL advisory lock. The browser submits the displayed amount and pricing version as consent, never as the source of truth. Mismatch returns `409 PRICE_CHANGED` before creating an order or returning a gateway form.
- The price version snapshots campaign dates, regular monthly/annual prices and phase (`launch-v2`; old `launch-v1` subscriptions remain recognized). It is copied from the order to the subscription and every renewal payment. First and recurring gateway amounts remain independently validated against stored amounts.
- Browser prices refresh at the server-provided boundary, on focus and periodically. Expired offers disappear even if refreshing fails. The monotonic browser timer includes request time conservatively; the API is the final authority. Changed quotes or billing periods require renewed consent.
- Each streamed pricing consumer starts with the server's loading state during hydration before reading a populated client cache. The site-wide banner may otherwise populate pricing before the upgrade page initializes.
- ECPay `TotalAmount` and `PeriodAmount` are equal. Renewal amounts come from `Subscription.amountNtd`; these operations do not re-evaluate today's catalog.
- No actual card charge, cancellation, refund or outbound email is performed by the automated tests. The E2E checkout target is fully intercepted; integration gateway actions are mocked.

## Validation

- Pure pricing tests: unset/partial configuration, exact Taipei boundaries, calendar-month clamping, invalid dates, quote changes with unchanged annual amounts, and no restarting an expired campaign.
- PostgreSQL tests: monthly/yearly creation, late first callback, repeated renewals, configuration outage during renewals, tampered/stale/missing consent, concurrent orders, cancellation/new pricing, and legacy rollout compatibility.
- Browser tests: desktop/mobile, light/dark, English/Traditional Chinese, annual selection and consent, quote expiry/offline refresh, persistent subscriber badge, cancellation disclosure and WCAG AA checks.

Production activation and a real owner-operated payment smoke test remain separate from these automated checks.

Local backend evidence (September 15): typecheck, lint, API build and production web build passed. The full PostgreSQL/Redis test run passed 165 tests (65 environment-specific tests skipped); the focused billing integration suite passed all 20 tests, including eight launch-pricing cases. No production data was migrated by these checks.

Final production-mode browser run: **35/35 passed** across desktop Chromium, mobile Chromium, Firefox, desktop WebKit and iOS WebKit. An earlier WebKit hydration failure occurred immediately after the layout's shared pricing response; the pricing hook now preserves the server's initial state through hydration. The final suite includes a delayed page-bundle scenario and checks for initialization errors. Local evidence: `/private/tmp/oj-launch-pricing-verified.log` and `/private/tmp/oj-launch-pricing-verified/` (screenshots). These are local fixtures, not live customer transactions.
