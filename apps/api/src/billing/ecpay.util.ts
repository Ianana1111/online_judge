/**
 * ECPay (綠界) AioCheckOut integration helpers. Defaults to ECPay's own published sandbox
 * merchant (MerchantID 3002607) so this integration is fully testable end-to-end before the
 * user's real merchant account is approved — swap ECPAY_MERCHANT_ID/HASH_KEY/HASH_IV and
 * ECPAY_ENV=production on Railway once it is, no code changes needed.
 * Docs: https://developers.ecpay.com.tw/
 */
import { webcrypto, createCipheriv, createDecipheriv } from "node:crypto";

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
 * with an undefined value (never actually sent), but NOT empty-string values — confirmed against
 * two real production ECPay webhooks (2026-07-26) that ECPay's own signature is computed WITH
 * empty fields like StoreID/CustomField1-4 included (e.g. "...&storeid=&..."), not omitted. This
 * had been silently breaking every incoming webhook's CheckMacValue verification (the outgoing,
 * order-creation direction never included empty fields to begin with, so that side always looked
 * fine) until caught by comparing our computed value against ECPay's actual sent value for a real
 * failed webhook. */
export async function computeCheckMacValue(
  params: Record<string, string | number | undefined>,
  { hashKey, hashIv }: { hashKey: string; hashIv: string },
): Promise<string> {
  const entries = Object.entries(params).filter(
    ([k, v]) => k !== "CheckMacValue" && v !== undefined,
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

// Deliberately an allow-list, not a deny-list: a webhook body ECPay sends can carry payer/card
// metadata (last-4 digit card4no, BIN card6no, auth_code, gwsr, bank vAccount/BankCode) that has
// no business sitting in Railway's log retention, and a deny-list would silently start leaking
// again the moment ECPay adds a field this list hasn't been taught about yet. Every name below has
// been checked against ECPay's own webhook docs and is either an id we already store, a status
// code, or a plain amount/date — nothing that identifies the payer or their instrument.
const SAFE_TO_LOG_ECPAY_FIELDS = [
  "MerchantTradeNo",
  "RtnCode",
  "RtnMsg",
  "TradeNo",
  "TradeAmt",
  "PaymentDate",
  "TradeDate",
  "PaymentType",
  "PaymentTypeChargeFee",
  "TotalSuccessTimes",
  "Frequency",
  "ExecTimes",
  "Status",
] as const;

/** Reduces a raw ECPay webhook body to a small allow-listed subset, safe to write to logs — see
 * `SAFE_TO_LOG_ECPAY_FIELDS`. Used only for diagnosing a CheckMacValue mismatch; never for the
 * actual signature computation, which still needs every field ECPay sent. */
export function redactEcpayBodyForLogging(body: Record<string, string | number | undefined>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const key of SAFE_TO_LOG_ECPAY_FIELDS) {
    if (key in body) redacted[key] = body[key];
  }
  redacted._omittedFieldCount = Object.keys(body).length - Object.keys(redacted).length;
  return redacted;
}

// --- AES-encrypted APIs (Credit/DoAction, CreditDetail/QueryTrade) ---
// A completely separate encryption scheme from CheckMacValue above: these newer "1.0.0" APIs wrap
// their payload as AES-128-CBC(PKCS7), key=HashKey and iv=HashIV used directly (both always
// exactly 16 ASCII chars, i.e. 16 bytes -> a valid AES-128 key/iv with no derivation step), over
// the URL-encoded JSON body, output as Base64 — per developers.ecpay.com.tw's "參數加密方式說明".

function ecpayAesEncrypt(payload: unknown, hashKey: string, hashIv: string): string {
  const urlEncoded = encodeURIComponent(JSON.stringify(payload));
  const cipher = createCipheriv("aes-128-cbc", Buffer.from(hashKey, "utf8"), Buffer.from(hashIv, "utf8"));
  const encrypted = Buffer.concat([cipher.update(urlEncoded, "utf8"), cipher.final()]);
  return encrypted.toString("base64");
}

function ecpayAesDecrypt<T>(encryptedBase64: string, hashKey: string, hashIv: string): T {
  const decipher = createDecipheriv("aes-128-cbc", Buffer.from(hashKey, "utf8"), Buffer.from(hashIv, "utf8"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedBase64, "base64")), decipher.final()]);
  return JSON.parse(decodeURIComponent(decrypted.toString("utf8"))) as T;
}

interface EcpayApiConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  isSandbox: boolean;
}

async function callEcpayAesApi<TResponseData>(
  path: string,
  data: Record<string, unknown>,
  config: EcpayApiConfig,
): Promise<TResponseData> {
  // Both endpoints only exist in production per ECPay's own docs (the DoAction test environment
  // has "no real authorization capability") — nothing meaningful to call in sandbox mode.
  const base = config.isSandbox ? "https://ecpayment-stage.ecpay.com.tw" : "https://ecpayment.ecpay.com.tw";
  const body = {
    MerchantID: config.merchantId,
    RqHeader: { Timestamp: Math.floor(Date.now() / 1000) },
    Data: ecpayAesEncrypt({ MerchantID: config.merchantId, ...data }, config.hashKey, config.hashIv),
  };
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as { TransCode?: number; TransMsg?: string; Data?: string };
  if (json.TransCode !== 1 || !json.Data) {
    throw new Error(`ECPay API ${path} transport failure: ${json.TransMsg ?? "unknown"}`);
  }
  return ecpayAesDecrypt<TResponseData>(json.Data, config.hashKey, config.hashIv);
}

export interface EcpayCreditQueryResult {
  RtnMsg: string;
  TradeID?: string;
  Amount?: number;
  ClsAmt?: number;
  /** "Authorized" | "To be captured" | "Captured" | "Canceled" (ECPay's own English enum values). */
  Status?: string;
}

/** Looks up a credit-card order's real-time authorization/capture state by our own MerchantTradeNo
 * — no need to have captured its ECPay-assigned TradeNo from an earlier webhook, since none fires
 * until capture completes anyway (the entire reason this polling path exists). */
export async function queryEcpayCreditTrade(merchantTradeNo: string, config: EcpayApiConfig): Promise<EcpayCreditQueryResult> {
  return callEcpayAesApi<EcpayCreditQueryResult>(
    "/1.0.0/CreditDetail/QueryTrade",
    { MerchantTradeNo: merchantTradeNo },
    config,
  );
}

export interface EcpayPeriodActionResult {
  RtnCode: number;
  RtnMsg: string;
  MerchantID: string;
  MerchantTradeNo: string;
}

/** Stops all future auto-charges on a recurring (定期定額) order. Per ECPay's own docs this can't be
 * undone — a "reactivated" subscription is really a brand new order — which is why
 * billing.service.cancelSubscription only ever marks our own Subscription row CANCELLED after this
 * call actually succeeds, never before. */
export async function cancelEcpayPeriod(merchantTradeNo: string, config: EcpayApiConfig): Promise<EcpayPeriodActionResult> {
  return callEcpayAesApi<EcpayPeriodActionResult>(
    "/1.0.0/Cashier/CreditCardPeriodAction",
    { MerchantTradeNo: merchantTradeNo, Action: "Cancel" },
    config,
  );
}

