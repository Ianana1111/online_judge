import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", timeout: 60_000, expect: { timeout: 10_000 }, fullyParallel: false, workers: 1,
  use: { baseURL: "http://127.0.0.1:55430", locale: "zh-TW", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], defaultBrowserType: "chromium", viewport: { width: 390, height: 844 } } },
    ...(process.env.CROSS_BROWSER_E2E === "1" ? [
      { name: "firefox", use: { ...devices["Desktop Firefox"] }, testMatch: /(?:account-security|public-pages|schools|community|notifications|refunds|refund-resolution)\.spec\.ts/ },
      { name: "webkit", use: { ...devices["Desktop Safari"] }, testMatch: /(?:account-security|public-pages|schools|community|notifications|refunds|refund-resolution)\.spec\.ts/ },
      { name: "ios-webkit", use: { ...devices["iPhone 13"] }, testMatch: /(?:account-security|public-pages|schools|community|notifications|refunds|refund-resolution)\.spec\.ts/ },
    ] : []),
  ],
  webServer: [...(process.env.RUN_FULL_SITE_E2E === "1" ? [{ command: "node scripts/serve-test-api.mjs", url: "http://127.0.0.1:55440/health", reuseExistingServer: false, timeout: 30_000 }] : []), { command: `pnpm --filter @oj/web exec next ${process.env.PLAYWRIGHT_PRODUCTION === "1" ? "start" : "dev"} --hostname 127.0.0.1 --port 55430`, url: "http://127.0.0.1:55430", reuseExistingServer: !process.env.CI,
    env: { API_INTERNAL_URL: "http://127.0.0.1:55440", NEXT_PUBLIC_API_URL: "http://127.0.0.1:55440", NEXT_PUBLIC_SENTRY_DSN: "", NEXT_TELEMETRY_DISABLED: "1" }, timeout: 120_000 },
  ],
});
