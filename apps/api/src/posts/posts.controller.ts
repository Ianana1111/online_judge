import { Body, Controller, Delete, Get, HttpCode, Param, Post as HttpPost } from "@nestjs/common";
import { createPostSchema, type CreatePostDto } from "@oj/shared";
import { CurrentUser, Public, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Public()
  @Get()
  list() {
    return this.posts.list();
  }

  @Public()
  @Get(":id")
  detail(@Param("id") id: string) {
    return this.posts.detail(id);
  }

  @Roles("ADMIN")
  @HttpPost()
  @HttpCode(201)
  create(@Body(new ZodValidationPipe(createPostSchema)) body: CreatePostDto, @CurrentUser() user: RequestUser) {
    return this.posts.create(user.id, body);
  }

  @Roles("ADMIN")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.posts.remove(id);
  }
}
