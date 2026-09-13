import { CommunityModule } from "../community/community.module";
import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";

@Module({
  imports: [CommunityModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
