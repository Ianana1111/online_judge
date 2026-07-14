import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { createProblemSchema, noteSchema, type CreateProblemDto, type NoteDto } from "@oj/shared";
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

  // Must be registered before the ":slug" wildcard route below, or "/problems/recommended" would
  // be matched as slug="recommended" instead.
  @Get("recommended")
  recommended(@CurrentUser() user: RequestUser) {
    return this.problems.recommendNext(user.id);
  }

  @OptionalAuth()
  @Get(":slug")
  detail(@Param("slug") slug: string, @CurrentUser() user: RequestUser | null) {
    return this.problems.detail(slug, user);
  }

  @OptionalAuth()
  @Get(":slug/stats")
  stats(@Param("slug") slug: string, @CurrentUser() user: RequestUser | null) {
    return this.problems.stats(slug, user);
  }

  @Get(":slug/note")
  getNote(@Param("slug") slug: string, @CurrentUser() user: RequestUser) {
    return this.problems.getNote(slug, user.id);
  }

  @Put(":slug/note")
  saveNote(
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(noteSchema)) body: NoteDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.problems.saveNote(slug, user.id, body.content);
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
