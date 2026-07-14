import { Body, Controller, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import {
  changeHandleSchema,
  changePasswordSchema,
  createUserSchema,
  setIsStudentSchema,
  type ChangeHandleDto,
  type ChangePasswordDto,
  type CreateUserDto,
  type SetIsStudentDto,
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

  @Patch("me/password")
  changePassword(
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.users.changePassword(user.id, body);
  }

  @Patch("me/handle")
  changeHandle(@Body(new ZodValidationPipe(changeHandleSchema)) body: ChangeHandleDto, @CurrentUser() user: RequestUser) {
    return this.users.changeHandle(user.id, body);
  }

  @Get("me/daily")
  daily(@CurrentUser() user: RequestUser) {
    return this.users.daily(user.id);
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
