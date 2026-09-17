import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("school email confirmation requires an explicit action and hides the token", async ({ page }) => {
  let confirms = 0;
  await page.route("http://127.0.0.1:55440/**", (route) => {
    if (new URL(route.request().url()).pathname === "/users/school/verify/confirm") { confirms++; expect(route.request().postDataJSON()).toEqual({ token: "school-fixture-token" }); return route.fulfill({ json: { ok: true } }); }
    return route.fulfill({ status: 401, json: {} });
  });
  await page.goto("/verify-school#token=school-fixture-token"); await expect(page).toHaveURL(/\/verify-school$/);
  await expect(page.getByRole("button", { name: "確認驗證學校信箱", exact: true })).toBeEnabled(); expect(confirms).toBe(0);
  await page.getByRole("button", { name: "確認驗證學校信箱", exact: true }).click(); await expect(page.getByRole("status")).toContainText("學校信箱驗證完成"); expect(confirms).toBe(1);
});

test("assisted domain request tracks review and administrator approval requires evidence", async ({ page }, info) => {
  const user = { id: "c000000000000000000000013", handle: "school_assisted", email: "school@example.test", role: "ADMIN", mfaEnabled: true, mfaRequired: false, hasPassword: true, settings: { profileSetupDismissed: true }, school: "國立臺灣大學", schoolEmail: null, schoolVerifiedAt: null };
  const item = { id: "c000000000000000000000014", school: user.school, domain: "newschool.edu.tw", officialUrl: "https://www.ntu.edu.tw/email", explanation: "學校今年啟用了新的學生信箱網域。", status: "PENDING", createdAt: "2026-09-13T01:00:00.000Z", updatedAt: "2026-09-13T01:00:00.000Z", decisions: [] };
  let submitted = false, reviewed = false;
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: user });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, nextCursor: null } });
    if (path === "/users/me/school/domains") return route.fulfill({ json: { roots: ["ntu.edu.tw"], exact: [] } });
    if (path === "/users/me/school/domain-requests") {
      if (route.request().method() === "POST") { expect(route.request().postDataJSON()).toEqual({ domain: item.domain, officialUrl: item.officialUrl, explanation: item.explanation }); submitted = true; return route.fulfill({ json: item }); }
      return route.fulfill({ json: submitted ? [item] : [] });
    }
    if (path.endsWith("/review")) { expect(route.request().postDataJSON()).toEqual({ status: "APPROVED", expectedUpdatedAt: item.updatedAt, note: "已核對校方資訊中心的信箱使用說明。" }); reviewed = true; return route.fulfill({ json: { ...item, status: "APPROVED" } }); }
    if (path === "/users/school-domain-requests") return route.fulfill({ json: { items: reviewed ? [] : [item], nextCursor: null } });
    return route.fulfill({ json: {} });
  });
  await page.goto("/settings"); await page.getByText("學校信箱無法驗證？申請協助", { exact: true }).click();
  await page.getByLabel("信箱網域（@ 後方）").fill(item.domain); await page.getByLabel("校方信箱說明網址").fill(item.officialUrl); await page.getByLabel("補充說明").fill(item.explanation); await page.getByRole("button", { name: "送出網域審核" }).click();
  await expect(page.getByRole("status").filter({ hasText: "等待審核" })).toBeVisible();
  await page.goto("/admin/schools"); const approve = page.getByRole("button", { name: "核准此網域" }); await expect(approve).toBeDisabled();
  await page.getByLabel("查證依據與回覆（申請人可見）").fill("已核對校方資訊中心的信箱使用說明。"); await expect(approve).toBeDisabled();
  await page.getByLabel("我已確認校方資料及此網域的學校歸屬。").check();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: info.outputPath("school-domain-review.png"), fullPage: true }); await approve.click();
  await expect(page.getByText("目前沒有這個狀態的申請。")).toBeVisible(); expect(reviewed).toBe(true);
});
test("school picker supports old names, keyboard selection, and institution-specific email checks", async ({ page }, info) => {
  const writes: { path: string; body: any }[] = [];
  const user = { id: "c000000000000000000000003", handle: "school_test", email: "school@example.test", role: "USER", isStudent: false, plan: "FREE", settings: { profileSetupDismissed: true, defaultLanguage: "cpp17", dailyGoal: 1 }, bio: "", avatarUrl: null, school: null as string | null, schoolEmail: null as string | null, schoolVerifiedAt: null, hasPassword: true, deletionRequestedAt: null, csrfToken: "test" };
  await page.route("http://127.0.0.1:55440/**", async (route) => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: user });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, asOf: "2026-09-12T00:00:00.000Z", nextCursor: null } });
    if (path === "/users/me/profile") { const body = req.postDataJSON(); writes.push({ path, body }); Object.assign(user, body); return route.fulfill({ json: { bio: user.bio, avatarUrl: null, school: user.school, schoolEmail: null, schoolVerifiedAt: null } }); }
    if (path === "/users/me/school/verify/request") { writes.push({ path, body: req.postDataJSON() }); return route.fulfill({ json: { ok: true } }); }
    return route.fulfill({ json: {} });
  });
  await page.goto("/settings"); await page.getByRole("button", { name: "學校", exact: true }).click();
  const search = page.getByRole("combobox", { name: "搜尋學校", exact: true }); await search.fill("高苑");
  await expect(page.getByRole("option", { name: "台鋼科技大學", exact: true })).toBeVisible(); await search.press("Enter");
  await expect(page.getByRole("button", { name: "學校", exact: true })).toBeFocused(); expect(writes[0].body).toEqual({ school: "台鋼科技大學" });
  const email = page.getByRole("textbox", { name: "學校電子信箱", exact: true }); await email.fill("student@tsust.edu.tw.evil.test");
  await expect(page.getByRole("button", { name: "寄送驗證信", exact: true })).toBeDisabled();
  await email.fill("Student@tsust.edu.tw"); await page.getByRole("button", { name: "寄送驗證信", exact: true }).click();
  expect(writes[1].body).toEqual({ email: "student@tsust.edu.tw" });
  await page.getByRole("button", { name: "學校", exact: true }).click(); await search.fill("一貫道崇德"); await search.press("Enter");
  await expect(page.getByText("學校信箱無法驗證？申請協助", { exact: true })).toBeVisible();
  const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: info.outputPath("school-settings.png"), fullPage: true });
});

