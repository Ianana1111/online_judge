import { Module } from "@nestjs/common";
import { CommunityService } from "./community.service";
import { ModerationController } from "./moderation.controller";
@Module({ providers: [CommunityService], controllers: [ModerationController], exports: [CommunityService] })
export class CommunityModule {}
