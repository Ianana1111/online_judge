import { CommunityModule } from "../community/community.module";
import { Module } from "@nestjs/common";
import { DiscussionsController } from "./discussions.controller";
import { DiscussionsService } from "./discussions.service";

@Module({
  imports: [CommunityModule],
  controllers: [DiscussionsController],
  providers: [DiscussionsService],
})
export class DiscussionsModule {}
