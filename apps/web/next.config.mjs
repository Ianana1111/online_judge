// Content-Security-Policy moved to middleware.ts — it needs a fresh nonce generated per request,
// which a static header set here can't do. Every other security header below has no such need and
// stays here.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@oj/shared"],
  // Default ("loose") CSS chunking merges stylesheets that are commonly loaded together into
  // shared chunks — which merged katex.min.css (only imported by StatementRenderer, meant to load
  // on problem/discussion/class pages only) into the same chunk as globals.css, shipping it to
  // every page including the homepage. "strict" makes each CSS chunk follow the actual JS import
  // graph instead.
  experimental: {
    cssChunking: "strict",
  },
  // @oj/shared's source uses NodeNext-style explicit ".js" import specifiers (e.g. "./schemas.js"
  // resolving to schemas.ts) — fine for tsc/ts-node, but webpack's resolver takes ".js" literally
  // and never finds a same-named ".ts" file since the package ships no build step. This is the
  // standard extensionAlias fix for a TS workspace package consumed straight from source.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
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
