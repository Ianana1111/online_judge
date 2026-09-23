import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("leaderboard highlights the top three in second-first-third podium order", async ({ page }, info) => {
  const board = [
    { handle: "gold", avatarUrl: null, school: null, solved: 30, streak: 6, avgTimeMs: 10, avgMemoryKb: 1024, totalSubmissions: 40, rank: 1 },
    { handle: "silver", avatarUrl: null, school: null, solved: 20, streak: 4, avgTimeMs: 20, avgMemoryKb: 2048, totalSubmissions: 30, rank: 2 },
    { handle: "bronze", avatarUrl: null, school: null, solved: 10, streak: 2, avgTimeMs: 30, avgMemoryKb: 3072, totalSubmissions: 20, rank: 3 },
  ];
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me" || path === "/auth/refresh") return route.fulfill({ status: 401, json: {} });
    if (path === "/leaderboard") return route.fulfill({ json: board });
    return route.fulfill({ json: path === "/notifications" ? { items: [], unreadCount: 0 } : {} });
  });
  await page.goto("/leaderboard");
  const podium = page.getByRole("region", { name: "排行榜前三名" });
  await expect(podium).toBeVisible();
  await expect(podium.getByRole("link")).toHaveText([/silver/, /gold/, /bronze/]);
  await expect(podium.getByText("30 題", { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("leaderboard-podium.png"), fullPage: true });
});

for (const theme of ["light", "dark"]) test(`dashboard and rankings show AC streaks without protection controls (${theme})`, async ({ page }, info) => {
  const user = { id: "c000000000000000000000000", handle: "streak_learner", email: "learner@example.test", role: "USER", isStudent: false,
    plan: "FREE", settings: { profileSetupDismissed: true, onboardingDismissed: true }, bio: "", avatarUrl: null, school: null,
    schoolEmail: null, schoolVerifiedAt: null, hasPassword: true, deletionRequestedAt: null, csrfToken: "test" };
  const writes: string[] = [];
  const board = [{ handle: user.handle, avatarUrl: null, school: null, solved: 3, streak: 2, avgTimeMs: 10, avgMemoryKb: 1024, totalSubmissions: 5, rank: 1, frozenToday: true }];
  await page.addInitScript((value) => { localStorage.setItem("theme", value); localStorage.setItem("locale", "zh-TW"); }, theme);
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET") writes.push(path);
    if (path === "/auth/me") return route.fulfill({ json: user });
    // Retired response fields may linger while an old API instance drains. The new UI ignores them.
    if (path === "/users/me/daily") return route.fulfill({ json: { goal: 1, solvedToday: 0, currentStreak: 2, atRisk: true, loginStreak: 7, streakFreezeCount: 2, frozenToday: true, loginMilestoneHit: true } });
    if (path === "/problems/recommended") return route.fulfill({ json: { tier: 1, consolidate: [], stretch: null, collectionNext: null } });
    if (path === "/submissions") return route.fulfill({ json: { items: [] } });
    if (path === `/users/${user.handle}`) return route.fulfill({ json: { ...user, solvedCount: 3 } });
    if (path === `/achievements/${user.handle}`) return route.fulfill({ json: [{ code: "first_ac", title: "第一題 AC", description: "完成第一題", earnedAt: "2026-09-22T00:00:00.000Z" }] });
    if (path.endsWith("/stats")) return route.fulfill({ json: { heatmap: [], languageBreakdown: [], verdictBreakdown: [], solvedByDifficulty: [] } });
    if (path === "/leaderboard") return route.fulfill({ json: board });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, nextCursor: null } });
    if (path === "/problems") return route.fulfill({ json: { items: [], total: 0 } });
    return route.fulfill({ json: [] });
  });
  await page.goto("/");
  const streakSwitcher = page.getByTestId("hero-streak-switcher").filter({ visible: true });
  await expect(streakSwitcher).toContainText("連續 7 天都有上線");
  await expect(page.locator("main")).not.toContainText("最新成就");
  if ((page.viewportSize()?.width ?? 0) < 640) await streakSwitcher.click();
  else await streakSwitcher.hover();
  await expect(streakSwitcher).toContainText("連續 2 天都有解題");
  await expect(streakSwitcher).toContainText("今日岌岌可危");
  if ((page.viewportSize()?.width ?? 0) < 640) await streakSwitcher.click();
  else await page.getByRole("heading", { name: /streak_learner/ }).hover();
  await expect(streakSwitcher).toContainText("連續 7 天都有上線");
  await expect(page.locator("main")).not.toContainText(/凍結|保護|freeze|protected/i);
  expect(writes.filter((path) => path.includes("freeze"))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath(`dashboard-${theme}.png`), fullPage: true });
  await page.goto("/leaderboard");
  await page.getByRole("button", { name: "連續紀錄", exact: true }).click();
  await expect(page.getByText("依連續解出題目（AC）的天數排名。", { exact: true })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: user.handle })).toContainText("2d");
  await expect(page.locator("main")).not.toContainText(/凍結|保護|freeze|protected/i);
  await page.screenshot({ path: info.outputPath(`leaderboard-${theme}.png`), fullPage: true });
});
