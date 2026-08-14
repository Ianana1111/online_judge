import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { createRunSchema, testRunResultChannel, type CreateRunDto, type TestRunResultDto } from "@oj/shared";
import { createRedisConnection } from "../common/redis.providers";
import { CurrentUser, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
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
  async stream(@Param("id") id: string, @Req() req: Request, @Res() res: Response) {
    let initial: TestRunResultDto;
    try {
      initial = await this.runs.getResult(id);
    } catch {
      throw new NotFoundException("Run not found or expired");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable buffering on nginx-style proxies
    res.flushHeaders();

    let closed = false;
    const write = (payload: unknown) => {
      if (closed) return;
      res.write(`event: status\ndata: ${JSON.stringify(payload)}\n\n`);
    };

    write(initial);

    if (isTerminal(initial.status)) {
      res.end();
      return;
    }

    const subscriber = createRedisConnection();
    const channel = testRunResultChannel(id);

    const cleanup = async () => {
      if (closed) return;
      closed = true;
      try {
        await subscriber.unsubscribe(channel);
      } catch {
        /* ignore */
      }
      subscriber.disconnect();
    };

    subscriber.on("message", (_channel, message) => {
      let payload: TestRunResultDto;
      try {
        payload = JSON.parse(message);
      } catch {
        return;
      }
      write(payload);
      if (isTerminal(payload.status)) {
        res.end();
        void cleanup();
      }
    });

    try {
      await subscriber.subscribe(channel);
    } catch {
      // If we can't subscribe, at least the initial snapshot was already sent.
      res.end();
      void cleanup();
      return;
    }

    req.on("close", () => {
      void cleanup();
    });
  }
}
