import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { officialEditorialSchema } from "../../packages/shared/src/editorial";
import type { LegacyRetirement } from "./candidates";

export const sha256 = (text: string | Buffer) => createHash("sha256").update(text).digest("hex");
export const judgeFiles = [
  ...["evaluate", "testRun", "sandboxRun", "runVerdict", "checkers", "gpeCheckers", "doubletsChecker", "percentageChecker", "roundedOutput", "rationalCheckers", "constructionCheckers", "textWitnessCheckers", "setTreeCheckers", "fixedDecimalOutput", "geometricWitnessCheckers", "formattingTextChecker", "languages"].map(n => `apps/judge/src/local/${n}.ts`),
  "packages/shared/src/judge.ts", "packages/shared/src/sampleRevision.ts",
];
export async function currentJudgeRevision(root = process.cwd()) {
  const hash = createHash("sha256");
  for (const file of judgeFiles) hash.update(file + "\0").update(await readFile(resolve(root, file))).update("\0");
  return hash.digest("hex");
}
export type CaseData = { ord: number; input: string; output: string };
export type AuditProblem = {
  id: string; slug: string; title: string; uvaId: number | null; uvaPid: number | null;
  statementMd: string; inputSpecMd: string; outputSpecMd: string; sourceUrl: string | null;
  timeLimitMs: number; memoryLimitKb: number; checkerType: "EXACT" | "IGNORE_TRAILING_WS" | "FLOAT" | "SPECIAL";
  floatEps: number | null; samples: CaseData[]; testCases: CaseData[];
};
const orderedCases = (cases: CaseData[]) => [...cases].sort((a,b) => a.ord-b.ord).map(({ord,input,output}) => ({ord,input,output}));
export function judgeFingerprint(p: AuditProblem) {
  return sha256(JSON.stringify({ slug: p.slug, uvaId: p.uvaId, uvaPid: p.uvaPid, statementMd: p.statementMd,
    inputSpecMd: p.inputSpecMd, outputSpecMd: p.outputSpecMd, sourceUrl: p.sourceUrl,
    timeLimitMs: p.timeLimitMs, memoryLimitKb: p.memoryLimitKb, checkerType: p.checkerType, floatEps: p.floatEps,
    samples: orderedCases(p.samples), testCases: orderedCases(p.testCases) }));
}
export const editorialHash = (content: unknown) => sha256(JSON.stringify(officialEditorialSchema.parse(content)));
export function oracleSpec(p:AuditProblem){
  return {statementHash:sha256(p.statementMd),inputSpecHash:sha256(p.inputSpecMd),outputSpecHash:sha256(p.outputSpecMd),sourceUrl:p.sourceUrl,uvaId:p.uvaId,uvaPid:p.uvaPid,checkerType:p.checkerType,floatEps:p.floatEps,timeLimitMs:p.timeLimitMs,memoryLimitKb:p.memoryLimitKb};
}

/** Human-reviewable Markdown/source files are canonical; the API snapshot is built from these
 * exact bytes, so there is no separate displayed-code copy that can drift from the judged code. */
export async function loadEditorial(root: string, slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Invalid editorial slug");
  const directory=resolve(root,"content/editorials",slug);
  let meta;
  try { meta=JSON.parse(await readFile(resolve(directory,"meta.json"),"utf8")); }
  catch(error) { if((error as NodeJS.ErrnoException).code==="ENOENT")return null;throw error; }
  const extensions:Record<string,string>={cpp17:"cpp",python3:"py",c11:"c",java17:"java"};
  if(meta.slug!==slug||!Array.isArray(meta.languages)||meta.languages.some((key:string)=>!Object.hasOwn(extensions,key)))throw new Error(`Invalid editorial metadata: ${slug}`);
  const solutions=[];
  for(const languageKey of meta.languages) solutions.push({languageKey,sourceCode:await readFile(resolve(directory,`${languageKey}.${extensions[languageKey]}`),"utf8"),explanationMd:await readFile(resolve(directory,`${languageKey}.md`),"utf8")});
  return officialEditorialSchema.parse({slug,title:meta.title,locale:meta.locale,bodyMd:await readFile(resolve(directory,"editorial.md"),"utf8"),solutions});
}

