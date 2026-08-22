import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Response } from "express";
import { setAuthCookies } from "../common/cookies.util";
import {
  changeHandleSchema,
  changePasswordSchema,
  createUserSchema,
  requestSchoolVerificationSchema,
  setIsStudentSchema,
  updateProfileSchema,
  updateSettingsSchema,
  type ChangeHandleDto,
  type ChangePasswordDto,
  type CreateUserDto,
  type RequestSchoolVerificationDto,
  type SetIsStudentDto,
  type UpdateProfileDto,
  type UpdateSettingsDto,
} from "@oj/shared";
import { CurrentUser, Public, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Roles("ADMIN")
  @Post()
  @HttpCode(201)
  create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto) {
    return this.users.createByAdmin(body);
  }

  // Each attempt costs one argon2 verify against the *current* password — unlimited attempts
  // against a hijacked session (stolen access token, unattended device) is both a CPU-cost DoS
  // and, since a correct guess needs no other confirmation, a password-guessing oracle.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Patch("me/password")
  async changePassword(
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordDto,
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.users.changePassword(user.id, body);
    setAuthCookies(res, session);
    return { ok: true, csrfToken: session.csrfToken };
  }

  // Handles are the only public identity on profiles/leaderboards/discussions and change
  // instantly with no cooldown otherwise — unlimited renames enable both impersonation (grabbing
  // a name someone just freed) and handle squatting.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Patch("me/handle")
  changeHandle(@Body(new ZodValidationPipe(changeHandleSchema)) body: ChangeHandleDto, @CurrentUser() user: RequestUser) {
    return this.users.changeHandle(user.id, body);
  }

  @Get("me/daily")
  daily(@CurrentUser() user: RequestUser) {
    return this.users.daily(user.id);
  }

  @Post("me/streak-freeze")
  useStreakFreeze(@CurrentUser() user: RequestUser) {
    return this.users.useStreakFreeze(user.id);
  }

  @Patch("me/settings")
  updateSettings(
    @Body(new ZodValidationPipe(updateSettingsSchema)) body: UpdateSettingsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.users.updateSettings(user.id, body);
  }

  // Covers the avatar upload path too (up to a 300KB data-URL stored inline on the user row) —
  // unlimited churn here is DB write amplification and row bloat with no cooldown otherwise.
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Patch("me/profile")
  updateProfile(
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.users.updateProfile(user.id, body);
  }

  // Sends a real email — much tighter than the global 120/min-per-IP default, same reasoning as
  // register/login's own throttles (auth.controller.ts): cheap to abuse, no reason to allow more
  // than the occasional real "didn't get it, resend" click.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post("me/school/verify/request")
  requestSchoolVerification(
    @Body(new ZodValidationPipe(requestSchoolVerificationSchema)) body: RequestSchoolVerificationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.users.requestSchoolVerification(user.id, body.email);
  }

  /** The link clicked from the verification email — public (no auth cookie required, see
   * confirmSchoolVerification's own comment) and a plain top-level navigation, so it redirects
   * back into the web app rather than returning JSON. */
  @Public()
  @Get("school/verify/confirm")
  async confirmSchoolVerification(@Query("token") token: string | undefined, @Res() res: Response) {
    const webOrigin = (process.env.WEB_ORIGIN ?? "http://localhost:3000").split(",")[0].trim();
    const result = token ? await this.users.confirmSchoolVerification(token) : { ok: false };
    res.redirect(`${webOrigin}/settings?schoolVerified=${result.ok ? "1" : "0"}`);
  }

  @Roles("ADMIN")
  @Get()
  list() {
    return this.users.listAll();
  }

  @Roles("ADMIN")
  @Patch(":id/student")
  setIsStudent(@Param("id") id: string, @Body(new ZodValidationPipe(setIsStudentSchema)) body: SetIsStudentDto) {
    return this.users.setIsStudent(id, body.isStudent);
  }

  @Public()
  @Get(":handle")
  profile(@Param("handle") handle: string) {
    return this.users.profile(handle);
  }

  @Public()
  @Get(":handle/stats")
  stats(@Param("handle") handle: string) {
    return this.users.stats(handle);
  }
}
