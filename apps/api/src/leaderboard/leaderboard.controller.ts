import { Controller, Get, Query } from "@nestjs/common";
import { OptionalAuth } from "../common/decorators";
import { LeaderboardService, type LeaderboardPeriod } from "./leaderboard.service";

const VALID_PERIODS = new Set(["all", "week", "month"]);

@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @OptionalAuth()
  @Get()
  get(@Query("period") period?: string) {
    const p: LeaderboardPeriod = VALID_PERIODS.has(period ?? "") ? (period as LeaderboardPeriod) : "all";
    return this.leaderboard.get(p);
  }
}
