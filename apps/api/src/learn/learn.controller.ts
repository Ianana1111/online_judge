import { Controller, Get, Header, Param } from "@nestjs/common";
import { CurrentUser, type RequestUser } from "../common/decorators";
import { LearnService } from "./learn.service";

@Controller("learn")
export class LearnController {
  constructor(private readonly learn: LearnService) {}

  // Requires login (global AuthGuard). The body is private teaching material: never cache it in
  // shared caches or keep it around after logout.
  @Get(":slug/content")
  @Header("Cache-Control", "private, no-store")
  content(@Param("slug") slug: string, @CurrentUser() user: RequestUser) {
    return this.learn.content(slug, user);
  }
}
