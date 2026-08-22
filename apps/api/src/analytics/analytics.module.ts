import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { PageviewRetentionService } from "./pageview-retention.service";

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PageviewRetentionService],
})
export class AnalyticsModule {}
