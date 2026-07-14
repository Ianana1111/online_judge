import { Module } from "@nestjs/common";
import { AchievementsModule } from "../achievements/achievements.module";
import { BillingModule } from "../billing/billing.module";
import { ContestsController } from "./contests.controller";
import { ContestsService } from "./contests.service";

@Module({
  imports: [BillingModule, AchievementsModule],
  controllers: [ContestsController],
  providers: [ContestsService],
})
export class ContestsModule {}
