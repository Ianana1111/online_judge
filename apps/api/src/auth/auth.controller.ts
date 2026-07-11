import { BadRequestException, Body, Controller, Get, HttpCode, Inject, Logger, Post, Query, Req, Res } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import type Redis from "ioredis";
import type { Request, Response } from "express";
import { loginSchema, registerSchema, type LoginDto, type RegisterDto } from "@oj/shared";
import { clearAuthCookies, setAuthCookies, setCsrfCookie } from "../common/cookies.util";
import { CurrentUser, Public, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { REDIS_CLIENT } from "../common/redis.providers";
import { AuthService } from "./auth.service";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

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

  /** Kicks off the redirect dance — a plain top-level navigation (not fetch), so the frontend
   * just points a link/window.location here directly instead of calling it via apiFetch. */
  @Public()
  @Get("google")
  googleStart(@Res() res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      throw new BadRequestException("Google sign-in isn't configured on this server yet.");
    }

    const state = randomBytes(24).toString("hex");
    res.cookie("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 10 * 60 * 1000,
      path: "/auth/google",
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
  }

  @Public()
  @Get("google/callback")
  async googleCallback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // WEB_ORIGIN may be a comma-separated allowlist (see main.ts CORS); redirects need one concrete
    // URL, so use the first entry as the canonical site origin to land the user back on.
    const webOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim();
    const cookieState = req.cookies?.google_oauth_state;
    res.clearCookie("google_oauth_state", { path: "/auth/google" });

    if (!code || !state || !cookieState || state !== cookieState) {
      return res.redirect(`${webOrigin}/login?error=google_state_mismatch`);
    }

    // Some browsers (prefetch/preconnect, extensions, or a double navigation) fire this callback
    // twice for the same redirect — both copies carry the same cookie, since a browser sends its
    // request cookies before either response's Set-Cookie can be processed, so the check above
    // alone doesn't catch it. Google's authorization `code` is single-use: whichever request wins
    // the exchange succeeds (creating the account and setting cookies), and the loser would throw
    // "invalid_grant" and land the user on an error page even though their account was already
    // created — confusing and wrong. Claim `state` atomically first so only one request per login
    // attempt ever calls Google; a losing duplicate just follows the winner to the same success
    // redirect instead of failing.
    const claimed = await this.redis.set(`oauth_state:${state}`, "1", "EX", 60, "NX");
    if (!claimed) {
      return res.redirect(webOrigin);
    }

    try {
      const clientId = process.env.GOOGLE_CLIENT_ID!;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
      });
      if (!tokenRes.ok) throw new Error(`Google token exchange failed: HTTP ${tokenRes.status}`);
      const tokenBody = (await tokenRes.json()) as { access_token: string };

      const userRes = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenBody.access_token}` },
      });
      if (!userRes.ok) throw new Error(`Google userinfo fetch failed: HTTP ${userRes.status}`);
      const profile = (await userRes.json()) as { sub: string; email: string; name?: string };

      const suggestedHandle = profile.email.split("@")[0] ?? profile.name ?? "user";
      const session = await this.authService.loginWithGoogle(profile.sub, profile.email, suggestedHandle);
      setAuthCookies(res, session);
      res.redirect(webOrigin);
    } catch (err) {
      // Previously swallowed silently — every past "Google sign-in failed" report was
      // undiagnosable because nothing was logged. Always log the real cause now.
      this.logger.error(`Google OAuth callback failed: ${err instanceof Error ? err.message : String(err)}`);
      res.redirect(`${webOrigin}/login?error=google_failed`);
    }
  }
}
