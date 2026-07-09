import { Body, Controller, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { judgeResultSchema, type JudgeResultDto } from "@oj/shared";
import { Public } from "../common/decorators";
import { InternalTokenGuard } from "../common/internal-token.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { SubmissionsService } from "./submissions.service";

/**
 * Service-to-service callback used by apps/judge (see apps/judge/src/reportResult.ts) to report
 * a judged (or interim "JUDGING") result. Exempt from the normal cookie-based AuthGuard/CSRF
 * guard - authenticated purely via the x-internal-token header checked by InternalTokenGuard.
 */
@Public()
@UseGuards(InternalTokenGuard)
@Controller("internal/submissions")
export class InternalSubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post(":id/result")
  @HttpCode(200)
  async result(@Param("id") id: string, @Body(new ZodValidationPipe(judgeResultSchema)) body: JudgeResultDto) {
    await this.submissions.applyJudgeResult(id, body);
    return { ok: true };
  }
}
