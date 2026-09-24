import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const token = "a".repeat(43);
const fixture = () => ({ id: "c000000000000000000000033", handle: "security_test", email: "security@example.test", role: "USER", isStudent: false, plan: "FREE", settings: { profileSetupDismissed: true }, bio: "", avatarUrl: null, school: null, schoolEmail: null, schoolVerifiedAt: null, hasPassword: true, deletionRequestedAt: null, emailVerifiedAt: null, mfaEnabled: false, mfaRequired: false, csrfToken: "test" });

test("recovery links stay out of the URL and reset requires matching passwords", async ({ page }, info) => {
  const requests: { path: string; body: any }[] = [];
  await page.route("http://127.0.0.1:55440/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (["/auth/me", "/auth/refresh"].includes(path)) return route.fulfill({ status: 401, json: { message: "Not authenticated" } });
    if (["/auth/forgot-password", "/auth/reset-password"].includes(path)) requests.push({ path, body: route.request().postDataJSON() });
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("/forgot-password"); await page.getByLabel("電子信箱", { exact: true }).fill("owner@example.test"); await page.getByRole("button", { name: "寄送重設連結" }).click();
  await expect(page.getByRole("status")).toContainText("如果這個信箱有可重設密碼的帳號");
  await page.goto(`/reset-password#token=${token}`); await expect(page).toHaveURL(/\/reset-password$/);
  await page.getByLabel("新密碼", { exact: true }).fill("new-correct-password"); await page.getByLabel("再次輸入新密碼").fill("does-not-match"); await page.getByRole("button", { name: "更新密碼" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "不一致" })).toBeVisible(); expect(requests.filter((r) => r.path === "/auth/reset-password")).toHaveLength(0);
  await page.getByLabel("再次輸入新密碼").fill("new-correct-password"); await page.getByRole("button", { name: "更新密碼" }).click();
  await expect(page.getByRole("status")).toContainText("舊登入憑證已失效");
  expect(requests[1]).toEqual({ path: "/auth/reset-password", body: { token, password: "new-correct-password" } });
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: info.outputPath("password-recovery.png"), fullPage: true });
});

test("email confirmation never consumes a link on page load", async ({ page }) => {
  let confirmed = 0;
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (["/auth/me", "/auth/refresh"].includes(path)) return route.fulfill({ status: 401, json: {} });
    if (path === "/auth/email/verify") { confirmed++; expect(route.request().postDataJSON()).toEqual({ token }); }
    return route.fulfill({ json: {} });
  });
  await page.goto(`/verify-email#token=${token}`); await expect(page).toHaveURL(/\/verify-email$/);
  await expect(page.getByRole("button", { name: "確認驗證信箱" })).toBeEnabled(); expect(confirmed).toBe(0);
  await page.getByRole("button", { name: "確認驗證信箱" }).click(); await expect(page.getByRole("status")).toContainText("信箱驗證完成"); expect(confirmed).toBe(1);
});

test("security settings enroll an authenticator and require recovery-code acknowledgement", async ({ page }, info) => {
  const user = fixture(), secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
  const uri = `otpauth://totp/judge.tw:test?secret=${secret}&issuer=judge.tw`;
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: user });
    if (path === "/auth/security" || path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, asOf: new Date().toISOString(), nextCursor: null } });
    if (path === "/auth/mfa/setup") { expect(route.request().postDataJSON()).toEqual({ password: "current-password" }); return route.fulfill({ json: { secret, uri, expiresInSeconds: 600 } }); }
    if (path === "/auth/mfa/enable") { expect(route.request().postDataJSON()).toEqual({ code: "123456" }); user.mfaEnabled = true; return route.fulfill({ json: { csrfToken: "new-test", recoveryCodes: ["abcde-12345-abcde-12345", "12345-abcde-12345-abcde"] } }); }
    return route.fulfill({ json: {} });
  });
  await page.goto("/settings?section=security"); await expect(page.getByRole("tab", { name: "安全性" })).toHaveAttribute("aria-selected", "true"); await page.getByLabel("目前密碼", { exact: true }).fill("current-password"); await page.getByRole("button", { name: "開始設定" }).click();
  const qr = page.getByRole("img", { name: "judge.tw 雙因素驗證設定 QR code" });
  await expect(qr).toBeVisible(); expect(await qr.locator("path").count()).toBeGreaterThan(0);
  await expect(page.getByRole("link", { name: "在此裝置開啟驗證器" })).toHaveAttribute("href", uri);
  await page.getByText("無法掃描？改用手動金鑰").click(); await expect(page.getByText(secret, { exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("mfa-setup-qr.png"), fullPage: true });
  await page.getByLabel("驗證碼", { exact: true }).fill("123456"); await page.getByRole("button", { name: "確認啟用" }).click();
  await expect(page.getByRole("heading", { name: "保存備用碼" })).toBeVisible(); await expect(page.getByText("abcde-12345-abcde-12345", { exact: false })).toBeVisible();
  await expect(qr).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: info.outputPath("mfa-recovery-codes.png"), fullPage: true });
  await page.getByRole("button", { name: "我已安全保存備用碼" }).click(); await expect(page.getByRole("heading", { name: "保存備用碼" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "重新產生備用碼" })).toBeVisible();
});

test("an MFA-gated session lands on verification and supports recovery codes", async ({ page }) => {
  const user = { ...fixture(), mfaEnabled: true, mfaRequired: true };
  await page.route("http://127.0.0.1:55440/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/me") return route.fulfill({ json: user });
    if (path === "/auth/mfa/verify") { expect(route.request().postDataJSON()).toEqual({ code: "abcde-12345-abcde-12345" }); user.mfaRequired = false; return route.fulfill({ json: { ok: true } }); }
    if (path === "/contests/me") return route.fulfill({ json: [] });
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, nextCursor: null } });
    return route.fulfill({ json: {} });
  });
  await page.goto("/settings"); await expect(page).toHaveURL(/\/verify-mfa$/);
  await page.getByRole("button", { name: "改用備用碼" }).click(); await page.getByLabel("備用碼", { exact: true }).fill("abcde-12345-abcde-12345"); await page.getByRole("button", { name: "確認並繼續" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:55430/");
});
