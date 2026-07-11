/**
 * ECPay (綠界) AioCheckOut integration helpers. Defaults to ECPay's own published sandbox
 * merchant (MerchantID 3002607) so this integration is fully testable end-to-end before the
 * user's real merchant account is approved — swap ECPAY_MERCHANT_ID/HASH_KEY/HASH_IV and
 * ECPAY_ENV=production on Railway once it is, no code changes needed.
 * Docs: https://developers.ecpay.com.tw/
 */
import { webcrypto } from "node:crypto";

const SANDBOX = {
  merchantId: "3002607",
  hashKey: "pwFHCqoQZGmho4w6",
  hashIv: "EkRm7iFT261dpevs",
};

export function ecpayConfig() {
  const isProduction = process.env.ECPAY_ENV === "production";
  return {
    merchantId: process.env.ECPAY_MERCHANT_ID || SANDBOX.merchantId,
    hashKey: process.env.ECPAY_HASH_KEY || SANDBOX.hashKey,
    hashIv: process.env.ECPAY_HASH_IV || SANDBOX.hashIv,
    checkoutUrl: isProduction
      ? "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"
      : "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",
    isSandbox: !isProduction,
  };
}

// ECPay's checksum needs specific percent-escape substitutions .NET's UrlEncode produces but
// encodeURIComponent doesn't (or encodes differently) — this list is exactly what their own PHP
// SDK documents.
const ENCODE_REPLACEMENTS: [RegExp, string][] = [
  [/%2d/gi, "-"],
  [/%5f/gi, "_"],
  [/%2e/gi, "."],
  [/%21/gi, "!"],
  [/%2a/gi, "*"],
  [/%28/gi, "("],
  [/%29/gi, ")"],
  [/%20/gi, "+"],
];

function ecpayUrlEncode(str: string): string {
  let encoded = encodeURIComponent(str);
  for (const [pattern, replacement] of ENCODE_REPLACEMENTS) {
    encoded = encoded.replace(pattern, replacement);
  }
  return encoded;
}

/** Computes CheckMacValue for a param set per ECPay's documented algorithm:
 * sort A-Z by key -> wrap with HashKey=...&...&HashIV=... -> URL-encode (.NET-style) -> lowercase
 * -> SHA256 -> uppercase. Excludes any existing CheckMacValue field from the input, and any key
 * with an empty/undefined value (ECPay omits those from the signed string). */
export async function computeCheckMacValue(
  params: Record<string, string | number | undefined>,
  { hashKey, hashIv }: { hashKey: string; hashIv: string },
): Promise<string> {
  const entries = Object.entries(params).filter(
    ([k, v]) => k !== "CheckMacValue" && v !== undefined && v !== "",
  ) as [string, string | number][];
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const joined = entries.map(([k, v]) => `${k}=${v}`).join("&");
  const raw = `HashKey=${hashKey}&${joined}&HashIV=${hashIv}`;
  const encoded = ecpayUrlEncode(raw).toLowerCase();

  const digest = await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(encoded));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function verifyCheckMacValue(
  params: Record<string, string | number | undefined>,
  config: { hashKey: string; hashIv: string },
): Promise<boolean> {
  const provided = params.CheckMacValue;
  if (typeof provided !== "string" || !provided) return false;
  const expected = await computeCheckMacValue(params, config);
  return expected === provided.toUpperCase();
}
