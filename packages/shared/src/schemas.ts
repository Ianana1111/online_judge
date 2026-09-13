import { z } from "zod";
import { VERDICTS } from "./verdicts.js";
import { canonicalSchoolName } from "./taiwanUniversityDomains.js";
import { TAIWAN_UNIVERSITIES } from "./taiwanUniversities.js";

export const registerSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "handle may only contain letters, numbers, underscore"),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  handle: z.string().min(1),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const createSubmissionSchema = z.object({
  problemId: z.string().cuid(),
  contestId: z.string().cuid().optional(),
  contestParticipantId: z.string().cuid().optional(),
  clientRequestId: z.string().uuid().optional(),
  languageKey: z.enum(["cpp17", "c11", "python3", "java17"]),
  sourceCode: z.string().min(1).max(65536),
}).refine((value) => Boolean(value.contestId) === Boolean(value.contestParticipantId), { message: "A contest submission must identify its attempt", path: ["contestParticipantId"] });
export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;

export const judgeResultSchema = z.object({
  submissionId: z.string().cuid(),
  evaluationVersion: z.number().int().positive().optional(),
  status: z.enum(VERDICTS),
  timeMs: z.number().int().min(0).optional(),
  memoryKb: z.number().int().min(0).optional(),
  score: z.number().min(0).max(100).optional(),
  compileError: z.string().max(16384).optional(),
  // Optional: the interim "JUDGING" report (worker.ts) doesn't know this yet at that point, and
  // the stuck-submission reaper's synthetic SE report isn't really "judged" by either path.
  judgedOn: z.enum(["SELF", "REMOTE"]).optional(),
});
export type JudgeResultDto = z.infer<typeof judgeResultSchema>;

// "Run" (test code against sample/custom input, no verdict/persistence) — see queue.ts's
// TEST_RUN_QUEUE_NAME. Capped at 8 cases / 4KB input each: this is meant for eyeballing a sample
// or a quick hand-written edge case, not a stress-test harness — anyone needing that already has
// the real Submit path (or, once configured, the local judge's own TestCase-backed run).
export const runCaseInputSchema = z.object({
  id: z.string().min(1).max(64),
  input: z.string().max(4096),
});
export const createRunSchema = z.object({
  problemId: z.string().cuid(),
  languageKey: z.enum(["cpp17", "c11", "python3", "java17"]),
  sourceCode: z.string().min(1).max(65536),
  cases: z.array(runCaseInputSchema).min(1).max(8),
});
export type CreateRunDto = z.infer<typeof createRunSchema>;

export const runCaseResultSchema = z.object({
  id: z.string(),
  stdout: z.string(),
  stderr: z.string(),
  timeMs: z.number().int().min(0),
  timedOut: z.boolean(),
  exitCode: z.number().int(),
});
export type RunCaseResultDto = z.infer<typeof runCaseResultSchema>;

export const testRunResultSchema = z.object({
  runId: z.string(),
  status: z.enum(["RUNNING", "DONE", "COMPILE_ERROR", "ERROR"]),
  compileError: z.string().max(16384).optional(),
  cases: z.array(runCaseResultSchema).optional(),
});
export type TestRunResultDto = z.infer<typeof testRunResultSchema>;

export const createUserSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "handle may only contain letters, numbers, underscore"),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

// currentPassword is optional because a Google-signin-only account has no passwordHash to check
// against — see users.service.deleteAccount for how the two cases are handled server-side.
export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1).optional(),
});
export type DeleteAccountDto = z.infer<typeof deleteAccountSchema>;

export const changeHandleSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "handle may only contain letters, numbers, underscore"),
});
export type ChangeHandleDto = z.infer<typeof changeHandleSchema>;

