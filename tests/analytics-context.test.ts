import { describe, expect, it, vi, afterEach } from "vitest";
import { signAnalyticsContext, verifyAnalyticsContext } from "../packages/shared/src/analyticsContext";
import { NextRequest } from "../apps/web/node_modules/next/server";
import { GET } from "../apps/web/app/api/analytics/context/route";
import { normalizeTaiwanRegion } from "../apps/web/lib/analytics-geo";
const secret = "test-analytics-context-secret-32-characters";
const now = Math.floor(Date.now() / 1000);
const claims = { visitorId: "a".repeat(64), country: "TW", region: "TPE", issuedAt: now, expiresAt: now + 3600 };
afterEach(() => vi.unstubAllEnvs());
it("accepts authenticated context and rejects modified, expired and overlong tokens", () => {
  const token = signAnalyticsContext(claims, secret);
  expect(verifyAnalyticsContext(token, secret)).toEqual(claims);
  expect(verifyAnalyticsContext(token, secret + "wrong")).toBeNull();
  expect(verifyAnalyticsContext(token, secret, (now + 3601) * 1000)).toBeNull();
  expect(verifyAnalyticsContext(token + ".extra", secret)).toBeNull();
  expect(verifyAnalyticsContext(token, undefined)).toBeNull();
  expect(verifyAnalyticsContext(signAnalyticsContext({ ...claims, expiresAt: now + 7200 }, secret), secret)).toBeNull();
});
describe("first-party location context", () => {
  it("normalizes Taiwan cities when the edge returns a legacy province and keeps ambiguity explicit", async () => {
    expect(normalizeTaiwanRegion("04", "Taipei")).toBe("TPE");
    expect(normalizeTaiwanRegion("04", "New%20Taipei")).toBe("NWT");
    expect(normalizeTaiwanRegion("TW-HSQ", "Hsinchu")).toBe("HSQ");
    expect(normalizeTaiwanRegion("04", "Hsinchu")).toBe("HSINCHU");
    expect(normalizeTaiwanRegion(null, "Chiayi")).toBe("CHIAYI");
    expect(normalizeTaiwanRegion("04", "Chiayi City")).toBe("CYI");
    expect(normalizeTaiwanRegion("04", "Unknown District")).toBeNull();
    expect(normalizeTaiwanRegion("04", "%invalid")).toBeNull();
    expect(normalizeTaiwanRegion("04", null)).toBeNull();
    vi.stubEnv("ANALYTICS_CONTEXT_SECRET", secret); vi.stubEnv("VERCEL", "1");
    const response = GET(new NextRequest("https://judge.tw/api/analytics/context", { headers: { "x-vercel-ip-country": "TW", "x-vercel-ip-country-region": "04", "x-vercel-ip-city": "New%20Taipei" } }));
    expect(verifyAnalyticsContext((await response.json()).token, secret)?.region).toBe("NWT");
  });
  it("uses hosting-edge geography without collecting the IP and reuses the browser cookie", async () => {
    vi.stubEnv("ANALYTICS_CONTEXT_SECRET", secret); vi.stubEnv("VERCEL", "1");
    const req = new NextRequest("https://judge.tw/api/analytics/context", { headers: { "x-vercel-ip-country": "TW", "x-vercel-ip-country-region": "NWT", "x-forwarded-for": "192.0.2.10" } });
    const response = GET(req), token = (await response.json()).token;
    const parsed = verifyAnalyticsContext(token, secret)!;
    expect(parsed).toMatchObject({ country: "TW", region: "NWT" });
    expect(JSON.stringify(parsed)).not.toContain("192.0.2.10");
    expect(response.headers.get("cache-control")).toContain("no-store");
    const cookie = response.cookies.get("oj_analytics_id")!;
    const again = GET(new NextRequest(req.url, { headers: { cookie: `oj_analytics_id=${cookie.value}` } }));
    expect(verifyAnalyticsContext((await again.json()).token, secret)?.visitorId).toBe(parsed.visitorId);
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/);
  });
  it("does not trust geo headers outside Vercel and honors privacy headers", async () => {
    vi.stubEnv("ANALYTICS_CONTEXT_SECRET", secret); vi.stubEnv("VERCEL", "");
    const response = GET(new NextRequest("http://localhost/api/analytics/context", { headers: { "x-vercel-ip-country": "TW" } }));
    expect(verifyAnalyticsContext((await response.json()).token, secret)?.country).toBeNull();
    expect(GET(new NextRequest("https://judge.tw/api/analytics/context", { headers: { dnt: "1" } })).status).toBe(204);
    expect(GET(new NextRequest("https://judge.tw/api/analytics/context", { headers: { "sec-gpc": "1" } })).status).toBe(204);
    expect(GET(new NextRequest("https://judge.tw/api/analytics/context", { headers: { "sec-fetch-site": "cross-site" } })).status).toBe(403);
  });
});
