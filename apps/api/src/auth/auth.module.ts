import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";
import { AccountSecurityController } from "./account-security.controller";
import { AccountSecurityService } from "./account-security.service";
import { MfaService } from "./mfa.service";
import { MailService } from "../common/mail.service";

@Module({
  imports: [NotificationsModule],
  controllers: [AuthController, AccountSecurityController],
  providers: [AuthService, TokenService, AuthGuard, AccountSecurityService, MfaService, MailService],
  exports: [AuthService, TokenService, AuthGuard],
})
export class AuthModule {}
