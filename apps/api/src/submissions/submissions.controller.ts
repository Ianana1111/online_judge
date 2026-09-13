import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import {
  createSubmissionSchema,
  isTerminalVerdict,
  submissionListQuerySchema,
  submissionResultChannel,
  type CreateSubmissionDto,
  type SubmissionListQueryDto,
  type Verdict,
} from "@oj/shared";
import { createRedisConnection } from "../common/redis.providers";
import { CurrentUser, OptionalAuth, type RequestUser } from "../common/decorators";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { serveStatusStream } from "../common/status-stream";
import { SubmissionsService } from "./submissions.service";

@Controller("submissions")
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  @HttpCode(201)
  create(@Body(new ZodValidationPipe(createSubmissionSchema)) body: CreateSubmissionDto, @CurrentUser() user: RequestUser) {
    return this.submissions.create(user.id, body);
  }

  // No @OptionalAuth here — every real use of this endpoint is "my own history," which requires
  // being logged in anyway, and there is no anonymous/other-user case it needs to serve.
  @Get()
  list(@Query(new ZodValidationPipe(submissionListQuerySchema)) query: SubmissionListQueryDto, @CurrentUser() user: RequestUser) {
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
    return serveStatusStream(req, res, submissionResultChannel(id), () => this.submissions.detail(id, user),
      (value) => isTerminalVerdict(value.verdict as Verdict));
  }

  @OptionalAuth()
  @Get(":id")
  detail(@Param("id") id: string, @CurrentUser() user: RequestUser | null) {
    return this.submissions.detail(id, user);
  }
}
