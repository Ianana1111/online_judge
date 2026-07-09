import { Body, Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { createDiscussionSchema, type CreateDiscussionDto } from "@oj/shared";
import { CurrentUser, Public, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { DiscussionsService } from "./discussions.service";

@Controller("discussions")
export class DiscussionsController {
  constructor(private readonly discussions: DiscussionsService) {}

  @Public()
  @Get("problem/:problemId")
  list(@Param("problemId") problemId: string) {
    return this.discussions.listByProblem(problemId);
  }

  @Post("problem/:problemId")
  @HttpCode(201)
  create(
    @Param("problemId") problemId: string,
    @Body(new ZodValidationPipe(createDiscussionSchema)) body: CreateDiscussionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.discussions.create(problemId, user.id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.discussions.remove(id, user);
  }
}
