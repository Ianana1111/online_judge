import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";

test("sample Run uses server comparisons; edits and language changes invalidate results", async ({ page }, info) => {
  test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Requires isolated database for the server-rendered problem");
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
    expect(lastCases).toEqual([{ id: "sample-1", input: "1\n", sampleOrd: 1, sampleRevision: expect.stringMatching(/^[a-f0-9]{64}$/) }]);
    await page.getByRole("tab", { name: "測試資料", exact: true }).click();
    await input.fill("2\n"); await expect(page.getByText("與預期相符", { exact: true })).toHaveCount(0); await expect(page.getByText(/已修改輸入：只顯示/)).toBeVisible();
    await run.click(); await expect(page.getByText("此結果僅供檢視輸出，未進行答案比對。")).toBeVisible(); expect(lastCases).toEqual([{ id: "sample-1", input: "2\n" }]);
    await page.getByRole("tab", { name: "測試資料", exact: true }).click();
    await page.getByRole("button", { name: "還原範例" }).click(); delayed = true; await run.click();
    await page.getByRole("tab", { name: "測試資料", exact: true }).click(); await input.fill("3\n");
    await expect(run).toBeEnabled(); await expect(page.getByText(/程式碼、語言或輸入已變更/)).toBeVisible(); await expect(page.getByText("與預期相符", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "還原範例" }).click(); await run.click(); await expect(page.getByText("與預期相符", { exact: true })).toBeVisible();
    await page.getByRole("combobox", { name: "語言", exact: true }).selectOption("cpp17"); await expect(page.getByText(/程式碼、語言或輸入已變更/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: info.outputPath("run-stale-result.png"), fullPage: true });
  } finally { await db.problem.delete({ where: { id: problem.id } }); await db.$disconnect(); }
});

