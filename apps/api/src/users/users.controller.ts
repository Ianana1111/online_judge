import { Body, Controller, Get, HttpCode, Param, Post } from "@nestjs/common";
import { createUserSchema, type CreateUserDto } from "@oj/shared";
import { Public, Roles } from "../common/decorators";
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

  @Roles("ADMIN")
  @Get()
  list() {
    return this.users.listAll();
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
