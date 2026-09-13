import { Injectable } from "@nestjs/common";
import type { CommunityListDto, CreatePostDto } from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { CommunityService } from "../community/community.service";
@Injectable()
export class PostsService {
  constructor(private readonly community: CommunityService) {}
  list(query: CommunityListDto) { return this.community.listPosts(query); }
  sitemap(cursor?: string) { return this.community.postSitemap(cursor); }
  detail(id: string) { return this.community.postDetail(id); }
  mine(userId: string, cursor?: string) { return this.community.ownPosts(userId, cursor); }
  own(id: string, user: RequestUser) { return this.community.ownPost(id, user); }
  create(user: RequestUser, dto: CreatePostDto) { return this.community.submitPost(user, dto); }
  edit(id: string, user: RequestUser, dto: CreatePostDto) { return this.community.submitPost(user, dto, id); }
  remove(id: string, user: RequestUser) { return this.community.remove("post", id, user); }
}
