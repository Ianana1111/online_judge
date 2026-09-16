import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Requires isolated database for the server-rendered problem");

test("sample Run uses server comparisons; edits and language changes invalidate results", async ({ page }, info) => {
  const url = new URL(process.env.DATABASE_URL!); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json")), { PrismaClient } = requireApi("@prisma/client"), db = new PrismaClient();
  const problem = await db.problem.create({ data: { slug: `run-${randomUUID()}`, title: "執行一致性測試", statementMd: "Read and echo an integer.", samples: { create: { ord: 1, input: "1\n", output: "1\n" } }, testCases: { create: { ord: 1, input: "1\n", output: "1\n" } } } });
  let lastCases: { id: string; input?: string; sampleOrd?: number }[] = [], delayed = false;
  const user = { id: "c000000000000000000000001", handle: "runner", email: "runner@example.test", role: "USER", plan: "FREE", settings: { profileSetupDismissed: true, defaultLanguage: "python3" }, bio: "", avatarUrl: null, school: null, isStudent: false, hasPassword: true, csrfToken: "test" };
  await page.route("http://127.0.0.1:55440/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: user });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, nextCursor: null, asOf: new Date().toISOString() } });
    if (path === "/runs" && route.request().method() === "POST") { lastCases = route.request().postDataJSON().cases; return route.fulfill({ json: { id: "run-fixture" } }); }
    if (path.startsWith("/runs/")) {
      if (delayed) await new Promise((resolve) => setTimeout(resolve, 600));
      const result = { runId: "run-fixture", status: "DONE", cases: lastCases.map((c) => ({ id: c.id, stdout: c.sampleOrd === 1 ? "1\n" : "2\n", stderr: "", timeMs: 10, exitCode: 0, timedOut: false, ...(c.sampleOrd === 1 ? { verdict: "AC" } : {}) })) };
      return path.endsWith("/stream") ? route.fulfill({ contentType: "text/event-stream", body: `event: status\ndata: ${JSON.stringify(result)}\n\n` }) : route.fulfill({ json: result });
    }
    if (path === "/billing/me") return route.fulfill({ json: { plan: "FREE", submits: { used: 0, limit: 20 }, runs: { used: 0, limit: 20 } } });
    return route.fulfill({ json: { items: [], total: 0, page: 1 } });
  });
  try {
    await page.goto(`/problems/${problem.slug}`);
    const run = page.getByRole("button", { name: "▶ 執行", exact: true }), input = page.getByRole("textbox", { name: "輸入", exact: true });
    await expect(run).toBeEnabled(); await run.click(); await expect(page.getByText("與預期相符", { exact: true })).toBeVisible();
    expect(lastCases).toEqual([{ id: "sample-1", input: "1\n", sampleOrd: 1 }]);
    await input.fill("2\n"); await expect(page.getByText("與預期相符", { exact: true })).toHaveCount(0); await expect(page.getByText(/已修改輸入：只顯示/)).toBeVisible();
    await run.click(); await expect(page.getByText("此結果僅供檢視輸出，未進行答案比對。")).toBeVisible(); expect(lastCases).toEqual([{ id: "sample-1", input: "2\n" }]);
    await page.getByRole("button", { name: "還原範例" }).click(); delayed = true; await run.click(); await input.fill("3\n");
    await expect(run).toBeEnabled(); await expect(page.getByText(/程式碼、語言或輸入已變更/)).toBeVisible(); await expect(page.getByText("與預期相符", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "還原範例" }).click(); await run.click(); await expect(page.getByText("與預期相符", { exact: true })).toBeVisible();
    await page.getByRole("combobox", { name: "語言", exact: true }).selectOption("cpp17"); await expect(page.getByText(/程式碼、語言或輸入已變更/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: info.outputPath("run-stale-result.png"), fullPage: true });
  } finally { await db.problem.delete({ where: { id: problem.id } }); await db.$disconnect(); }
});
