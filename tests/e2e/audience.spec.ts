import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import type { AudienceDashboard } from "../../apps/web/lib/types";

test("audience shows recorded browsers before engagement and refreshes without a page reload", async ({ page }) => {
  await page.clock.install();
  let visitors = 2;
  await page.route("http://127.0.0.1:55440/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: { id: "admin", handle: "operator", role: "ADMIN", plan: "PRO", mfaEnabled: true, settings: { profileSetupDismissed: true }, csrfToken: "fixture" } });
    if (path === "/analytics/traffic/summary") return route.fulfill({ json: { totalViews: visitors, distinctPaths: 1 } });
    if (path === "/analytics/audience") {
      const data: AudienceDashboard = {
        days: 30, source: "all", timezone: "Asia/Taipei", generatedAt: new Date().toISOString(), trackingSince: new Date().toISOString(),
        coverage: { configured: true, trackedPageviews: visitors, legacyPageviews: 0 },
        totals: { visitors, engaged: visitors - 2, anonymous: visitors - 2, free: 0, pro: 0, unsubscribed: 0, direct: visitors - 2 },
        sources: [], regions: [], daily: [],
      };
      return route.fulfill({ json: data });
    }
    return route.fulfill({ json: [] });
  });
  await page.goto("/admin/audience");
  await expect(page.getByText("已追蹤 2 個瀏覽器，其中 2 個尚未達到互動門檻。", { exact: true })).toBeVisible();
  visitors = 3;
  await page.clock.fastForward(31_000);
  await expect(page.getByText("已追蹤 3 個瀏覽器，其中 2 個尚未達到互動門檻。", { exact: true })).toBeVisible();
  visitors = 4;
  await page.getByRole("button", { name: "更新資料", exact: true }).click();
  await expect(page.getByText("已追蹤 4 個瀏覽器，其中 2 個尚未達到互動門檻。", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("admin audience reports use real data, filter sources, and enforce API roles", async ({ page }, info) => {
  test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Disposable API required");
  const url = new URL(process.env.DATABASE_URL!);
  if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable DB required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json"));
  const { PrismaClient } = requireApi("@prisma/client"), argon2 = requireApi("argon2");
  const db = new PrismaClient(); const suffix = randomUUID(), password = `Local_${randomUUID()}!`, path = `/audience-fixture-${suffix}`;
  const admin = await db.user.create({ data: { handle: `audience_${suffix}`, email: `${suffix}@example.test`, passwordHash: await argon2.hash(password), role: "ADMIN", settings: { profileSetupDismissed: true } } });
  try {
    const anon = await page.request.get("http://127.0.0.1:55440/analytics/audience");
    expect(anon.status()).toBe(401);
    await db.pageView.createMany({ data: [
      { path, visitorId: createHash("sha256").update(`${suffix}a`).digest("hex"), audience: "ANONYMOUS", engaged: true, acquisition: "DIRECT", country: "TW", region: "TPE", subscriber: false },
      { path, visitorId: createHash("sha256").update(`${suffix}b`).digest("hex"), audience: "FREE", engaged: true, acquisition: "REFERRAL", country: "TW", region: "KHH", subscriber: false },
    ] });
    const login = await page.request.post("http://127.0.0.1:55440/auth/login", { data: { handle: admin.handle, password } });
    expect(login.ok()).toBe(true);
    const report = await page.request.get("http://127.0.0.1:55440/analytics/audience?days=7");
    expect(report.ok()).toBe(true); expect(report.headers()["cache-control"]).toContain("no-store");
    expect((await report.json()).totals.engaged).toBeGreaterThanOrEqual(2);
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(theme => localStorage.setItem("theme", theme), theme);
      await page.goto("/admin/audience");
      await expect(page.getByRole("heading", { name: "訪客與台灣地區分析" })).toBeVisible();
      await expect(page.getByText("臺北市", { exact: true })).toBeVisible();
      await expect(page.getByText("高雄市", { exact: true })).toBeVisible();
      await page.getByLabel("進站來源").selectOption("direct");
      await expect(page.getByText("高雄市", { exact: true })).toHaveCount(0);
      await expect(page.getByText("臺北市", { exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(audit.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
      await page.screenshot({ path: info.outputPath(`audience-${theme}.png`), fullPage: true });
    }
    await db.user.update({ where: { id: admin.id }, data: { role: "USER" } });
    expect((await page.request.get("http://127.0.0.1:55440/analytics/audience")).status()).toBe(403);
  } finally {
    await db.pageView.deleteMany({ where: { path } });
    await db.user.delete({ where: { id: admin.id } }); await db.$disconnect();
  }
});

test("tracker requires visible time and interaction, preserves acquisition, and honors opt-out", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false }));
  await page.clock.install();
  const events: { path: string; engaged: boolean; referrer: string; eventId: string; sessionId: string; activeMs: number }[] = [];
  await page.route("**/api/analytics/context", route => route.fulfill({ json: { token: "signed-test-context", expiresAt: Date.now() + 3600000 } }));
  await page.route("http://127.0.0.1:55440/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ status: 401, json: {} });
    if (path === "/analytics/pageview") { events.push(route.request().postDataJSON()); return route.fulfill({ status: 204 }); }
    return route.fulfill({ json: [] });
  });
  await page.goto("/about", { referer: "https://www.google.com/search?q=private" });
  await expect.poll(() => events.length).toBe(1);
  await page.clock.fastForward(12000);
  expect(events).toHaveLength(1);
  await page.getByRole("heading", { level: 1 }).click();
  await expect.poll(() => events.length).toBe(2);
  expect(events[1]).toMatchObject({ eventId: events[0].eventId, engaged: true, referrer: "https://www.google.com" });
  expect(events[1].activeMs).toBeGreaterThanOrEqual(10000);
  await page.goto("/faq");
  await expect.poll(() => events.length).toBe(3);
  expect(events[2]).toMatchObject({ sessionId: events[0].sessionId, referrer: "https://www.google.com", engaged: false });
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { get: () => true }));
  await page.goto("/about"); await page.clock.fastForward(15000);
  expect(events).toHaveLength(3);
});
