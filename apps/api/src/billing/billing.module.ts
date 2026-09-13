import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { EcpayAuthPollService } from "./ecpay-auth-poll.service";
import { RefundProcessorService } from "./refund-processor.service";

@Module({
  controllers: [BillingController],
  providers: [BillingService, EcpayAuthPollService, RefundProcessorService],
  exports: [BillingService],
})
export class BillingModule {}
