import { test, expect } from "@playwright/test";

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
    if (path.endsWith("/stats")) return route.fulfill({ json: { heatmap: [], languageBreakdown: [], verdictBreakdown: [], solvedByDifficulty: [] } });
    if (path === "/leaderboard") return route.fulfill({ json: board });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, nextCursor: null } });
    if (path === "/problems") return route.fulfill({ json: { items: [], total: 0 } });
    return route.fulfill({ json: [] });
  });
  await page.goto("/");
  await expect(page.getByText("連續 7 天都有上線", { exact: true })).toBeVisible();
  await expect(page.getByText("今日岌岌可危", { exact: true }).filter({ visible: true })).toBeVisible();
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
