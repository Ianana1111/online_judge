import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route("http://127.0.0.1:55440/**", (route) => route.fulfill({ status: route.request().url().includes("/auth/") ? 401 : 200, json: {} }));
});

for (const theme of ["dark", "light"]) {
  test(`homepage simple practice entry points (${theme})`, async ({ page, isMobile }, info) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("把每一次練習");
    await expect(page.getByRole("link", { name: "開始免費練習" })).toHaveAttribute("href", "/register");
    if (isMobile) {
      await expect(page.getByRole("link", { name: "開始免費練習" })).toBeInViewport();
      await expect(page.locator(".guest-hero-copy")).toHaveCSS("text-align", "left");
    }
    await expect(page.getByRole("button", { name: "執行測試", exact: true })).toHaveCount(0);
    await expect(page.getByRole("tablist", { name: "練習方向" })).toHaveCount(0);
    const paths = page.locator('section[aria-labelledby="practice-path-heading"]');
    await expect(paths.getByRole("link")).toHaveCount(3);
    await expect(paths.getByRole("link").first()).toHaveAttribute("href", "/collections/cpe-basic-49");
    await expect(paths.getByRole("link").last()).toHaveAttribute("href", "/contests");
    await expect(page.getByRole("link", { name: "加入 Discord 社群" })).toHaveAttribute("href", "https://discord.gg/FbVqG8vd6a");
    await expect(page.locator(".guest-hero-copy h1 > .text-brand").first()).toHaveText("你的實力。");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await expect(page).toHaveTitle(/judge\./);
    const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`home-${theme}.png`), fullPage: true });
  });
}

test("FAQ search uses the same answers as structured data", async ({ page }, info) => {
  await page.goto("/faq");
  const seo = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faq = seo.map((s) => JSON.parse(s)).find((s) => s["@type"] === "FAQPage");
  expect(faq.mainEntity.length).toBeGreaterThan(25);
  await page.getByRole("searchbox", { name: "搜尋常見問題" }).fill("退款");
  await page.getByText("什麼情況可以申請全額退款？", { exact: true }).click();
  const answer = faq.mainEntity.find((q: { name: string }) => q.name === "什麼情況可以申請全額退款？").acceptedAnswer.text;
  await expect(page.getByText(answer, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
  await page.screenshot({ path: info.outputPath("faq.png"), fullPage: true });
});
