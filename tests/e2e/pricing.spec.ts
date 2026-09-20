import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { billingCatalog } from "../../packages/shared/src/billingPricing";

const campaign = { startsAt: "2026-09-15T00:00:00+08:00", endsAt: "2026-10-15T00:00:00+08:00", regularYearlyPriceNtd: "4000" };
function catalog(ended = false) { return billingCatalog(campaign, new Date(ended ? campaign.endsAt : campaign.startsAt)); }
async function fixture(page: Page, options: { subscriber?: boolean; anonymous?: boolean; locale?: "en" | "zh-TW"; theme?: "dark" | "light"; launch?: boolean } = {}) {
  const state = { plans: options.launch ? catalog() : billingCatalog(), failPricing: false, rejectQuote: false, writes: [] as { path: string; body: any }[] };
  await page.addInitScript(({ locale, theme }) => { localStorage.setItem("locale", locale); localStorage.setItem("theme", theme); }, { locale: options.locale ?? "zh-TW", theme: options.theme ?? "dark" });
  await page.route("http://127.0.0.1:55440/**", async (route) => {
    const request = route.request(), path = new URL(request.url()).pathname;
    if (request.method() !== "GET") state.writes.push({ path, body: request.postDataJSON() });
    if (path === "/auth/me") return route.fulfill({ status: options.anonymous ? 401 : 200, json: options.anonymous ? {} : {
      id: "pricing-user", handle: "launch_tester", email: "pricing@example.test", role: "USER", plan: options.subscriber ? "PRO" : "FREE", isStudent: false,
      settings: { profileSetupDismissed: true, uiLocale: options.locale ?? "zh-TW" }, csrfToken: "fixture", school: null, schoolVerifiedAt: null, hasPassword: true,
    } });
    if (path.startsWith("/auth/")) return route.fulfill({ status: 401, json: {} });
    if (path === "/billing/plans") return route.fulfill({ status: state.failPricing ? 503 : 200, json: state.failPricing ? { message: "Unavailable" } : state.plans });
    if (path === "/billing/me") return route.fulfill({ json: {
      plan: options.subscriber ? "PRO" : "FREE", planExpiresAt: options.subscriber ? "2026-12-15T00:00:00Z" : null, planCancelRequested: false,
      subscription: options.subscriber ? { amountNtd: 200, period: "MONTHLY", nextChargeAt: "2026-12-15T00:00:00Z", launchPriceLocked: true } : null,
      refundEligibleUntil: null, refundRequest: null, pendingPayment: null, submits: { used: 0, limit: 10 }, virtualContests: { used: 0, limit: 1 },
    } });
    if (path === "/billing/ecpay/create") {
      if (state.rejectQuote) { state.plans = catalog(true); return route.fulfill({ status: 409, json: { code: "PRICE_CHANGED", message: "Pricing changed. Review the current price and confirm again." } }); }
      return route.fulfill({ json: { actionUrl: "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5", sandbox: true, fields: { TotalAmount: request.postDataJSON().expectedAmountNtd } } });
    }
    if (path === "/notifications") return route.fulfill({ json: { items: [], unreadCount: 0, nextCursor: null } });
    if (path === "/contests/me") return route.fulfill({ json: [] });
    return route.fulfill({ json: {} });
  });
  // Intercept the allowed CSP form target completely; this never contacts ECPay.
  await page.route("https://payment-stage.ecpay.com.tw/**", (route) => route.fulfill({ contentType: "text/plain", body: "Mock hosted checkout" }));
  return state;
}

