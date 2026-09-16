import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const postId = "c000000000000000000000101", revisionId = "c000000000000000000000201", userId = "c000000000000000000000001";
const post = { id: postId, title: "二分搜尋的邊界，為什麼要包含相等？", bodyMd: "## 從一筆資料開始\n\n當搜尋區間只剩一個元素，我們仍然需要比較它。\n\n```cpp\nwhile (left <= right) { /* compare */ }\n```", excerpt: "從一筆資料開始，理解搜尋區間與邊界條件。", bodyLength: 500, authorId: userId, authorHandle: "test_student", authorAvatarUrl: null, isOfficial: false, category: "EDITORIAL", commentCount: 0, createdAt: "2026-09-11T00:00:00.000Z", publishedAt: "2026-09-12T00:00:00.000Z" };
async function mock(page: Page, admin = false) {
  const writes: { path: string; body: any }[] = []; let pending = true;
  await page.route("http://127.0.0.1:55440/**", async (route) => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname;
    if (path === "/auth/me") return route.fulfill({ json: { id: userId, handle: "test_student", email: "test@example.test", role: admin ? "ADMIN" : "USER", isStudent: false, plan: "FREE", settings: { profileSetupDismissed: true }, bio: "", avatarUrl: null, school: null, schoolEmail: null, schoolVerifiedAt: null, hasPassword: true, deletionRequestedAt: null, csrfToken: "test" } });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, asOf: "2026-09-12T00:00:00.000Z", nextCursor: null } });
    if (path === "/analytics/pageview") return route.fulfill({ json: { ok: true } });
    if (req.method() !== "GET") { writes.push({ path, body: req.postDataJSON() }); if (path.includes("/review")) pending = false; return route.fulfill({ json: { id: postId, revisionId, status: "PENDING" } }); }
    if (path === "/posts/mine") return route.fulfill({ json: { items: [{ ...post, status: "PENDING", reason: null, publishedAt: null }], nextCursor: null } });
    if (path === `/posts/${postId}/mine`) return route.fulfill({ json: { ...post, status: "APPROVED", reason: null } });
    if (path === "/posts") return route.fulfill({ json: { items: !url.searchParams.get("q") || url.searchParams.get("q") === "二分" ? [post] : [], nextCursor: null } });
    if (path === `/posts/${postId}`) return route.fulfill({ json: post });
    if (path.startsWith("/discussions/")) return route.fulfill({ json: { items: path.endsWith("/mine") && writes.length ? [{ id: "comment-1", body: "我也遇到單一元素的情況。", userId, userHandle: "test_student", userRole: "USER", createdAt: post.createdAt, publishedAt: null, status: "PENDING", reason: null }] : [], nextCursor: null } });
    if (path === "/moderation") return route.fulfill({ json: { items: pending ? [{ id: revisionId, postId, discussionId: null, title: post.title, body: post.bodyMd + '\n\n<img src="https://tracker.example.test/pixel" onerror="alert(1)"><script>alert(1)</script>', category: "EDITORIAL", isOfficial: false, createdAt: post.createdAt, status: "PENDING", reason: null, reviewedAt: null, post: { title: "舊標題", bodyMd: "先前公開的內容", publishedAt: post.publishedAt, author: { handle: "test_student" } }, discussion: null }] : [], nextCursor: null } });
    return route.fulfill({ json: {} });
  });
  return writes;
}
async function accessibility(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
test("community search and composing clearly communicate pending publication", async ({ page }, info) => {
  const writes = await mock(page); await page.goto("/discussion");
  await expect(page.getByRole("heading", { name: post.title })).toBeVisible(); await accessibility(page);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: info.outputPath("community-list.png"), fullPage: true });
  await page.getByLabel("搜尋討論", { exact: true }).fill("沒有符合"); await page.getByRole("button", { name: "搜尋", exact: true }).click();
  await expect(page.getByText("還沒有符合的討論", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "＋ 發起討論", exact: true }).click();
  await page.getByLabel("標題", { exact: true }).fill("我的二分搜尋筆記"); await page.getByLabel("內容", { exact: true }).fill(post.bodyMd);
  await page.getByRole("button", { name: "預覽排版", exact: true }).click(); await expect(page.getByRole("heading", { name: "從一筆資料開始" })).toBeVisible();
  await accessibility(page); await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: info.outputPath("community-compose.png"), fullPage: true });
  await page.getByRole("button", { name: "送出審核 →", exact: true }).click();
  await expect(page.getByText("投稿已收到。審核結果會出現在通知中心。", { exact: true })).toBeVisible();
  expect(writes[0]).toMatchObject({ path: "/posts", body: { title: "我的二分搜尋筆記", bodyMd: post.bodyMd, isOfficial: false } });
});
test("article comments show private review progress after submitting", async ({ page }, info) => {
  const writes = await mock(page); await page.goto(`/discussion/${postId}`);
  await expect(page.getByRole("heading", { name: post.title, exact: true })).toBeVisible();
  await page.getByLabel("你的想法", { exact: true }).fill("我也遇到單一元素的情況。");
  await page.getByRole("button", { name: "送出審核", exact: true }).click();
  await expect(page.getByText("等待審核", { exact: true })).toBeVisible();
  expect(writes[0]).toEqual({ path: `/discussions/post/${postId}`, body: { body: "我也遇到單一元素的情況。" } });
  await accessibility(page); await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: info.outputPath("community-comments.png"), fullPage: true });
});
test("administrator reviews exact content without loading embedded tracking markup", async ({ page }, info) => {
  const writes = await mock(page, true), trackers: string[] = []; page.on("request", (r) => { if (r.url().includes("tracker.example.test")) trackers.push(r.url()); });
  await page.goto("/admin/moderation"); await expect(page.getByRole("heading", { name: post.title, exact: true })).toBeVisible();
  await expect(page.locator('img[src*="tracker.example.test"]')).toHaveCount(0);
  await page.getByRole("button", { name: "退回修改", exact: true }).click(); await expect(page.getByText("請先填寫需要修改的原因。", { exact: true })).toBeVisible(); expect(writes).toHaveLength(0);
  await page.getByLabel("審核建議（退回時必填）", { exact: true }).fill("請補上邊界案例。");
  await accessibility(page); await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: info.outputPath("community-review.png"), fullPage: true });
  await page.getByRole("button", { name: "退回修改", exact: true }).click(); await expect(page.getByText("目前沒有等待審核的內容。", { exact: true })).toBeVisible();
  expect(writes).toEqual([{ path: `/moderation/${revisionId}/review`, body: { decision: "REJECTED", reason: "請補上邊界案例。" } }]); expect(trackers).toHaveLength(0);
});

