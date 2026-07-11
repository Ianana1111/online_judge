import { Module } from "@nestjs/common";
import { BillingModule } from "../billing/billing.module";
import { ContestsController } from "./contests.controller";
import { ContestsService } from "./contests.service";

@Module({
  imports: [BillingModule],
  controllers: [ContestsController],
  providers: [ContestsService],
})
export class ContestsModule {}
