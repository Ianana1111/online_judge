# Refund reconciliation

The administrator's **Billing → Refund operations** view lists open requests, individual processing states and completed history. It refreshes every 30 seconds and uses Taipei time. The API paginates all states; a deleted account is shown without restoring its personal information.

The view now includes an audited operator resolution form backed by `POST /billing/admin/refunds/:id/resolve`. It requires an MFA-verified administrator, matching order and amount, an evidence reference, a reason, the version reviewed and a unique request identifier. A real owner-controlled gateway rehearsal remains outstanding. Do not mark a request completed merely because the bank action was sent.

## Investigation record

For each `NEEDS_REVIEW` request, record the request ID, merchant order number, ECPay transaction number, amount, original request time, investigator and investigation time in the restricted operations incident record. Do not copy card data, gateway credentials or unnecessary customer details.

1. Find the exact merchant order in the ECPay merchant console. Check the merchant, amount and transaction number against the application's record.
2. Review recurring-payment cancellation and credit-card transaction history separately. A cancelled subscription does not establish that the first payment was refunded. Conversely, a refund does not establish that future charges were stopped.
3. Identify the action whose result was not recorded (`CANCEL_SUBSCRIPTION`, `E`, `N` or `R`) and compare its timestamp with gateway records. Save the gateway's definitive status/reference in the incident record. A timeout, missing callback or empty local confirmation field is not proof of failure.
4. If the external result is still uncertain, keep the request in review and obtain confirmation through the merchant's support channel. Never resubmit a card action solely to test whether it already happened.
5. If the external refund is confirmed, check the remaining subscription entitlement and any later purchases or manual grants before planning a database correction. An existing refund confirmation with an unfinished request can indicate that the entitlement transaction failed after the gateway succeeded.

Choose one outcome in the form: confirmed full refund and cancellation; confirmed no refund; or unresolved. Only the first completes the request. The other two preserve the pause and never automatically reissue a card action. Each decision is retained in an immutable history, including the administrator identifier. Concurrent/repeated requests cannot debit entitlement twice, and a stale worker cannot overwrite a newer decision.

Known payment entitlement intervals remove only their remaining attributable period. For legacy transactions without that ledger, the operator must explicitly preserve existing entitlement and explain why, or keep the case under review. The command cannot infer ownership of manual grants. Deleted account/payment rows do not prevent recording a confirmed external refund against the retained request. No resolution option sends a bank request.

## Implemented safeguards and evidence

- Workers claim each request atomically. An ambiguous sent action or interrupted worker moves to review rather than automatically sending the action again.
- Every worker claim has a unique fencing token. Delayed callbacks and error handlers cannot overwrite an operator's resolution or another worker's state.
- The administrator view does not initiate card actions. Viewing, filtering and paging cannot trigger a refund or cancellation.
- Real-database tests cover duplicate requests, concurrent worker claims, an ambiguous refund response, retained records, pagination after removal of a cursor row, and restricted account fields.
- Built-API tests cover anonymous/user denial, current administrator access, query validation and immediate denial after an administrator role is removed.
- Production-browser tests exercise the populated queue and completed-history filter on desktop/mobile in light/dark themes.
- Four additional final-build browser checks cover fetch failure/recovery, pagination, deleted-account records and empty history, and assert that viewing the queue sends no bank mutations.

Real gateway evidence has not been collected during this implementation session.
