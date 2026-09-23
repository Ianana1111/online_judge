import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const problems = [
  { id: "p1", uvaId: 101, slug: "one", title: "One", difficulty: 1, source: "UVA", tags: ["DP"], solvedByMe: false, cpeAppearances: null, gpeAppearances: null },
  { id: "p2", uvaId: 102, slug: "two", title: "Two", difficulty: 2, source: "UVA", tags: ["Graph"], solvedByMe: false, cpeAppearances: null, gpeAppearances: null },
  { id: "p3", uvaId: 103, slug: "three", title: "Three", difficulty: 4, source: "UVA", tags: ["Math"], solvedByMe: false, cpeAppearances: null, gpeAppearances: null },
  { id: "p4", uvaId: 104, slug: "four", title: "Four", difficulty: 4, source: "UVA", tags: ["DP"], solvedByMe: false, cpeAppearances: null, gpeAppearances: null },
];

test("problem difficulty and tag filters support multiple selections and preserve them in links", async ({ page }, info) => {
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me" || path === "/auth/refresh") return route.fulfill({ status: 401, json: {} });
    if (path === "/problems") return route.fulfill({ json: { items: problems, total: problems.length } });
    return route.fulfill({ json: path === "/notifications" ? { items: [], unreadCount: 0 } : {} });
  });
  await page.goto("/problems");

  const filters = page.locator('button[aria-haspopup="listbox"]');
  await filters.nth(0).click();
  await page.getByRole("option", { name: "★★", exact: true }).click();
  await page.getByRole("option", { name: "★★★★", exact: true }).click();
  await page.getByRole("button", { name: "完成", exact: true }).click();

  await filters.nth(1).click();
  await page.getByRole("option", { name: "DP", exact: true }).click();
  await page.getByRole("option", { name: "Graph", exact: true }).click();
  await page.getByRole("button", { name: "完成", exact: true }).click();

  await expect(page.getByRole("link", { name: "Two", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Four", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "One", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Three", exact: true })).toHaveCount(0);
  const href = await page.getByRole("link", { name: "Two", exact: true }).getAttribute("href");
  const params = new URL(href!, "http://judge.test").searchParams;
  expect(params.getAll("difficulty")).toEqual(["2", "4"]);
  expect(params.getAll("tag")).toEqual(["DP", "Graph"]);
  await expect(page).toHaveURL(/difficulty=2.*difficulty=4.*tag=DP.*tag=Graph/);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("problem-multi-filters.png"), fullPage: true });
});
