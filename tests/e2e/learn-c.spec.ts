import { test, expect, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Requires the managed local API and disposable database");

// The C learning map (/learn/c) holds full class solutions: only students enrolled in C (learnC) and
// admins may see it. This uses a small fake bundle — the real content is private and never in the repo.
test("the C learning map is only for students enrolled in C, and its practice runs in the browser", async ({ browser }) => {
  test.setTimeout(240_000);
  const dbUrl = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (dbUrl.hostname !== "127.0.0.1" || dbUrl.port !== "55432" || dbUrl.pathname !== "/oj_test") throw new Error("Disposable test database required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json"));
  const { PrismaClient } = requireApi("@prisma/client"), argon2 = requireApi("argon2");
  const db = new PrismaClient({ errorFormat: "minimal" });
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12), password = `Local_${randomUUID()}!`;
  const users: string[] = [];
  const previous = await db.learnContent.findUnique({ where: { slug: "c" } });
  const hello = "#include <stdio.h>\n\nint main() {\n    printf(\"hi\\n\");\n    return 0;\n}\n";
  const content = {
    chapters: [{
      id: "ch-basics", title: "程式的骨架", short: "骨架", lead: "測試用的章節", num: 1, practice: ["e2e-hello"],
      md: "## 最小的 C 程式\n\n測試內容：只有學 C 的學生看得到。\n\n:::practice e2e-hello\n:::\n\n:::anim for-order\n:::\n",
    }],
    problems: [],
    practice: [{
      id: "e2e-hello", title: "印出 hi", level: 1, desc: "印出 `hi`。", chapter: "ch-basics", broken: false, hint: "用 printf。",
      starter: "#include <stdio.h>\n\nint main() {\n    return 0;\n}\n", solution: hello,
      tests: [{ input: "", output: "hi\n" }, { input: "", output: "hi\n" }],
    }],
  };
  const account = async (name: string, data: Record<string, unknown>) => {
    const u = await db.user.create({ data: { handle: `${name}_${suffix}`, email: `${name}_${suffix}@example.test`, passwordHash: await argon2.hash(password), settings: { uiLocale: "zh-TW", profileSetupDismissed: true, onboardingDismissed: true }, ...data } });
    users.push(u.id);
    return u.handle as string;
  };
  const open = async (handle: string | null): Promise<{ page: Page; errors: string[] }> => {
    const page = await (await browser.newContext()).newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // Expected API refusals, and Vercel Analytics (its script only exists on Vercel), are not page errors.
    page.on("console", (m) => { if (m.type() === "error" && !/status of (401|403|404)|_vercel\/insights/.test(m.text())) errors.push(m.text()); });
    if (handle) expect((await page.context().request.post("http://127.0.0.1:55440/auth/login", { data: { handle, password } })).ok()).toBe(true);
    await page.goto("/learn/c");
    return { page, errors };
  };
  try {
    await db.learnContent.upsert({ where: { slug: "c" }, create: { slug: "c", version: `e2e-${suffix}`, content }, update: { version: `e2e-${suffix}`, content } });
    const cStudent = await account("learnc", { isStudent: true, learnC: true });
    const cpeStudent = await account("learncpe", { isStudent: true });

    const anon = await open(null);
    await expect(anon.page.getByRole("status")).toContainText("請先登入");
    await expect(anon.page.getByText("只有學 C 的學生看得到")).toHaveCount(0);

    const cpe = await open(cpeStudent);
    await expect(cpe.page.getByRole("status")).toContainText("還沒有開通");
    await expect(cpe.page.getByRole("link", { name: "C 語言學習地圖" })).toHaveCount(0);

    const { page, errors } = await open(cStudent);
    await expect(page.getByText("只有學 C 的學生看得到")).toBeVisible();
    // On narrow screens the navigation links sit behind the menu button.
    const menu = page.getByRole("button", { name: "開啟選單" });
    if (await menu.isVisible()) await menu.click();
    await expect(page.getByRole("link", { name: "C 語言學習地圖" }).first()).toBeVisible();
    if (await page.getByRole("button", { name: "關閉選單" }).isVisible()) await page.getByRole("button", { name: "關閉選單" }).click();
    // The practice editor runs the student's code in the bundled Web Worker.
    const practice = page.locator("#pr-e2e-hello");
    await practice.scrollIntoViewIfNeeded();
    await practice.locator(".ed-ta").fill(hello);
    await practice.locator('[data-a="check"]').click();
    await expect(practice.locator(".res-pass")).toContainText("全部通過", { timeout: 20_000 });
    const anim = page.locator('.anim[data-anim="for-order"]');
    await anim.scrollIntoViewIfNeeded();
    await anim.locator('[data-p="next"]').click();
    await expect(anim.locator(".pl-pos")).toHaveText(/^2 \//);
    expect(errors).toEqual([]);
    // No course content is served as a static file.
    expect((await page.context().request.get("/learn/c/data.js")).status()).toBe(404);
  } finally {
    await db.user.deleteMany({ where: { id: { in: users } } });
    if (previous) await db.learnContent.update({ where: { slug: "c" }, data: { version: previous.version, content: previous.content } });
    else await db.learnContent.deleteMany({ where: { slug: "c" } });
    await db.$disconnect();
  }
});
