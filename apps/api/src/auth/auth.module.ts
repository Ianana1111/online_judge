import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";

@Module({
  imports: [NotificationsModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, AuthGuard],
  exports: [TokenService, AuthGuard],
})
export class AuthModule {}
