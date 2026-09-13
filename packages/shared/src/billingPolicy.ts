import type { BillingPeriod } from "./billing.js";

export const REFUND_POLICY_VERSION = "first-charge-7d-v1";
export const REFUND_WINDOW_DAYS = 7;
export const REFUND_WINDOW_MS = REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export function refundDeadline(paidAt: Date): Date {
  if (!Number.isFinite(paidAt.getTime())) throw new Error("Invalid payment timestamp");
  return new Date(paidAt.getTime() + REFUND_WINDOW_MS);
}

export function withinRefundWindow(paidAt: Date | null, deadline: Date | null, receivedAt: Date): boolean {
  return paidAt !== null && deadline !== null &&
    Number.isFinite(receivedAt.getTime()) &&
    receivedAt.getTime() >= paidAt.getTime() && receivedAt.getTime() <= deadline.getTime();
}

/** Preserve the original billing day across short months (Jan 31 -> Feb 28 -> Mar 31).
 * Taipei has no DST; an explicit offset keeps server/browser timezones out of billing. */
export function billingCycleEnd(anchor: Date, period: BillingPeriod, cycles = 1): Date {
  if (!Number.isFinite(anchor.getTime()) || !Number.isSafeInteger(cycles) || cycles < 0) {
    throw new Error("Invalid billing cycle");
  }
  const taipei = new Date(anchor.getTime() + 8 * 3600_000);
  const months = cycles * (period === "YEARLY" ? 12 : 1);
  const target = new Date(Date.UTC(taipei.getUTCFullYear(), taipei.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(taipei.getUTCDate(), lastDay));
  target.setUTCHours(taipei.getUTCHours(), taipei.getUTCMinutes(), taipei.getUTCSeconds(), taipei.getUTCMilliseconds());
  return new Date(target.getTime() - 8 * 3600_000);
}

/** ECPay timestamps are Taiwan local wall time, never the host timezone. */
export function parseEcpayPaymentDate(value: string): Date {
  const match = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error("Invalid ECPay payment date");
  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`);
  const wall = new Date(date.getTime() + 8 * 3600_000);
  if (!Number.isFinite(date.getTime()) || wall.getUTCFullYear() !== +year || wall.getUTCMonth() + 1 !== +month ||
    wall.getUTCDate() !== +day || wall.getUTCHours() !== +hour || wall.getUTCMinutes() !== +minute || wall.getUTCSeconds() !== +second) {
    throw new Error("Invalid ECPay payment date");
  }
  return date;
}