for (const theme of ["dark", "light"] as const) {
  test(`monthly and annual prices carry through checkout accessibly (${theme})`, async ({ page }, info) => {
    const state = await fixture(page, { theme });
    const errors: string[] = []; page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/upgrade");
    const monthly = page.getByRole("button", { name: /月訂閱/ });
    const yearly = page.getByRole("button", { name: /年訂閱/ });
    await expect(monthly).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("NT$200", { exact: true })).toBeVisible();
    await expect(page.locator("s")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "開幕首月限定" })).toHaveCount(0);
    await expect(page.getByText("NT$400", { exact: true })).toHaveCount(0);
    await yearly.click();
    await expect(yearly).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("s")).toHaveText("NT$2,400");
    await expect(page.getByText("NT$2,000", { exact: true })).toBeVisible();
    await expect(page.getByText("一次支付 NT$2,000，平均每月約 NT$167。")).toBeVisible();
    expect(errors, "upgrade initializes without hydration errors").toEqual([]);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBe(true);
    await page.screenshot({ path: info.outputPath(`upgrade-annual-${theme}.png`), fullPage: true });
    await monthly.focus();
    await page.keyboard.press("Enter");
    await expect(monthly).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("s")).toHaveCount(0);
    await page.screenshot({ path: info.outputPath(`upgrade-monthly-${theme}.png`), fullPage: true });
    await yearly.click();
    await page.getByRole("button", { name: "取得 Pro 方案", exact: true }).click();
    await expect(page).toHaveURL(/\/upgrade\/checkout\?period=YEARLY$/);
    await expect(yearly).toHaveAttribute("aria-pressed", "true");
    const checkbox = page.getByRole("checkbox");
    await checkbox.check();
    await monthly.click();
    await expect(monthly).toHaveAttribute("aria-pressed", "true");
    await expect(checkbox).not.toBeChecked();
    await yearly.click();
    await expect(yearly).toHaveAttribute("aria-pressed", "true");
    await expect(checkbox).not.toBeChecked();
    await page.reload();
    await expect(yearly).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("此訂閱持續有效期間，每期續扣 NT$2,000／年。")).toBeVisible();
    expect(errors, "checkout initializes without hydration errors").toEqual([]);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBe(true);
    await page.screenshot({ path: info.outputPath(`checkout-${theme}.png`), fullPage: true });
    await checkbox.check();
    await page.getByRole("button", { name: /訂閱.*2000/ }).click();
    await expect(page).toHaveURL("https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5");
    expect(state.writes.filter((w) => w.path === "/billing/ecpay/create")).toEqual([{ path: "/billing/ecpay/create", body: { period: "YEARLY", expectedAmountNtd: 2000, pricingVersion: state.plans.pricingVersion } }]);
    expect(errors).toEqual([]);
  });
}

test("stale checkout refreshes the price and clears consent without redirecting", async ({ page }) => {
  const state = await fixture(page, { launch: true }); state.rejectQuote = true;
  await page.goto("/upgrade/checkout");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /訂閱.*200/ }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("方案價格或優惠資格已更新");
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await expect(page.getByRole("button", { name: /訂閱.*400/ })).toBeDisabled();
  await expect(page.getByRole("region", { name: "開幕首月限定" })).toBeHidden();
  expect(page.url()).toContain("/upgrade/checkout");
  expect(state.writes.filter((w) => w.path === "/billing/ecpay/create")).toHaveLength(1);
});

