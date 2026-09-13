import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route("http://127.0.0.1:55440/**", (route) => route.fulfill({ status: route.request().url().includes("/auth/") ? 401 : 200, json: {} }));
});

for (const theme of ["dark", "light"]) {
  test(`homepage challenge and practice paths (${theme})`, async ({ page }, info) => {
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("把每一次練習");
    await page.getByRole("button", { name: "執行測試", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Wrong Answer");
    await page.getByRole("combobox", { name: "修改搜尋邊界條件" }).selectOption("inclusive");
    await page.getByRole("button", { name: "執行測試", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("Accepted");
    await page.getByRole("tab", { name: /為下一場考試準備/ }).click();
    await expect(page.getByRole("tabpanel")).toContainText("選一場虛擬測驗");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
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
