import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { createProblemSchema, type CreateProblemDto } from "@oj/shared";
import { CurrentUser, OptionalAuth, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ListQuery, ProblemsService } from "./problems.service";

@Controller("problems")
export class ProblemsController {
  constructor(private readonly problems: ProblemsService) {}

  @OptionalAuth()
  @Get()
  list(@Query() query: ListQuery, @CurrentUser() user: RequestUser | null) {
    return this.problems.list(query, user);
  }

  @OptionalAuth()
  @Get(":slug")
  detail(@Param("slug") slug: string, @CurrentUser() user: RequestUser | null) {
    return this.problems.detail(slug, user);
  }

  @Roles("ADMIN")
  @Post()
  create(@Body(new ZodValidationPipe(createProblemSchema)) body: CreateProblemDto) {
    return this.problems.create(body);
  }

  @Roles("ADMIN")
  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Partial<CreateProblemDto>) {
    return this.problems.update(id, body);
  }

  @Roles("ADMIN")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.problems.remove(id);
  }

  @Roles("ADMIN")
  @Post(":id/samples")
  addSample(@Param("id") id: string, @Body() body: { ord?: number; input: string; output: string }) {
    return this.problems.addSample(id, body);
  }
}
