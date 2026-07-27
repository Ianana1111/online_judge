import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { EcpayCaptureService } from "./ecpay-capture.service";

@Module({
  controllers: [BillingController],
  providers: [BillingService, EcpayCaptureService],
  exports: [BillingService],
})
export class BillingModule {}
