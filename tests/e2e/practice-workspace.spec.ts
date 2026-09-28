import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

test("standalone practice uses compact chrome without moving the workspace", async ({ page }, info) => {
  test.skip(process.env.RUN_FULL_SITE_E2E !== "1", "Requires the disposable problem database");
  const url = new URL(process.env.DATABASE_URL!);
  if (url.hostname !== "127.0.0.1" || url.port !== "55432" || url.pathname !== "/oj_test") throw new Error("Disposable database required");
  const requireApi = createRequire(resolve(__dirname, "../../apps/api/package.json"));
  const { PrismaClient } = requireApi("@prisma/client");
  const db = new PrismaClient();
  const problem = await db.problem.create({ data: {
    slug: `practice-${randomUUID()}`, title: "Practice layout fixture", statementMd: "Read an integer and print it.",
    samples: { create: { ord: 1, input: "1\n", output: "1\n" } },
    testCases: { create: { ord: 1, input: "1\n", output: "1\n" } },
  } });
  const nextProblem = await db.problem.create({ data: {
    slug: `practice-next-${randomUUID()}`, title: "Next practice fixture", statementMd: "The next problem is ready.",
  } });
  await page.route("http://127.0.0.1:55440/**", async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ status: 401, json: { message: "Unauthorized" } });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/problems") return route.fulfill({ json: { items: [problem, nextProblem].map(p => ({ ...p, tags: ["math"], solvedByMe: false })), total: 2, page: 1 } });
    if (path === "/collections/cpe-basic-49") return route.fulfill({ json: { slug: "cpe-basic-49", title: "CPE 必考 49 題", problems: [problem, nextProblem].map(p => ({ ...p, tags: ["math"], solvedByMe: false })) } });
    return route.fulfill({ json: { items: [], total: 0, page: 1 } });
  });
  try {
    await page.goto(`/problems/${problem.slug}`);
    await expect(page.getByText("Read an integer and print it.", { exact: true })).toBeVisible();
    const nav = page.locator(".site-navbar");
    const main = page.locator("#main-content");
    const viewportWidth = page.viewportSize()!.width;
    const bounds = await main.boundingBox();
    expect(bounds!.width).toBe(viewportWidth);
    expect(await main.evaluate(el => parseFloat(getComputedStyle(el).paddingLeft))).toBeGreaterThanOrEqual(12);
    expect(await main.evaluate(el => parseFloat(getComputedStyle(el).paddingLeft))).toBeLessThanOrEqual(24);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "顯示導覽列" })).toHaveCount(0);
    const toolbar = page.locator(".problem-toolbar");
    await expect(toolbar.getByRole("link", { name: "judge.tw" })).toBeVisible();
    await expect(toolbar.getByRole("link", { name: "登入", exact: true })).toBeVisible();
    await expect(toolbar.getByRole("link", { name: "回到題目列表" })).toHaveAttribute("href", "/problems");
    await expect(toolbar.getByRole("link", { name: "來去考試吧" })).toHaveAttribute("href", "/contests");
    const logoBounds = await toolbar.locator(".workspace-logo").boundingBox();
    const panelBounds = await page.locator(".problem-panel").boundingBox();
    expect(logoBounds!.x).toBe(panelBounds!.x);
    const themeToggle = toolbar.getByRole("button", { name: /切換成/ });
    const nextTheme = (await themeToggle.getAttribute("aria-label"))!.includes("淺色") ? "light" : "dark";
    await themeToggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", nextTheme);
    if (info.project.name !== "mobile") {
      expect((await toolbar.boundingBox())!.height).toBe(32);
      const workspaceBefore = await page.locator(".practice-workspace").boundingBox();
      await page.mouse.move(700, 1);
      await expect(nav).toBeHidden();
      expect(await page.locator(".practice-workspace").boundingBox()).toEqual(workspaceBefore);
    }
    await page.screenshot({ path: info.outputPath("practice-workspace.png"), fullPage: true });
    // Delay the isolated database lookup while allowing Next to stream its loading boundary.
    let releaseNext!: () => void;
    const nextReady = new Promise<void>(resolve => { releaseNext = resolve; });
    await page.goto(`/problems/${problem.slug}?listSource=problems`);
    await expect(page.getByRole("link", { name: nextProblem.title, exact: true })).toBeVisible();
    const readyBounds = await page.locator(".practice-workspace").boundingBox();
    const readyRight = await page.locator(".practice-workspace .split-pane > div").last().boundingBox();
    let lockReady!: () => void;
    const locked = new Promise<void>(resolve => { lockReady = resolve; });
    const heldLookup = db.$transaction(async (tx: { $executeRawUnsafe: (sql: string) => Promise<unknown> }) => {
      await tx.$executeRawUnsafe("LOCK TABLE problems IN ACCESS EXCLUSIVE MODE");
      lockReady();
      await nextReady;
    }, { timeout: 30_000 });
    await locked;
    await page.getByRole("link", { name: nextProblem.title, exact: true }).click();
    try {
      const loading = page.getByRole("status", { name: "正在載入題目" });
      await expect(loading).toBeVisible();
      const loadingBounds = await loading.boundingBox();
      expect(loadingBounds!.x).toBe(readyBounds!.x);
      expect(loadingBounds!.width).toBe(readyBounds!.width);
      const loadingRight = await loading.locator(".split-pane > div").last().boundingBox();
      // Flexbox can distribute fractions of a CSS pixel differently between skeletons and content.
      expect(loadingRight!.x).toBeCloseTo(readyRight!.x, 0);
      expect(loadingRight!.width).toBeCloseTo(readyRight!.width, 0);
      if (info.project.name !== "mobile") {
        expect(loadingBounds!.height).toBe(readyBounds!.height);
        await page.mouse.move(700, 300);
        await expect(nav).toBeHidden();
        expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath("problem-loading.png"), fullPage: true });
    } finally { releaseNext(); await heldLookup; }
    await expect(page.getByText("The next problem is ready.", { exact: true })).toBeVisible();
    // Returning after navigating between problems retains the source and all list filters.
    const filterQuery = "sort=number-asc&difficulty=1&difficulty=2&tag=math&tag=dp&examKind=GPE&q=Practice";
    for (const source of ["problems", "collection"]) {
      const context = source === "collection" ? "listSource=collection&listId=cpe-basic-49" : "listSource=problems";
      const target = source === "collection" ? "/collections/cpe-basic-49" : "/problems";
      await page.goto(`/problems/${problem.slug}?${context}&${filterQuery}`);
      await page.getByRole("link", { name: nextProblem.title, exact: true }).click();
      const back = toolbar.getByRole("link", { name: "回到題目列表" });
      await expect(back).toHaveAttribute("href", `${target}?${filterQuery}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await back.click();
      await expect(page).toHaveURL(new RegExp(`${target}\\?`));
      await expect(page.getByPlaceholder("搜尋題目名稱…")).toHaveValue("Practice");
      await expect(page.getByRole("button", { name: "難度", exact: true })).toContainText("2 個難度");
      await expect(page.getByRole("button", { name: "標籤", exact: true })).toContainText("2 個標籤");
    }
    // Legacy contest-linked problems must retain the original layout too.
    await page.goto(`/problems/${problem.slug}?contestId=fixture`);
    await expect(page.getByText("Read an integer and print it.", { exact: true })).toBeVisible();
    await expect(page.locator(".practice-workspace")).toHaveCount(0);
    expect((await main.boundingBox())!.width).toBe(Math.min(viewportWidth, 1400));
    await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
    await page.goto("/about");
    await expect(page.locator(".practice-workspace")).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.body.classList.contains("problem-workspace-active"))).toBe(false);
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
    await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
  } finally {
    await db.problem.deleteMany({ where: { id: { in: [problem.id, nextProblem.id] } } });
    await db.$disconnect();
  }
});
