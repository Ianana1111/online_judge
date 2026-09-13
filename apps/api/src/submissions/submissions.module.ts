import { Module } from "@nestjs/common";
import { AchievementsModule } from "../achievements/achievements.module";
import { BillingModule } from "../billing/billing.module";
import { InternalSubmissionsController } from "./internal.controller";
import { StuckSubmissionReaperService } from "./stuck-submission-reaper.service";
import { SubmissionsController } from "./submissions.controller";
import { SubmissionsService } from "./submissions.service";
import { SubmissionDispatcherService } from "./submission-dispatcher.service";

@Module({
  imports: [BillingModule, AchievementsModule],
  controllers: [SubmissionsController, InternalSubmissionsController],
  providers: [SubmissionsService, StuckSubmissionReaperService, SubmissionDispatcherService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
