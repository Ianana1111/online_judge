/**
 * Server-side filtering for the self-hosted pageview beacon (see PageviewTracker on the frontend,
 * recordPageview in analytics.service.ts). A client-side beacon can be hit by anything that loads
 * the page's JS — real browsers, but also headless crawlers and (for the referrer field
 * specifically) nothing forges this from outside since it's read from the browser's own
 * document.referrer, not attacker-controlled at the network level. The two things worth filtering
 * before insertion are known bot/crawler user agents and known referrer-spam domains — bots that
 * fake a Referer header pointing at their own site hoping a site owner reviewing analytics clicks
 * through out of curiosity (a long-standing, purely cosmetic annoyance, not a security issue, but
 * it pollutes traffic data if left in).
 */

const BOT_UA_PATTERNS = [
  /bot\b/i,
  /crawler/i,
  /spider/i,
  /slurp/i,
  /mediapartners/i,
  /bingpreview/i,
  /facebookexternalhit/i,
  /whatsapp/i,
  /telegrambot/i,
  /python-requests/i,
  /python-urllib/i,
  /^curl\//i,
  /^wget\//i,
  /go-http-client/i,
  /okhttp/i,
  /scrapy/i,
  /headlesschrome/i,
  /phantomjs/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /gptbot/i,
  /claudebot/i,
  /ccbot/i,
  /apache-httpclient/i,
  /libwww-perl/i,
  /^java\//i,
  /postmanruntime/i,
  /axios\//i,
  /node-fetch/i,
];

// A best-effort list of well-known "ghost"/referrer-spam domains — bots that never actually visit
// the site, they just fire raw HTTP requests with a forged Referer header to advertise themselves
// in analytics dashboards. Not exhaustive (new ones appear constantly); extend as new ones show up.
const REFERRER_SPAM_DOMAINS = new Set([
  "multisearching.com",
  "sify.com",
  "thenet1.com",
  "turboscout.com",
  "zapmeta.com",
  "zoominfo.com",
  "buttons-for-website.com",
  "blackhatworth.com",
  "darodar.com",
  "econom.co",
  "floating-share-buttons.com",
  "free-share-buttons.com",
  "hulfingtonpost.com",
  "ilovevitaly.com",
  "kambasoft.com",
  "medispainstitute.com",
  "priceg.com",
  "sitevaluation.org",
  "social-buttons.com",
  "trafficmonetizer.org",
  "webmonetizer.net",
  "traffic2cash.xyz",
  "get-free-traffic-now.com",
  "4webmasters.org",
  "best-seo-offer.com",
  "best-seo-solution.com",
  "buy-cheap-online.info",
  "hvd-store.com",
  "top1-seo-service.com",
  "adcash.com",
]);

export function isBotUserAgent(userAgent: string | undefined | null): boolean {
  if (!userAgent || !userAgent.trim()) return true; // real browsers always send one
  return BOT_UA_PATTERNS.some((pat) => pat.test(userAgent));
}

export function isSpamReferrer(referrer: string | undefined | null): boolean {
  if (!referrer) return false;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    return REFERRER_SPAM_DOMAINS.has(host);
  } catch {
    return false; // not a valid URL — leave it, don't drop otherwise-legitimate data on a parse quirk
  }
}
