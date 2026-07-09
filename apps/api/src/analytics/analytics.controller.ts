import { Controller, Get } from "@nestjs/common";
import { Roles } from "../common/decorators";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

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
