import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { moderationListSchema, reviewContentSchema, type ModerationListDto, type ReviewContentDto } from "@oj/shared";
import { CurrentUser, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CommunityService } from "./community.service";
@Controller("moderation")
@Roles("ADMIN")
export class ModerationController {
  constructor(private readonly community: CommunityService) {}
  @Get()
  list(@Query(new ZodValidationPipe(moderationListSchema)) query: ModerationListDto) { return this.community.reviewQueue(query.cursor, query.state); }
  @Post(":id/review")
  review(@Param("id") id: string, @Body(new ZodValidationPipe(reviewContentSchema)) body: ReviewContentDto, @CurrentUser() user: RequestUser) {
    return this.community.review(id, user, body);
  }
}
