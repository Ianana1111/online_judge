import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("school picker supports old names, keyboard selection, and institution-specific email checks", async ({ page }, info) => {
  const writes: { path: string; body: any }[] = [];
  const user = { id: "c000000000000000000000003", handle: "school_test", email: "school@example.test", role: "USER", isStudent: false, plan: "FREE", settings: { profileSetupDismissed: true, defaultLanguage: "cpp17", dailyGoal: 1 }, bio: "", avatarUrl: null, school: null as string | null, schoolEmail: null as string | null, schoolVerifiedAt: null, hasPassword: true, deletionRequestedAt: null, csrfToken: "test" };
  await page.route("http://127.0.0.1:55440/**", async (route) => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: user });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, asOf: "2026-09-12T00:00:00.000Z", nextCursor: null } });
    if (path === "/users/me/profile") { const body = req.postDataJSON(); writes.push({ path, body }); Object.assign(user, body); return route.fulfill({ json: { bio: user.bio, avatarUrl: null, school: user.school, schoolEmail: null, schoolVerifiedAt: null } }); }
    if (path === "/users/me/school/verify/request") { writes.push({ path, body: req.postDataJSON() }); return route.fulfill({ json: { ok: true } }); }
    return route.fulfill({ json: {} });
  });
  await page.goto("/settings"); await page.getByRole("button", { name: "學校", exact: true }).click();
  const search = page.getByRole("combobox", { name: "搜尋學校", exact: true }); await search.fill("高苑");
  await expect(page.getByRole("option", { name: "台鋼科技大學", exact: true })).toBeVisible(); await search.press("Enter");
  await expect(page.getByRole("button", { name: "學校", exact: true })).toBeFocused(); expect(writes[0].body).toEqual({ school: "台鋼科技大學" });
  const email = page.getByRole("textbox", { name: "學校電子信箱", exact: true }); await email.fill("student@tsust.edu.tw.evil.test");
  await expect(page.getByRole("button", { name: "寄送驗證信", exact: true })).toBeDisabled();
  await email.fill("Student@tsust.edu.tw"); await page.getByRole("button", { name: "寄送驗證信", exact: true }).click();
  expect(writes[1].body).toEqual({ email: "student@tsust.edu.tw" });
  await page.getByRole("button", { name: "學校", exact: true }).click(); await search.fill("一貫道崇德"); await search.press("Enter");
  await expect(page.getByText("這所學校尚無可確認的專屬信箱網域。", { exact: false })).toBeVisible();
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: info.outputPath("school-settings.png"), fullPage: true });
});
