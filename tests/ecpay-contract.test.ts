import { createCipheriv } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cancelEcpayPeriod, computeCheckMacValue, doCreditCardAction, parseCreditQuery, queryEcpayCreditTrade, queryEcpayOrder, refundActions, verifyCheckMacValue } from "../apps/api/src/billing/ecpay.util";

// Published test merchant credentials, never a live account.
const config = { merchantId: "3002607", hashKey: "pwFHCqoQZGmho4w6", hashIv: "EkRm7iFT261dpevs", isSandbox: true };
const identity = { MerchantID: config.merchantId, MerchantTradeNo: "JTTEST123", TradeNo: "GATEWAY123" };
afterEach(() => vi.unstubAllGlobals());

describe("ECPay contract", () => {
  it("preserves empty signed fields and rejects modified payloads", async () => {
    const body = { ...identity, RtnCode: "1", StoreID: "", TradeAmt: "200" };
    const mac = await computeCheckMacValue(body, config);
    expect(await verifyCheckMacValue({ ...body, CheckMacValue: mac }, config)).toBe(true);
    expect(await verifyCheckMacValue({ ...body, TradeAmt: "2000", CheckMacValue: mac }, config)).toBe(false);
    const { StoreID: _, ...withoutEmpty } = body;
    expect(await verifyCheckMacValue({ ...withoutEmpty, CheckMacValue: mac }, config)).toBe(false);
    expect(await verifyCheckMacValue({ ...body, CheckMacValue: "invalid" }, config)).toBe(false);
  });
  // ECPay sorts the signed fields case-insensitively. It only shows up on payloads that mix cases,
  // which is exactly what ECPay sends back once NeedExtraPaidInfo is on or the order is recurring:
  // a case-sensitive sort grouped every lowercase key after every uppercase one, so real payment
  // notifications failed verification and were rejected as forgeries.
  it("sorts signed fields case-insensitively, as ECPay's own signatures are produced", async () => {
    const body = {
      ...identity, RtnCode: "1", TradeAmt: "200", amount: "200", auth_code: "414278",
      card4no: "3895", gwsr: "163066184", process_date: "2026/09/20 12:34:55", ItemName: "judge.tw Pro",
    };
    const mac = await computeCheckMacValue(body, config);
    // Independently built here in the order ECPay specifies, so a regression in the sort is caught
    // rather than silently agreeing with whatever the implementation happens to do.
    const ordered = Object.entries(body).sort(([a], [b]) => (a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0));
    expect(Object.keys(body).sort()).not.toEqual(ordered.map(([k]) => k)); // the two orders really do differ
    const raw = `HashKey=${config.hashKey}&${ordered.map(([k, v]) => `${k}=${v}`).join("&")}&HashIV=${config.hashIv}`;
    const { createHash } = await import("node:crypto");
    const encoded = encodeURIComponent(raw)
      .replace(/%2d/gi, "-").replace(/%5f/gi, "_").replace(/%2e/gi, ".").replace(/%21/gi, "!")
      .replace(/%2a/gi, "*").replace(/%28/gi, "(").replace(/%29/gi, ")").replace(/%20/gi, "+")
      .toLowerCase();
    expect(mac).toBe(createHash("sha256").update(encoded).digest("hex").toUpperCase());
  });
  // Everything we SEND ECPay is PascalCase, where both orderings agree — pinned so a future change
  // to the sort can't silently invalidate the checkout form signature ECPay validates on redirect.
  it("keeps the outgoing checkout signature stable", async () => {
    expect(await computeCheckMacValue({
      MerchantID: "3002607", MerchantTradeNo: "JTMU9BMGWP2C13526D78", MerchantTradeDate: "2026/09/20 12:33:20",
      PaymentType: "aio", TotalAmount: 200, TradeDesc: "judge.tw Pro upgrade", ItemName: "judge.tw Pro (月方案)",
      ReturnURL: "https://api.judge.tw/billing/ecpay/return", ClientBackURL: "https://judge.tw/upgrade/checkout",
      ChoosePayment: "Credit", IgnorePayment: "ApplePay", NeedExtraPaidInfo: "Y", EncryptType: 1,
      PeriodAmount: 200, PeriodType: "M", Frequency: 1, ExecTimes: 999,
      PeriodReturnURL: "https://api.judge.tw/billing/ecpay/period-return",
    }, config)).toBe("A968E13285AE5E1B53BA5EFAE39D2652F30E2C53D9F20CB3477529F580E9660B");
  });
  it.each([
    ["Authorized", ["N"]], ["To be captured", ["E", "N"]], ["Captured", ["R"]],
    ["已授權", ["N"]], ["要關帳", ["E", "N"]], ["操作取消", ["N"]],
  ])("uses the documented full-refund sequence for %s", (status, expected) => {
    expect(refundActions(status as string)).toEqual(expected);
  });
  it("fails closed on unknown or already cancelled states", () => {
    expect(() => refundActions("Canceled")).toThrow();
    expect(() => refundActions("")).toThrow();
  });
  it("unwraps the gateway's nested credit detail envelope", () => {
    expect(parseCreditQuery({ RtnMsg: "", RtnValue: { TradeID: "123", Amount: "200", ClsAmt: "200", Status: "Captured" }, CloseData: [{ Status: "Captured", Amount: 200 }] }))
      .toMatchObject({ TradeID: "123", Amount: 200, Status: "Captured", CloseData: [{ Amount: 200 }] });
    expect(() => parseCreditQuery({ RtnMsg: "", TradeID: "123", Amount: 200 })).toThrow();
    expect(parseCreditQuery({ RtnMsg: "error_nopay" })).toEqual({ RtnMsg: "error_nopay" });
  });
  it("decodes the AES query response before reading RtnValue", async () => {
    const cipher = createCipheriv("aes-128-cbc", Buffer.from(config.hashKey), Buffer.from(config.hashIv));
    const data = { RtnMsg: "", RtnValue: { TradeID: 123, Amount: 200, ClsAmt: 0, Status: "Authorized" } };
    const encrypted = Buffer.concat([cipher.update(encodeURIComponent(JSON.stringify(data)), "utf8"), cipher.final()]).toString("base64");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ TransCode: 1, Data: encrypted })));
    vi.stubGlobal("fetch", fetcher);
    expect(await queryEcpayCreditTrade(identity.MerchantTradeNo, config)).toMatchObject({ TradeID: "123", Amount: 200 });
    expect(fetcher.mock.calls[0][0]).toBe("https://ecpayment-stage.ecpay.com.tw/1.0.0/CreditDetail/QueryTrade");
  });
  it("uses the AIO form refund endpoint and real gateway TradeNo", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(new URLSearchParams({ ...identity, RtnCode: "1", RtnMsg: "OK" }).toString()));
    vi.stubGlobal("fetch", fetcher);
    expect((await doCreditCardAction(identity.MerchantTradeNo, identity.TradeNo, "R", 200, config)).RtnCode).toBe(1);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://payment-stage.ecpay.com.tw/CreditDetail/DoAction");
    expect(init.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(init.body.get("Action")).toBe("R");
    expect(init.body.get("TradeNo")).toBe(identity.TradeNo);
    expect(await verifyCheckMacValue(Object.fromEntries(init.body), config)).toBe(true);
  });
  it("cancels future renewals using the separately signed AIO operation", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...identity, RtnCode: 1, RtnMsg: "OK" })));
    vi.stubGlobal("fetch", fetcher);
    await cancelEcpayPeriod(identity.MerchantTradeNo, config);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://payment-stage.ecpay.com.tw/Cashier/CreditCardPeriodAction");
    expect(init.body.get("Action")).toBe("Cancel");
    expect(Number(init.body.get("TimeStamp"))).toBeGreaterThan(0);
  });
  it("does not accept a response for another merchant or transaction", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ...identity, MerchantID: "other", RtnCode: 1 }))));
    await expect(doCreditCardAction(identity.MerchantTradeNo, identity.TradeNo, "R", 200, config)).rejects.toThrow("identity mismatch");
  });
  it("requires a verified signature on order queries", async () => {
    const body = { ...identity, TradeStatus: "1", TradeAmt: "200", PaymentDate: "2026/09/12 12:00:00" };
    const mac = await computeCheckMacValue(body, config);
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(new URLSearchParams({ ...body, CheckMacValue: mac }).toString()))
      .mockResolvedValueOnce(new Response(new URLSearchParams(body).toString()));
    vi.stubGlobal("fetch", fetcher);
    expect((await queryEcpayOrder(identity.MerchantTradeNo, config)).TradeNo).toBe(identity.TradeNo);
    await expect(queryEcpayOrder(identity.MerchantTradeNo, config)).rejects.toThrow("Unsigned");
  });
  it("rejects invalid amounts before sending a refund", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    await expect(doCreditCardAction("JTTEST123", "GATEWAY123", "R", -1, config)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
