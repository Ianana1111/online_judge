import { expect, it } from "vitest";
import { operationalAlerts } from "../apps/api/src/operations/operations.service";
const normal = { queues: [{ name: "local", waiting: 0, active: 1, delayed: 0, failed: 10 }], pendingSubmissions: 1, oldestPendingSeconds: 20, completedLast15m: 40, systemErrorsLast15m: 0, refundReviews: 0, failedAuthMail: 0 };
it("distinguishes retained old failures from current incidents", () => {
  expect(operationalAlerts(normal)).toEqual([]);
  expect(operationalAlerts({ ...normal, systemErrorsLast15m: 2 })).toEqual([]);
  expect(operationalAlerts({ ...normal, systemErrorsLast15m: 3 })).toEqual(["JUDGE_SYSTEM_ERROR_RATE"]);
});
it("flags actionable queue, mail and reconciliation conditions", () => {
  expect(operationalAlerts({ ...normal, queues: [{ ...normal.queues[0], waiting: 51 }], oldestPendingSeconds: 301, refundReviews: 1, failedAuthMail: 1 })).toEqual(["JUDGE_PENDING_OVER_5_MINUTES", "JUDGE_QUEUE_BACKLOG", "REFUND_MANUAL_REVIEW", "ACCOUNT_MAIL_DELIVERY_FAILED"]);
});
