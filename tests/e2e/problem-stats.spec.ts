import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";

for (const theme of ["dark", "light"]) test(`personal stats: ${theme}, comparison, exploration and empty/error states`, async ({ page }, info) => {
  test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Requires the disposable SSR database");
  const url = new URL(process.env.DATABASE_URL!);
  if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json"));
  const { PrismaClient } = requireApi("@prisma/client"), db = new PrismaClient();
  const problem = await db.problem.create({ data: { slug: `stats-${randomUUID()}`, title: "The 3n + 1 problem", statementMd: "Read two integers and compute the maximum cycle length.", samples: { create: { ord: 1, input: "1 10\n", output: "1 10 20\n" } }, testCases: { create: { ord: 1, input: "1 10\n", output: "1 10 20\n" } } } });
  const user = { id: "stats-solver", handle: "solver", email: "solver@example.test", role: "USER", plan: "FREE", settings: { profileSetupDismissed: true }, avatarUrl: null, school: null, isStudent: false, hasPassword: true, csrfToken: "test" };
  const counts = [2, 4, 8, 10, 7, 5, 4, 3, 2, 1];
  const stats = {
    solvedCount: 46, time: { minMs: 10, medianMs: 45, maxMs: 110 },
    memory: { minKb: 1024, medianKb: 4608, maxKb: 11264, solverCount: 46 }, memoryAvailable: true,
    yourBest: { timeMs: 34, beatsPct: 73.9, languageKey: "cpp17", memoryKb: 8192, timeRank: 7, timeTies: 2, memoryRank: 39, beatsMemoryPct: 13 },
    timeHistogram: counts.map((count, i) => ({ minMs: 10 + i * 10, maxMs: 20 + i * 10, count, languageCounts: { cpp17: count } })),
    memoryHistogram: counts.map((count, i) => ({ minKb: (i + 1) * 1024, maxKb: (i + 2) * 1024, count, languageCounts: { cpp17: count } })),
    yourTimeBucketIndex: 2, yourMemoryBucketIndex: 7,
  };
  let fail = true;
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(theme => localStorage.setItem("theme", theme), theme);
  await page.route("http://127.0.0.1:55440/**", async route => {
    const url = new URL(route.request().url()), path = url.pathname;
    if (path === "/auth/me") return route.fulfill({ json: user });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0 } });
    if (path === "/runs/usage") return route.fulfill({ json: { used: 0, limit: 20, remaining: 20, cooldownMs: 0 } });
    if (path === "/billing/me") return route.fulfill({ json: { plan: "FREE", submits: { used: 0, limit: 20 }, runs: { used: 0, limit: 20 } } });
    if (path.endsWith("/stats")) {
      const language = url.searchParams.get("language");
      if (language === "python3") return route.fulfill({ json: { solvedCount: 0 } });
      if (language === "java17" && fail) return route.fulfill({ status: 500, json: { message: "Fixture unavailable" } });
      if (language === "java17") return route.fulfill({ json: { ...stats, yourBest: null, yourTimeBucketIndex: null, yourMemoryBucketIndex: null } });
      if (language === "c11") return route.fulfill({ json: { ...stats, solvedCount: 1, time: { minMs: 0, maxMs: 0, medianMs: 0 }, yourBest: { ...stats.yourBest, timeMs: 0, timeRank: 1, timeTies: 1, beatsPct: 0, languageKey: "c11", memoryKb: null }, yourTimeBucketIndex: 0, yourMemoryBucketIndex: null, timeHistogram: [{ minMs: 0, maxMs: 0, count: 1, languageCounts: { c11: 1 } }], memoryAvailable: false, memory: null, memoryHistogram: null } });
      return route.fulfill({ json: stats });
    }
    return route.fulfill({ json: { items: [], total: 0, page: 1 } });
  });
  try {
    await page.goto(`/problems/${problem.slug}`);
    await page.getByRole("tab", { name: "統計", exact: true }).click();
    const panel = page.locator("#problem-tabpanel-stats");
    const runtime = panel.getByRole("group", { name: "執行時間分布", exact: true });
    await expect(panel).toContainText("#7"); await expect(panel).toContainText("快於 73.9%"); await expect(panel).toContainText("並列");
    await expect(runtime).toContainText("34 ms");
    const ownBar = runtime.getByRole("button", { name: /你的位置/ });
    await expect(ownBar).toHaveAttribute("aria-pressed", "true");
    await runtime.getByRole("button").last().click();
    await expect(ownBar).toHaveAttribute("aria-pressed", "false");
    await expect(runtime.getByText("你", { exact: true })).toBeVisible();
    await expect(runtime).toContainText("100–110 ms");
    await runtime.getByRole("button").last().press("ArrowLeft");
    await expect(runtime.getByRole("button").nth(8)).toBeFocused();
    await ownBar.click();
    await panel.getByRole("heading", { name: "看看你的解題表現" }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`stats-${theme}.png`), fullPage: true });
    const audit = await new AxeBuilder({ page }).include("#problem-tabpanel-stats").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(audit.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const compare = panel.getByRole("combobox", { name: "比較語言" });
    await compare.selectOption("c11");
    await expect(panel).toContainText("#1"); await expect(panel).toContainText("樣本仍在累積中");
    await expect(runtime.getByRole("button")).toHaveCount(1); await expect(panel).toContainText("目前尚無可用的記憶體紀錄");
    await compare.selectOption("python3"); await expect(panel).toContainText("目前還沒有這個語言的 AC 紀錄");
    await compare.selectOption("java17"); await expect(panel.getByRole("alert")).toContainText("暫時無法載入統計");
    fail = false; await panel.getByRole("button", { name: "再試一次" }).click();
    await expect(panel).toContainText("在此比較範圍內取得 AC 後"); await expect(runtime.getByText("你", { exact: true })).toHaveCount(0);
    await compare.selectOption(""); await expect(panel).toContainText("#7"); await expect(ownBar).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  } finally { await db.problem.delete({ where: { id: problem.id } }); await db.$disconnect(); }
});
