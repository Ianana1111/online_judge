import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

/** Thin wrapper around Resend — the only outbound-email path in this codebase so far (school
 * email verification). Mirrors how Google sign-in guards its own missing-config case (see
 * auth.controller.ts's googleStart): throw a clear error at send time rather than crashing boot,
 * since local dev / typecheck / most of the test surface never needs a real email to go out. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly client = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  async send(params: { to: string; subject: string; html: string }): Promise<void> {
    if (!this.client) {
      throw new BadRequestException("Email sending isn't configured on this server yet.");
    }
    const from = process.env.RESEND_FROM_EMAIL ?? "judge.tw <onboarding@resend.dev>";
    const { error } = await this.client.emails.send({ from, to: params.to, subject: params.subject, html: params.html });
    if (error) {
      this.logger.error(`Resend send failed: ${error.name} — ${error.message}`);
      throw new BadRequestException("Couldn't send the verification email — try again in a moment.");
    }
  }
}
