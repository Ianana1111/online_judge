import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const theme of ["light", "dark"] as const) {
  test(`refund operations expose fetch failures, page results and preserve read-only actions (${theme})`, async ({ page }, info) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    let fail = true;
    const bankWrites: string[] = [];
    const refund = { id: "refund-1", userId: "admin-1", paymentId: "payment-1", user: { id: "admin-1", handle: "review_student", email: "student@example.test" },
      amountNtd: 200, merchantTradeNo: "TEST_REVIEW_1", ecpayTradeNo: "GATEWAY_1", status: "NEEDS_REVIEW", requestedAt: "2026-09-12T00:00:00.000Z", updatedAt: "2026-09-12T00:00:00.000Z", completedAt: null,
      nextAttemptAt: "2026-09-12T00:10:00.000Z", attempts: 1, lastError: "Local fixture: outcome unknown", inFlightAction: "R", cancellationConfirmedAt: null, refundConfirmedAt: null };
    await page.route("http://127.0.0.1:55440/**", async (route) => {
      const request = route.request(), url = new URL(request.url()), path = url.pathname;
      if (path.startsWith("/billing") && request.method() !== "GET") bankWrites.push(path);
      if (path === "/auth/me") return route.fulfill({ json: { id: "admin-1", handle: "test_admin", email: "admin@example.test", role: "ADMIN", plan: "PRO", isStudent: false, settings: { profileSetupDismissed: true }, csrfToken: "fixture", bio: "", avatarUrl: null, school: null, schoolEmail: null, schoolVerifiedAt: null, hasPassword: true, deletionRequestedAt: null } });
      if (path === "/contests/me") return route.fulfill({ json: [] });
      if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, nextCursor: null, asOf: "2026-09-12T00:00:00.000Z" } });
      if (path === "/billing/admin/authorized-pending") return route.fulfill({ json: [] });
      if (path === "/billing/admin/refunds") {
        if (fail) return route.fulfill({ status: 503, json: { message: "Temporary failure" } });
        const completed = url.searchParams.get("status") === "COMPLETED", next = url.searchParams.has("cursor");
        return route.fulfill({ json: { counts: { REQUESTED: 1, NEEDS_REVIEW: 1, PROCESSING: 0, COMPLETED: 0 },
          items: completed ? [] : next ? [{ ...refund, id: "refund-2", merchantTradeNo: "TEST_REVIEW_2", user: null, status: "REQUESTED", lastError: null, inFlightAction: null }] : [refund], nextCursor: completed || next ? null : "fixture-next" } });
      }
      return route.fulfill({ json: {} });
    });
    await page.goto("/admin/billing");
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("無法載入退款資料，請重新整理後再試。");
    await expect(page.getByText("目前沒有符合此狀態的退款申請。", { exact: true })).toBeHidden();
    fail = false;
    await page.getByRole("button", { name: "重新整理", exact: true }).click();
    const card = page.getByRole("article", { name: "需要人工核對 · TEST_REVIEW_1" });
    await expect(card).toBeVisible();
    await card.getByText("查看處理細節", { exact: true }).click();
    await expect(card.getByText("Local fixture: outcome unknown", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "載入更多退款申請", exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(2);
    await expect(page.getByText("已刪除的帳號", { exact: true })).toBeVisible();
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(axe.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`refunds-${theme}.png`), fullPage: true });
    await page.getByRole("button", { name: "已完成退款 · 0", exact: true }).click();
    await expect(page.getByText("目前沒有符合此狀態的退款申請。", { exact: true })).toBeVisible();
    expect(bankWrites).toEqual([]);
  });
}
