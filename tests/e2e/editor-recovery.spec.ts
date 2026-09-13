import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Requires isolated database and built API");

for (const unavailable of [false, true]) test(`editor preserves language drafts and custom cases when storage is ${unavailable ? "unavailable" : "available"}`, async ({ page }) => {
  const url = new URL(process.env.DATABASE_URL!); if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable local database required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json")), { PrismaClient } = requireApi("@prisma/client"), argon2 = requireApi("argon2");
  const db = new PrismaClient(), suffix = randomUUID().replaceAll("-", ""), password = `Local_${suffix}`;
  let userId: string | undefined, problemId: string | undefined;
  try {
    const user = await db.user.create({ data: { handle: `draft_${suffix}`, email: `${suffix}@example.test`, passwordHash: await argon2.hash(password), settings: { profileSetupDismissed: true, defaultLanguage: "python3" } } }); userId = user.id;
    const p = await db.problem.create({ data: { slug: `editor-${suffix}`, title: "編輯器復原測試", statementMd: "Read and add two numbers.", testCases: { create: { ord: 0, input: "1 2\n", output: "3\n" } }, samples: { create: { ord: 0, input: "1 2\n", output: "3\n" } } } }); problemId = p.id;
    const login = await page.context().request.post("http://127.0.0.1:55440/auth/login", { data: { handle: user.handle, password } }); expect(login.ok()).toBe(true);
    const key = `oj:testcases:${user.id}:${p.slug}`, draftKey = `oj:draft:${user.id}:${p.slug}`;
    await page.addInitScript(({ key, unavailable }) => {
      localStorage.setItem("locale", "zh-TW");
      if (unavailable) {
        const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
        Storage.prototype.getItem = function (k) { if (k.startsWith("oj:")) throw new DOMException("Denied", "SecurityError"); return get.call(this, k); };
        Storage.prototype.setItem = function (k, v) { if (k.startsWith("oj:")) throw new DOMException("Full", "QuotaExceededError"); return set.call(this, k, v); };
      } else if (sessionStorage.getItem(key) !== "seeded") { localStorage.setItem(key, JSON.stringify([{ id: "custom-preserved", input: "41 1\n" }, { id: "sample-0", input: "invalid cache" }, { id: "custom-preserved", input: "duplicate" }])); sessionStorage.setItem(key, "seeded"); }
    }, { key, unavailable });
    const errors: string[] = []; page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/problems/${p.slug}`); const language = page.getByRole("combobox", { name: "語言", exact: true }); await expect(language).toHaveValue("python3");
    const editor = page.locator(".monaco-editor textarea").first(); await expect(editor).toBeVisible();
    await expect.poll(async () => (await page.locator(".monaco-editor").first().boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(190);
    // Device profiles advertise Windows/Android to Monaco, so its select-all binding is Ctrl+A
    // even when Playwright itself is launched on a macOS host.
    await page.locator(".monaco-editor .view-lines").first().click(); await page.keyboard.press("Control+A"); await page.keyboard.type("print(42)", { delay: 30 }); await page.keyboard.press("Enter");
    await expect(page.locator(".monaco-editor").first()).toContainText("print(42)");
    await language.selectOption("cpp17"); await language.selectOption("python3"); await expect(page.locator(".monaco-editor").first()).toContainText("print(42)");
    if (unavailable) {
      await expect(page.getByRole("alert").filter({ hasText: "無法保存自訂測資" })).toBeVisible();
      await page.getByRole("button", { name: /新增.*測資|Add case/ }).click(); await page.getByRole("textbox", { name: "輸入", exact: true }).fill("41 1");
    } else {
      await page.getByRole("button", { name: "Case 1", exact: true }).click(); const input = page.getByRole("textbox", { name: "輸入", exact: true }); await expect(input).toHaveValue("41 1\n"); await input.fill("100 23\n");
      await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!)[0].input, key)).toBe("100 23\n");
      await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).sources.python3, draftKey)).toBe("print(42)\n");
      await page.reload(); await expect(language).toHaveValue("python3"); await page.getByRole("button", { name: "Case 1", exact: true }).click(); await expect(input).toHaveValue("100 23\n");
      if (await page.getByRole("separator", { name: "調整題目與編輯器寬度" }).count()) {
        const divider = page.getByRole("separator", { name: "調整題目與編輯器寬度" }); await divider.focus(); await page.keyboard.press("ArrowRight"); await expect(divider).toHaveAttribute("aria-valuenow", "55");
      }
      await page.goto("/"); await expect(page.getByRole("link", { name: "繼續最近編輯的題目" })).toHaveAttribute("href", `/problems/${p.slug}`);
    }
    expect(errors).toEqual([]);
  } finally { if (userId) await db.user.delete({ where: { id: userId } }); if (problemId) await db.problem.delete({ where: { id: problemId } }); await db.$disconnect(); }
});
