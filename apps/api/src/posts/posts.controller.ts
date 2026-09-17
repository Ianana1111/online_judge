import { Body, Controller, Delete, Get, Header, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { communityListSchema, createPostSchema, type CommunityListDto, type CreatePostDto } from "@oj/shared";
import { CurrentUser, Public, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { PostsService } from "./posts.service";
@Controller("posts")
export class PostsController {
  constructor(private readonly posts: PostsService) {}
  @Public() @Get()
  list(@Query(new ZodValidationPipe(communityListSchema)) query: CommunityListDto) { return this.posts.list(query); }
  @Public() @Get("sitemap")
  sitemap(@Query(new ZodValidationPipe(communityListSchema)) query: CommunityListDto) { return this.posts.sitemap(query.cursor); }
  @Get("mine")
  mine(@CurrentUser() user: RequestUser, @Query(new ZodValidationPipe(communityListSchema)) query: CommunityListDto) { return this.posts.mine(user.id, query.cursor); }
  @Get(":id/mine")
  own(@Param("id") id: string, @CurrentUser() user: RequestUser) { return this.posts.own(id, user); }
  @Public() @Get(":id") @Header("Cache-Control", "no-store")
  detail(@Param("id") id: string) { return this.posts.detail(id); }
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) @Post() @HttpCode(201)
  create(@Body(new ZodValidationPipe(createPostSchema)) body: CreatePostDto, @CurrentUser() user: RequestUser) { return this.posts.create(user, body); }
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Patch(":id")
  edit(@Param("id") id: string, @Body(new ZodValidationPipe(createPostSchema)) body: CreatePostDto, @CurrentUser() user: RequestUser) { return this.posts.edit(id, user, body); }
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: RequestUser) { return this.posts.remove(id, user); }
}
