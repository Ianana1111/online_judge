import { Body, Controller, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { loginSchema, registerSchema, type LoginDto, type RegisterDto } from "@oj/shared";
import { clearAuthCookies, setAuthCookies, setCsrfCookie } from "../common/cookies.util";
import { CurrentUser, Public, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(201)
  @Post("register")
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.register(body);
    setAuthCookies(res, session);
    return { ...session.user, csrfToken: session.csrfToken };
  }

  @Public()
  @HttpCode(200)
  @Post("login")
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.authService.login(body);
    setAuthCookies(res, session);
    // Echoed in the body too: cross-domain (prod), the web app can't read this cookie via
    // document.cookie, so it keeps this value in memory instead — see cookies.util.ts.
    return { ...session.user, csrfToken: session.csrfToken };
  }

  @Public()
  @HttpCode(200)
  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await this.authService.refresh(req.cookies?.refresh_token);
    setAuthCookies(res, session);
    return { ok: true, csrfToken: session.csrfToken };
  }

  @Public()
  @HttpCode(200)
  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.refresh_token);
    clearAuthCookies(res);
    return { ok: true };
  }

  @Get("me")
  async me(@CurrentUser() user: RequestUser, @Res({ passthrough: true }) res: Response) {
    const { csrfMaxAgeMs, ...body } = await this.authService.me(user.id);
    setCsrfCookie(res, body.csrfToken, csrfMaxAgeMs);
    return body;
  }
}