const verifiedAccount = { handle: "original_student", school: "國立臺灣大學" };
const schoolUser = (handle = verifiedAccount.handle) => ({
  id: `c0000000000000000000000${handle === verifiedAccount.handle ? "31" : "32"}`, handle, email: "login@example.test", role: "USER",
  settings: { profileSetupDismissed: true }, school: verifiedAccount.school, schoolEmail: "student@ntu.edu.tw",
  schoolVerifiedAt: null as string | null, hasPassword: true, bio: "Original biography", csrfToken: "test",
});

for (const session of ["anonymous", "original", "different", "mfa", "enrollment", "deletion", "new-account"] as const) {
  test(`school confirmation in another Chrome profile is independent of ${session} session`, async ({ page }, info) => {
    const user = schoolUser(session === "original" ? verifiedAccount.handle : "another_student");
    Object.assign(user, { mfaRequired: session === "mfa", mfaEnrollmentRequired: session === "enrollment", deletionRequestedAt: session === "deletion" ? new Date().toISOString() : null });
    if (session === "new-account") Object.assign(user, { school: null, schoolEmail: null, settings: {} });
    let confirms = 0;
    const unrelatedWrites: string[] = [];
    await page.route("http://127.0.0.1:55440/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/auth/me") return route.fulfill({ status: session === "anonymous" ? 401 : 200, json: user });
      if (path === "/auth/refresh") return route.fulfill({ status: 401, json: {} });
      if (path === "/analytics/pageview" || path === "/billing/plans") return route.fulfill({ json: {} });
      if (path === "/users/school/verify/confirm") {
        confirms++; if (session === "original") user.schoolVerifiedAt = new Date().toISOString();
        return route.fulfill({ json: { ok: true, account: verifiedAccount } });
      }
      if (route.request().method() !== "GET") unrelatedWrites.push(path);
      if (["mfa", "enrollment"].includes(session)) return route.fulfill({ status: 403, json: { code: "MFA_REQUIRED" } });
      return route.fulfill({ json: path === "/notifications" ? { items: [], unreadCount: 0 } : [] });
    });
    await page.goto("/verify-school#token=school-fixture-token");
    await expect(page.getByRole("button", { name: "確認驗證學校信箱", exact: true })).toBeEnabled();
    await expect(page).toHaveURL(/\/verify-school$/); expect(confirms).toBe(0);
    await page.getByRole("button", { name: "確認驗證學校信箱", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(`@${verifiedAccount.handle}`);
    if (session === "original") {
      await expect(page.getByRole("link", { name: "查看已驗證的學校" })).toHaveAttribute("href", "/settings");
    } else {
      await expect(page.getByText(/你可以關閉此頁/)).toBeVisible();
      await expect(page.getByRole("link", { name: "查看已驗證的學校" })).toHaveCount(0);
      if (session !== "anonymous") await expect(page.getByRole("note")).toContainText("@another_student");
      expect(user.schoolVerifiedAt).toBeNull();
    }
    // A success receipt is display-only; neither storage nor URL retains the bearer token.
    const stored = await page.evaluate(() => JSON.stringify({ session: { ...sessionStorage }, local: { ...localStorage } }));
    expect(stored).not.toContain("school-fixture-token"); expect(stored).not.toContain("student@ntu.edu.tw");
    await page.reload();
    await expect(page.getByRole("status")).toContainText("學校信箱驗證完成");
    await expect(page).toHaveURL(/\/verify-school$/); expect(confirms).toBe(1); expect(unrelatedWrites).toEqual([]);
    if (session === "anonymous") {
      const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(audit.violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: info.outputPath("school-confirmed-other-profile.png"), fullPage: true });
    }
  });
}

