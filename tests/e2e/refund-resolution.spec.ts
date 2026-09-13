import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("operator verifies the order, amount and evidence before recording a refund", async ({ page }, info) => {
  const writes: { path: string; body: any }[] = [], history: any[] = [];
  const item = { id: "refund-resolution", userId: "buyer", paymentId: "payment", user: { id: "buyer", handle: "test_buyer", email: "buyer@example.test" }, amountNtd: 200, merchantTradeNo: "TEST_RECONCILE", ecpayTradeNo: "GATEWAY_1", status: "NEEDS_REVIEW", requestedAt: "2026-09-13T00:00:00.000Z", updatedAt: "2026-09-13T00:00:00.000Z", completedAt: null as string | null, nextAttemptAt: "2026-09-13T00:00:00.000Z", attempts: 1, lastError: "Fixture: gateway outcome requires review", inFlightAction: "R", cancellationConfirmedAt: null, refundConfirmedAt: null };
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: { id: "admin", handle: "operator", email: "operator@example.test", role: "ADMIN", plan: "PRO", mfaEnabled: true, mfaRequired: false, isStudent: false, settings: { profileSetupDismissed: true }, csrfToken: "fixture", bio: "", avatarUrl: null, school: null, schoolEmail: null, schoolVerifiedAt: null, hasPassword: true, deletionRequestedAt: null } });
    if (path === "/contests/me" || path === "/billing/admin/authorized-pending") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, nextCursor: null } });
    if (path.endsWith("/history")) return route.fulfill({ json: history });
    if (path.endsWith("/resolve")) {
      const body = req.postDataJSON(); writes.push({ path, body }); item.status = "COMPLETED"; item.completedAt = new Date().toISOString();
      history.push({ id: "resolution", actorId: "admin", decision: body.decision, evidenceReference: body.evidenceReference, reason: body.reason, createdAt: new Date().toISOString() });
      return route.fulfill({ json: { id: "resolution", status: "COMPLETED" } });
    }
    if (path === "/billing/admin/refunds") return route.fulfill({ json: { items: [item], counts: { REQUESTED: 0, PROCESSING: 0, NEEDS_REVIEW: item.status === "NEEDS_REVIEW" ? 1 : 0, COMPLETED: item.status === "COMPLETED" ? 1 : 0 }, nextCursor: null } });
    if (req.method() !== "GET" && path.startsWith("/billing")) writes.push({ path, body: req.postDataJSON() });
    return route.fulfill({ json: {} });
  });
  await page.goto("/admin/billing"); await page.getByText("人工對帳與操作紀錄", { exact: true }).click();
  const submit = page.getByRole("button", { name: "確認並記錄對帳結果" }); await expect(submit).toBeDisabled();
  await page.getByLabel("對帳結果", { exact: true }).selectOption("CONFIRM_REFUNDED");
  await page.getByLabel("再次輸入商店訂單編號").fill("TEST_RECONCILE"); await page.getByLabel("核對金額（NT$）").fill("200");
  await page.getByLabel("綠界紀錄或客服案件編號").fill("GATEWAY-CASE-123"); await page.getByLabel("核對依據與處理原因").fill("已逐項核對交易、全額退款與取消續扣紀錄，皆確認完成。");
  await page.getByLabel("已確認此筆全額退款完成", { exact: false }).check();
  expect(writes).toHaveLength(0);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: info.outputPath("refund-resolution.png"), fullPage: true });
  await submit.click(); await expect(page.getByRole("article")).toHaveAccessibleName(/已完成退款/);
  expect(writes).toHaveLength(1); expect(writes[0].path).toBe("/billing/admin/refunds/refund-resolution/resolve");
  expect(writes[0].body.expectedUpdatedAt).toBe("2026-09-13T00:00:00.000Z"); expect(writes[0].body.clientRequestId).toMatch(/^[a-f0-9-]{36}$/);
  await page.getByText("人工對帳與操作紀錄", { exact: true }).click(); await expect(page.getByText("GATEWAY-CASE-123", { exact: false })).toBeVisible();
});
