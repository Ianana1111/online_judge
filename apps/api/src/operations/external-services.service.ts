import { Injectable } from "@nestjs/common";
import { resolveNs } from "node:dns/promises";
import { connect } from "node:tls";
import { prisma } from "@oj/db";
import { providerBillingSnapshotSchema, type ExternalServicesDashboard, type ExternalServiceRow, type ServiceCostInput, type ServiceKey } from "@oj/shared";
import { OperationsService } from "./operations.service";
import { SERVICE_CATALOG } from "./service-catalog";

async function certificateExpiry(): Promise<string | null> {
  return new Promise(resolve => {
    const socket = connect({ host: "judge.tw", port: 443, servername: "judge.tw", rejectUnauthorized: true });
    const done = (value: string | null) => { socket.destroy(); resolve(value); };
    socket.setTimeout(4000, () => done(null)); socket.once("error", () => done(null));
    socket.once("secureConnect", () => { const value = socket.getPeerCertificate().valid_to; done(value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null); });
  });
}
// Only fixed public destinations are probed. Editable management URLs never reach fetch/TLS/DNS.
async function probeSite() {
  const [web, nameservers, expiresAt] = await Promise.all([
    fetch("https://judge.tw/", { method: "HEAD", redirect: "error", signal: AbortSignal.timeout(4000) }).then(r => r.ok).catch(() => false),
    Promise.race([resolveNs("judge.tw"), new Promise<string[]>(resolve => { const t = setTimeout(() => resolve([]), 4000); t.unref(); })]).catch(() => [] as string[]),
    certificateExpiry(),
  ]);
  return { web, nameservers, expiresAt, checkedAt: new Date().toISOString() };
}
@Injectable()
export class ExternalServicesService {
  private probe?: { until: number; data: Awaited<ReturnType<typeof probeSite>> };
  private probing?: ReturnType<typeof probeSite>;
  constructor(private readonly operations: OperationsService) {}
  private async site() {
    if (this.probe && this.probe.until > Date.now()) return this.probe.data;
    this.probing ??= probeSite();
    try { const data = await this.probing; this.probe = { until: Date.now() + 300000, data }; return data; }
    finally { this.probing = undefined; }
  }
  async update(key: ServiceKey, value: ServiceCostInput, userId: string) {
    const data = { ...value, renewsAt: value.renewsAt ? new Date(value.renewsAt) : null, updatedById: userId };
    await prisma.externalServiceRecord.upsert({ where: { key }, create: { key, ...data }, update: data });
    return { ok: true };
  }
  async dashboard(): Promise<ExternalServicesDashboard> {
    const since = new Date(Date.now() - 30 * 86400000);
    const [records, ops, site, googleUsers, payments, lastPayment] = await Promise.all([
      prisma.externalServiceRecord.findMany(), this.operations.snapshot().catch(() => null), this.site(),
      prisma.user.count({ where: { googleId: { not: null }, deletionRequestedAt: null } }),
      prisma.payment.count({ where: { method: "ECPAY", status: "APPROVED", paidAt: { gte: since } } }),
      prisma.payment.findFirst({ where: { method: "ECPAY", status: "APPROVED" }, select: { paidAt: true }, orderBy: { paidAt: "desc" } }),
    ]);
    const configured = (key: string) => !!process.env[key];
    const overrides: Partial<Record<ServiceKey, Pick<ExternalServiceRow, "status" | "statusLabel" | "facts">>> = {
      railway: { status: ops ? (ops.alerts.includes("JUDGE_WORKER_UNREACHABLE") ? "attention" : "ok") : "attention", statusLabel: ops ? (ops.alerts.includes("JUDGE_WORKER_UNREACHABLE") ? "Judge 心跳中斷，請檢查" : "本站資料庫與佇列可連線") : "本站營運探測失敗", facts: [
        { label: "運行內容", value: "API · Judge · PostgreSQL · Redis" }, { label: "資料庫連線數", value: String(ops?.databaseConnections ?? "待確認") }, { label: "Redis 記憶體", value: ops?.redis ? `${ops.redis.usedMb} MB` : "待確認" },
      ] },
      vercel: { status: site.web ? "ok" : "attention", statusLabel: site.web ? "網站 HTTPS 可連線" : "網站探測未成功", facts: [
        { label: "網站", value: "judge.tw" }, { label: "使用中 Sandbox", value: ops?.judge ? `${ops.judge.sandboxes} / 100` : "待確認" }, { label: "探測時間", value: site.checkedAt },
      ] },
      resend: { status: !configured("RESEND_API_KEY") ? "inactive" : (ops?.failedAuthMail ?? 0) > 0 ? "attention" : "configured", statusLabel: !configured("RESEND_API_KEY") ? "尚未設定寄信服務" : (ops?.failedAuthMail ?? 0) > 0 ? "有郵件多次寄送失敗" : "寄信設定已就緒", facts: [
        { label: "待處理寄送失敗", value: String(ops?.failedAuthMail ?? "待確認") }, { label: "驗證範圍", value: "設定與本站重試紀錄；不代表收件匣已收信" },
      ] },
      domain: { status: !site.expiresAt ? "attention" : Date.parse(site.expiresAt) - Date.now() < 14 * 86400000 ? "attention" : "ok", statusLabel: site.expiresAt ? "HTTPS 憑證有效" : "憑證狀態待確認", facts: [
        { label: "DNS", value: site.nameservers.join(" · ") || "查詢未成功" }, { label: "憑證到期", value: site.expiresAt ?? "待確認" }, { label: "續費", value: "網域續約日請另外填寫，與憑證日期不同" },
      ] },
      ecpay: { status: ["ECPAY_MERCHANT_ID", "ECPAY_HASH_KEY", "ECPAY_HASH_IV"].every(configured) ? "configured" : "inactive", statusLabel: !["ECPAY_MERCHANT_ID", "ECPAY_HASH_KEY", "ECPAY_HASH_IV"].every(configured) ? "金流設定未完成" : process.env.ECPAY_ENV === "production" ? "正式金流設定" : "測試金流設定", facts: [
        { label: "近 30 天確認收款", value: `${payments} 筆` }, { label: "最近確認收款", value: lastPayment?.paidAt?.toISOString() ?? "尚無確認紀錄" }, { label: "費用", value: "交易手續費依商店合約；授權成功不等於已請款" },
      ] },
      google: { status: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"].every(configured) ? "configured" : "inactive", statusLabel: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"].every(configured) ? "OAuth 已設定" : "OAuth 未設定", facts: [{ label: "本站綁定 Google 的帳號", value: `${googleUsers} 人` }, { label: "用途", value: "Google 登入；不是 Google Cloud 帳戶人數" }] },
      github: { status: "configured", statusLabel: "程式碼託管來源", facts: [{ label: "Repository", value: "Ianana1111 / online_judge" }, { label: "CI", value: "依每次 commit 與 workflow 設定執行" }] },
      discord: { status: "configured", statusLabel: "社群入口已設定", facts: [{ label: "社群", value: "judge. Discord" }, { label: "加值費用", value: "Nitro／伺服器加成如有購買，請另行登記" }] },
      sentry: { status: configured("SENTRY_DSN") ? "configured" : "inactive", statusLabel: configured("SENTRY_DSN") ? "API 錯誤追蹤已設定" : "API 錯誤追蹤未啟用", facts: [{ label: "檢查範圍", value: "API 設定；前端與 Judge 請至服務後台確認" }] },
    };
    const services = SERVICE_CATALOG.map(meta => {
      const r = records.find(row => row.key === meta.key), snapshot = providerBillingSnapshotSchema.safeParse(r?.billingSnapshot);
      return { ...meta, ...overrides[meta.key]!, cost: {
        plan: r?.plan ?? "", currency: r?.currency === "TWD" ? "TWD" as const : "USD" as const,
        billingCycle: (r?.billingCycle ?? "UNKNOWN") as ServiceCostInput["billingCycle"], amountMinor: r?.amountMinor ?? null,
        budgetMinor: r?.budgetMinor ?? null, renewsAt: r?.renewsAt?.toISOString() ?? null, notes: r?.notes ?? "", managementUrl: r?.managementUrl ?? null,
        updatedAt: r?.updatedAt.toISOString() ?? null, billingSnapshot: snapshot.success ? snapshot.data : null, billingCheckedAt: r?.billingCheckedAt?.toISOString() ?? null,
      } };
    });
    return { measuredAt: new Date().toISOString(), services };
  }
}
