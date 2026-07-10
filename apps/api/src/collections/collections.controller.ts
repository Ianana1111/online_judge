import { Controller, Get, Param } from "@nestjs/common";
import { OptionalAuth, type RequestUser, CurrentUser } from "../common/decorators";
import { CollectionsService } from "./collections.service";

@Controller("collections")
export class CollectionsController {
  constructor(private readonly collections: CollectionsService) {}

  @OptionalAuth()
  @Get()
  list() {
    return this.collections.list();
  }

  @OptionalAuth()
  @Get(":slug")
  detail(@Param("slug") slug: string, @CurrentUser() user: RequestUser | null) {
    return this.collections.detail(slug, user);
  }
}
