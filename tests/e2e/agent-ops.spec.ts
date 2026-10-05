import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { OpsDashboard, OpsRun, OpsStep } from "../../packages/shared/src/agentOps";

test("JudgeOps reports, controls and executor onboarding work on desktop/mobile", async ({ page }, info) => {
  const now = new Date().toISOString();
  const step: OpsStep = { role: "REVIEW", model: "codex-test", inputTokens: 1200, outputTokens: 240, completedAt: now,
    output: { summary: "判題執行器心跳過期，佇列仍有等待工作。需要先查閱部署狀態，尚無足夠資料確認根因。", specialist: "SRE", findings: [{ text: "執行器已超過兩分鐘未回報心跳。", evidenceIds: ["judge"] }], hypotheses: ["worker 可能已停止，仍需服務日誌驗證。"], actions: [{ title: "確認最近部署", detail: "比對部署完成時間與心跳停止時間。", risk: "READ_ONLY" }, { title: "必要時重新部署", detail: "先確認造成中斷的原因與復原方式。", risk: "CHANGE_REQUIRED" }], limitations: ["HTTP 探測未涵蓋真實付款與 Google 登入流程。"], review: "NEEDS_EVIDENCE" } };
  const report: OpsRun = { id: "report1", kind: "DAILY", title: "今日每日維運摘要", status: "COMPLETED", incidentId: null, createdAt: now, startedAt: now, completedAt: now, availableAt: now, errorCode: null, attempts: 1, steps: [{ ...step, role: "TRIAGE", output: { ...step.output, review: "NOT_REVIEWED" } }, { ...step, role: "SRE", output: { ...step.output, review: "NOT_REVIEWED" } }, step], evidence: [{ id: "judge", label: "判題執行器", observedAt: now, data: { heartbeatAgeSeconds: 180, runErrors15m: 3, rssMb: null } }] };
  const paused: OpsRun = { ...report, id: "paused1", kind: "INCIDENT", title: "範例執行異常", status: "PAUSED", errorCode: "QUOTA", steps: [], completedAt: null };
  const data: OpsDashboard = { measuredAt: now, settings: { dispatchEnabled: false, dailyRunLimit: 4 }, monitor: { enabled: true, lastCollectedAt: now, error: false, healthy: false }, counts: { queued: 0, running: 0, paused: 1, completed24h: 1, openIncidents: 1, startsToday: 2 }, credentials: [], incidents: [{ id: "incident1", code: "RUN_SYSTEM_ERRORS", title: "範例執行服務出現錯誤", severity: "HIGH", firstSeenAt: now, lastSeenAt: now, recoveredAt: null }], runs: [report, paused] };
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.route("http://127.0.0.1:55440/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: { id: "opsadmin", handle: "operator", role: "ADMIN", plan: "PRO", settings: { profileSetupDismissed: true }, csrfToken: "fixture" } });
    if (path === "/agent-ops") return route.fulfill({ json: data });
    if (path.startsWith("/agent-ops/")) expect(route.request().headers()["x-csrf-token"]).toBe("fixture");
    if (path === "/agent-ops/settings") { data.settings = route.request().postDataJSON(); return route.fulfill({ json: {} }); }
    if (path === "/agent-ops/runs/paused1/retry") { paused.status = "QUEUED"; paused.errorCode = null; return route.fulfill({ json: { ok: true } }); }
    if (path === "/agent-ops/credentials") return route.fulfill({ json: { token: "jo_" + "a".repeat(64) } });
    return route.fulfill({ json: [] });
  });
  await page.goto("/admin/agent-ops");
  await expect(page.getByRole("heading", { name: "AI 維運中心" })).toBeVisible();
  await expect(page.getByText("仍需補充證據", { exact: true })).toBeVisible();
  await expect(page.getByText("涉及修改，尚未執行", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /範例執行異常/ }).click();
  await expect(page.getByText("Codex 額度不足，已暫停；額度恢復後可重試", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "接續重試" }).click();
  await expect(page.getByRole("article", { name: "調查報告" }).getByText("等待執行", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "開啟調查派工" }).click();
  await expect(page.getByRole("button", { name: "暫停所有派工" })).toBeVisible();
  await page.getByRole("button", { name: "建立連線憑證" }).click();
  await expect(page.getByLabel("新的執行器憑證")).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "已保存，關閉" }).click();
  await expect(page.getByLabel("新的執行器憑證")).toHaveCount(0);
  await page.getByRole("button", { name: /今日每日維運摘要/ }).click();
  await page.getByText("查看交接紀錄與用量", { exact: true }).click();
  await expect(page.getByText(/輸入 1,200/)).toHaveCount(3);
  for (const theme of ["dark", "light"]) {
    await page.evaluate(theme => { localStorage.setItem("theme", theme); }, theme);
    await page.reload();
    await expect(page.getByRole("heading", { name: "AI 維運中心" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(audit.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.screenshot({ path: info.outputPath(`judgeops-${theme}.png`), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test("JudgeOps shows stale/offline data without reporting everything healthy", async ({ page }) => {
  await page.route("http://127.0.0.1:55440/**", route => {
    if (new URL(route.request().url()).pathname === "/auth/me") return route.fulfill({ json: { id: "admin", role: "ADMIN", handle: "operator", settings: { profileSetupDismissed: true } } });
    return route.fulfill({ status: 503, json: { message: "Temporarily unavailable" } });
  });
  await page.goto("/admin/agent-ops");
  await expect(page.locator("main [role=alert]")).toContainText("無法取得最新維運資料", { timeout: 20000 });
  await expect(page.getByText("運作中", { exact: true })).toHaveCount(0);
});
