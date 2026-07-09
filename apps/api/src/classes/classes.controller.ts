import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { createClassSessionSchema, updateClassSessionSchema, type CreateClassSessionDto, type UpdateClassSessionDto } from "@oj/shared";
import { CurrentUser, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ClassesService } from "./classes.service";

@Controller("classes")
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Roles("ADMIN")
  @Post()
  @HttpCode(201)
  create(
    @Body(new ZodValidationPipe(createClassSessionSchema)) body: CreateClassSessionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.classes.createForStudent(user.id, body);
  }

  @Roles("ADMIN")
  @Patch(":id")
  update(@Param("id") id: string, @Body(new ZodValidationPipe(updateClassSessionSchema)) body: UpdateClassSessionDto) {
    return this.classes.update(id, body);
  }

  @Roles("ADMIN")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.classes.remove(id);
  }

  @Roles("ADMIN")
  @Get("overview")
  overview() {
    return this.classes.overview();
  }

  @Get("me")
  me(@CurrentUser() user: RequestUser) {
    return this.classes.listForStudent(user.id);
  }

  @Roles("ADMIN")
  @Get("student/:studentId")
  forStudent(@Param("studentId") studentId: string) {
    return this.classes.listForStudent(studentId);
  }
}
