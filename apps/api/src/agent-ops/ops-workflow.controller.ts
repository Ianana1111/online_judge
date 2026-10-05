import { Body, Controller, Get, Header, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { z } from "zod";
import { opsFailSchema, opsLeaseSchema, opsTaskCreateSchema, opsTaskEventSchema, opsWorkflowResultSchema } from "@oj/shared";
import { CurrentUser, Public, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AgentOpsTokenGuard } from "./agent-ops.controller";
import { OpsWorkflowService } from "./ops-workflow.service";
const eventSchema = opsLeaseSchema.extend({ event: opsTaskEventSchema });
const resultSchema = opsLeaseSchema.extend({ result: opsWorkflowResultSchema });
const approvalSchema = z.object({ digest: z.string().regex(/^[a-f0-9]{64}$/) }).strict();
@Roles("ADMIN") @Controller("agent-ops/workflows")
export class OpsWorkflowController {
  constructor(private readonly workflows: OpsWorkflowService) {}
  @Get() @Header("Cache-Control", "private, no-store")
  dashboard() { return this.workflows.dashboard(); }
  @Post() @Throttle({ default: { limit: 4, ttl: 60_000 } })
  create(@Body(new ZodValidationPipe(opsTaskCreateSchema)) input: z.infer<typeof opsTaskCreateSchema>) { return this.workflows.create(input); }
  @Post(":id/approve")
  approve(@Param("id") id: string, @Body(new ZodValidationPipe(approvalSchema)) body: z.infer<typeof approvalSchema>, @CurrentUser() user: RequestUser) { return this.workflows.approve(id, body.digest, user.id); }
  @Post(":id/cancel")
  cancel(@Param("id") id: string) { return this.workflows.cancel(id); }
}
@Public() @UseGuards(AgentOpsTokenGuard) @Controller("internal/agent-ops/tasks")
export class OpsTaskRunnerController {
  constructor(private readonly workflows: OpsWorkflowService) {}
  @Post("claim") @Header("Cache-Control", "private, no-store")
  claim(@Req() req: { opsCredentialId: string }) { return this.workflows.claim(req.opsCredentialId); }
  @Post(":id/heartbeat")
  heartbeat(@Param("id") id: string, @Req() req: { opsCredentialId: string }, @Body(new ZodValidationPipe(opsLeaseSchema)) body: z.infer<typeof opsLeaseSchema>) { return this.workflows.heartbeat(id, req.opsCredentialId, body.lease); }
  @Post(":id/events")
  event(@Param("id") id: string, @Req() req: { opsCredentialId: string }, @Body(new ZodValidationPipe(eventSchema)) body: z.infer<typeof eventSchema>) { return this.workflows.event(id, req.opsCredentialId, body.lease, body.event); }
  @Post(":id/complete")
  complete(@Param("id") id: string, @Req() req: { opsCredentialId: string }, @Body(new ZodValidationPipe(resultSchema)) body: z.infer<typeof resultSchema>) { return this.workflows.complete(id, req.opsCredentialId, body.lease, body.result); }
  @Post(":id/fail")
  fail(@Param("id") id: string, @Req() req: { opsCredentialId: string }, @Body(new ZodValidationPipe(opsFailSchema)) body: z.infer<typeof opsFailSchema>) { return this.workflows.fail(id, req.opsCredentialId, body.lease, body.code); }
}
