/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@oj/shared"],
  // Structural headers only — deliberately no Content-Security-Policy here. Monaco's editor
  // loads its tokenizer/language workers from blob: URLs and KaTeX injects inline styles, so a
  // real CSP needs a carefully allowlisted script-src/worker-src/style-src that's easy to get
  // subtly wrong (breaking the editor or math rendering) without live browser testing to verify
  // against. These headers can't break page functionality, so they're safe to ship without that.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
