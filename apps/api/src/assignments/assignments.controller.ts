import { Body, Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { createAssignmentSchema, type CreateAssignmentDto } from "@oj/shared";
import { CurrentUser, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AssignmentsService } from "./assignments.service";

@Controller("assignments")
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @Roles("ADMIN")
  @Post()
  @HttpCode(201)
  create(
    @Body(new ZodValidationPipe(createAssignmentSchema)) body: CreateAssignmentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.assignments.createByAdmin(body, user.id);
  }

  @Roles("ADMIN")
  @Get()
  listAll() {
    return this.assignments.listAllForAdmin();
  }

  @Roles("ADMIN")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.assignments.remove(id);
  }

  @Get("me")
  listMine(@CurrentUser() user: RequestUser) {
    return this.assignments.listForUser(user.id);
  }
}
