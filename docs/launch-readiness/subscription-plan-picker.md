# Monthly and annual Pro selection

## Visual revision

The owner requested a cleaner design inspired by the official [Claude pricing page](https://claude.com/pricing) and [OpenAI pricing page](https://chatgpt.com/zh-Hant/pricing/), visually reviewed on September 15. The revised layout uses neutral surfaces, a compact month/year selector, prominent prices, and primary actions above the feature lists. Light mode uses white cards, dark mode uses low-chroma surfaces, and the checkout shares the same styles. The Pro card keeps priority on mobile; normal page scrolling replaces nested scrolling. No competitor branding or assets are copied. The NT$350 anchor remains absent because it is not an actual offered price; annual comparison uses the real NT$2,400 monthly total.

Revision validation: typecheck, lint and production web build passed; four desktop/mobile light/dark preview workflows and all **50 production-mode browser tests** passed. The screenshots were visually reviewed. Latest log: `/private/tmp/oj-pricing-design-production.log`; screenshots: `/private/tmp/oj-pricing-design-production/`. These checks use mocked payment flows and do not certify deployment or real settlement.

Current product decision: NT$200/month or NT$2,000/year, with no launch deadline. No NT$350 price is approved for actual collection, so it is not shown as a comparison price. Keep all three optional campaign environment variables empty. Production already returns these ongoing prices with `pricingVersion: legacy-v1` and `promo: null`; this change does not alter charges or add a migration.

## User experience

- Select monthly or annual directly in the upgrade page's Pro card. The Pro card appears first on narrow screens.
- Monthly shows NT$200/month. Annual shows NT$2,000/year, an approximate monthly equivalent of NT$167, and explicitly explains the upfront annual charge.
- The genuine comparison is 12 monthly payments totaling NT$2,400 versus one annual payment of NT$2,000, saving NT$400. Comparison amounts are computed from the server catalog, not hardcoded promotional anchors.
- Both the upgrade page and checkout share the same period picker and price details, with keyboard-operable controls and announced price changes.
- Selection travels to checkout via `?period=MONTHLY` or `?period=YEARLY` and survives refresh. Missing or invalid periods default to monthly. Switching period clears consent, including switching back to an earlier selection.
- Existing recurring subscribers continue to see their saved amount and cancellation controls, rather than a picker that might imply an in-place plan change.
- FAQ and refund policy describe ongoing pricing, annual savings and automatic renewals, without first-month eligibility requirements.

## Safeguards

Unloaded prices disable purchase. The API remains the price authority and checks the displayed amount and pricing version before creating a payment. Renewals still use the saved subscription amount. No database schema or gateway integration changes are needed. Historical campaign tests remain to protect existing compatibility; the current product does not activate that optional campaign.

## Validation — September 15

- `pnpm typecheck`, `pnpm lint`, and the production web build passed.
- Desktop/mobile development-mode browser tests: 20/20 passed.
- Production-mode browser tests: **50/50 passed** across desktop Chromium, mobile Chromium, Firefox, desktop WebKit and iOS WebKit. Coverage includes month/year selection, keyboard activation, deep-link and refresh persistence, clearing consent after switching back, exact monthly/annual order amounts, invalid periods, unavailable pricing/retry, existing subscribers, English/Chinese, light/dark, hydration and WCAG AA checks.
- A light-theme contrast issue in the savings label was corrected and verified in the final suite.
- Local log: `/private/tmp/oj-plan-picker-production.log`; screenshots: `/private/tmp/oj-plan-picker-production/`.

Automated gateway navigation is fully intercepted; no real charge, refund or cancellation is performed. These results validate the local build, not a completed production deployment.
