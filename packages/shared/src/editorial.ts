import { z } from "zod";

// A regression test binds this to the production compile/run/checker sources. Changing the
// pipeline requires a new revision and invalidates old publication evidence automatically.
export const EDITORIAL_JUDGE_REVISION = "a65e36e2f56fe46c3c9ec98f4a3c3ad6c1150cc95483843e3b360e149c0b01e6";
export const editorialSolutionSchema = z.object({
  languageKey: z.enum(["cpp17", "python3", "c11", "java17"]),
  sourceCode: z.string().min(30).max(100_000),
  explanationMd: z.string().trim().min(150).max(40_000),
}).strict();
export const officialEditorialSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(200),
  locale: z.literal("zh-TW"),
  bodyMd: z.string().trim().min(500).max(80_000),
  solutions: z.array(editorialSolutionSchema).min(1).max(4),
}).strict().superRefine((value, ctx) => {
  if (new Set(value.solutions.map(s => s.languageKey)).size !== value.solutions.length) ctx.addIssue({ code: "custom", message: "Duplicate solution language" });
  for (const heading of ["題意與限制", "解題思路", "範例推演", "正確性", "複雜度", "常見錯誤"]) {
    if (!value.bodyMd.includes(`## ${heading}`)) ctx.addIssue({ code: "custom", message: `Missing editorial section: ${heading}` });
  }
});
export type OfficialEditorial = z.infer<typeof officialEditorialSchema>;
export type OfficialEditorialResponse =
  | { status: "NOT_READY" | "REVIEW_REQUIRED" | "EXAM_LOCKED" }
  | { status: "AVAILABLE"; editorial: OfficialEditorial; revision: number; verifiedAt: string; publishedAt: string };
