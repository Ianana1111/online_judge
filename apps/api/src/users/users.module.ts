import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BillingModule } from "../billing/billing.module";
import { MailService } from "../common/mail.service";
import { AccountDeletionReaperService } from "./account-deletion-reaper.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { SchoolDomainsController } from "./school-domains.controller";
import { SchoolDomainsService } from "./school-domains.service";

@Module({
  imports: [AuthModule, BillingModule],
  controllers: [SchoolDomainsController, UsersController],
  providers: [UsersService, SchoolDomainsService, MailService, AccountDeletionReaperService],
})
export class UsersModule {}
