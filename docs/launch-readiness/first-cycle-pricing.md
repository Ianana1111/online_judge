# First-cycle pricing — approved policy and gateway dependency

Owner instruction, 2026-09-16: replace the earlier perpetual launch-price proposal with a genuine one-calendar-month enrollment offer. This document supersedes the *proposed* new-customer policy in `launch-pricing.md`; it does not change existing payment agreements or imply the new offer is deployed.

| New subscription | During enrollment: first charge | Subsequent charges | After enrollment: new first charge |
| --- | --- | --- | --- |
| Monthly | NT$200 | NT$400/month from cycle 2 | NT$400 |
| Annual | NT$2,000 | NT$4,000/year from cycle 2 | NT$4,000 |

Existing subscriptions retain their saved agreed terms. New subscribers must see and accept both first-charge and renewal amounts. The fixed Taipei enrollment dates must be recorded on activation; restarting an application must never restart the promotion. Owner date preference is pending (proposed: production activation through the same Taipei time one calendar month later).

## Confirmed external dependency

Research checked 2026-09-16 against ECPay primary documentation:

- [AIO recurring payments](https://developers.ecpay.com.tw/2868/): `TotalAmount` must equal `PeriodAmount`; simply sending 200 and 400 is invalid.
- [Recurring-order actions](https://developers.ecpay.com.tw/2900/): the public API supports cancellation and reauthorization, not changing future amounts.
- [Merchant portal editing announcement](https://www.ecpay.com.tw/Announcement/DetailAnnouncement?nID=5311): contract merchants can change future amounts through the portal. This is a per-order manual operation, not an automated API integration.
- [Credit-card binding service](https://developers.ecpay.com.tw/35529/): supports binding and token-based authorizations, but requires a contract merchant to apply for activation. This is the recommended route for fully automated introductory and renewal prices.

Owner confirmation of card-binding activation / selected gateway route is pending. Do not activate the first-cycle campaign using the existing fixed-amount adapter. Do not charge the regular price and silently substitute a partial refund for the promised discounted first payment.

## Work remaining after gateway selection

1. Preserve immutable first-charge and renewal quotes, consent version, campaign window and provider identity per order/subscription; additive migration must preserve historical subscription amounts.
2. Integrate the selected supported gateway: binding callback ownership, authenticated/encrypted responses, card-token protection and merchant configuration validation.
3. For token-based billing, persist each scheduled charge before dispatch; reconcile ambiguous responses before retry, deduplicate callbacks, and serialize cancellations with renewals. Grant access only after independently validated payment confirmation. Never store raw card numbers or security codes.
4. Update upgrade, checkout, subscription status, notification copy, FAQ and policy together: actual 400→200 / 4,000→2,000, explicit cycle-2 prices, exact offer deadline, consent invalidation when quotes change. Do not describe the introductory price as lifetime pricing.
5. Verify refunds through the selected provider, including cancel-before-refund, once-only settlement, gateway uncertainty and entitlement withdrawal.
6. Test campaign boundaries, concurrent checkouts/renewals/cancellation, declined cards, late callbacks, replay, month-end/leap-year dates and old subscription compatibility. Owner-controlled real first payment/renewal/refund acceptance is still required.

## Refund/cancellation refinement implemented separately

- A successful first-payment refund removes the remaining access funded by that payment immediately; it does not leave a refunded month/year available. Separate grants are preserved.
- After the 168-hour first-payment refund window, cancellation only stops future renewal. No standard first-payment refund is issued and access continues until the paid monthly/annual period expires. Existing exceptional/legal refund handling remains intact.
- The upgrade page polls outstanding refund requests, updates the displayed plan after completion and clearly distinguishes renewal cancellation from refund requests.
- Local checks: 9 billing-policy unit tests, API/web type checking, production web build and 6 desktop/mobile light/dark browser checks passed. Local PostgreSQL tests were attempted but the Docker daemon did not respond and port 55432 was unavailable; CI must run the added monthly/annual day-six refund and day-eight cancellation tests before treating database verification as passed.
