import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { createContestSchema, type CreateContestDto } from "@oj/shared";
import { CurrentUser, OptionalAuth, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ContestsService } from "./contests.service";

@Controller("contests")
export class ContestsController {
  constructor(private readonly contests: ContestsService) {}

  @OptionalAuth()
  @Get()
  list() {
    return this.contests.list();
  }

  @Roles("ADMIN")
  @Post()
  @HttpCode(201)
  create(@Body(new ZodValidationPipe(createContestSchema)) body: CreateContestDto) {
    return this.contests.createByAdmin(body);
  }

  @OptionalAuth()
  @Get(":id")
  detail(@Param("id") id: string, @CurrentUser() user: RequestUser | null) {
    return this.contests.detail(id, user);
  }

  @HttpCode(200)
  @Post(":id/register")
  register(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.contests.register(id, user.id);
  }

  @OptionalAuth()
  @Get(":id/scoreboard")
  scoreboard(@Param("id") id: string) {
    return this.contests.scoreboard(id);
  }
}
