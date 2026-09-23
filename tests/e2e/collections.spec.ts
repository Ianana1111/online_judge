import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const topics = [["math", "數學與數論"], ["array", "陣列與資料處理"], ["string", "字串處理"], ["sorting-searching", "排序與搜尋"], ["datastructure", "資料結構"], ["simulation", "模擬與實作"], ["greedy", "貪心策略"], ["recursion-backtracking", "遞迴與回溯"], ["dp", "動態規劃"], ["graph", "圖論與路徑"], ["geometry", "計算幾何"], ["adhoc", "觀察與解題技巧"]];
const collections = [
  { id: "exam", slug: "cpe-before-exam", title: "考前必刷", category: "考試專區", description: "彙整 CPE 歷屆第 1–3 題，重複題目只收錄一次。從前段題建立手感，逐步鞏固考場得分能力；各題保留原始星等。", problemCount: 120 },
  { id: "cpe", slug: "cpe-basic-49", title: "CPE 必考 49 題", category: "考試歷屆", description: "從經典題目開始，建立穩定的解題基礎。", problemCount: 49 },
  { id: "gpe", slug: "gpe-history", title: "GPE 歷屆題目", category: "考試專區", description: "深入研究所程式設計測驗的歷屆題型。", problemCount: 115 },
  ...topics.map(([tag, title], i) => ({ id: tag, slug: `algo-${tag}`, title, category: "主題專區", description: "一次專注一個觀念，從基礎題型到進階挑戰，建立可靠的解題思路。", problemCount: 10 + i, tags: [tag] })),
];
async function mock(page: Page) {
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.startsWith("/auth/")) return route.fulfill({ status: 401, json: {} });
    if (path === "/collections") return route.fulfill({ json: collections });
    if (path.startsWith("/collections/")) return route.fulfill({ json: { ...collections.find((c) => c.slug === path.split("/").at(-1)), problems: [{ id: "p", slug: "example", title: "範例題目", uvaId: 100, difficulty: 1, source: "UVA", tags: ["math"], solvedByMe: false, cpeAppearances: null, gpeAppearances: null }] } });
    return route.fulfill({ json: {} });
  });
}
async function audit(page: Page) {
  // App Router streams metadata separately from the client-rendered collection.
  // Wait for the accessible document title before auditing the completed page.
  await expect(page).toHaveTitle(/judge\./);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
}
for (const theme of ["dark", "light"]) test(`collections: responsive design, search, empty state and detail (${theme})`, async ({ page }, info) => {
  await mock(page); await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
  await page.goto("/collections"); await expect(page.getByRole("heading", { name: "CPE 必考 49 題" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "考試專區", exact: true })).toBeVisible(); await expect(page.getByRole("heading", { name: "主題專區", exact: true })).toBeVisible();
  await expect(page.getByText("CPE 核心必考清單", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /開始刷必考 49 題/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "考前必刷", exact: true })).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("smooth");
  await page.getByRole("link", { name: /^主題專區/ }).click();
  await expect(page).toHaveURL(/#topic-collections$/);
  await expect(page.locator("#topic-collections")).toBeInViewport();
  await audit(page); await page.screenshot({ path: info.outputPath(`collections-${theme}.png`), fullPage: true });
  const search = page.getByRole("searchbox", { name: "搜尋主題題庫" }); await search.fill("DP");
  await expect(page.getByRole("heading", { name: "動態規劃", exact: true })).toBeVisible(); await expect(page.getByRole("heading", { name: "數學與數論" })).toHaveCount(0);
  await search.fill("找不到"); await expect(page.getByText("沒有符合的主題，試試其他關鍵字。")).toBeVisible(); await page.getByRole("button", { name: "顯示所有主題" }).click();
  await page.getByRole("link", { name: /^數學與數論 / }).click();
  await expect(page).toHaveURL(/\/collections\/algo-math$/);
  await expect(page.getByRole("heading", { name: "數學與數論", level: 1, exact: true })).toBeVisible();
  await expect(page).toHaveTitle(/^(數學與數論|題目集) \| judge\.$/);
  await expect(page.getByRole("link", { name: /範例題目/ })).toBeVisible(); await audit(page); await page.screenshot({ path: info.outputPath(`collection-detail-${theme}.png`), fullPage: true });
});
test("collection list and detail recover from network failures", async ({ page }) => {
  await mock(page); let failed = true;
  await page.route("http://127.0.0.1:55440/collections", (route) => route.fulfill(failed ? { status: 503, json: { message: "Unavailable" } } : { json: collections }));
  await page.goto("/collections"); await expect(page.getByRole("alert").filter({ hasText: "暫時無法載入題目集" })).toContainText("暫時無法載入題目集", { timeout: 20000 }); failed = false;
  await page.getByRole("button", { name: "重新載入" }).click(); await expect(page.getByRole("heading", { name: "CPE 必考 49 題" })).toBeVisible();
});