test("school confirmation retries safely and a new invalid link cannot reuse an old success receipt", async ({ page }) => {
  let attempts = 0;
  await page.route("http://127.0.0.1:55440/**", (route) => {
    if (new URL(route.request().url()).pathname !== "/users/school/verify/confirm") return route.fulfill({ status: 401, json: {} });
    attempts++;
    if (attempts === 1) return route.fulfill({ status: 503, json: {} });
    return route.fulfill({ json: attempts === 2 ? { ok: true, account: verifiedAccount } : { ok: false } });
  });
  await page.goto("/verify-school#token=retry-fixture");
  const button = page.getByRole("button", { name: "確認驗證學校信箱", exact: true });
  await button.click(); await expect(page.locator("main").getByRole("alert")).toContainText("重試");
  await button.click(); await expect(page.getByRole("status")).toContainText("學校信箱驗證完成");
  await page.goto("/verify-school#token=invalid-fixture");
  await expect(page.getByRole("status")).toHaveCount(0);
  await button.click(); await expect(page.locator("main").getByRole("alert")).toContainText("連結已失效");
});

for (const trigger of ["focus", "manual", "poll"] as const) {
  test(`original Settings observes verification from a separate browser via ${trigger} without discarding edits`, async ({ page }) => {
    const user = schoolUser();
    await page.route("http://127.0.0.1:55440/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path === "/auth/me") return route.fulfill({ json: user });
      if (path === "/users/me/school/domains") return route.fulfill({ json: { roots: ["ntu.edu.tw"], exact: [] } });
      return route.fulfill({ json: path === "/notifications" ? { items: [], unreadCount: 0 } : [] });
    });
    if (trigger === "poll") await page.clock.install();
    await page.goto("/settings");
    const refresh = page.getByRole("button", { name: "已點信件確認？更新驗證狀態" });
    await expect(refresh).toBeVisible();
    const bio = page.locator("#settings-bio"); await bio.fill("Unsaved school verification regression test");
    user.schoolVerifiedAt = "2026-09-17T12:00:00.000Z";
    if (trigger === "manual") await refresh.click();
    else if (trigger === "focus") await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    else await page.clock.fastForward(15_000);
    await expect(page.getByText(/student@ntu.edu.tw.*學校已鎖定|Verified via student@ntu.edu.tw/)).toBeVisible();
    await expect(refresh).toHaveCount(0);
    await expect(bio).toHaveValue("Unsaved school verification regression test");
  });
}
