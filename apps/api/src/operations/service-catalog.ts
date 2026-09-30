import type { ExternalServiceRow } from "@oj/shared";
export const SERVICE_CATALOG: Pick<ExternalServiceRow, "key" | "name" | "category" | "description" | "dashboardUrl" | "pricingUrl">[] = [
  { key: "railway", name: "Railway", category: "基礎設施", description: "API、Judge worker、PostgreSQL 與 Redis", dashboardUrl: "https://railway.com/project/989e8e66-0317-4d49-b353-f12da6edcea3", pricingUrl: "https://docs.railway.com/pricing/plans" },
  { key: "vercel", name: "Vercel", category: "基礎設施", description: "網站部署、CDN 與 Sandbox 程式評測", dashboardUrl: "https://vercel.com/ianana1111s-projects/judges", pricingUrl: "https://vercel.com/docs/pricing" },
  { key: "resend", name: "Resend", category: "帳號與通訊", description: "帳號驗證、重設密碼及學校驗證郵件", dashboardUrl: "https://resend.com/emails", pricingUrl: "https://resend.com/pricing" },
  { key: "domain", name: "judge.tw · 網域與 DNS", category: "基礎設施", description: "DNS、HTTPS 憑證與網域續約", dashboardUrl: "https://www.twnic.tw/", pricingUrl: "https://www.twnic.tw/" },
  { key: "ecpay", name: "綠界 ECPay", category: "金流", description: "Pro 收款、定期定額與退款", dashboardUrl: "https://vendor.ecpay.com.tw/", pricingUrl: "https://www.ecpay.com.tw/Business/payment_fees" },
  { key: "google", name: "Google Cloud", category: "帳號與通訊", description: "Google OAuth 登入與授權設定", dashboardUrl: "https://console.cloud.google.com/auth/overview", pricingUrl: "https://console.cloud.google.com/billing" },
  { key: "github", name: "GitHub", category: "開發與社群", description: "程式碼、Actions 與部署來源", dashboardUrl: "https://github.com/Ianana1111/online_judge", pricingUrl: "https://github.com/settings/billing" },
  { key: "discord", name: "Discord", category: "開發與社群", description: "judge. 社群與使用者交流", dashboardUrl: "https://discord.com/channels/1542874383322972262", pricingUrl: "https://discord.com/nitro" },
  { key: "sentry", name: "Sentry", category: "開發與社群", description: "錯誤追蹤與診斷（依啟用設定）", dashboardUrl: "https://sentry.io/", pricingUrl: "https://sentry.io/pricing/" },
];