test("pricing remains consistent when the page bundle loads after the shared catalog", async ({ page }) => {
  await fixture(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let catalogLoaded = false;
  let delayedPageBundle = false;
  page.on("response", (response) => {
    if (new URL(response.url()).pathname === "/billing/plans") catalogLoaded = true;
  });
  await page.route(/\/_next\/static\/chunks\/app\/upgrade\/page[^/]*\.js/, async (route) => {
    delayedPageBundle = true;
    const response = await route.fetch();
    // The layout also consumes pricing. Hold this page's hydration until that query can resolve.
    await expect.poll(() => catalogLoaded, { timeout: 10_000 }).toBe(true);
    await route.fulfill({ response });
  });
  await page.goto("/upgrade");
  await expect(page.getByRole("button", { name: /月訂閱/ })).toHaveAttribute("aria-pressed", "true");
  expect(delayedPageBundle).toBe(true);
  expect(errors).toEqual([]);
});

test("an expired offer disappears even if the refresh is offline", async ({ page }) => {
  await page.clock.install();
  const state = await fixture(page);
  state.plans = billingCatalog(campaign, new Date(+new Date(campaign.endsAt) - 10_000));
  await page.goto("/upgrade/checkout");
  await expect(page.getByRole("region", { name: "開幕首月限定" })).toBeVisible();
  state.failPricing = true;
  await page.clock.fastForward(11_000);
  await expect(page.getByRole("region", { name: "開幕首月限定" })).toBeHidden();
  await expect(page.getByRole("button", { name: /訂閱.*200/ })).toBeHidden();
  expect(state.writes.filter((w) => w.path === "/billing/ecpay/create")).toHaveLength(0);
});

test("an existing subscriber retains the launch badge after expiry and sees cancellation consequences", async ({ page }, info) => {
  const state = await fixture(page, { subscriber: true }); state.plans = catalog(true);
  await page.goto("/upgrade");
  await expect(page.getByText("你的開幕優惠價已鎖定", { exact: true })).toBeVisible();
  await expect(page.locator("s")).toHaveCount(0);
  await page.getByRole("button", { name: "取消訂閱", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("開幕優惠價的續訂保障將結束");
  await expect(page.getByRole("dialog")).toContainText("已付款的 Pro 權限可用至到期日");
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: info.outputPath("cancel-price-lock.png"), fullPage: true });
  expect(state.writes.filter((w) => w.path.startsWith("/billing"))).toEqual([]);
});

test("public English visitors can compare plans without a launch deadline", async ({ page }) => {
  await fixture(page, { anonymous: true, locale: "en" });
  await page.goto("/upgrade");
  await expect(page.getByRole("button", { name: /Monthly subscription/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Annual subscription/ }).click();
  await expect(page.getByText("NT$2,000 billed yearly, about NT$167/month.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Launch month offer" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Get Pro Plan", exact: true })).toBeDisabled();
  await expect(page.locator("s")).toHaveText("NT$2,400");
});

for (const period of ["MONTHLY", "invalid"]) {
  test(`checkout charges the monthly amount for ${period} selection`, async ({ page }) => {
    const state = await fixture(page);
    await page.goto(`/upgrade/checkout?period=${period}`);
    await expect(page.getByRole("button", { name: /月訂閱/ })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /訂閱.*200/ }).click();
    await expect(page).toHaveURL("https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5");
    expect(state.writes.filter((w) => w.path === "/billing/ecpay/create")).toEqual([{ path: "/billing/ecpay/create", body: { period: "MONTHLY", expectedAmountNtd: 200, pricingVersion: state.plans.pricingVersion } }]);
  });
}

test("unavailable prices block purchase and recover on retry", async ({ page }) => {
  const state = await fixture(page); state.failPricing = true;
  await page.goto("/upgrade");
  await expect(page.getByRole("button", { name: "取得 Pro 方案", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: /月訂閱|年訂閱/ })).toHaveCount(0);
  await expect(page.getByText("目前無法取得價格，請重試後再結帳。")).toBeVisible();
  state.failPricing = false;
  await page.getByRole("status").getByRole("button").click();
  await expect(page.getByRole("button", { name: /月訂閱/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "取得 Pro 方案", exact: true })).toBeEnabled();
  expect(state.writes.filter((w) => w.path.startsWith("/billing"))).toEqual([]);
});

for (const theme of ["light", "dark"] as const) {
  test(`a refund updates access without reloading and explains immediate termination (${theme})`, async ({ page }, info) => {
    await fixture(page, { subscriber: true, theme });
    let requested = false, completed = false, refundPosts = 0;
    await page.route(/http:\/\/127\.0\.0\.1:55440\/billing\/(me|refund\/request)$/, async (route) => {
      if (route.request().method() === "POST") {
        requested = true; refundPosts++;
        return route.fulfill({ json: { id: "refund-test", status: "REQUESTED" } });
      }
      return route.fulfill({ json: {
        plan: completed ? "FREE" : "PRO", planExpiresAt: completed ? null : "2027-09-16T00:00:00Z", planCancelRequested: false,
        subscription: completed ? null : { amountNtd: 2000, period: "YEARLY", nextChargeAt: "2027-09-16T00:00:00Z", launchPriceLocked: false },
        refundEligibleUntil: requested ? null : "2026-09-23T00:00:00Z",
        refundRequest: requested ? { id: "refund-test", status: completed ? "COMPLETED" : "REQUESTED", requestedAt: "2026-09-16T00:00:00Z", completedAt: completed ? "2026-09-16T00:01:00Z" : null } : null,
        pendingPayment: null, submits: { used: 0, limit: completed ? 10 : null }, virtualContests: { used: 0, limit: completed ? 1 : null },
      } });
    });
    await page.goto("/upgrade");
    await page.getByRole("button", { name: /不符合期待/ }).click();
    const dialog = page.getByRole("dialog", { name: "確定要申請全額退款嗎？" });
    await expect(dialog).toContainText("不會保留到月底或年度結束");
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: info.outputPath(`refund-confirm-${theme}.png`), fullPage: true });
    await dialog.getByRole("button", { name: "申請退款", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("退款申請已受理");
    completed = true;
    await expect(page.getByRole("status")).toContainText("退款已送出，該筆付款的 Pro 權限已終止", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "取消訂閱", exact: true })).toBeHidden();
    await expect(page.getByRole("button", { name: "取得 Pro 方案", exact: true })).toBeVisible();
    expect(refundPosts).toBe(1);
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`launch comparison and renewal lock follow the monthly and annual choice (${theme})`, async ({ page }, info) => {
    await fixture(page, { launch: true, theme });
    await page.goto("/upgrade");
    await expect(page.locator("s")).toHaveText("NT$400");
    await expect(page.getByText("NT$200", { exact: true })).toBeVisible();
    await expect(page.getByText("開幕期間加入，持續續訂就維持此優惠價。", { exact: true })).toBeVisible();
    await page.screenshot({ path: info.outputPath(`launch-monthly-${theme}.png`), fullPage: true });
    await page.getByRole("button", { name: "年訂閱", exact: true }).click();
    await expect(page.locator("s")).toHaveText("NT$4,000");
    await expect(page.getByText("NT$2,000", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "取得 Pro 方案", exact: true }).click();
    await expect(page.locator("s")).toHaveText("NT$4,000");
    await expect(page.getByText("此訂閱持續有效期間，每期續扣 NT$2,000／年。")).toBeVisible();
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2)).toBe(true);
    await page.screenshot({ path: info.outputPath(`launch-annual-checkout-${theme}.png`), fullPage: true });
  });
}
