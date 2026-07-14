import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Queue } from "bullmq";
import type Redis from "ioredis";
import { prisma } from "@oj/db";
import {
  JUDGE_QUEUE_NAME,
  isTerminalVerdict,
  submissionResultChannel,
  type CreateSubmissionDto,
  type JudgeResultDto,
  type Verdict,
} from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { JUDGE_QUEUE, REDIS_CLIENT } from "../common/redis.providers";
import { BillingService } from "../billing/billing.service";
import { AchievementsService } from "../achievements/achievements.service";

const PAGE_SIZE = 20;
const COOLDOWN_MS = 10_000;

export interface SubmissionListQuery {
  user?: string;
  problem?: string;
  contestId?: string;
  page?: string;
  pageSize?: string;
}

@Injectable()
export class SubmissionsService {
  constructor(
    @Inject(JUDGE_QUEUE) private readonly queue: Queue,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly billing: BillingService,
    private readonly achievements: AchievementsService,
  ) {}

  async create(userId: string, dto: CreateSubmissionDto): Promise<{ id: string }> {
    const problem = await prisma.problem.findUnique({ where: { id: dto.problemId } });
    if (!problem) throw new NotFoundException("Problem not found");

    if (dto.contestId) {
      const participant = await prisma.contestParticipant.findUnique({
        where: { contestId_userId: { contestId: dto.contestId, userId } },
      });
      const now = Date.now();
      if (!participant || participant.endsAt.getTime() < now || participant.startedAt.getTime() > now) {
        throw new ForbiddenException("This contest window is closed or you have not started it yet.");
      }
    }

    // Atomic cooldown claim (Redis SET NX): a plain "read last submission, compare timestamp"
    // check is a TOCTOU race — concurrent requests can all read "no recent submission" before
    // any of them commits. SET NX makes only one concurrent request win the window.
    const claimed = await this.redis.set(`submit_cooldown:${userId}`, "1", "PX", COOLDOWN_MS, "NX");
    if (!claimed) {
      throw new HttpException("You are submitting too fast. Please wait a few seconds.", HttpStatus.TOO_MANY_REQUESTS);
    }

    // Plan gate, checked (and consumed) after validation so a rejected submission never burns
    // quota, but before the submission row exists so a bypassed gate can't ever queue a job.
    // This is itself an atomic conditional UPDATE (see billing.service) — not check-then-write.
    await this.billing.assertCanSubmit(userId);

    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: dto.problemId,
        contestId: dto.contestId,
        languageKey: dto.languageKey,
        sourceCode: dto.sourceCode,
        status: "PENDING",
        verdict: "PENDING",
      },
    });

    // Default attempts (1) is intentional: silently re-running arbitrary user code on a
    // transient job failure is not safe, so we don't override BullMQ's retry behavior here.
    await this.queue.add(JUDGE_QUEUE_NAME, { submissionId: submission.id });

    return { id: submission.id };
  }

  async detail(id: string, requester: RequestUser | null) {
    const submission = await this.findWithResults(id);
    if (!submission) throw new NotFoundException("Submission not found");
    return this.toPublicDetail(submission, this.canSeeSource(submission.userId, requester));
  }

  async list(query: SubmissionListQuery, requester: RequestUser | null) {
    const where: Record<string, unknown> = {};

    if (query.user === "me") {
      if (!requester) throw new ForbiddenException("Authentication required");
      where.userId = requester.id;
    } else if (query.user) {
      where.userId = query.user;
    }
    if (query.problem) where.problemId = query.problem;
    if (query.contestId) where.contestId = query.contestId;

    const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
    const pageSize = query.pageSize ? Math.min(200, Math.max(1, parseInt(query.pageSize, 10) || PAGE_SIZE)) : PAGE_SIZE;

    const [rows, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        select: {
          id: true,
          problemId: true,
          languageKey: true,
          status: true,
          verdict: true,
          timeMs: true,
          memoryKb: true,
          createdAt: true,
          problem: { select: { slug: true, title: true, tags: { select: { tag: { select: { slug: true } } } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.submission.count({ where }),
    ]);

    return {
      items: rows.map((s) => ({
        id: s.id,
        problemId: s.problemId,
        problemSlug: s.problem.slug,
        problemTitle: s.problem.title,
        problemTags: s.problem.tags.map((t) => t.tag.slug),
        languageKey: s.languageKey,
        status: s.status,
        verdict: s.verdict,
        timeMs: s.timeMs,
        memoryKb: s.memoryKb,
        createdAt: s.createdAt,
      })),
      total,
      page,
    };
  }

  /** Used by the internal judge-result callback. Returns the updated public detail (no
   * sourceCode) so the caller can publish it to the SSE channel. */
  async applyJudgeResult(submissionId: string, dto: JudgeResultDto) {
    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new NotFoundException("Submission not found");

    const terminal = isTerminalVerdict(dto.status as Verdict);
    const data: Record<string, unknown> = { status: dto.status, verdict: dto.status };
    if (dto.timeMs !== undefined) data.timeMs = dto.timeMs;
    if (dto.memoryKb !== undefined) data.memoryKb = dto.memoryKb;
    if (dto.score !== undefined) data.score = dto.score;
    if (dto.compileError !== undefined) data.compileError = dto.compileError;
    if (terminal) data.judgedAt = new Date();

    await prisma.submission.update({ where: { id: submissionId }, data });

    const updated = await this.findWithResults(submissionId);
    const publicDetail = this.toPublicDetail(updated!, false);
    await this.redis.publish(submissionResultChannel(submissionId), JSON.stringify(publicDetail));

    // After publishing, so a slow achievement evaluation never delays the verdict reaching the
    // live SSE stream — achievement/notification delivery is polled separately, not time-critical.
    if (dto.status === "AC") {
      await this.achievements.evaluateAfterAc(updated!.userId, updated!.problemId);
    }

    return publicDetail;
  }

  private canSeeSource(ownerId: string, requester: RequestUser | null): boolean {
    return !!requester && (requester.id === ownerId || requester.role === "ADMIN");
  }

  private async findWithResults(id: string) {
    return prisma.submission.findUnique({ where: { id } });
  }

  toPublicDetail(
    submission: NonNullable<Awaited<ReturnType<SubmissionsService["findWithResults"]>>>,
    includeSource: boolean,
  ) {
    return {
      id: submission.id,
      userId: submission.userId,
      problemId: submission.problemId,
      contestId: submission.contestId,
      languageKey: submission.languageKey,
      status: submission.status,
      verdict: submission.verdict,
      timeMs: submission.timeMs,
      memoryKb: submission.memoryKb,
      score: submission.score,
      compileError: submission.compileError,
      createdAt: submission.createdAt,
      judgedAt: submission.judgedAt,
      ...(includeSource ? { sourceCode: submission.sourceCode } : {}),
    };
  }
}
