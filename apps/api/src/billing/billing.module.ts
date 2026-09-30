import { StripeGateway } from "./stripe.gateway";
import { StripeBillingService } from "./stripe-billing.service";
import { StripeController } from "./stripe.controller";
import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { EcpayAuthPollService } from "./ecpay-auth-poll.service";
import { RefundProcessorService } from "./refund-processor.service";
import { RefundReconciliationService } from "./refund-reconciliation.service";

@Module({
  controllers: [BillingController, StripeController],
  providers: [StripeGateway, StripeBillingService, BillingService, EcpayAuthPollService, RefundProcessorService, RefundReconciliationService],
  exports: [BillingService],
})
export class BillingModule {}
