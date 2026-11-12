import { test, expect, type Page } from "@playwright/test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Requires the managed local API and disposable database");

// The C learning map (/learn/c) holds full class solutions: only tutored students and admins may see
// its content. This uses a small fake bundle — the real content is private and never in the repo.
test("the C learning map shows its content to tutored students only", async ({ browser }) => {
  test.setTimeout(180_000);
  const dbUrl = new URL(process.env.DATABASE_URL ?? "invalid:");
  if (dbUrl.hostname !== "127.0.0.1" || dbUrl.port !== "55432" || dbUrl.pathname !== "/oj_test") throw new Error("Disposable test database required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json"));
  const { PrismaClient } = requireApi("@prisma/client"), argon2 = requireApi("argon2");
  const db = new PrismaClient({ errorFormat: "minimal" });
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12), password = `Local_${randomUUID()}!`;
  const users: string[] = [];
  const previous = await db.learnContent.findUnique({ where: { slug: "c" } });
  const content = {
    chapters: [{ id: "ch-basics", title: "程式的骨架", short: "骨架", lead: "測試用的章節", num: 1, practice: [], md: "## 最小的 C 程式\n\n測試內容：只有學生看得到。\n" }],
    problems: [], practice: [],
  };
  const account = async (name: string, data: Record<string, unknown>) => {
    const u = await db.user.create({ data: { handle: `${name}_${suffix}`, email: `${name}_${suffix}@example.test`, passwordHash: await argon2.hash(password), settings: { uiLocale: "zh-TW", profileSetupDismissed: true, onboardingDismissed: true }, ...data } });
    users.push(u.id);
    return u.handle as string;
  };
  const open = async (handle: string | null): Promise<Page> => {
    const page = await (await browser.newContext()).newPage();
    if (handle) expect((await page.context().request.post("http://127.0.0.1:55440/auth/login", { data: { handle, password } })).ok()).toBe(true);
    await page.goto("/learn/c");
    return page;
  };
  try {
    await db.learnContent.upsert({ where: { slug: "c" }, create: { slug: "c", version: `e2e-${suffix}`, content }, update: { version: `e2e-${suffix}`, content } });
    const student = await account("learnstu", { isStudent: true }), other = await account("learnusr", {});

    const anon = await open(null);
    await expect(anon.locator("#gate")).toContainText("請先登入");
    await expect(anon.locator("#chapters")).toBeHidden();

    const outsider = await open(other);
    await expect(outsider.locator("#gate")).toContainText("還沒有開通");
    await expect(outsider.getByText("只有學生看得到")).toHaveCount(0);

    const page = await open(student);
    await expect(page.getByText("只有學生看得到")).toBeVisible();
    await expect(page.locator("#gate")).toBeHidden();
    // The static shell itself carries no course content.
    expect((await page.context().request.get("/learn/c/data.js")).status()).toBe(404);
  } finally {
    await db.user.deleteMany({ where: { id: { in: users } } });
    if (previous) await db.learnContent.update({ where: { slug: "c" }, data: { version: previous.version, content: previous.content } });
    else await db.learnContent.deleteMany({ where: { slug: "c" } });
    await db.$disconnect();
  }
});
