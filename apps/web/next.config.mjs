const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "https://api.judge.tw";

// Verified end-to-end live on judge.tw with devtools open (2026-07-17): editor + Monaco worker
// init, KaTeX CSS/font loading (loaded globally via app/layout.tsx on every page), the Google
// OAuth redirect (landed on real accounts.google.com with the correct callback URL), and the ECPay
// ATM checkout (auto-submitted hosted-checkout form reached payment-stage.ecpay.com.tw) — zero CSP
// violations logged across all four. Enforcing from here on; see git history for the prior
// Report-Only rationale if a future directive change needs to go through this process again.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${API_ORIGIN} https://accounts.google.com`,
  "worker-src 'self' blob:",
  `form-action 'self' https://accounts.google.com https://payment.ecpay.com.tw https://payment-stage.ecpay.com.tw`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@oj/shared"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Content-Security-Policy-Report-Only", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
