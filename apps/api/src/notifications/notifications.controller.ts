import { Body, Controller, Get, HttpCode, Post, Query } from "@nestjs/common";
import { markNotificationsReadSchema, notificationListSchema, type MarkNotificationsReadDto } from "@oj/shared";
import { CurrentUser, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query(new ZodValidationPipe(notificationListSchema)) query: { cursor?: string; unread?: string }) {
    return this.notifications.list(user.id, query);
  }

  @HttpCode(200)
  @Post("read")
  markRead(
    @Body(new ZodValidationPipe(markNotificationsReadSchema)) body: MarkNotificationsReadDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notifications.markRead(user.id, body);
  }
}
