const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || "https://api.judge.tw";

// @monaco-editor/react's default loader fetches the editor itself from jsDelivr at runtime
// (cdn.jsdelivr.net/npm/monaco-editor@.../min/vs/loader.js) rather than bundling it — this only
// surfaced once CSP actually started enforcing (2026-07-17 prod incident: editor stuck on
// "Loading..." within minutes of flipping the header, reverted to Report-Only, root-caused via a
// live `securitypolicyviolation` listener — Report-Only's own console text didn't surface it).
// Whitelisting the CDN here is the fast fix; self-hosting Monaco (removing the CDN dependency
// entirely) is a real follow-up, not done here.
const MONACO_CDN = "https://cdn.jsdelivr.net";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://accounts.google.com ${MONACO_CDN}`,
  `style-src 'self' 'unsafe-inline' ${MONACO_CDN}`,
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${API_ORIGIN} https://accounts.google.com ${MONACO_CDN}`,
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
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