for (const theme of ["dark", "light"]) test(`my posts: aligned actions and long titles (${theme})`, async ({ page }, info) => {
  await mock(page); await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
  await page.goto("/discussion");
  const create = page.getByRole("link", { name: "＋ 發起討論", exact: true }), mine = page.getByRole("link", { name: "我的投稿", exact: true });
  await expect(mine).toBeVisible(); const [a, b] = await Promise.all([create.boundingBox(), mine.boundingBox()]);
  expect(a && b && Math.abs(a.height - b.height)).toBeLessThanOrEqual(1);
  if (a && b && a.y === b.y) expect(Math.abs(a.y + a.height / 2 - b.y - b.height / 2)).toBeLessThanOrEqual(1);
  await page.route("http://127.0.0.1:55440/posts/mine", (route) => route.fulfill({ json: { items: [
    { ...post, id: "pending", title: "沒有空格的長標題".repeat(18), status: "PENDING", reason: null, publishedAt: null },
    { ...post, id: "rejected", status: "REJECTED", reason: "請補充邊界案例。\n" + "long_reference_identifier_".repeat(12) },
    { ...post, id: "approved", status: "APPROVED", reason: null },
  ], nextCursor: null } }));
  await mine.click(); await expect(page.getByRole("heading", { name: "我的投稿", exact: true })).toBeVisible();
  await expect(page.getByText("等待審核", { exact: true })).toBeVisible(); await expect(page.getByText("需要修改", { exact: true })).toBeVisible();
  await accessibility(page); await page.screenshot({ path: info.outputPath(`my-posts-${theme}.png`), fullPage: true });
});
