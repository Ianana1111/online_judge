import { describe, it, expect } from "vitest";
import { validatePublication } from "../scripts/editorials/publication";
import { editorialHash, judgeFingerprint, oracleSpec, sha256, type AuditProblem } from "../scripts/editorials/evidence";
import { EDITORIAL_JUDGE_REVISION } from "../packages/shared/src/editorial";
import { editorialFixture } from "./support/editorial-fixture";
import { validateContentRevision } from "../scripts/editorials/content-revision";

/** Deliberately synthetic unit fixtures. They never leave this test or enter a database. */
function fixture(){
  const content=editorialFixture();
  const problem:AuditProblem={id:"synthetic",slug:content.slug,title:"Echo",uvaId:null,uvaPid:null,statementMd:"Echo an integer",inputSpecMd:"integer",outputSpecMd:"same integer",sourceUrl:null,timeLimitMs:1000,memoryLimitKb:65536,checkerType:"IGNORE_TRAILING_WS",floatEps:null,samples:[{ord:1,input:"1\n",output:"1\n"}],testCases:[{ord:1,input:"2\n",output:"2\n"},{ord:2,input:"0\n",output:"0\n"}]};
  const verification={verificationHash:"review",oracleHash:"oracle",review:{sources:["https://example.test/spec"],constraints:["integer"],independentMethod:"identity",oracleFile:"synthetic",mutations:[{id:"increment",label:"Adds one",languageKey:"cpp17",find:"<< n <<",replace:"<< n+1 <<"},{id:"constant",label:"Always prints one",languageKey:"cpp17",find:"<< n <<",replace:"<< 1 <<"}]}};
  const common={complete:true,checkedAt:"2026-09-21T00:00:00Z",judgeRevision:EDITORIAL_JUDGE_REVISION,judgeFingerprint:judgeFingerprint(problem)};
  const rows=[{kind:"sample",ord:1,verdict:"AC"},{kind:"hidden",ord:1,verdict:"AC"},{kind:"hidden",ord:2,verdict:"AC"}];
  const reports=[{languageKey:"cpp17",sourceHash:sha256(content.solutions[0].sourceCode),editorialContentHash:editorialHash(content),expectation:"AC",compileStatus:"OK",submitStatus:"AC",matched:true,rows},...verification.review.mutations.map(m=>({languageKey:"cpp17",sourceHash:sha256(content.solutions[0].sourceCode.replace(m.find,m.replace)),expectation:"REJECT",compileStatus:"OK",submitStatus:"WA",matched:true,rows:rows.map(r=>({...r,verdict:r.kind==="hidden"?"WA":"AC"}))}))];
  const execution={...common,verificationHash:"review",oracleHash:"oracle",reports};
  const run={...common,scope:"real-handlers-with-read-only-snapshot-lookup",editorialContentHash:editorialHash(content),reports:[{languageKey:"cpp17",sourceHash:reports[0].sourceHash,submit:{status:"AC"},run:{status:"DONE",cases:[{id:"sample-1",verdict:"AC"}]}}]};
  const dockerId="sha256:"+"a".repeat(64),snapshot="synthetic-vercel-snapshot";
  const files={docker:{...structuredClone(execution),backend:"docker",toolchain:dockerId},vercel:{...structuredClone(execution),backend:"vercel",toolchain:snapshot},runDocker:{...structuredClone(run),backend:"docker",toolchain:dockerId},runVercel:{...structuredClone(run),backend:"vercel",toolchain:snapshot},oracle:{oracleHash:"oracle",problems:[{slug:problem.slug,spec:oracleSpec(problem),checks:(["samples","testCases"] as const).flatMap(kind=>problem[kind].map(c=>({kind,ord:c.ord,status:"MATCH",inputHash:sha256(c.input),outputHash:sha256(c.output)})))}]}};
  return {problem,content,verification,files,snapshot};
}

