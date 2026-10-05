import { Body, CanActivate, Controller, ExecutionContext, Get, Header, Injectable, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { prisma } from "@oj/db";
import { z } from "zod";
import { opsCompleteSchema, opsCredentialSchema, opsFailSchema, opsLeaseSchema, opsManualSchema, opsSettingsSchema } from "@oj/shared";
import { CurrentUser, Public, Roles, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AgentOpsService, opsHash } from "./agent-ops.service";

@Injectable()
export class AgentOpsTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const header = req.headers.authorization;
    if (typeof header !== "string" || !/^Bearer jo_[a-f0-9]{64}$/.test(header)) throw new UnauthorizedException();
    const credential = await prisma.agentOpsCredential.findUnique({ where: { tokenHash: opsHash(header.slice(7)) } });
    if (!credential || credential.revokedAt || +credential.expiresAt <= Date.now()) throw new UnauthorizedException();
    req.opsCredentialId = credential.id;
    return true;
  }
}
@Roles("ADMIN")
@Controller("agent-ops")
export class AgentOpsController {
  constructor(private readonly ops: AgentOpsService) {}
  @Get() @Header("Cache-Control", "private, no-store")
  dashboard() { return this.ops.dashboard(); }
  @Post("collect") @Throttle({ default: { limit: 4, ttl: 60_000 } })
  async collect() { await this.ops.collect(); return { ok: true }; }
  @Patch("settings")
  settings(@Body(new ZodValidationPipe(opsSettingsSchema)) body: z.infer<typeof opsSettingsSchema>) { return this.ops.settings(body); }
  @Post("credentials") @Header("Cache-Control", "private, no-store") @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@Body(new ZodValidationPipe(opsCredentialSchema)) body: z.infer<typeof opsCredentialSchema>, @CurrentUser() user: RequestUser) { return this.ops.createCredential(body.name, user.id); }
  @Post("credentials/:id/revoke")
  revoke(@Param("id") id: string) { return this.ops.revoke(id); }
  @Post("runs") @Throttle({ default: { limit: 4, ttl: 60_000 } })
  manual(@Body(new ZodValidationPipe(opsManualSchema)) body: z.infer<typeof opsManualSchema>) { return this.ops.manual(body.requestId); }
  @Post("runs/:id/retry")
  retry(@Param("id") id: string) { return this.ops.retry(id); }
  @Post("runs/:id/cancel")
  cancel(@Param("id") id: string) { return this.ops.cancel(id); }
}
@Public() @UseGuards(AgentOpsTokenGuard)
@Controller("internal/agent-ops")
export class AgentOpsRunnerController {
  constructor(private readonly ops: AgentOpsService) {}
  @Post("claim") @Header("Cache-Control", "private, no-store")
  claim(@Req() req: { opsCredentialId: string }) { return this.ops.claim(req.opsCredentialId); }
  @Post("runs/:id/heartbeat")
  heartbeat(@Param("id") id: string, @Req() req: { opsCredentialId: string }, @Body(new ZodValidationPipe(opsLeaseSchema)) body: z.infer<typeof opsLeaseSchema>) { return this.ops.heartbeat(id, req.opsCredentialId, body.lease); }
  @Post("runs/:id/steps")
  complete(@Param("id") id: string, @Req() req: { opsCredentialId: string }, @Body(new ZodValidationPipe(opsCompleteSchema)) body: z.infer<typeof opsCompleteSchema>) { return this.ops.complete(id, req.opsCredentialId, body); }
  @Post("runs/:id/fail")
  fail(@Param("id") id: string, @Req() req: { opsCredentialId: string }, @Body(new ZodValidationPipe(opsFailSchema)) body: z.infer<typeof opsFailSchema>) { return this.ops.fail(id, req.opsCredentialId, body.lease, body.code); }
}
