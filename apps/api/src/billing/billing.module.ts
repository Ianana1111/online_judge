import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { EcpayAuthPollService } from "./ecpay-auth-poll.service";

@Module({
  controllers: [BillingController],
  providers: [BillingService, EcpayAuthPollService],
  exports: [BillingService],
})
export class BillingModule {}
