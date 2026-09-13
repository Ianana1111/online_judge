import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("opening notifications preserves unread state; explicit actions update it", async ({ page }, info) => {
  const items = [
    { id: "c000000000000000000000001", title: "第一個 Accepted", body: "你的解題旅程開始了。", type: "ACHIEVEMENT", createdAt: "2026-09-10T01:00:00.000Z", readAt: null as string | null, link: null },
    { id: "c000000000000000000000002", title: "課程更新", body: "新課程已準備好。", type: "CLASS", createdAt: "2026-09-09T01:00:00.000Z", readAt: null as string | null, link: null },
  ];
  const writes: unknown[] = [];
  await page.route("http://127.0.0.1:55440/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/auth/me") return route.fulfill({ json: { id: "c000000000000000000000000", handle: "test_student", email: "test@example.test", role: "USER", isStudent: false, plan: "FREE", settings: { profileSetupDismissed: true }, bio: "", avatarUrl: null, school: null, schoolEmail: null, schoolVerifiedAt: null, hasPassword: true, deletionRequestedAt: null, csrfToken: "test" } });
    if (url.pathname === "/contests/me") return route.fulfill({ json: [] });
    if (url.pathname === "/notifications/read") {
      const body = route.request().postDataJSON(); writes.push(body);
      for (const item of items) if (body.all || body.ids.includes(item.id)) item.readAt = new Date().toISOString();
      return route.fulfill({ json: { ok: true } });
    }
    if (url.pathname === "/notifications") return route.fulfill({ json: { items: items.filter((n) => url.searchParams.get("unread") !== "true" || !n.readAt), unreadCount: items.filter((n) => !n.readAt).length, asOf: "2026-09-12T00:00:00.000Z", nextCursor: null } });
    return route.fulfill({ json: {} });
  });
  await page.goto("/faq");
  const bell = page.getByRole("button", { name: "通知 (2 則未讀)", exact: true });
  await bell.click();
  const panel = page.getByRole("dialog", { name: "通知中心" });
  await expect(panel.getByText("第一個 Accepted", { exact: true })).toBeVisible();
  expect(writes).toHaveLength(0);
  await page.keyboard.press("Escape"); await expect(panel).not.toBeVisible(); await expect(bell).toBeFocused();
  await bell.click(); await panel.getByRole("button", { name: "標為已讀: 第一個 Accepted", exact: true }).click();
  await expect(page.getByRole("button", { name: "通知 (1 則未讀)", exact: true })).toBeVisible();
  expect(writes).toEqual([{ ids: [items[0].id] }]);
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("notifications.png") });
  await panel.getByRole("button", { name: "全部標為已讀", exact: true }).click();
  await expect(page.getByRole("button", { name: "通知", exact: true })).toBeVisible();
  expect(writes[1]).toEqual({ all: true, before: "2026-09-12T00:00:00.000Z" });
});
