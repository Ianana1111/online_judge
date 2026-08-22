import { Controller, ForbiddenException, Get, Query } from "@nestjs/common";
import { TAIWAN_UNIVERSITIES, UNVERIFIED_SCHOOL_FILTER } from "@oj/shared";
import { CurrentUser, OptionalAuth, type RequestUser } from "../common/decorators";
import { LeaderboardService, type LeaderboardPeriod, type LeaderboardScope } from "./leaderboard.service";

const VALID_PERIODS = new Set(["all", "week", "month"]);
const VALID_SCOPES = new Set(["all", "students"]);
// A closed set, not free text — every value here becomes its own cache key in
// LeaderboardService (`leaderboard:${period}:${scope}:${school}`, 60s TTL). Before this
// validation, an arbitrary `?school=` value produced an arbitrary never-before-seen cache key,
// so every request bypassed the cache entirely and forced a full recompute (a fan-out of several
// AC-history table scans) — trivially abusable as a low-effort DB-load DoS.
const VALID_SCHOOLS = new Set<string>([...TAIWAN_UNIVERSITIES, UNVERIFIED_SCHOOL_FILTER]);

@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @OptionalAuth()
  @Get()
  get(
    @Query("period") period?: string,
    @Query("scope") scope?: string,
    @Query("school") school?: string,
    @CurrentUser() user?: RequestUser | null,
  ) {
    const p: LeaderboardPeriod = VALID_PERIODS.has(period ?? "") ? (period as LeaderboardPeriod) : "all";
    const s: LeaderboardScope = VALID_SCOPES.has(scope ?? "") ? (scope as LeaderboardScope) : "all";
    // isStudent isn't public profile data (see users.service.profile) — a cohort-scoped board
    // would otherwise let an anonymous visitor enumerate which handles are the tutor's students.
    if (s === "students" && !user) {
      throw new ForbiddenException("Log in to view the student leaderboard.");
    }
    const validSchool = school && VALID_SCHOOLS.has(school) ? school : undefined;
    return this.leaderboard.get(p, s, validSchool);
  }
}
