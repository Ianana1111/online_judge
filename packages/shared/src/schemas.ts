import { z } from "zod";
import { VERDICTS } from "./verdicts.js";

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
  languageKey: z.enum(["cpp17", "c11", "python3", "java17"]),
  sourceCode: z.string().min(1).max(65536),
});
export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;

export const judgeResultSchema = z.object({
  submissionId: z.string().cuid(),
  status: z.enum(VERDICTS),
  timeMs: z.number().int().min(0).optional(),
  memoryKb: z.number().int().min(0).optional(),
  score: z.number().min(0).max(100).optional(),
  compileError: z.string().max(16384).optional(),
});
export type JudgeResultDto = z.infer<typeof judgeResultSchema>;

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

export const createDiscussionSchema = z.object({
  body: z.string().min(1).max(4000),
});
export type CreateDiscussionDto = z.infer<typeof createDiscussionSchema>;

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
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(80),
  kind: z.enum(["CPE", "VIRTUAL", "PUBLIC"]).default("PUBLIC"),
  startAt: z.string().datetime().optional(),
  durationMin: z.number().int().min(10).max(600).default(180),
  freezeMin: z.number().int().min(0).max(600).default(60),
  penaltyMin: z.number().int().min(0).max(120).default(20),
  scoring: z.enum(["ICPC", "SUBTASK"]).default("ICPC"),
  isPublic: z.boolean().default(true),
  problems: z
    .array(z.object({ problemId: z.string().cuid(), label: z.string().min(1).max(4) }))
    .min(1),
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
  source: z.enum(["UVA", "CPE", "CUSTOM"]).default("CUSTOM"),
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
