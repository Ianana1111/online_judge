/**
 * ECPay (綠界) AioCheckOut integration helpers. Defaults to ECPay's own published sandbox
 * merchant (MerchantID 3002607) so this integration is fully testable end-to-end before the
 * user's real merchant account is approved — swap ECPAY_MERCHANT_ID/HASH_KEY/HASH_IV and
 * ECPAY_ENV=production on Railway once it is, no code changes needed.
 * Docs: https://developers.ecpay.com.tw/
 */
import { webcrypto, createCipheriv, createDecipheriv, timingSafeEqual } from "node:crypto";

const SANDBOX = {
  merchantId: "3002607",
  hashKey: "pwFHCqoQZGmho4w6",
  hashIv: "EkRm7iFT261dpevs",
};

// SANDBOX's credentials are ECPay's own publicly-published test merchant (documented in their
// integration guide, not a secret) — safe to fall back to ONLY while genuinely pointed at their
// sandbox checkout URL. Falling back to them while ECPAY_ENV=production would mean the real
// checkout endpoint verifies CheckMacValue against a key anyone can look up, so a forged webhook
// (e.g. a fake "payment succeeded" POST) would pass signature verification and grant free Pro —
// see assertEcpayConfigured in main.ts, which refuses to even start in that state; this throw is
// the same check at the point of use, in case ecpayConfig() is ever reached some other way.
export function ecpayConfig() {
  const isProduction = process.env.ECPAY_ENV === "production";
  if (isProduction && (!process.env.ECPAY_MERCHANT_ID || !process.env.ECPAY_HASH_KEY || !process.env.ECPAY_HASH_IV)) {
    throw new Error(
      "ECPAY_ENV is production but ECPAY_MERCHANT_ID/ECPAY_HASH_KEY/ECPAY_HASH_IV are not all set — " +
        "refusing to fall back to ECPay's publicly-known sandbox credentials against the real checkout endpoint.",
    );
  }
  if (isProduction && (process.env.ECPAY_MERCHANT_ID === SANDBOX.merchantId || process.env.ECPAY_HASH_KEY === SANDBOX.hashKey || process.env.ECPAY_HASH_IV === SANDBOX.hashIv)) {
    throw new Error("Public ECPay test credentials cannot be used in production");
  }
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
  // Case-INSENSITIVE, as ECPay specifies and as their own signatures are actually produced —
  // verified against a real production QueryTradeInfo response, which a case-sensitive sort could
  // not reproduce. It only matters for payloads mixing cases: everything we send ECPay is
  // PascalCase, so both orderings agree there, but what ECPay sends back adds lowercase fields
  // (amount, auth_code, card4no, gwsr, process_date, eci, stage, ...) whenever NeedExtraPaidInfo
  // is on or the order is recurring. Sorting those case-sensitively grouped every lowercase key
  // after every uppercase one, so the digest never matched and real payment notifications were
  // rejected as forgeries.
  const lower = new Map(entries.map(([k]) => [k, k.toLowerCase()]));
  entries.sort(([a], [b]) => {
    const x = lower.get(a)!, y = lower.get(b)!;
    return x < y ? -1 : x > y ? 1 : a < b ? -1 : a > b ? 1 : 0;
  });

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
  if (typeof provided !== "string" || !/^[a-fA-F0-9]{64}$/.test(provided)) return false;
  const expected = await computeCheckMacValue(params, config);
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
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
  // ECPay encodes this payload .NET-style, where a space is "+" and a literal plus is "%2b".
  // decodeURIComponent alone only handles "%20", so without this every spaced value arrives
  // mangled — "To+be+captured" never equals the "To be captured" the auth poll compares against.
  return JSON.parse(decodeURIComponent(decrypted.toString("utf8").replace(/\+/g, "%20"))) as T;
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
    signal: AbortSignal.timeout(10_000),
    redirect: "error",
  });
  if (!res.ok) throw new Error(`ECPay query failed (HTTP ${res.status})`);
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
  CloseData?: { Status: string; Amount: number }[];
}

export function parseCreditQuery(data: unknown): EcpayCreditQueryResult {
  if (!data || typeof data !== "object") throw new Error("Invalid ECPay credit response");
  const envelope = data as Record<string, unknown>;
  if (typeof envelope.RtnMsg !== "string") throw new Error("Missing ECPay query result");
  if (envelope.RtnMsg !== "") return { RtnMsg: envelope.RtnMsg };
  if (!envelope.RtnValue || typeof envelope.RtnValue !== "object") throw new Error("Missing ECPay RtnValue");
  const value = Object.fromEntries(Object.entries(envelope.RtnValue).map(([key, val]) => [key.trim(), val]));
  const closeData = envelope.CloseData ?? value.CloseData ?? value.close_data;
  const close = Array.isArray(closeData) ? closeData.map((row) => ({
    Status: String(row.Status ?? row.status ?? ""), Amount: Number(row.Amount ?? row.amount),
  })) : [];
  const amount = Number(value.Amount ?? value.amount);
  const tradeId = value.TradeID;
  if ((typeof tradeId !== "string" && typeof tradeId !== "number") || !Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Invalid ECPay credit identity or amount");
  }
  return { RtnMsg: "", TradeID: String(tradeId), Amount: amount,
    ClsAmt: Number(value.ClsAmt ?? value.clsamt),
    Status: String(value.Status ?? value.status ?? ""), CloseData: close };
}

