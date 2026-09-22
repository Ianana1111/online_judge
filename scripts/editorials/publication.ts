import { executionSchema, runSchema, oracleSchema } from "../../packages/shared/src/editorialEvidence";
import { EDITORIAL_JUDGE_REVISION, type OfficialEditorial } from "../../packages/shared/src/editorial";
import { editorialHash, judgeFingerprint, oracleSpec, sha256, type AuditProblem, type loadVerification } from "./evidence";

type Verification=Awaited<ReturnType<typeof loadVerification>>;
export type PublicationFiles={docker:unknown;vercel:unknown;runDocker:unknown;runVercel:unknown;oracle:unknown};

/** Fail closed: a passing process exit code or hand-entered "verified" flag is insufficient.
 * Every reference, mutant, sample and hidden row must have current, complete evidence. */
export function validatePublication(problem:AuditProblem,content:OfficialEditorial,verification:Verification,files:PublicationFiles,vercelSnapshot:string){
  const fail=(message:string):never=>{throw new Error(`${problem.slug}: ${message}`);};
  if(content.slug!==problem.slug||!problem.samples.length||!problem.testCases.length||!vercelSnapshot)fail("Missing publication prerequisites");
  const fingerprint=judgeFingerprint(problem),contentHash=editorialHash(content);
  const expectedRows=[...problem.samples.map(c=>`sample:${c.ord}`),...problem.testCases.map(c=>`hidden:${c.ord}`)].sort();
  const sameRows=(actual:string[],expected:string[])=>JSON.stringify([...actual].sort())===JSON.stringify([...expected].sort());
  const executions=[executionSchema.parse(files.docker),executionSchema.parse(files.vercel)];
  const runs=[runSchema.parse(files.runDocker),runSchema.parse(files.runVercel)];
  if(executions[0].backend!=="docker"||executions[1].backend!=="vercel"||runs[0].backend!=="docker"||runs[1].backend!=="vercel")fail("Wrong evidence backend");
  for(let i=0;i<executions.length;i++){
    const evidence=executions[i],run=runs[i];
    const retired=evidence.retiredLegacyCandidates??[],planned=verification.review.retiredLegacyCandidates??[];
    if(retired.length!==planned.length||retired.some((r,j)=>r.index!==planned[j].index||r.sourceHash!==planned[j].sourceHash||r.reason!==planned[j].reason||r.classification!==planned[j].classification))fail("Legacy retirement evidence does not match review");
    if(evidence.judgeRevision!==EDITORIAL_JUDGE_REVISION||run.judgeRevision!==EDITORIAL_JUDGE_REVISION||evidence.judgeFingerprint!==fingerprint||run.judgeFingerprint!==fingerprint||run.editorialContentHash!==contentHash)fail("Stale pipeline, problem or content evidence");
    if(evidence.verificationHash!==verification.verificationHash||evidence.oracleHash!==verification.oracleHash)fail("Verification plan changed");
    if(run.toolchain!==evidence.toolchain||(i===1&&evidence.toolchain!==vercelSnapshot)||(i===0&&!/^sha256:[a-f0-9]{64}$/.test(evidence.toolchain)))fail("Toolchain mismatch");
    for(const candidate of evidence.reports){
      if(candidate.expectation==="OBSERVE"||!sameRows(candidate.rows.map(r=>`${r.kind}:${r.ord}`),expectedRows)||candidate.rows.some(r=>!["AC","WA","TLE","MLE","RE","OLE"].includes(r.verdict)))fail("Unresolved candidate or incomplete case execution");
      const hidden=candidate.rows.filter(r=>r.kind==="hidden");
      if(candidate.submitStatus!==(hidden.find(r=>r.verdict!=="AC")?.verdict??"AC"))fail("Submit aggregate mismatch");
      if(candidate.expectation==="AC"&&candidate.rows.some(r=>r.verdict!=="AC"))fail("A valid candidate failed");
      if(candidate.expectation==="REJECT"&&!hidden.some(r=>r.verdict!=="AC"))fail("A known wrong candidate survived");
    }
    for(const solution of content.solutions){
      const sourceHash=sha256(solution.sourceCode);
      if(!evidence.reports.some(c=>c.languageKey===solution.languageKey&&c.sourceHash===sourceHash&&c.editorialContentHash===contentHash&&c.expectation==="AC"))fail("Displayed source was not fully judged");
      const r=run.reports.find(c=>c.languageKey===solution.languageKey&&c.sourceHash===sourceHash);
      if(!r||!sameRows(r.run.cases.map(c=>c.id),problem.samples.map(c=>`sample-${c.ord}`)))fail("Displayed source lacks complete Run evidence");
    }
    for(const mutation of verification.review.mutations){
      const reference=content.solutions.find(s=>s.languageKey===mutation.languageKey);
      if(!reference||!mutation.find||reference.sourceCode.split(mutation.find).length!==2)fail("Stale mutation definition");
      const hash=sha256(reference!.sourceCode.replace(mutation.find,mutation.replace));
      if(!evidence.reports.some(c=>c.sourceHash===hash&&c.languageKey===mutation.languageKey&&c.expectation===(mutation.expectation??"REJECT")))fail("Missing targeted alternative-solution evidence");
    }
  }
  const oracle=oracleSchema.parse(files.oracle);
  if(oracle.oracleHash!==verification.oracleHash)fail("Independent oracle changed");
  const independent=oracle.problems.find(p=>p.slug===problem.slug);
  if(!independent||JSON.stringify(independent.spec)!==JSON.stringify(oracleSpec(problem)))fail("Independent specification review is stale");
  const checks=independent!.checks;
  if(!checks||!sameRows(checks.map(c=>`${c.kind}:${c.ord}`),[...problem.samples.map(c=>`samples:${c.ord}`),...problem.testCases.map(c=>`testCases:${c.ord}`)]))fail("Independent checks do not cover the complete corpus");
  for(const check of checks!){
    if(check.status!=="MATCH")fail("Independent input or answer review failed");
    const tc=problem[check.kind].find(c=>c.ord===check.ord)!;
    if(check.inputHash!==sha256(tc.input)||check.outputHash!==sha256(tc.output))fail("Independent expected-answer evidence is stale");
  }
  return {schemaVersion:1,judgeFingerprint:fingerprint,contentHash,judgeRevision:EDITORIAL_JUDGE_REVISION,verificationHash:verification.verificationHash,oracleHash:verification.oracleHash,
    verifiedAt:new Date(Math.max(...[...executions,...runs].map(r=>Date.parse(r.checkedAt)))),
    counts:{samples:problem.samples.length,hidden:problem.testCases.length,solutions:content.solutions.length,mutations:verification.review.mutations.filter(m=>m.expectation!=="AC").length},
    artifacts:Object.fromEntries(Object.entries(files).map(([key,value])=>[key,sha256(JSON.stringify(value))])),
    toolchains:executions.map(e=>({backend:e.backend,id:e.toolchain})),runScope:runs[0].scope};
}
