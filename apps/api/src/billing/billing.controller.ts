import { Body, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { billingRequestSchema, ecpayCreateSchema, PLAN_PRICING, type BillingRequestDto, type EcpayCreateDto } from "@oj/shared";
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

  // --- ECPay (綠界) automated ATM virtual-account flow ---

  /** Starts an automated upgrade. Returns a form-post target + fields — the frontend auto-submits
   * a hidden <form> to ECPay's hosted checkout, which is how every ECPay integration works (not a
   * JSON API call: the browser itself must navigate there). */
  @Post("ecpay/create")
  createEcpayOrder(@Body(new ZodValidationPipe(ecpayCreateSchema)) body: EcpayCreateDto, @CurrentUser() user: RequestUser) {
    return this.billing.createEcpayOrder(user.id, body.period);
  }

  /** Webhook — ECPay POSTs here (form-urlencoded, not JSON) once it has issued an ATM virtual
   * account for an order, well before the customer has actually paid. No auth/CSRF: this is
   * server-to-server from ECPay's own infrastructure, authenticated by CheckMacValue instead. */
  @Public()
  @Post("ecpay/payment-info")
  async ecpayPaymentInfo(@Req() req: Request, @Res() res: Response) {
    await this.billing.handleEcpayPaymentInfo(req.body as Record<string, string>);
    // ECPay requires exactly this literal response to consider the notification delivered —
    // anything else (including a JSON body) makes it retry up to 4x/day.
    res.type("text/plain").send("1|OK");
  }

  /** Webhook — ECPay POSTs here once the customer has actually paid. Same auth model as above. */
  @Public()
  @Post("ecpay/return")
  async ecpayReturn(@Req() req: Request, @Res() res: Response) {
    await this.billing.handleEcpayReturn(req.body as Record<string, string>);
    res.type("text/plain").send("1|OK");
  }
}
