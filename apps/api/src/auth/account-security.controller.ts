import { Body, Controller, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { z } from "zod";
import { CurrentUser, Public, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { setAuthCookies } from "../common/cookies.util";
import { AccountSecurityService } from "./account-security.service";
import { MfaService } from "./mfa.service";

const email = z.object({ email: z.string().trim().email().max(254) });
const token = z.object({ token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) });
const reset = token.extend({ password: z.string().min(8).max(128) });
const proof = z.object({ password: z.string().max(128).optional() });
const code = z.object({ code: z.string().trim().min(6).max(32) });
const disable = proof.merge(code);

@Controller("auth")
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AccountSecurityController {
  constructor(private readonly security: AccountSecurityService, private readonly mfa: MfaService) {}

  @Public() @Post("forgot-password") @HttpCode(200)
  requestReset(@Body(new ZodValidationPipe(email)) body: z.infer<typeof email>) { return this.security.requestReset(body.email); }

  @Public() @Post("reset-password") @HttpCode(200)
  reset(@Body(new ZodValidationPipe(reset)) body: z.infer<typeof reset>) { return this.security.resetPassword(body.token, body.password); }

  @Post("email/request") @HttpCode(200)
  requestVerification(@CurrentUser() user: RequestUser) { return this.security.requestVerification(user.id); }

  @Public() @Post("email/verify") @HttpCode(200)
  verifyEmail(@Body(new ZodValidationPipe(token)) body: z.infer<typeof token>) { return this.security.verifyEmail(body.token); }

  @Get("security")
  history(@CurrentUser() user: RequestUser) { return this.security.history(user.id); }

  @Post("mfa/setup") @HttpCode(200)
  setup(@CurrentUser() user: RequestUser, @Body(new ZodValidationPipe(proof)) body: z.infer<typeof proof>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.setHeader("Cache-Control", "no-store");
    return this.mfa.setup(user, body.password, req.cookies?.security_reauth_token);
  }

  @Post("mfa/enable") @HttpCode(200)
  async enable(@CurrentUser() user: RequestUser, @Body(new ZodValidationPipe(code)) body: z.infer<typeof code>, @Res({ passthrough: true }) res: Response) {
    const result = await this.mfa.enable(user, body.code);
    setAuthCookies(res, result.session);
    res.setHeader("Cache-Control", "no-store");
    return { csrfToken: result.session.csrfToken, recoveryCodes: result.recoveryCodes };
  }

  @Post("mfa/verify") @HttpCode(200)
  verify(@CurrentUser() user: RequestUser, @Body(new ZodValidationPipe(code)) body: z.infer<typeof code>) { return this.mfa.verify(user, body.code); }

  @Post("mfa/disable") @HttpCode(200)
  async disable(@CurrentUser() user: RequestUser, @Body(new ZodValidationPipe(disable)) body: z.infer<typeof disable>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await this.mfa.disable(user, body.code, body.password, req.cookies?.security_reauth_token);
    setAuthCookies(res, session);
    return { csrfToken: session.csrfToken };
  }

  @Post("mfa/recovery-codes") @HttpCode(200)
  async regenerate(@CurrentUser() user: RequestUser, @Body(new ZodValidationPipe(disable)) body: z.infer<typeof disable>, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.mfa.regenerate(user, body.code, body.password, req.cookies?.security_reauth_token);
    setAuthCookies(res, result.session);
    res.setHeader("Cache-Control", "no-store");
    return { csrfToken: result.session.csrfToken, recoveryCodes: result.recoveryCodes };
  }
}