export const updateProfileSchema = z.object({
  bio: z.string().max(200).optional(),
  // Data-URL only (e.g. "data:image/jpeg;base64,...") — the client resizes/compresses before
  // sending, so 300KB comfortably covers a small avatar while still capping DB row growth.
  // null clears the avatar back to the generic initial-letter placeholder.
  avatarUrl: z
    .union([z.string().max(300_000).startsWith("data:image/"), z.null()])
    .optional(),
  // A closed set (see taiwanUniversities.ts), not free text — enforced here too, not just in the
  // picker UI, since the leaderboard's school filter only works if every row's value is exactly
  // one of these strings. null clears it back to unset.
  school: z.preprocess((value) => typeof value === "string" ? canonicalSchoolName(value) : value, z.union([z.enum(TAIWAN_UNIVERSITIES), z.null()])).optional(),
});
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const requestSchoolVerificationSchema = z.object({
  email: z.string().email().max(200),
});
export type RequestSchoolVerificationDto = z.infer<typeof requestSchoolVerificationSchema>;

export const setIsStudentSchema = z.object({
  isStudent: z.boolean(),
});
export type SetIsStudentDto = z.infer<typeof setIsStudentSchema>;

export const adminGrantPlanSchema = z.object({
  period: z.enum(["MONTHLY", "YEARLY"]),
});
export type AdminGrantPlanDto = z.infer<typeof adminGrantPlanSchema>;

export const ecpayCreateSchema = z.object({
  period: z.enum(["MONTHLY", "YEARLY"]),
});
export type EcpayCreateDto = z.infer<typeof ecpayCreateSchema>;

export const adminRefundListSchema = z.object({
  cursor: z.string().min(1).max(300).optional(),
  status: z.enum(["REQUESTED", "PROCESSING", "NEEDS_REVIEW", "COMPLETED"]).optional(),
});
export type AdminRefundListDto = z.infer<typeof adminRefundListSchema>;

export const noteSchema = z.object({
  content: z.string().max(20_000),
});
export type NoteDto = z.infer<typeof noteSchema>;

export const createDiscussionSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});
export type CreateDiscussionDto = z.infer<typeof createDiscussionSchema>;

export const postCategorySchema = z.enum(["GENERAL", "QUESTION", "EDITORIAL", "ANNOUNCEMENT"]);
export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  bodyMd: z.string().trim().min(1).max(50_000),
  category: postCategorySchema.default("GENERAL"),
  isOfficial: z.boolean().default(false),
}).strict();
export type CreatePostDto = z.infer<typeof createPostSchema>;
export const communityListSchema = z.object({
  cursor: z.string().max(500).optional(),
  q: z.string().trim().max(100).optional(),
  category: postCategorySchema.optional(),
});
export type CommunityListDto = z.infer<typeof communityListSchema>;
export const reviewContentSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().trim().max(1000).optional(),
}).strict().refine((v) => v.decision !== "REJECTED" || !!v.reason, { message: "Please explain what needs to change", path: ["reason"] });
export type ReviewContentDto = z.infer<typeof reviewContentSchema>;
export const moderationListSchema = communityListSchema.extend({ state: z.enum(["pending", "reviewed"]).default("pending") });
export type ModerationListDto = z.infer<typeof moderationListSchema>;

export const createAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).default(""),
  dueAt: z.string().datetime().optional(),
  problemIds: z.array(z.string().cuid()).min(1),
  assigneeUserIds: z.array(z.string().cuid()).default([]),
  assignToAll: z.boolean().default(false),
});
export type CreateAssignmentDto = z.infer<typeof createAssignmentSchema>;

export const createContestSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(["CPE", "GPE", "VIRTUAL", "PUBLIC"]).default("PUBLIC"),
  startAt: z.string().datetime().optional(),
  durationMin: z.number().int().min(10).max(600).default(180),
  freezeMin: z.number().int().min(0).max(600).default(60),
  penaltyMin: z.number().int().min(0).max(120).default(20),
  scoring: z.literal("ICPC").default("ICPC"),
  isPublic: z.boolean().default(true),
  problems: z
    .array(z.object({ problemId: z.string().cuid(), label: z.string().trim().min(1).max(4) }))
    .min(1).max(26),
}).strict().superRefine((value, ctx) => {
  if (value.freezeMin > value.durationMin) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["freezeMin"], message: "Freeze duration cannot exceed exam duration" });
  if (new Set(value.problems.map((p) => p.problemId)).size !== value.problems.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["problems"], message: "Each problem may appear only once" });
  if (new Set(value.problems.map((p) => p.label)).size !== value.problems.length) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["problems"], message: "Problem labels must be unique" });
});
export type CreateContestDto = z.infer<typeof createContestSchema>;

