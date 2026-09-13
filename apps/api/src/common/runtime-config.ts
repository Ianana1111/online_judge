import { BlockList, isIP } from "node:net";
const REQUIRED_SECRETS = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "CSRF_SECRET", "INTERNAL_SERVICE_TOKEN", "SCHOOL_VERIFY_SECRET"] as const;
export function assertRuntimeConfig(env: NodeJS.ProcessEnv = process.env): void {
  if (env.ADMIN_MFA_REQUIRED && !["true", "false"].includes(env.ADMIN_MFA_REQUIRED)) throw new Error("ADMIN_MFA_REQUIRED must be true or false");
  if (env.ACCOUNT_SECURITY_KEY && (!/^[a-f\d]{64}$/i.test(env.ACCOUNT_SECURITY_KEY) || new Set(env.ACCOUNT_SECURITY_KEY).size < 8)) throw new Error("ACCOUNT_SECURITY_KEY must contain 32 random bytes encoded as hex");
  if (env.ADMIN_MFA_REQUIRED === "true" && !env.ACCOUNT_SECURITY_KEY) throw new Error("Configure ACCOUNT_SECURITY_KEY before requiring administrator MFA");
  if (env.ECPAY_ENV && !["sandbox", "production"].includes(env.ECPAY_ENV)) throw new Error("ECPAY_ENV must be sandbox or production");
  if (env.NODE_ENV !== "production") return;
  const invalid = REQUIRED_SECRETS.filter((name) => { const value = env[name]; return !value || Buffer.byteLength(value) < 32 || /dev_|change.?me|example|placeholder/i.test(value) || new Set(value).size < 10; });
  if (invalid.length) throw new Error(`Unsafe production secret configuration: ${invalid.join(", ")}. Use independent cryptographically random secrets of at least 32 bytes.`);
  if (new Set(REQUIRED_SECRETS.map((name) => env[name])).size !== REQUIRED_SECRETS.length) throw new Error("Production authentication secrets must be independent");
  if (env.ACCOUNT_SECURITY_KEY && REQUIRED_SECRETS.some((name) => env[name] === env.ACCOUNT_SECURITY_KEY)) throw new Error("Account encryption must use an independent key");
  if (!env.ECPAY_ENV) throw new Error("Set ECPAY_ENV explicitly for production builds, including staging");
  for (const name of ["WEB_ORIGIN", "API_ORIGIN"]) {
    const values = env[name]?.split(",").map((v) => v.trim());
    if (!values?.length) throw new Error(`${name} is required in production`);
    for (const value of values) {
      try { const url = new URL(value); if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error(); }
      catch { throw new Error(`${name} must contain HTTPS origins without paths or credentials`); }
    }
  }
}

function normalizeIp(ip: string) { return ip.startsWith("::ffff:") && isIP(ip.slice(7)) === 4 ? ip.slice(7) : ip; }
/** Honor an edge header only from explicitly trusted socket peers. Do not trust a user-supplied
 * X-Real-IP on direct requests or guess the number of reverse proxies in a deployment. */
export function createRequestTracker(cidrs = process.env.TRUSTED_PROXY_CIDRS ?? "") {
  const trusted = new BlockList();
  for (const entry of cidrs.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [address, mask, extra] = entry.split("/"); const ip = normalizeIp(address), family = isIP(ip);
    if (!family || extra !== undefined || (mask !== undefined && !/^\d+$/.test(mask))) throw new Error("Invalid TRUSTED_PROXY_CIDRS configuration");
    trusted.addSubnet(ip, mask === undefined ? (family === 4 ? 32 : 128) : Number(mask), family === 4 ? "ipv4" : "ipv6");
  }
  return (req: { user?: { id?: string }; headers?: Record<string, unknown>; socket?: { remoteAddress?: string }; ip?: string }) => {
    // An authenticated account cannot bypass its budget by rotating source IPs.
    if (req.user?.id) return `user:${req.user.id}`;
    const peer = normalizeIp(req.socket?.remoteAddress ?? req.ip ?? "unknown"), family = isIP(peer);
    const forwarded = req.headers?.["x-real-ip"];
    if (family && trusted.check(peer, family === 4 ? "ipv4" : "ipv6") && typeof forwarded === "string" && isIP(forwarded)) return `ip:${normalizeIp(forwarded)}`;
    return `ip:${peer}`;
  };
}
