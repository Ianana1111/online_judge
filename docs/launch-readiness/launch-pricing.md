# Pro launch pricing and renewal protection

Status: implemented; production campaign dates and the post-offer annual price await the owner's decision. An unset campaign preserves the existing NT$200/month and NT$2,000/year without advertising a launch discount. Test dates are fixtures, not an approved launch schedule.

## Customer terms

- During one fixed calendar month, new orders offer NT$200/month or NT$2,000/year. The comparison is explicitly **monthly price after the offer: NT$350**, not a claim that NT$350 was historically charged.
- Eligibility is recorded when the subscription order is created before the published Taiwan-time deadline. The first successful payment activates the saved subscription terms. Existing payable orders keep their saved amount even when the first callback arrives later.
- Every uninterrupted renewal of that same subscription and billing period uses its original amount. No campaign expiry or configuration change reprices existing orders or subscriptions.
- Cancellation or a refund that terminates the subscription ends that subscription's price lock. Switching month/year currently requires cancellation and a new subscription at the then-current price; there is no automatic transfer of eligibility. Cancellation preserves already-paid access, subject to the refund policy.
- Gateway payment retries do not change the saved amount. Gateway-terminated subscriptions need operator reconciliation. This change does not implement card replacement or gateway subscription-status synchronization.
- The public launch advertisement expires. Qualified active subscribers continue to see their saved amount and launch price-lock badge. Existing legacy subscriptions also retain their amount, without being relabelled as launch purchases.

## Activation

Set all three API variables together only after the owner confirms them:

| Variable | Required value |
| --- | --- |
| `LAUNCH_PROMO_STARTS_AT` | Fixed ISO timestamp with timezone; owner decision pending |
| `LAUNCH_PROMO_ENDS_AT` | Start plus one calendar month in Asia/Taipei; owner decision pending |
| `PRO_REGULAR_YEARLY_PRICE_NTD` | Approved positive integer, at least 2000; owner decision pending |

The regular monthly price is NT$350. A completely empty configuration keeps current pricing. Partial/invalid configuration returns 503 for the catalog and new checkout; existing payment callbacks and renewals continue using stored terms. Do not reset dates on deployments or remove the configuration at expiry: doing so would restore legacy pricing for new orders.

Deploy migration `20260916000000_launch_subscription_pricing` before the new API. It adds `pricingVersion` to payments and subscriptions, with `legacy-v1` for existing rows, and does not change any saved amount. Back up the production database before applying. Deploy API and web with the campaign unset, verify both, then configure the approved schedule. Old clients may still create an unquoted order only while the catalog is entirely unconfigured at unchanged legacy prices. Once a campaign is configured, an old client must reload and acknowledge the current quote.

## Engineering safeguards

- The catalog, checkout and registration notification use the same server-side campaign evaluation, with inclusive start and exclusive end. Catalog responses use `Cache-Control: no-store`.
- New checkout evaluates pricing after acquiring the per-user PostgreSQL advisory lock. The browser submits the displayed amount and pricing version as consent, never as the source of truth. Mismatch returns `409 PRICE_CHANGED` before creating an order or returning a gateway form.
- The price version snapshots campaign dates, regular annual price and phase. It is copied from the order to the subscription and every renewal payment. First and recurring gateway amounts remain independently validated against stored amounts.
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
