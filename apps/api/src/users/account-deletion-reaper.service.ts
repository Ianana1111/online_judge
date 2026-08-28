import { Injectable, Logger, NotFoundException, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { prisma } from "@oj/db";
import { BillingService } from "../billing/billing.service";
import { ACCOUNT_DELETION_GRACE_MS } from "./users.service";

// A pending deletion sits reversible for days, not minutes — checking every 5 minutes like the
// judging reaper would be pointless polling. Once an hour is more than prompt enough for a
// deadline measured in days.
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

/** Finishes what UsersService.deleteAccount started: once ACCOUNT_DELETION_GRACE_MS has actually
 * elapsed since a deletion was requested (and nobody cancelled it via cancelDeletion), this
 * performs the real, permanent prisma.user.delete. Everything else (submissions, discussion
 * posts, achievements, etc.) cascades via the schema's onDelete: Cascade — a real deletion, not a
 * soft one, matching what "delete my account" has to mean under PDPA. */
@Injectable()
export class AccountDeletionReaperService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AccountDeletionReaperService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly billing: BillingService) {}

  onModuleInit(): void {
    this.timer = setInterval(() => void this.reapOnce(), CHECK_INTERVAL_MS);
    void this.reapOnce();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async reapOnce(): Promise<void> {
    if (this.running) return; // a slow previous pass is still in flight
    this.running = true;
    try {
      const cutoff = new Date(Date.now() - ACCOUNT_DELETION_GRACE_MS);
      const due = await prisma.user.findMany({
        where: { deletionRequestedAt: { lt: cutoff } },
        select: { id: true },
      });
      for (const u of due) {
        await this.reapOne(u.id);
      }
      if (due.length > 0) this.logger.log(`Permanently deleted ${due.length} account(s) past their grace period.`);
    } catch (err) {
      this.logger.warn(`Account-deletion reaper pass failed: ${String(err)}`);
    } finally {
      this.running = false;
    }
  }

  private async reapOne(userId: string): Promise<void> {
    try {
      // deleteAccount already cancels the subscription up front, but re-check here too in case one
      // was somehow re-created (or the earlier cancel silently no-opped) during the grace window —
      // a permanently deleted account must never leave a live recurring charge behind.
      try {
        await this.billing.cancelSubscription(userId);
      } catch (e) {
        if (!(e instanceof NotFoundException)) throw e;
      }
      await prisma.user.delete({ where: { id: userId } });
    } catch (err) {
      this.logger.warn(`Failed to permanently delete account ${userId}: ${String(err)}`);
    }
  }
}
