# Refund reconciliation

The administrator's **Billing → Refund operations** view lists open requests, individual processing states and completed history. It refreshes every 30 seconds and uses Taipei time. The API paginates all states; a deleted account is shown without restoring its personal information.

This is a triage view. There is currently no audited administrator command to resolve an ambiguous external action or recalculate historical entitlements. That command and an owner-controlled gateway rehearsal remain release gates. Do not mark a request completed merely because the bank action was sent.

## Investigation record

For each `NEEDS_REVIEW` request, record the request ID, merchant order number, ECPay transaction number, amount, original request time, investigator and investigation time in the restricted operations incident record. Do not copy card data, gateway credentials or unnecessary customer details.

1. Find the exact merchant order in the ECPay merchant console. Check the merchant, amount and transaction number against the application's record.
2. Review recurring-payment cancellation and credit-card transaction history separately. A cancelled subscription does not establish that the first payment was refunded. Conversely, a refund does not establish that future charges were stopped.
3. Identify the action whose result was not recorded (`CANCEL_SUBSCRIPTION`, `E`, `N` or `R`) and compare its timestamp with gateway records. Save the gateway's definitive status/reference in the incident record. A timeout, missing callback or empty local confirmation field is not proof of failure.
4. If the external result is still uncertain, keep the request in review and obtain confirmation through the merchant's support channel. Never resubmit a card action solely to test whether it already happened.
5. If the external refund is confirmed, check the remaining subscription entitlement and any later purchases or manual grants before planning a database correction. An existing refund confirmation with an unfinished request can indicate that the entitlement transaction failed after the gateway succeeded.

Before release, implement a dedicated resolution command with current administrator authorization, a required evidence reference and reason, a durable audit record, concurrency protection and idempotent entitlement adjustment. It must distinguish confirmed success, confirmed no action and unresolved outcomes. Exercise crash recovery and concurrent resolution using a fake gateway, followed by an owner-controlled live rehearsal. Directly changing a status or clearing `inFlightAction` is not an adequate resolution workflow.

## Implemented safeguards and evidence

- Workers claim each request atomically. An ambiguous sent action or interrupted worker moves to review rather than automatically sending the action again.
- The administrator view does not initiate card actions. Viewing, filtering and paging cannot trigger a refund or cancellation.
- Real-database tests cover duplicate requests, concurrent worker claims, an ambiguous refund response, retained records, pagination after removal of a cursor row, and restricted account fields.
- Built-API tests cover anonymous/user denial, current administrator access, query validation and immediate denial after an administrator role is removed.
- Production-browser tests exercise the populated queue and completed-history filter on desktop/mobile in light/dark themes.
- Four additional final-build browser checks cover fetch failure/recovery, pagination, deleted-account records and empty history, and assert that viewing the queue sends no bank mutations.

Real gateway evidence has not been collected during this implementation session.