describe("official editorial publication gate",()=>{
  function revisionFixture() {
    const f=fixture(), previousContent=structuredClone(f.content);
    f.content.bodyMd += "\n\n先從一個輸入開始，確認輸出必須保留這個值，再把相同步驟放進讀取迴圈。";
    f.content.translations.en.bodyMd += "\n\nStart with one input value, preserve it in the output, then repeat that operation until input ends.";
    const revision={schemaVersion:1,previousContent,review:{slug:f.problem.slug,previousContentHash:editorialHash(previousContent),revisedContentHash:editorialHash(f.content),reviewedAt:"2026-09-22T00:00:00Z",checklist:{chineseTeaching:true,englishTeaching:true,workedExample:true,correctnessAndComplexity:true,sourceUnchanged:true}}};
    return {...f,revision};
  }
  it("keeps historical execution evidence intact while binding a bilingual prose revision to identical source",()=>{
    const f=revisionFixture(), original=JSON.stringify(f.files);
    expect(()=>validatePublication(f.problem,f.content,f.verification,f.files,f.snapshot)).toThrow();
    const proof=validateContentRevision(f.problem,f.content,f.verification,f.files,f.snapshot,f.revision);
    expect(proof.contentHash).toBe(editorialHash(f.content));
    expect(proof.contentRevision.previousContentHash).toBe(editorialHash(f.revision.previousContent));
    expect(JSON.stringify(f.files)).toBe(original);
  });
  it.each(["source","unreviewed-prose","invented-history","missing-english","missing-case","bad-run","changed-plan"])("does not waive %s verification for translations",kind=>{
    const f=revisionFixture();
    if(kind==="source"){f.content.solutions[0].sourceCode+="// changed\n";f.revision.review.revisedContentHash=editorialHash(f.content);}
    if(kind==="unreviewed-prose")f.content.translations.en.bodyMd+="Extra unreviewed explanation.";
    if(kind==="invented-history"){f.revision.previousContent.bodyMd+="Unverified previous text.";f.revision.review.previousContentHash=editorialHash(f.revision.previousContent);}
    if(kind==="missing-english")Object.assign(f.content,{translations:undefined});
    if(kind==="missing-case")f.files.vercel.reports[0].rows.pop();
    if(kind==="bad-run")f.files.runVercel.reports[0].run.cases[0].verdict="WA";
    if(kind==="changed-plan")f.verification.verificationHash="changed";
    expect(()=>validateContentRevision(f.problem,f.content,f.verification,f.files,f.snapshot,f.revision)).toThrow();
  });
  it("accepts complete cross-toolchain evidence and retains only compact private fingerprints",()=>{
    const f=fixture(),proof=validatePublication(f.problem,f.content,f.verification,f.files,f.snapshot);
    expect(proof.counts).toEqual({samples:1,hidden:2,solutions:1,mutations:2});
    expect(Object.keys(proof.artifacts)).toHaveLength(5);
    expect(JSON.stringify(proof)).not.toContain("sourceCode");expect(JSON.stringify(proof)).not.toContain("actualOutput");
  });
  it.each(["source","statement","oracle","oracle-spec","oracle-rejection","plan","toolchain","run","missing-case","duplicate-case","surviving-mutant","missing-mutant","unresolved","compile-error"])("refuses %s drift or incomplete evidence",kind=>{
    const f=fixture();
    if(kind==="source")f.content.solutions[0].sourceCode+="// edited\n";
    if(kind==="statement")f.problem.statementMd+=" changed";
    if(kind==="oracle-spec")f.files.oracle.problems[0].spec.statementHash="outdated specification";
    if(kind==="oracle-rejection")f.files.oracle.problems[0].checks[0].status="INPUT_REQUIRES_REVIEW";
    if(kind==="oracle")f.files.oracle.problems[0].checks[0].outputHash="changed";
    if(kind==="plan")f.verification.verificationHash="changed";
    if(kind==="toolchain")f.files.runVercel.toolchain="different-snapshot";
    if(kind==="run")f.files.runVercel.reports[0].run.cases[0].verdict="WA";
    if(kind==="missing-case")f.files.vercel.reports[0].rows.pop();
    if(kind==="duplicate-case")f.files.vercel.reports[0].rows[2]={...f.files.vercel.reports[0].rows[1]};
    if(kind==="surviving-mutant"){const m=f.files.vercel.reports[1];m.rows.forEach(r=>r.verdict="AC");m.submitStatus="AC";}
    if(kind==="missing-mutant")f.files.vercel.reports.pop();
    if(kind==="unresolved")f.files.vercel.reports[1].expectation="OBSERVE";
    if(kind==="compile-error")f.files.vercel.reports[1].compileStatus="CE";
    expect(()=>validatePublication(f.problem,f.content,f.verification,f.files,f.snapshot)).toThrow();
  });
  it("can publish a complete problem without treating an unrelated failed oracle check as passed",()=>{
    const f=fixture(),other=structuredClone(f.files.oracle.problems[0]);other.slug="unrelated";other.checks[0].status="INPUT_REQUIRES_REVIEW";f.files.oracle.problems.push(other);
    expect(validatePublication(f.problem,f.content,f.verification,f.files,f.snapshot).counts.hidden).toBe(2);
  });
  it("binds an explicit legacy retirement to both execution artifacts without waiving targeted mutants",()=>{
    const f=fixture();
    const retired=[{index:1,sourceHash:"a".repeat(64),classification:"UNSUITABLE_MUTANT" as const,reason:"The exact historical candidate has no demonstrated incorrect output on the supported toolchains; two independently counterexampled targeted mutants replace it."}];
    Object.assign(f.verification.review,{retiredLegacyCandidates:retired});
    expect(()=>validatePublication(f.problem,f.content,f.verification,f.files,f.snapshot)).toThrow();
    Object.assign(f.files.docker,{retiredLegacyCandidates:retired});
    Object.assign(f.files.vercel,{retiredLegacyCandidates:retired});
    expect(validatePublication(f.problem,f.content,f.verification,f.files,f.snapshot).counts.mutations).toBe(2);
    f.files.vercel.reports.pop();
    expect(()=>validatePublication(f.problem,f.content,f.verification,f.files,f.snapshot)).toThrow();
  });
  it("refuses an unplanned retirement even when every remaining candidate passes",()=>{
    const f=fixture();
    Object.assign(f.files.vercel,{retiredLegacyCandidates:[{index:1,sourceHash:"a".repeat(64),classification:"UNSUITABLE_MUTANT",reason:"An execution artifact cannot unilaterally drop a historical candidate without a matching source-bound review in the editorial verification plan."}]});
    expect(()=>validatePublication(f.problem,f.content,f.verification,f.files,f.snapshot)).toThrow();
  });
});
