// Server-only subpath: never export this from the browser-facing package index.
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const claimsSchema = z.object({
  visitorId: z.string().regex(/^[a-f0-9]{64}$/),
  country: z.string().regex(/^[A-Z]{2}$/).nullable(),
  region: z.string().regex(/^[A-Z0-9-]{1,8}$/).nullable(),
  issuedAt: z.number().int(), expiresAt: z.number().int(),
}).strict();
export type AnalyticsContext = z.infer<typeof claimsSchema>;
export const ANALYTICS_CONTEXT_TTL = 3600;

export function signAnalyticsContext(claims: AnalyticsContext, secret: string): string {
  if (secret.length < 32) throw new Error("Analytics secret is not configured");
  const payload = Buffer.from(JSON.stringify(claimsSchema.parse(claims))).toString("base64url");
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
}

export function verifyAnalyticsContext(token: string | undefined, secret: string | undefined, now = Date.now()): AnalyticsContext | null {
  if (!token || token.length > 2000 || !secret || secret.length < 32) return null;
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra !== undefined) return null;
    const expected = createHmac("sha256", secret).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const claims = claimsSchema.parse(JSON.parse(Buffer.from(payload, "base64url").toString()));
    const seconds = Math.floor(now / 1000);
    if (claims.issuedAt > seconds + 30 || claims.expiresAt <= seconds || claims.expiresAt - claims.issuedAt > ANALYTICS_CONTEXT_TTL || claims.expiresAt <= claims.issuedAt) return null;
    return claims;
  } catch { return null; }
}
