import { Controller, ForbiddenException, Get, Query } from "@nestjs/common";
import { CurrentUser, OptionalAuth, type RequestUser } from "../common/decorators";
import { LeaderboardService, type LeaderboardPeriod, type LeaderboardScope } from "./leaderboard.service";

const VALID_PERIODS = new Set(["all", "week", "month"]);
const VALID_SCOPES = new Set(["all", "students"]);

@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @OptionalAuth()
  @Get()
  get(@Query("period") period?: string, @Query("scope") scope?: string, @CurrentUser() user?: RequestUser | null) {
    const p: LeaderboardPeriod = VALID_PERIODS.has(period ?? "") ? (period as LeaderboardPeriod) : "all";
    const s: LeaderboardScope = VALID_SCOPES.has(scope ?? "") ? (scope as LeaderboardScope) : "all";
    // isStudent isn't public profile data (see users.service.profile) — a cohort-scoped board
    // would otherwise let an anonymous visitor enumerate which handles are the tutor's students.
    if (s === "students" && !user) {
      throw new ForbiddenException("Log in to view the student leaderboard.");
    }
    return this.leaderboard.get(p, s);
  }
}
