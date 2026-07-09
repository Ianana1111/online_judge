import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { createSubmissionSchema, isTerminalVerdict, submissionResultChannel, type CreateSubmissionDto, type Verdict } from "@oj/shared";
import { createRedisConnection } from "../common/redis.providers";
import { CurrentUser, OptionalAuth, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { SubmissionListQuery, SubmissionsService } from "./submissions.service";

@Controller("submissions")
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  @HttpCode(201)
  create(@Body(new ZodValidationPipe(createSubmissionSchema)) body: CreateSubmissionDto, @CurrentUser() user: RequestUser) {
    return this.submissions.create(user.id, body);
  }

  @OptionalAuth()
  @Get()
  list(@Query() query: SubmissionListQuery, @CurrentUser() user: RequestUser | null) {
    return this.submissions.list(query, user);
  }

  @OptionalAuth()
  @Get(":id/stream")
  async stream(
    @Param("id") id: string,
    @CurrentUser() user: RequestUser | null,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const initial = await this.submissions.detail(id, user);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable buffering on nginx-style proxies
    res.flushHeaders();

    // The pub/sub broadcast payload never carries sourceCode (see SubmissionsService -
    // it's a single shared message forwarded to every connected viewer, so it can't be
    // filtered per-viewer). If this viewer is allowed to see it, splice it back in locally
    // from the initial snapshot (sourceCode never changes during judging).
    const sourceCodeToAttach: string | undefined = (initial as { sourceCode?: string }).sourceCode;

    let closed = false;
    const write = (payload: unknown) => {
      if (closed) return;
      res.write(`event: status\ndata: ${JSON.stringify(payload)}\n\n`);
    };

    write(initial);

    if (isTerminalVerdict(initial.verdict as Verdict)) {
      res.end();
      return;
    }

    const subscriber = createRedisConnection();
    const channel = submissionResultChannel(id);

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
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(message);
      } catch {
        return;
      }
      if (sourceCodeToAttach !== undefined && payload.sourceCode === undefined) {
        payload.sourceCode = sourceCodeToAttach;
      }
      write(payload);
      if (isTerminalVerdict(payload.verdict as Verdict)) {
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

  @OptionalAuth()
  @Get(":id")
  detail(@Param("id") id: string, @CurrentUser() user: RequestUser | null) {
    return this.submissions.detail(id, user);
  }
}
