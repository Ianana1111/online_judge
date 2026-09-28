import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

test("standalone practice fills the screen and reveals navigation without moving the workspace", async ({ page }, info) => {
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
    if (path === "/problems") return route.fulfill({ json: { items: [problem, nextProblem].map(p => ({ ...p, tags: [], solvedByMe: false })), total: 2, page: 1 } });
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
    if (info.project.name === "mobile") {
      await expect(page.getByRole("button", { name: "開啟選單" })).toBeVisible();
      await page.getByRole("button", { name: "開啟選單" }).click();
      await expect(page.getByRole("navigation", { name: "主要導覽", exact: true }).getByRole("link", { name: "題目", exact: true })).toBeVisible();
    } else {
      await page.mouse.move(700, 300);
      await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
      const workspaceBefore = await page.locator(".practice-workspace").boundingBox();
      await page.mouse.move(700, 1);
      await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().top)).toBe(0);
      await page.mouse.move(700, 25);
      await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().top)).toBe(0);
      expect(await page.locator(".practice-workspace").boundingBox()).toEqual(workspaceBefore);
      await page.mouse.move(700, 300);
      await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
      await page.keyboard.press("Tab"); // skip link
      await page.keyboard.press("Tab"); // navigation reveal button
      await expect(page.getByRole("button", { name: "顯示導覽列" })).toBeFocused();
      await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().top)).toBe(0);
      await page.locator('#main-content [role="tab"]').first().focus();
      await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
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
        await expect.poll(() => nav.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
        expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath("problem-loading.png"), fullPage: true });
    } finally { releaseNext(); await heldLookup; }
    await expect(page.getByText("The next problem is ready.", { exact: true })).toBeVisible();
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
