import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { billingRequestSchema, PLAN_PRICING, type BillingRequestDto } from "@oj/shared";
import { CurrentUser, Public, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { BillingService } from "./billing.service";

@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  /** Static pricing + the manual-transfer payee details (from env, so no account numbers in code).
   * Public so the pricing page renders for logged-out visitors too. */
  @Public()
  @Get("plans")
  plans() {
    return {
      pricing: PLAN_PRICING,
      payee: {
        bank: process.env.PAYEE_BANK ?? "",
        account: process.env.PAYEE_ACCOUNT ?? "",
        name: process.env.PAYEE_NAME ?? "",
        linePay: process.env.PAYEE_LINEPAY ?? "",
        note: process.env.PAYEE_NOTE ?? "",
      },
    };
  }

  @Get("me")
  status(@CurrentUser() user: RequestUser) {
    return this.billing.status(user.id);
  }

  @Post("request")
  request(@Body(new ZodValidationPipe(billingRequestSchema)) body: BillingRequestDto, @CurrentUser() user: RequestUser) {
    return this.billing.requestUpgrade(user.id, body);
  }

  @Roles("ADMIN")
  @Get("admin/pending")
  pending() {
    return this.billing.listPending();
  }

  @Roles("ADMIN")
  @Post("admin/:id/approve")
  approve(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.billing.approve(id, user.id);
  }

  @Roles("ADMIN")
  @Post("admin/:id/reject")
  reject(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.billing.reject(id, user.id);
  }
}
