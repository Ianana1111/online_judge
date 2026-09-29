import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ANALYTICS_CONTEXT_TTL, signAnalyticsContext } from "@oj/shared/analyticsContext";
import { normalizeTaiwanRegion } from "../../../../lib/analytics-geo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const cookieName = "oj_analytics_id";
const headers = { "Cache-Control": "private, no-store", "Vary": "Cookie" };

export function GET(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return new NextResponse(null, { status: 403, headers });
  if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return new NextResponse(null, { status: 204, headers });
  const secret = process.env.ANALYTICS_CONTEXT_SECRET;
  if (!secret || secret.length < 32) return new NextResponse(null, { status: 503, headers });
  const previous = request.cookies.get(cookieName)?.value;
  const id = previous && /^[a-f0-9-]{36}$/i.test(previous) ? previous : randomUUID();
  // Only the hosting edge supplies location. Never accept it from JSON/query parameters,
  // or trust request headers when this server is running outside Vercel.
  const countryValue = process.env.VERCEL === "1" ? request.headers.get("x-vercel-ip-country") : null;
  const regionValue = process.env.VERCEL === "1" ? request.headers.get("x-vercel-ip-country-region") : null;
  const country = countryValue && /^[A-Z]{2}$/.test(countryValue) ? countryValue : null;
  const cityValue = process.env.VERCEL === "1" ? request.headers.get("x-vercel-ip-city") : null;
  const region = country === "TW" ? normalizeTaiwanRegion(regionValue, cityValue)
    : regionValue && /^[A-Z0-9-]{1,8}$/.test(regionValue) ? regionValue : null;
  const issuedAt = Math.floor(Date.now() / 1000);
  const token = signAnalyticsContext({ visitorId: createHmac("sha256", secret).update(`visitor:${id}`).digest("hex"), country, region, issuedAt, expiresAt: issuedAt + ANALYTICS_CONTEXT_TTL }, secret);
  const response = NextResponse.json({ token, expiresAt: (issuedAt + ANALYTICS_CONTEXT_TTL) * 1000 }, { headers });
  response.cookies.set(cookieName, id, { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 180 * 24 * 60 * 60 });
  return response;
}
