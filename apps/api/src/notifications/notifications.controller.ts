import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { markNotificationsReadSchema, type MarkNotificationsReadDto } from "@oj/shared";
import { CurrentUser, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.notifications.list(user.id);
  }

  @HttpCode(200)
  @Post("read")
  markRead(
    @Body(new ZodValidationPipe(markNotificationsReadSchema)) body: MarkNotificationsReadDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notifications.markRead(user.id, body.ids);
  }
}
