import { z } from "zod";

// A regression test binds this to the production compile/run/checker sources. Changing the
// pipeline requires a new revision and invalidates old publication evidence automatically.
export const EDITORIAL_JUDGE_REVISION = "e6d221ab1c342e5b03144a9763eabe222c21cc8052e20defa9561afdaa338950";
export const editorialSolutionSchema = z.object({
  languageKey: z.enum(["cpp17", "python3", "c11", "java17"]),
  sourceCode: z.string().min(30).max(100_000),
  explanationMd: z.string().trim().min(150).max(40_000),
}).strict();
export const editorialLocaleSchema = z.enum(["zh-TW", "en"]);
export type EditorialLocale = z.infer<typeof editorialLocaleSchema>;
const englishEditorialSchema = z.object({
  title: z.string().trim().min(1).max(200),
  bodyMd: z.string().trim().min(500).max(80_000),
  solutions: z.array(z.object({
    languageKey: editorialSolutionSchema.shape.languageKey,
    explanationMd: editorialSolutionSchema.shape.explanationMd,
  }).strict()).min(1).max(4),
}).strict();
export const officialEditorialSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(200),
  locale: z.literal("zh-TW"),
  bodyMd: z.string().trim().min(500).max(80_000),
  solutions: z.array(editorialSolutionSchema).min(1).max(4),
  translations: z.object({ en: englishEditorialSchema }).strict().optional(),
}).strict().superRefine((value, ctx) => {
  if (new Set(value.solutions.map(s => s.languageKey)).size !== value.solutions.length) ctx.addIssue({ code: "custom", message: "Duplicate solution language" });
  for (const heading of ["題意與限制", "解題思路", "範例推演", "正確性", "複雜度", "常見錯誤"]) {
    if (!value.bodyMd.includes(`## ${heading}`)) ctx.addIssue({ code: "custom", message: `Missing editorial section: ${heading}` });
  }
  if (value.translations) {
    for (const heading of ["Problem and constraints", "Building the approach", "Walkthrough", "Why it works", "Complexity", "Common mistakes"]) {
      if (!value.translations.en.bodyMd.includes(`## ${heading}`)) ctx.addIssue({ code: "custom", message: `Missing English section: ${heading}` });
    }
    const expected = value.solutions.map(s => s.languageKey).sort();
    const actual = value.translations.en.solutions.map(s => s.languageKey).sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual)) ctx.addIssue({ code: "custom", message: "English explanations must cover each reference exactly once" });
  }
});
export type OfficialEditorial = z.infer<typeof officialEditorialSchema>;
export type LocalizedEditorial = Omit<OfficialEditorial, "locale" | "translations"> & { locale: EditorialLocale };
/** Both languages share the exact same judged source; translations cannot override code. */
export function localizeEditorial(content: OfficialEditorial, locale: EditorialLocale): LocalizedEditorial | null {
  if (locale === "en") {
    const english = content.translations?.en;
    if (!english) return null;
    return { slug: content.slug, locale, title: english.title, bodyMd: english.bodyMd,
      solutions: content.solutions.map(solution => ({ ...solution,
        explanationMd: english.solutions.find(s => s.languageKey === solution.languageKey)!.explanationMd,
      })) };
  }
  return { slug: content.slug, locale, title: content.title, bodyMd: content.bodyMd, solutions: content.solutions };
}
export type OfficialEditorialResponse =
  | { status: "AUTH_REQUIRED" | "PRO_REQUIRED" | "NOT_READY" | "REVIEW_REQUIRED" | "EXAM_LOCKED" }
  | { status: "AVAILABLE"; editorial: LocalizedEditorial; revision: number; verifiedAt: string; publishedAt: string; accessExpiresAt: string | null };
