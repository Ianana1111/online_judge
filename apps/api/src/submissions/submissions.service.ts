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
  JUDGE_LOCAL_QUEUE_NAME,
  JUDGE_REMOTE_QUEUE_NAME,
  isTerminalVerdict,
  submissionResultChannel,
  type CreateSubmissionDto,
  type JudgeResultDto,
  type SubmissionListQueryDto,
  type Verdict,
} from "@oj/shared";
import type { RequestUser } from "../common/decorators";
import { JUDGE_LOCAL_QUEUE, JUDGE_REMOTE_QUEUE, REDIS_CLIENT } from "../common/redis.providers";
import { BillingService } from "../billing/billing.service";
import { AchievementsService } from "../achievements/achievements.service";

const PAGE_SIZE = 20;
const COOLDOWN_MS = 10_000;

@Injectable()
export class SubmissionsService {
  constructor(
    @Inject(JUDGE_LOCAL_QUEUE) private readonly localQueue: Queue,
    @Inject(JUDGE_REMOTE_QUEUE) private readonly remoteQueue: Queue,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly billing: BillingService,
    private readonly achievements: AchievementsService,
  ) {}

  async create(userId: string, dto: CreateSubmissionDto): Promise<{ id: string }> {
    const problem = await prisma.problem.findUnique({
      where: { id: dto.problemId },
      include: { _count: { select: { testCases: true } } },
    });
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

    // Routed once, here, rather than left for the worker to decide — a problem with local test
    // cases goes to the local queue (high concurrency: every submission gets its own isolated
    // sandbox, so there's no reason to serialize them), everything else falls back to the remote
    // queue (kept serialized — see worker.ts). Default attempts (1) is intentional: silently
    // re-running arbitrary user code on a transient job failure is not safe, so we don't override
    // BullMQ's retry behavior here.
    const judgedLocally = problem._count.testCases > 0;
    if (judgedLocally) {
      await this.localQueue.add(JUDGE_LOCAL_QUEUE_NAME, { submissionId: submission.id });
    } else {
      await this.remoteQueue.add(JUDGE_REMOTE_QUEUE_NAME, { submissionId: submission.id });
    }

    return { id: submission.id };
  }

  async detail(id: string, requester: RequestUser | null) {
    const submission = await this.findWithResults(id);
    if (!submission) throw new NotFoundException("Submission not found");
    return this.toPublicDetail(submission, this.canSeeSource(submission.userId, requester));
  }

  /** Always scoped to the caller's own submissions — `query.user` is accepted for shape
   * compatibility with the frontend's `?user=me` but its value is never actually consulted, since
   * there is no legitimate case for one account to list another's submission history (verdicts,
   * timings, and per-problem activity — including during a live contest — are not public data).
   * `requester` is guaranteed non-null by the controller no longer allowing anonymous access. */
  async list(query: SubmissionListQueryDto, requester: RequestUser) {
    const where: Record<string, unknown> = { userId: requester.id };

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
  // Only PENDING/JUDGING are valid states to update FROM — a submission already in a terminal
  // verdict has finished judging, full stop.
  private static readonly OPEN_VERDICTS: Verdict[] = ["PENDING", "JUDGING"];

  /**
   * Conditional on the submission still being in a non-terminal state (PENDING/JUDGING) — not a
   * plain unconditional update — so a stalled BullMQ job's retry, or any other duplicate/delayed
   * delivery of a result for the same submission, can't clobber an already-terminal verdict back
   * to an earlier state, and can't re-trigger AC achievement evaluation (duplicate notifications)
   * for a submission that was already AC. The interim "JUDGING" update from worker.ts and the
   * final terminal update both still apply normally through this same check, since PENDING and
   * JUDGING are both in OPEN_VERDICTS — only a THIRD, stale call arriving after the real terminal
   * result is what this actually blocks.
   */
  async applyJudgeResult(submissionId: string, dto: JudgeResultDto) {
    const terminal = isTerminalVerdict(dto.status as Verdict);
    const data: Record<string, unknown> = { status: dto.status, verdict: dto.status };
    if (dto.timeMs !== undefined) data.timeMs = dto.timeMs;
    if (dto.memoryKb !== undefined) data.memoryKb = dto.memoryKb;
    if (dto.score !== undefined) data.score = dto.score;
    if (dto.compileError !== undefined) data.compileError = dto.compileError;
    if (dto.judgedOn !== undefined) data.judgedOn = dto.judgedOn;
    if (terminal) data.judgedAt = new Date();

    const claimed = await prisma.submission.updateMany({
      where: { id: submissionId, verdict: { in: SubmissionsService.OPEN_VERDICTS } },
      data,
    });
    if (claimed.count === 0) {
      // Either no such submission, or it was already terminal — check which, since the caller
      // (the judge worker's HTTP callback) still needs a 404 for a genuinely unknown id.
      const exists = await prisma.submission.findUnique({ where: { id: submissionId }, select: { id: true } });
      if (!exists) throw new NotFoundException("Submission not found");
      // `applied: false` is what lets StuckSubmissionReaperService tell "I just marked this SE"
      // apart from "this was already terminal by the time I got to it (lost the race to a real
      // judge result)" — only the former should refund the user's submit quota.
      return { applied: false, detail: this.toPublicDetail((await this.findWithResults(submissionId))!, false) };
    }

    const updated = await this.findWithResults(submissionId);
    const publicDetail = this.toPublicDetail(updated!, false);
    await this.redis.publish(submissionResultChannel(submissionId), JSON.stringify(publicDetail));

    // After publishing, so a slow achievement evaluation never delays the verdict reaching the
    // live SSE stream — achievement/notification delivery is polled separately, not time-critical.
    if (dto.status === "AC") {
      await this.achievements.evaluateAfterAc(updated!.userId, updated!.problemId);
    }

    return { applied: true, detail: publicDetail };
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
      createdAt: submission.createdAt,
      judgedAt: submission.judgedAt,
      // Gated the same as sourceCode (owner or admin only), not shown to arbitrary viewers: a
      // raw compiler stderr dump can echo back whatever the submitted source tried to have the
      // compiler print — including, in the worst case, local sandbox file contents pulled in via
      // an absolute-path #include — and GET /submissions/:id and its SSE stream are both
      // @OptionalAuth, so this was previously world-readable by submission id.
      ...(includeSource ? { compileError: submission.compileError, sourceCode: submission.sourceCode } : {}),
    };
  }
}
