import { ServiceUnavailableException } from "@nestjs/common";
import { billingCatalog } from "@oj/shared";

export function currentBillingCatalog(now = new Date()) {
  try {
    return billingCatalog({
      startsAt: process.env.LAUNCH_PROMO_STARTS_AT,
      endsAt: process.env.LAUNCH_PROMO_ENDS_AT,
      regularYearlyPriceNtd: process.env.PRO_REGULAR_YEARLY_PRICE_NTD,
    }, now);
  } catch {
    throw new ServiceUnavailableException("Pricing is temporarily unavailable. Please try again later.");
  }
}