for (const verdict of ["AC", "WA"] as const) test(`Run beside Submit opens a closable result, and submission heading stays English (${verdict})`, async ({ page }, info) => {
  const user = { id: "c000000000000000000000001", handle: "runner", email: "runner@example.test", role: "USER", plan: "FREE", settings: { profileSetupDismissed: true, defaultLanguage: "python3" }, bio: "", avatarUrl: null, school: null, isStudent: false, hasPassword: true, csrfToken: "test" };
  const problem = { id: "run-ui-problem", slug: "run-ui", title: "Echo sample", statementMd: "Read an integer and print it.", tags: [], samples: [{ ord: 1, input: "1\n", output: "1\n" }], judgeable: true, checkerType: "IGNORE_TRAILING_WS", timeLimitMs: 1000, memoryLimitKb: 65536, difficulty: 1, cpeAppearances: null, uvaId: null };
  const contest = { id: "run-ui-contest", slug: "cpe-run-ui", title: "Run UI fixture", kind: "CPE", startAt: null, durationMin: 180, penaltyMin: 20, isPublic: true,
    problems: [{ ord: 1, label: "A", problem }], myParticipant: { id: "run-ui-participant", startedAt: new Date().toISOString(), endsAt: new Date(Date.now() + 3600_000).toISOString(), status: "RUNNING", attemptNumber: 1 }, solvedProblemIds: [], myAttempts: [], serverNow: new Date().toISOString() };
  let runs = 0, submissions = 0, failCompile = false;
  await page.addInitScript((theme) => localStorage.setItem("theme", theme), verdict === "AC" ? "light" : "dark");
  await page.route("http://127.0.0.1:55440/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: user });
    if (path === "/contests/run-ui-contest") return route.fulfill({ json: { ...contest, serverNow: new Date().toISOString() } });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path.endsWith("/scoreboard")) return route.fulfill({ json: { standings: [], frozen: false } });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0 } });
    if (path === "/billing/me") return route.fulfill({ json: { plan: "FREE", submits: { used: 0, limit: 20 }, runs: { used: 0, limit: 20 } } });
    if (path === "/runs") { runs++; return route.fulfill({ json: { id: "run-ui-result" } }); }
    if (path.startsWith("/runs/")) {
      const result = failCompile ? { runId: "run-ui-result", status: "COMPILE_ERROR", compileError: "Synthetic compiler diagnostic" } : { runId: "run-ui-result", status: "DONE", cases: [{ id: "sample-1", verdict, stdout: verdict === "AC" ? "1\n" : "2\n", timeMs: 10, exitCode: 0, timedOut: false, stderr: "" }] };
      return path.endsWith("/stream") ? route.fulfill({ contentType: "text/event-stream", body: `event: status\ndata: ${JSON.stringify(result)}\n\n` }) : route.fulfill({ json: result });
    }
    if (path === "/submissions" && route.request().method() === "POST") { submissions++; return route.fulfill({ json: { id: "submit-ui-result" } }); }
    if (path.startsWith("/submissions/")) {
      const result = { id: "submit-ui-result", verdict, createdAt: new Date().toISOString(), timeMs: 10, memoryKb: 1024 };
      return path.endsWith("/stream") ? route.fulfill({ contentType: "text/event-stream", body: `event: status\ndata: ${JSON.stringify(result)}\n\n` }) : route.fulfill({ json: result });
    }
    if (path.endsWith("/stats")) return route.fulfill({ json: { timeHistogram: [], memoryAvailable: false, yourRun: null } });
    return route.fulfill({ json: {} });
  });
  const errors: string[] = []; page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/contests/run-ui-contest"); await page.getByRole("button", { name: "A Echo sample", exact: true }).click();
  const run = page.getByRole("button", { name: "▶ 執行", exact: true });
  const submit = page.getByRole("button", { name: "送出", exact: true });
  await expect(run).toBeEnabled(); await expect(submit).toBeEnabled();
  expect(await run.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(17, 17, 17)");
  const rb = (await run.boundingBox())!, sb = (await submit.boundingBox())!;
  expect(Math.abs(rb.y - sb.y)).toBeLessThan(4); expect(sb.x - (rb.x + rb.width)).toBeLessThan(16);
  await run.click();
  const result = page.getByRole("tabpanel", { name: "執行結果", exact: true });
  await expect(result).toContainText(verdict === "AC" ? "與預期相符" : "與預期不符");
  await expect(result).toBeInViewport();
  await expect(page.getByRole("textbox", { name: "輸入", exact: true })).toHaveCount(0);
  expect(runs).toBe(1); expect(submissions).toBe(0);
  await page.screenshot({ path: info.outputPath(`run-result-${verdict}.png`), fullPage: true });
  const audit = await new AxeBuilder({ page }).include("form").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations).toEqual([]);
  await page.getByRole("button", { name: "關閉執行結果", exact: true }).click();
  await expect(page.getByRole("tab", { name: "執行結果", exact: true })).toHaveCount(0);
  const input = page.getByRole("textbox", { name: "輸入", exact: true }); await expect(input).toHaveValue("1\n");
  await run.click(); await expect(result).toContainText("執行完成");
  await page.getByRole("combobox", { name: "語言", exact: true }).selectOption("cpp17");
  await expect(result).toContainText("程式碼、語言或輸入已變更");
  await expect(result.getByText("與預期相符", { exact: true })).toHaveCount(0);
  failCompile = true; await run.click(); await expect(result).toContainText("Synthetic compiler diagnostic");
  await submit.click();
  await expect(page.getByRole("heading", { name: verdict === "AC" ? "Accept" : "Wrong Answer", exact: true })).toBeVisible();
  await expect(page.locator("#problem-tabpanel-result")).not.toContainText(/答案正確|答案錯誤/);
  await expect(result).toContainText("Synthetic compiler diagnostic"); expect(submissions).toBe(1);
  await page.getByRole("button", { name: "關閉結果", exact: true }).click();
  await expect(page.locator("#problem-tabpanel-result")).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
