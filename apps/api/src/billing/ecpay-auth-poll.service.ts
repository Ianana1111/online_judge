import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { prisma } from "@oj/db";
import { BillingService } from "./billing.service";
import { ecpayConfig, queryEcpayCreditTrade } from "./ecpay.util";

const POLL_INTERVAL_MS = 10_000;
// Don't bother querying orders older than this — an abandoned checkout that never got authorized
// this long ago isn't coming back, and ECPay's own settlement query window is capped at 3 months
// anyway.
const MAX_ORDER_AGE_MS = 48 * 60 * 60 * 1000;

function isEcpayDailyBatchWindow(now: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  // ECPay's own docs: "Every daily auto-settlement 20:15~20:30, do not execute this API" — give it
  // a couple minutes of margin on both sides rather than the exact boundary.
  const mins = hour * 60 + minute;
  return mins >= 20 * 60 + 10 && mins <= 20 * 60 + 35;
}

/**
 * Credit-card orders get no push notification at all for "authorization succeeded" — ECPay's
 * ReturnURL webhook only fires once the trade is actually captured/settled. Rather than wait for
 * that, this polls ECPay's own query API every 10s for still-PENDING credit orders and, the
 * moment one shows as authorized, calls billing.markCreditAuthorized to grant Pro immediately.
 * Capture itself is a deliberately manual step done later via ECPay's merchant backend — see
 * BillingService.listAuthorizedPending for the "still owed" queue that creates.
 */
@Injectable()
export class EcpayAuthPollService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EcpayAuthPollService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly billing: BillingService) {}

  onModuleInit(): void {
    const config = ecpayConfig();
    // The sandbox/stage environment has no real card authorization to poll for (ECPay's own docs:
    // "Test environment unavailable due to lack of real authorization capability") — nothing to do
    // there, so only run this against the real production merchant account.
    if (config.isSandbox) {
      this.logger.log("ECPay authorization polling disabled (sandbox/non-production merchant config).");
      return;
    }
    this.timer = setInterval(() => {
      void this.pollOnce();
    }, POLL_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async pollOnce(): Promise<void> {
    if (this.running) return; // a slow previous cycle is still in flight — don't overlap
    this.running = true;
    try {
      const now = new Date();
      if (isEcpayDailyBatchWindow(now)) return;

      const candidates = await prisma.payment.findMany({
        where: {
          method: "ECPAY",
          ecpayMethod: "CREDIT",
          status: "PENDING",
          createdAt: { gte: new Date(now.getTime() - MAX_ORDER_AGE_MS) },
          merchantTradeNo: { not: null },
        },
      });
      if (candidates.length === 0) return;

      const config = ecpayConfig();
      for (const payment of candidates) {
        try {
          await this.checkAuthorized(payment.merchantTradeNo!, config);
        } catch (err) {
          this.logger.warn(`ECPay auth poll failed for ${payment.merchantTradeNo}: ${String(err)}`);
        }
      }
    } finally {
      this.running = false;
    }
  }

  private async checkAuthorized(merchantTradeNo: string, config: ReturnType<typeof ecpayConfig>): Promise<void> {
    const query = await queryEcpayCreditTrade(merchantTradeNo, config);
    this.logger.log(`ECPay poll ${merchantTradeNo}: TradeID=${query.TradeID ?? "none"} Status=${query.Status ?? "none"}`);
    if (!query.TradeID || (query.Status !== "Authorized" && query.Status !== "To be captured")) {
      return; // not authorized yet (or already captured/canceled) — nothing to do this cycle
    }
    await this.billing.markCreditAuthorized(merchantTradeNo, query.TradeID);
  }
}
