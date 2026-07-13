import { Body, Controller, Get, HttpCode, Post, Query, Req } from "@nestjs/common";
import type { Request } from "express";
import { recordPageviewSchema, type RecordPageviewDto } from "@oj/shared";
import { CurrentUser, OptionalAuth, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AnalyticsService } from "./analytics.service";

const MAX_DAYS = 365;
const MAX_LIMIT = 50;

function clampDays(raw: string | undefined): number {
  const n = raw ? parseInt(raw, 10) : 30;
  return Math.min(MAX_DAYS, Math.max(1, Number.isFinite(n) ? n : 30));
}
function clampLimit(raw: string | undefined): number {
  const n = raw ? parseInt(raw, 10) : 10;
  return Math.min(MAX_LIMIT, Math.max(1, Number.isFinite(n) ? n : 10));
}

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  /** Lightweight pageview beacon — fired by PageviewTracker on every client-side route change.
   * OptionalAuth (not Public): tries to read the session so logged-in views can be attributed to
   * a user, but never rejects an anonymous request — most traffic has no session at all. Exempt
   * from CSRF (see csrf.guard.ts) for the same reason: anonymous visitors have no CSRF token to
   * present, and a forged pageview event is low-stakes (it only pollutes traffic counts). */
  @OptionalAuth()
  @HttpCode(204)
  @Post("pageview")
  async pageview(
    @Body(new ZodValidationPipe(recordPageviewSchema)) body: RecordPageviewDto,
    @Req() req: Request,
    @CurrentUser() user: RequestUser | null,
  ) {
    await this.analytics.recordPageview(body, req.headers["user-agent"], user?.id ?? null);
  }

  @Roles("ADMIN")
  @Get("traffic/summary")
  trafficSummary(@Query("days") days?: string) {
    return this.analytics.trafficSummary(clampDays(days));
  }

  @Roles("ADMIN")
  @Get("traffic/daily")
  dailyTraffic(@Query("days") days?: string) {
    return this.analytics.dailyTraffic(clampDays(days));
  }

  @Roles("ADMIN")
  @Get("traffic/top-pages")
  topPages(@Query("days") days?: string, @Query("limit") limit?: string) {
    return this.analytics.topPages(clampDays(days), clampLimit(limit));
  }

  @Roles("ADMIN")
  @Get("traffic/top-referrers")
  topReferrers(@Query("days") days?: string, @Query("limit") limit?: string) {
    return this.analytics.topReferrers(clampDays(days), clampLimit(limit));
  }

  @Roles("ADMIN")
  @Get("avg-correct-trend")
  avgCorrectTrend() {
    return this.analytics.avgCorrectTrend();
  }

  @Roles("ADMIN")
  @Get("answer-rate-by-label")
  answerRateByLabel() {
    return this.analytics.answerRateByLabel();
  }

  @Roles("ADMIN")
  @Get("topic-by-label")
  topicByLabel() {
    return this.analytics.topicByLabel();
  }

  @Roles("ADMIN")
  @Get("repeat-problems")
  repeatProblems() {
    return this.analytics.repeatProblems();
  }

  @Roles("ADMIN")
  @Get("topic-performance")
  topicPerformance() {
    return this.analytics.topicPerformance();
  }
}
