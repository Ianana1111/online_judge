import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { z } from "zod";
import { communityListSchema, createDiscussionSchema, type CommunityListDto, type CreateDiscussionDto } from "@oj/shared";
import { CurrentUser, Public, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { DiscussionsService } from "./discussions.service";
const scopeSchema = z.enum(["problem", "post"]);
const parent = (scope: "problem" | "post", id: string) => scope === "problem" ? { problemId: id } : { postId: id };
@Controller("discussions")
export class DiscussionsController {
  constructor(private readonly discussions: DiscussionsService) {}
  @Public() @Get(":scope/:id")
  list(@Param("scope", new ZodValidationPipe(scopeSchema)) scope: "problem" | "post", @Param("id") id: string,
    @Query(new ZodValidationPipe(communityListSchema)) query: CommunityListDto) { return this.discussions.list(parent(scope, id), query.cursor); }
  @Get(":scope/:id/mine")
  mine(@Param("scope", new ZodValidationPipe(scopeSchema)) scope: "problem" | "post", @Param("id") id: string,
    @Query(new ZodValidationPipe(communityListSchema)) query: CommunityListDto, @CurrentUser() user: RequestUser) { return this.discussions.list(parent(scope, id), query.cursor, user.id); }
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Post(":scope/:id") @HttpCode(201)
  create(@Param("scope", new ZodValidationPipe(scopeSchema)) scope: "problem" | "post", @Param("id") id: string,
    @Body(new ZodValidationPipe(createDiscussionSchema)) body: CreateDiscussionDto, @CurrentUser() user: RequestUser) { return this.discussions.create(parent(scope, id), user, body); }
  @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Patch(":id")
  edit(@Param("id") id: string, @Body(new ZodValidationPipe(createDiscussionSchema)) body: CreateDiscussionDto, @CurrentUser() user: RequestUser) { return this.discussions.edit(id, user, body); }
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: RequestUser) { return this.discussions.remove(id, user); }
}
