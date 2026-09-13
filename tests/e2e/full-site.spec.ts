import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Requires the managed local API and disposable database");

test("all page entrypoints render with real API data and accessible mobile/desktop layout", async ({ page }, info) => {
  test.setTimeout(300_000);
  const dbUrl = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (dbUrl.hostname !== "127.0.0.1" || dbUrl.port !== "55432" || dbUrl.pathname !== "/oj_test") throw new Error("Disposable test database required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json"));
  const { PrismaClient } = requireApi("@prisma/client"), argon2 = requireApi("argon2");
  const db = new PrismaClient({ errorFormat: "minimal" });
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12), password = `Local_${randomUUID()}!`;
  let userId: string | undefined, problemId: string | undefined, contestId: string | undefined, collectionId: string | undefined;
  const report: unknown[] = [];
  const refundIds = Array.from({ length: 4 }, (_, index) => `r${suffix}${index}`);
  try {
    const user = await db.user.create({ data: { handle: `site_${suffix}`, email: `${suffix}@example.test`, passwordHash: await argon2.hash(password), role: "ADMIN", isStudent: true, school: "國立臺灣大學", settings: { uiLocale: "zh-TW", profileSetupDismissed: true, onboardingDismissed: true } } }); userId = user.id;
    const problem = await db.problem.create({ data: { slug: `site-problem-${suffix}`, title: "兩數相加：理解輸入與輸出", statementMd: "## 題目說明\n\n讀取兩個整數，輸出它們的和。\n\n```text\n1 2\n```", inputSpecMd: "兩個整數 a 與 b。", outputSpecMd: "輸出 a + b。", samples: { create: { ord: 0, input: "1 2\n", output: "3\n" } }, testCases: { create: { ord: 0, input: "1 2\n", output: "3\n" } } } }); problemId = problem.id;
    const contest = await db.contest.create({ data: { slug: `cpe-2026-05-26-${suffix}`, title: "CPE 模擬測驗", kind: "CPE", freezeMin: 0, problems: { create: { problemId, label: "A", ord: 0 } } } }); contestId = contest.id;
    const collection = await db.collection.create({ data: { slug: `site-collection-${suffix}`, title: "程式設計入門", description: "循序練習，從輸入輸出開始。", category: "演算法主題", problems: { create: { problemId, ord: 0 } } } }); collectionId = collection.id;
    const lesson = await db.classSession.create({ data: { studentId: userId, teacherId: userId, number: 1, title: "輸入輸出與基本運算", contentMd: "## 今日重點\n\n讀懂題意並測試邊界值。", homework: { create: { problemId, ord: 0 } } } });
    await db.assignment.create({ data: { title: "第一週練習", description: "完成題目並記錄解題思路。", createdById: userId, problems: { create: { problemId, ord: 0 } }, assignees: { create: { userId } } } });
    const post = await db.post.create({ data: { authorId: userId, title: "如何安排第一週的練習", bodyMd: "從一題開始，記錄每次錯誤，最後整理自己的解題筆記。", category: "GENERAL", publishedAt: new Date() } });
    await db.submission.create({ data: { userId, problemId, sourceCode: "int main(){}", languageKey: "cpp17", status: "AC", verdict: "AC", judgedOn: "SELF", timeMs: 10, memoryKb: 1024 } });
    await db.submission.createMany({ data: ["WA", "TLE", "MLE", "RE", "RF", "CE", "PE", "OLE", "SE"].map((verdict) => ({ userId, problemId, sourceCode: "int main(){}", languageKey: "cpp17", status: verdict, verdict, judgedOn: "SELF", timeMs: 1234, memoryKb: 65536 })) });
    await db.notification.createMany({ data: [
      { userId, type: "CONTENT_REVIEW", title: "你的文章已通過審核", body: "你的練習心得已公開，現在可以和其他同學分享。", link: `/discussion/${post.id}` },
      { userId, type: "CLASS_UPDATE", title: "課程內容已更新", body: "輸入輸出與基本運算：新增課後練習。", link: `/classes/${lesson.id}`, readAt: new Date() },
    ] });
    const payment = await db.payment.create({ data: { userId, method: "ECPAY", ecpayMethod: "CREDIT", status: "AUTHORIZED", period: "MONTHLY", amountNtd: 200, merchantTradeNo: `TEST${suffix}`, ecpayTradeNo: `GW${suffix}` } });
    await db.refundRequest.createMany({ data: ["NEEDS_REVIEW", "REQUESTED", "PROCESSING", "COMPLETED"].map((status, index) => ({
      id: refundIds[index], userId: index === 0 ? userId : refundIds[index], paymentId: index === 0 ? payment.id : refundIds[index],
      status, amountNtd: 200, merchantTradeNo: `TEST${suffix}${index}`, attempts: 1,
      ...(index === 0 ? { inFlightAction: "R", lastError: "Local fixture: response interrupted after send" } : {}),
      ...(index === 3 ? { completedAt: new Date(), refundConfirmedAt: new Date() } : {}),
    })) });
    const login = await page.context().request.post("http://127.0.0.1:55440/auth/login", { data: { handle: user.handle, password } });
    expect(login.ok()).toBe(true);
    const routes = ["/", "/problems", `/problems/${problem.slug}`, "/collections", `/collections/${collection.slug}`, "/contests", `/contests/${contestId}`, "/cpe", "/gpe", "/leaderboard", "/submissions", `/u/${user.handle}`, "/assignments", "/classes", `/classes/${lesson.id}`, "/discussion", `/discussion/${post.id}`, "/discussion/write", "/discussion/mine", "/notifications", "/settings", "/upgrade", "/upgrade/checkout", "/pricing", "/faq", "/about", "/terms", "/privacy", "/refund", "/admin", "/admin/problems", "/admin/contests", "/admin/classes", `/admin/classes/${userId}`, `/admin/classes/${userId}/${lesson.id}`, "/admin/users", "/admin/assignments", "/admin/billing", "/admin/analytics", "/admin/moderation", "/login", "/register"];
    for (const theme of ["light", "dark"] as const) {
      await page.addInitScript((value) => { localStorage.setItem("theme", value); localStorage.setItem("locale", "zh-TW"); }, theme);
      for (const [index, route] of routes.entries()) {
      const errors: string[] = [], onError = (error: Error) => errors.push(error.message);
      page.on("pageerror", onError);
      const response = await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await page.waitForLoadState("networkidle");
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
      const screenshot = `${theme}-${String(index + 1).padStart(2, "0")}-${route.replace(/[^a-z0-9]+/gi, "-")}.png`;
      await page.screenshot({ path: info.outputPath(screenshot), fullPage: true });
      const violations = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) }));
      report.push({ theme, route, status: response?.status(), overflow, errors, violations });
      expect.soft(response?.status(), route).toBeLessThan(400);
      expect.soft(errors, route).toEqual([]);
      expect.soft(overflow, route).toBe(false);
      expect.soft(violations, route).toEqual([]);
      if (route === "/") {
        const greetingFits = await page.locator("h1").evaluate((element) => element.scrollWidth <= element.clientWidth + 1);
        expect.soft(greetingFits, "The full account name fits inside the dashboard heading").toBe(true);
      }
      if (route === "/submissions") {
        const trigger = page.getByRole("button", { name: /查看「/ }).first();
        await trigger.focus(); await page.keyboard.press("Enter");
        await expect(page.getByRole("dialog", { name: /(提交|送出)紀錄/ })).toBeVisible();
        await expect(page.getByText("int main(){}", { exact: true })).toBeVisible();
        const modalAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect.soft(modalAxe.violations, `${theme}: submission dialog`).toEqual([]);
        await page.screenshot({ path: info.outputPath(`${theme}-submission-dialog.png`), fullPage: true });
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toBeHidden();
        await expect(trigger).toBeFocused();
      }
      if (route === "/admin/billing") {
        const refund = page.getByRole("article", { name: `需要人工核對 · TEST${suffix}0` });
        await expect(refund).toBeVisible();
        await refund.getByText("查看處理細節", { exact: true }).click();
        await expect(refund.getByText("Local fixture: response interrupted after send", { exact: true })).toBeVisible();
        await page.getByRole("button", { name: /^已完成退款 ·/ }).click();
        await expect(page.getByRole("article", { name: `已完成退款 · TEST${suffix}3` })).toBeVisible();
        await expect(refund).toBeHidden();
        await page.screenshot({ path: info.outputPath(`${theme}-refund-history.png`), fullPage: true });
      }
      page.off("pageerror", onError);
      }
    }
  } finally {
    await writeFile(info.outputPath("page-audit.json"), JSON.stringify(report, null, 2));
    await info.attach("page-audit", { body: JSON.stringify(report, null, 2), contentType: "application/json" });
    await db.refundRequest.deleteMany({ where: { id: { in: refundIds } } });
    if (userId) await db.user.delete({ where: { id: userId } });
    if (contestId) await db.contest.delete({ where: { id: contestId } });
    if (collectionId) await db.collection.delete({ where: { id: collectionId } });
    if (problemId) await db.problem.delete({ where: { id: problemId } });
    await db.$disconnect();
  }
});
