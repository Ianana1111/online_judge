import { z } from "zod";
import { officialEditorialSchema } from "./editorial";

export const contentRevisionSchema = z.object({
  schemaVersion: z.literal(1), previousContent: officialEditorialSchema,
  review: z.object({
    slug: z.string(), previousContentHash: z.string().regex(/^[a-f0-9]{64}$/),
    revisedContentHash: z.string().regex(/^[a-f0-9]{64}$/), reviewedAt: z.string().datetime(),
    checklist: z.object({chineseTeaching:z.literal(true),englishTeaching:z.literal(true),
      workedExample:z.literal(true),correctnessAndComplexity:z.literal(true),sourceUnchanged:z.literal(true)}).strict(),
  }).strict(),
}).strict();

// Private tooling evidence; never part of the public editorial DTO.
const rowSchema=z.object({kind:z.enum(["sample","hidden"]),ord:z.number().int(),verdict:z.string()});
export const executionSchema=z.object({complete:z.literal(true),checkedAt:z.string().datetime(),backend:z.enum(["docker","vercel"]),toolchain:z.string().min(1),judgeRevision:z.string(),judgeFingerprint:z.string(),verificationHash:z.string(),oracleHash:z.string(),retiredLegacyCandidates:z.array(z.object({index:z.number().int().nonnegative(),sourceHash:z.string().regex(/^[a-f0-9]{64}$/),reason:z.string().min(100),classification:z.literal("UNSUITABLE_MUTANT")})).optional(),reports:z.array(z.object({languageKey:z.string(),sourceHash:z.string(),editorialContentHash:z.string().optional(),expectation:z.enum(["AC","REJECT","OBSERVE"]),compileStatus:z.literal("OK"),submitStatus:z.string(),matched:z.literal(true),rows:z.array(rowSchema)})).min(1)});
export const runSchema=z.object({
  complete:z.literal(true),scope:z.literal("real-handlers-with-read-only-snapshot-lookup"),
  checkedAt:z.string().datetime(),backend:z.enum(["docker","vercel"]),toolchain:z.string().min(1),
  judgeRevision:z.string(),judgeFingerprint:z.string(),editorialContentHash:z.string(),
  reports:z.array(z.object({
    languageKey:z.string(),sourceHash:z.string(),submit:z.object({status:z.literal("AC")}),
    run:z.object({status:z.literal("DONE"),cases:z.array(z.object({id:z.string(),verdict:z.literal("AC")}))}),
  })).min(1),
});
export const oracleSchema=z.object({oracleHash:z.string(),problems:z.array(z.object({slug:z.string(),spec:z.object({statementHash:z.string(),inputSpecHash:z.string(),outputSpecHash:z.string(),sourceUrl:z.string().nullable(),uvaId:z.number().nullable(),uvaPid:z.number().nullable(),checkerType:z.string(),floatEps:z.number().nullable(),timeLimitMs:z.number(),memoryLimitKb:z.number()}).strict(),checks:z.array(z.object({kind:z.enum(["samples","testCases"]),ord:z.number().int(),status:z.enum(["MATCH","INPUT_REQUIRES_REVIEW","WRONG_EXPECTED_OUTPUT"]),inputHash:z.string(),outputHash:z.string()}))}))});
