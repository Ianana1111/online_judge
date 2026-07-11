import { Module } from "@nestjs/common";
import { BillingModule } from "../billing/billing.module";
import { InternalSubmissionsController } from "./internal.controller";
import { SubmissionsController } from "./submissions.controller";
import { SubmissionsService } from "./submissions.service";

@Module({
  imports: [BillingModule],
  controllers: [SubmissionsController, InternalSubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
