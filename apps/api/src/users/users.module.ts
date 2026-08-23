import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BillingModule } from "../billing/billing.module";
import { MailService } from "../common/mail.service";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [AuthModule, BillingModule],
  controllers: [UsersController],
  providers: [UsersService, MailService],
})
export class UsersModule {}
