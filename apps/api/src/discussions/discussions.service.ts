import { Injectable } from "@nestjs/common";
import type { CreateDiscussionDto } from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { CommunityService } from "../community/community.service";
type Parent = { problemId: string; postId?: never } | { postId: string; problemId?: never };
@Injectable()
export class DiscussionsService {
  constructor(private readonly community: CommunityService) {}
  list(parent: Parent, cursor?: string, ownUserId?: string) { return this.community.listComments(parent, cursor, ownUserId); }
  create(parent: Parent, user: RequestUser, dto: CreateDiscussionDto) { return this.community.submitComment(parent, user, dto); }
  edit(id: string, user: RequestUser, dto: CreateDiscussionDto) { return this.community.editComment(id, user, dto); }
  remove(id: string, user: RequestUser) { return this.community.remove("comment", id, user); }
}
