import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { SERVICE_CATALOG } from "../../apps/api/src/operations/service-catalog";
import type { ExternalServiceRow } from "../../packages/shared/src/operations";

const cost = { plan: "", currency: "USD" as const, billingCycle: "UNKNOWN" as const, amountMinor: null, budgetMinor: null, renewsAt: null, notes: "", managementUrl: null };
test("admin service directory edits costs, preserves unknown values and works on small screens", async ({ page }, info) => {
  const rows: ExternalServiceRow[] = SERVICE_CATALOG.map(meta => ({ ...meta, status: "configured", statusLabel: "設定已就緒", facts: [{ label: "檢查", value: "設定紀錄" }], cost: { ...cost, updatedAt: null, billingSnapshot: null, billingCheckedAt: null } }));
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.route("http://127.0.0.1:55440/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: { id: "admin", handle: "operator", role: "ADMIN", plan: "PRO", settings: { profileSetupDismissed: true }, csrfToken: "fixture" } });
    if (path === "/operations/services") return route.fulfill({ json: { measuredAt: new Date().toISOString(), services: rows } });
    if (path === "/operations/services/railway") {
      expect(route.request().headers()["x-csrf-token"]).toBe("fixture");
      rows[0].cost = { ...rows[0].cost, ...route.request().postDataJSON(), updatedAt: new Date().toISOString() };
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: [] });
  });
  await page.goto("/admin/services");
  await expect(page.getByRole("heading", { name: "外部服務與成本" })).toBeVisible();
  await expect(page.getByText("尚未填寫", { exact: true })).toHaveCount(2);
  const railway = page.getByRole("article", { name: "Railway", exact: true });
  await railway.getByRole("button", { name: "編輯費用" }).click();
  await railway.getByLabel("計費方式").selectOption("YEARLY");
  await railway.getByLabel("每年固定費").fill("120");
  await railway.getByLabel("方案名稱").fill("Fixture plan");
  await railway.getByRole("button", { name: "儲存設定" }).click();
  await expect(railway.getByRole("status")).toHaveText("設定已儲存。");
  await expect(railway.getByText("US$10.00", { exact: true })).toBeVisible();
  await page.reload();
  await expect(railway.getByText("US$10.00", { exact: true })).toBeVisible();
  for (const theme of ["dark", "light"]) {
    await page.evaluate(theme => { document.documentElement.classList.toggle("light", theme === "light"); document.documentElement.classList.toggle("dark", theme === "dark"); document.documentElement.dataset.theme = theme; localStorage.setItem("theme", theme); }, theme);
    await page.reload();
    await expect(railway).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(audit.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: info.outputPath(`services-${theme}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test("real admin API requires role and CSRF, validates edits and persists without exposing actor", async ({ page }, info) => {
  test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Disposable API required");
  const url = new URL(process.env.DATABASE_URL!);
  if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable DB required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json"));
  const { PrismaClient } = requireApi("@prisma/client"), argon2 = requireApi("argon2");
  const db = new PrismaClient(), suffix = randomUUID(), password = `Local_${suffix}!`;
  const admin = await db.user.create({ data: { handle: `services_${suffix}`, email: `${suffix}@example.test`, passwordHash: await argon2.hash(password), role: "ADMIN", settings: { profileSetupDismissed: true } } });
  const existing = await db.externalServiceRecord.findUnique({ where: { key: "domain" } });
  const api = "http://127.0.0.1:55440";
  try {
    expect((await page.request.get(`${api}/operations/services`)).status()).toBe(401);
    const login = await page.request.post(`${api}/auth/login`, { data: { handle: admin.handle, password } });
    expect(login.ok()).toBe(true);
    const me = await (await page.request.get(`${api}/auth/me`)).json();
    const headers = { "x-csrf-token": me.csrfToken };
    expect((await page.request.patch(`${api}/operations/services/domain`, { data: cost })).status()).toBe(403);
    expect((await page.request.patch(`${api}/operations/services/domain`, { headers, data: { ...cost, amountMinor: -10 } })).status()).toBe(400);
    expect((await page.request.patch(`${api}/operations/services/unknown`, { headers, data: cost })).status()).toBe(400);
    expect((await page.request.patch(`${api}/operations/services/domain`, { headers, data: { ...cost, billingSnapshot: {} } })).status()).toBe(400);
    expect((await page.request.patch(`${api}/operations/services/domain`, { headers, data: { ...cost, currency: "TWD", billingCycle: "YEARLY", amountMinor: 80000 } })).ok()).toBe(true);
    const response = await page.request.get(`${api}/operations/services`);
    expect(response.ok()).toBe(true); expect(response.headers()["cache-control"]).toContain("no-store");
    const service = (await response.json()).services.find((s: ExternalServiceRow) => s.key === "domain");
    expect(service.cost).toMatchObject({ amountMinor: 80000, currency: "TWD", billingCycle: "YEARLY" });
    expect(service.cost).not.toHaveProperty("updatedById");
    expect((await page.request.get(`${api}/operations/overview`)).ok()).toBe(true);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "營運總覽" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "待處理事項" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath("overview.png"), fullPage: true });
    for (const tab of ["product", "audience", "learning"]) {
      await page.goto(`/admin/analytics?tab=${tab}`);
      await expect(page.getByRole("heading", { name: "數據分析", exact: true })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "分析類別" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "發生了一些問題" })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    for (const route of ["problems", "contests", "users", "assignments"]) {
      await page.goto(`/admin/${route}`);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.locator("main form")).toHaveCount(0);
    }
    await db.user.update({ where: { id: admin.id }, data: { role: "USER" } });
    expect((await page.request.get(`${api}/operations/services`)).status()).toBe(403);
    expect((await page.request.get(`${api}/operations/overview`)).status()).toBe(403);
    expect((await page.request.patch(`${api}/operations/services/domain`, { headers, data: cost })).status()).toBe(403);
  } finally {
    if (existing) { const { key, ...data } = existing; await db.externalServiceRecord.update({ where: { key }, data }); }
    else await db.externalServiceRecord.deleteMany({ where: { key: "domain" } });
    await db.user.delete({ where: { id: admin.id } }); await db.$disconnect();
  }
});