export type StatementCorrection = { beforeHash: string; file: string; reason: string; source: string };
export const reviewedTextFields = ["title", "inputSpecMd", "outputSpecMd"] as const;
export type TextCorrection = { field: typeof reviewedTextFields[number]; beforeHash: string; value: string; reason: string; source: string };
export function validateTextCorrections(corrections: TextCorrection[] = []) {
  if (!Array.isArray(corrections)) throw new Error("Invalid text correction review");
  const seen = new Set<string>();
  for (const change of corrections) {
    if (!change || !reviewedTextFields.includes(change.field) || seen.has(change.field) || !/^[a-f0-9]{64}$/.test(change.beforeHash) || typeof change.value !== "string" || typeof change.reason !== "string" || !change.reason.trim() || typeof change.source !== "string" || !/^https:\/\//.test(change.source) || (change.field === "title" && (!change.value.trim() || change.value.length > 200)))
      throw new Error("Invalid text correction review");
    seen.add(change.field);
  }
  return corrections;
}
export async function loadStatementCorrection(root:string, correction:StatementCorrection) {
  const statementPath=/^content\/editorials\/([a-z0-9-]+)\/statement\.md$/.exec(correction.file);
  // Locally archived GPE statements may have no public source URL. Bind their provenance
  // to both the exact problem and the reviewed original bytes, never an invented URL.
  const localSource=statementPath && correction.source===`local-statement:${statementPath[1]}:sha256:${correction.beforeHash}`;
  if(!/^[a-f0-9]{64}$/.test(correction.beforeHash)||!statementPath||!correction.reason.trim()||(!/^https:\/\//.test(correction.source)&&!localSource))throw new Error("Invalid statement correction review");
  const statement=await readFile(resolve(root,correction.file),"utf8");
  if(statement.trim().length<100)throw new Error("Incomplete corrected statement");
  return statement;
}
export async function loadVerification(root: string, slug: string) {
  const raw=await readFile(resolve(root,"content/editorials",slug,"verification.json"),"utf8");
  const review=JSON.parse(raw) as { sources:string[];constraints:string[];independentMethod:string;oracleFile:string;oracleDependencies?:string[];statementCorrection?:StatementCorrection;checkerChange?:{from:AuditProblem["checkerType"];to:AuditProblem["checkerType"];reason:string};mutations:{id:string;label:string;languageKey:string;find:string;replace:string;expectation?:"AC"|"REJECT"}[] };
  if(!review.sources?.length||!review.constraints?.length||!review.independentMethod||review.mutations.filter(m=>m.expectation!=="AC").length<2)throw new Error(`Incomplete verification plan: ${slug}`);
  const reviewed = review as typeof review & { retiredLegacyCandidates?: LegacyRetirement[]; textCorrections?: TextCorrection[] };
  validateTextCorrections(reviewed.textCorrections);
  const files=[review.oracleFile,...review.oracleDependencies??[]];
  for(const file of files)if(!/^scripts\/[a-zA-Z0-9_/-]+\.py$/.test(file)||file.includes(".."))throw new Error("Invalid oracle source path");
  const hash=createHash("sha256");
  for(const file of files){if(files.length>1)hash.update(file+"\0");hash.update(await readFile(resolve(root,file)));if(files.length>1)hash.update("\0");}
  return {review:reviewed,verificationHash:sha256(raw),oracleHash:hash.digest("hex")};
}

export async function validateSpecChanges(root:string,before:AuditProblem,after:AuditProblem,review:Awaited<ReturnType<typeof loadVerification>>["review"]) {
  const textCorrections = validateTextCorrections(review.textCorrections);
  for (const field of reviewedTextFields) if (before[field] !== after[field]) {
    const correction = textCorrections.find(c => c.field === field);
    if (!correction || sha256(before[field]) !== correction.beforeHash || after[field] !== correction.value) throw new Error("Unreviewed text change");
  }
  if(before.checkerType!==after.checkerType){
    const change=review.checkerChange;
    if(change?.from!==before.checkerType||change.to!==after.checkerType||!change.reason)throw new Error("Unreviewed checker change");
  }
  if(before.statementMd!==after.statementMd){
    const correction=review.statementCorrection;
    if(!correction||sha256(before.statementMd)!==correction.beforeHash||await loadStatementCorrection(root,correction)!==after.statementMd)throw new Error("Unreviewed statement change");
  }
  if(judgeFingerprint({...before,statementMd:after.statementMd,inputSpecMd:after.inputSpecMd,outputSpecMd:after.outputSpecMd,checkerType:after.checkerType,samples:[],testCases:[]})!==judgeFingerprint({...after,samples:[],testCases:[]}))throw new Error("Other specification changes require separate review");
}
