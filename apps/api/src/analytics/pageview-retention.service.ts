import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { prisma } from "@oj/db";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
// The admin traffic dashboard's own lookback caps at 365 days (see analytics.controller's
// clampDays/MAX_DAYS) — retaining a bit past that keeps the dashboard's longest view fully
// populated with margin, while still bounding what was previously unbounded growth on a 500MB
// Postgres instance (page_views writes are unauthenticated and unthrottled-by-content, so this
// table grows with every page load on the site, forever, unless something prunes it).
const RETENTION_DAYS = 400;
export const PRUNED_PAGEVIEWS_COUNTER = "pageviews_pruned";

@Injectable()
export class PageviewRetentionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PageviewRetentionService.name);
  private timer: NodeJS.Timeout | null = null;

  onModuleInit(): void {
    this.timer = setInterval(() => {
      void this.pruneOnce();
    }, CHECK_INTERVAL_MS);
    void this.pruneOnce(); // also run once at boot rather than waiting a full day for the first pass
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async pruneOnce(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
      // Pruned rows still count toward the all-time total (see AnalyticsService.trafficSummary).
      const count = await prisma.$transaction(async (tx) => {
        const { count } = await tx.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } });
        if (count > 0) await tx.siteCounter.upsert({
          where: { key: PRUNED_PAGEVIEWS_COUNTER },
          create: { key: PRUNED_PAGEVIEWS_COUNTER, value: count },
          update: { value: { increment: count } },
        });
        return count;
      });
      if (count > 0) this.logger.log(`Pruned ${count} page_views row(s) older than ${RETENTION_DAYS} days.`);
    } catch (err) {
      this.logger.warn(`page_views retention prune failed: ${String(err)}`);
    }
  }
}
