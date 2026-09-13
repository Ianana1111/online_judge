import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { createRunSchema, testRunResultChannel, type CreateRunDto, type TestRunResultDto } from "@oj/shared";
import { createRedisConnection } from "../common/redis.providers";
import { CurrentUser, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { serveStatusStream } from "../common/status-stream";
import { RunsService } from "./runs.service";

function isTerminal(status: TestRunResultDto["status"]): boolean {
  return status !== "RUNNING";
}

@Controller("runs")
export class RunsController {
  constructor(private readonly runs: RunsService) {}

  @Post()
  @HttpCode(201)
  create(@Body(new ZodValidationPipe(createRunSchema)) body: CreateRunDto, @CurrentUser() user: RequestUser) {
    return this.runs.create(user.id, body);
  }

  @Get(":id/stream")
  async stream(@Param("id") id: string, @CurrentUser() user: RequestUser, @Req() req: Request, @Res() res: Response) {
    await this.runs.assertOwner(id, user.id);
    return serveStatusStream(req, res, testRunResultChannel(id), () => this.runs.getResult(id), (value) => isTerminal(value.status));
  }

  @Get(":id")
  async detail(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    await this.runs.assertOwner(id, user.id);
    return this.runs.getResult(id);
  }
}