/** Documented by the AIO detail-query page as the MerchantTradeNo fallback. */

/** Looks up a credit-card order's real-time authorization/capture state by our own MerchantTradeNo
 * — no need to have captured its ECPay-assigned TradeNo from an earlier webhook, since none fires
 * until capture completes anyway (the entire reason this polling path exists). */
export async function queryEcpayCreditTrade(merchantTradeNo: string, config: EcpayApiConfig): Promise<EcpayCreditQueryResult> {
  return parseCreditQuery(await callEcpayAesApi<unknown>(
    "/1.0.0/CreditDetail/QueryTrade",
    { MerchantTradeNo: merchantTradeNo },
    config,
  ));
}

async function callEcpayFormApi(path: string, fields: Record<string, string | number>, config: EcpayApiConfig): Promise<Record<string, string>> {
  const params = { MerchantID: config.merchantId, ...fields };
  const mac = await computeCheckMacValue(params, config);
  const base = config.isSandbox ? "https://payment-stage.ecpay.com.tw" : "https://payment.ecpay.com.tw";
  const response = await fetch(`${base}${path}`, {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(10_000),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(Object.entries({ ...params, CheckMacValue: mac }).map(([k, v]): [string, string] => [k, String(v)])),
  });
  if (!response.ok) throw new Error(`ECPay operation failed (HTTP ${response.status})`);
  const raw = (await response.text()).trim();
  const decoded = raw.startsWith("{") ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw));
  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) throw new Error("Invalid ECPay response");
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(decoded)) {
    if (typeof value !== "string" && typeof value !== "number") throw new Error("Invalid ECPay response field");
    result[key] = String(value);
  }
  if (result.CheckMacValue && !(await verifyCheckMacValue(result, config))) throw new Error("Invalid ECPay response signature");
  if (result.MerchantID !== config.merchantId || result.MerchantTradeNo !== String(fields.MerchantTradeNo)) {
    throw new Error("ECPay response identity mismatch");
  }
  return result;
}

export async function queryEcpayOrder(merchantTradeNo: string, config: EcpayApiConfig) {
  const result = await callEcpayFormApi("/Cashier/QueryTradeInfo/V5", {
    MerchantTradeNo: merchantTradeNo, TimeStamp: Math.floor(Date.now() / 1000),
  }, config);
  if (!result.CheckMacValue || !(await verifyCheckMacValue(result, config))) throw new Error("Unsigned ECPay order query");
  return result;
}

export function refundActions(status: string): ("N" | "E" | "R")[] {
  switch (status) {
    case "Authorized": case "已授權": case "操作取消": return ["N"];
    case "To be captured": case "要關帳": return ["E", "N"];
    case "Captured": case "已關帳": return ["R"];
    default: throw new Error("Credit transaction requires reconciliation before refund");
  }
}

export interface EcpayDoActionResult {
  RtnCode: number;
  RtnMsg: string;
  MerchantID: string;
  MerchantTradeNo: string;
  TradeNo: string;
}

/** Refunds ("R") a captured credit-card charge, or voids ("E") one that's only been authorized —
 * distinct from cancelEcpayPeriod above, which stops FUTURE auto-charges on a recurring order but
 * never touches money already moved for a period already charged. Same AES-encrypted API family
 * (and same "no real authorization capability in ECPay's sandbox/stage environment" limitation —
 * see queryEcpayCreditTrade's own callers) as CreditDetail/QueryTrade, which is what supplies the
 * `tradeNo` this needs — ECPay's own TradeID for the transaction, not our MerchantTradeNo. */
export async function doCreditCardAction(
  merchantTradeNo: string,
  tradeNo: string,
  action: "R" | "E" | "N",
  totalAmount: number,
  config: EcpayApiConfig,
): Promise<EcpayDoActionResult> {
  if (!Number.isSafeInteger(totalAmount) || totalAmount <= 0) throw new Error("Invalid refund amount");
  const result = await callEcpayFormApi(
    "/CreditDetail/DoAction",
    { MerchantTradeNo: merchantTradeNo, TradeNo: tradeNo, Action: action, TotalAmount: totalAmount },
    config,
  );
  if (result.TradeNo !== tradeNo) throw new Error("ECPay refund transaction mismatch");
  if (!/^\d+$/.test(result.RtnCode ?? "")) throw new Error("Missing ECPay action result");
  return { ...result, RtnCode: Number(result.RtnCode) } as unknown as EcpayDoActionResult;
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
  const result = await callEcpayFormApi(
    "/Cashier/CreditCardPeriodAction",
    { MerchantTradeNo: merchantTradeNo, Action: "Cancel", TimeStamp: Math.floor(Date.now() / 1000) },
    config,
  );
  if (!/^\d+$/.test(result.RtnCode ?? "")) throw new Error("Missing ECPay cancellation result");
  return { ...result, RtnCode: Number(result.RtnCode) } as unknown as EcpayPeriodActionResult;
}
