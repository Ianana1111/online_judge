import { Body, Controller, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { testRunResultSchema, type TestRunResultDto } from "@oj/shared";
import { Public } from "../common/decorators";
import { InternalTokenGuard } from "../common/internal-token.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { RunsService } from "./runs.service";

/**
 * Service-to-service callback used by apps/judge (see apps/judge/src/reportResult.ts) to report a
 * finished (or interim "RUNNING") test-run result. Mirrors internal/submissions — exempt from the
 * normal cookie-based AuthGuard/CSRF guard, authenticated purely via x-internal-token.
 */
@Public()
@UseGuards(InternalTokenGuard)
@Controller("internal/runs")
export class InternalRunsController {
  constructor(private readonly runs: RunsService) {}

  @Post(":id/result")
  @HttpCode(200)
  async result(@Param("id") _id: string, @Body(new ZodValidationPipe(testRunResultSchema)) body: TestRunResultDto) {
    await this.runs.applyResult(body);
    return { ok: true };
  }
}
