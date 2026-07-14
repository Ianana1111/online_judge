const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "https://api.judge.tw";

// Shipped as Content-Security-Policy-Report-Only, not the enforcing header — deliberately. This
// site's known requirements (Monaco's worker-src blob: tokenizer, KaTeX's inline styles, Next's
// own inline hydration scripts, Google OAuth's full-page redirect, ECPay's auto-submitted hosted-
// checkout form) make it easy to get one directive subtly wrong; Report-Only never blocks
// anything; it only makes the browser console log what *would* have been blocked. Once someone
// has actually used the site end-to-end (editor, math rendering, Google login, an upgrade
// checkout) with devtools open and seen zero unexpected violations, flip the header name below to
// the enforcing one.
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