export const createProblemSchema = z.object({
  uvaId: z.number().int().positive().optional(),
  slug: z.string().min(1).max(64),
  title: z.string().min(1).max(200),
  statementMd: z.string(),
  inputSpecMd: z.string().default(""),
  outputSpecMd: z.string().default(""),
  timeLimitMs: z.number().int().min(100).max(30_000).default(1000),
  memoryLimitKb: z.number().int().min(1024).max(1_048_576).default(65536),
  difficulty: z.number().int().min(1).max(4).default(1),
  source: z.enum(["UVA", "CPE", "GPE", "CUSTOM"]).default("CUSTOM"),
  checkerType: z.enum(["EXACT", "IGNORE_TRAILING_WS", "FLOAT", "SPECIAL"]).default("IGNORE_TRAILING_WS"),
  floatEps: z.number().positive().optional(),
  tagSlugs: z.array(z.string()).default([]),
});
export type CreateProblemDto = z.infer<typeof createProblemSchema>;

export const createClassSessionSchema = z.object({
  studentId: z.string().cuid(),
  title: z.string().max(200).default(""),
  contentMd: z.string().max(20_000).default(""),
  problemIds: z.array(z.string().cuid()).default([]),
});
export type CreateClassSessionDto = z.infer<typeof createClassSessionSchema>;

export const updateClassSessionSchema = z.object({
  title: z.string().max(200).optional(),
  contentMd: z.string().max(20_000).optional(),
  problemIds: z.array(z.string().cuid()).optional(),
});
export type UpdateClassSessionDto = z.infer<typeof updateClassSessionSchema>;

export const createClassCommentSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});
export type CreateClassCommentDto = z.infer<typeof createClassCommentSchema>;

export const recordPageviewSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
});
export type RecordPageviewDto = z.infer<typeof recordPageviewSchema>;

export const notificationListSchema = z.object({ cursor: z.string().max(500).optional(), unread: z.enum(["true", "false"]).optional() });
export const markNotificationsReadSchema = z.union([
  z.object({ ids: z.array(z.string().cuid()).min(1).max(100) }).strict(),
  z.object({ all: z.literal(true), before: z.string().datetime() }).strict(),
]);
export type MarkNotificationsReadDto = z.infer<typeof markNotificationsReadSchema>;

// Merge-patched into User.settings (Json) — only known keys are accepted so this stays a real
// schema, not an arbitrary-blob passthrough, even though the storage itself is untyped Json.
// Anything not listed here is silently dropped by Zod before updateSettings ever sees it, so a
// new settings key added on the frontend alone will appear to save and then quietly not persist —
// every key the UI writes must have an entry here.
export const updateSettingsSchema = z.object({
  defaultLanguage: z.enum(["cpp17", "c11", "python3", "java17"]).optional(),
  dailyGoal: z.number().int().min(1).max(50).optional(),
  onboardingDismissed: z.boolean().optional(),
  profileSetupDismissed: z.boolean().optional(),
  uiLocale: z.enum(["zh-TW", "en"]).optional(),
});
export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;

// GET /submissions?... — every field must be a plain string (not the array/object shape qs's
// bracket-notation parsing would build from e.g. "?problem[not]=x"), since submissions.service
// drops these straight into a Prisma `where` clause; an object here would silently become a
// Prisma filter operator instead of an exact-match id. `user` is accepted for shape only — the
// service always scopes the query to the caller's own id regardless of what's sent here, so this
// never actually authorizes looking up anyone else's submissions.
export const submissionListQuerySchema = z.object({
  user: z.string().max(100).optional(),
  problem: z.string().max(100).optional(),
  contestId: z.string().max(100).optional(),
  page: z.string().max(20).optional(),
  pageSize: z.string().max(20).optional(),
});
export type SubmissionListQueryDto = z.infer<typeof submissionListQuerySchema>;
