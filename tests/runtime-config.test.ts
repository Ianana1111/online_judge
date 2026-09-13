import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { assertRuntimeConfig, createRequestTracker } from "../apps/api/src/common/runtime-config";
describe("deployment security boundaries", () => {
  const configured = () => ({ NODE_ENV: "production", ECPAY_ENV: "sandbox", WEB_ORIGIN: "https://judge.example.test", API_ORIGIN: "https://api.example.test", ...Object.fromEntries(["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET", "CSRF_SECRET", "INTERNAL_SERVICE_TOKEN", "SCHOOL_VERIFY_SECRET"].map((s) => [s, randomBytes(32).toString("hex")])) });
  it("rejects public defaults, weak secrets, shared keys, and non-HTTPS origins", () => {
    const env = configured(); expect(() => assertRuntimeConfig(env)).not.toThrow();
    for (const key of ["", "dev_access_secret_change_me", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]) expect(() => assertRuntimeConfig({ ...env, JWT_ACCESS_SECRET: key })).toThrow();
    expect(() => assertRuntimeConfig({ ...env, CSRF_SECRET: env.JWT_ACCESS_SECRET })).toThrow();
    expect(() => assertRuntimeConfig({ ...env, WEB_ORIGIN: "http://judge.example.test" })).toThrow();
    expect(() => assertRuntimeConfig({ ...env, API_ORIGIN: "https://api.example.test/callback" })).toThrow();
    expect(() => assertRuntimeConfig({ ...env, ECPAY_ENV: "prod" })).toThrow();
  });
  it("ignores spoofed edge headers on direct connections", () => {
    const track = createRequestTracker(); expect(track({ socket: { remoteAddress: "203.0.113.1" }, headers: { "x-real-ip": "198.51.100.1" } })).toBe("ip:203.0.113.1");
  });
  it("honors only valid single IP headers from configured peers", () => {
    const track = createRequestTracker("10.0.0.0/24,2001:db8::/64");
    expect(track({ socket: { remoteAddress: "::ffff:10.0.0.2" }, headers: { "x-real-ip": "198.51.100.1" } })).toBe("ip:198.51.100.1");
    expect(track({ socket: { remoteAddress: "10.0.0.2" }, headers: { "x-real-ip": "198.51.100.1, 1.2.3.4" } })).toBe("ip:10.0.0.2");
    expect(track({ socket: { remoteAddress: "10.0.1.2" }, headers: { "x-real-ip": "198.51.100.1" } })).toBe("ip:10.0.1.2");
    expect(() => createRequestTracker("bad/99")).toThrow();
  });
  it("uses one account budget across rotating client IPs", () => {
    const track = createRequestTracker(); expect(track({ user: { id: "one" }, socket: { remoteAddress: "203.0.113.1" } })).toBe("user:one");
    expect(track({ user: { id: "one" }, socket: { remoteAddress: "203.0.113.2" } })).toBe("user:one");
  });
});
