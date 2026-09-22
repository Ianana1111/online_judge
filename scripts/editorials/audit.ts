/**
 * Full-case audit using the deployed compile/run/checker implementation. No database writes.
 * Reports containing stdout/diagnostics must stay under generated/ or /private/tmp/.
 * node --import ./packages/db/node_modules/tsx/dist/loader.mjs scripts/editorials/audit.ts
 *   --snapshot=/private/tmp/oj-editorials-20260921/content.json --out=generated/editorial-audit/baseline
 *   [--only=slug,slug] [--backend=docker|vercel] [--resume]
 * This is execution evidence, not independent-oracle review or a publication approval.
 */
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createDockerSandbox } from "../../tests/support/docker-sandbox";
import { createVercelSandbox } from "../../tests/support/vercel-sandbox";
import { compileInSandbox, runOneCase } from "../../apps/judge/src/local/sandboxRun";
import { evaluateInSandbox } from "../../apps/judge/src/local/evaluate";
import { checkProblemOutput } from "../../apps/judge/src/local/checkers";
import { runtimeVerdict } from "../../apps/judge/src/local/runVerdict";
import { LANGUAGES } from "../../apps/judge/src/local/languages";
import type { Candidate, BatteryManifest } from "../../apps/judge/src/audit/battery-types";
import { EDITORIAL_JUDGE_REVISION } from "../../packages/shared/src/editorial";
import { currentJudgeRevision, editorialHash, judgeFingerprint, loadEditorial, loadVerification, sha256, type AuditProblem } from "./evidence";
import { planLegacyCandidates, type CandidateReview } from "./candidates";

const option = (name: string) => process.argv.find(s => s.startsWith(`--${name}=`))?.slice(name.length+3);
type CheckedCandidate = Candidate & { expectation: "AC" | "REJECT" | "OBSERVE"; editorialContentHash?: string };
type CaseResult = { kind: "sample" | "hidden"; ord: number; verdict: string; timeMs?: number; memoryKb?: number | null; actualOutput?: string; diagnostic?: string };
async function main() {
  const root=process.cwd(), snapshotFile=option("snapshot"), output=resolve(option("out") ?? "generated/editorial-audit/baseline");
  const backend=option("backend") ?? "docker";
  if (!snapshotFile || !["docker","vercel"].includes(backend)) throw new Error("Explicit snapshot and supported backend required");
  const toolchain=backend==="docker"
    ? (await promisify(execFile)("docker",["image","inspect","oj-readiness-sandbox-fixture","--format","{{.Id}}"])).stdout.trim()
    : process.env.JUDGE_SANDBOX_SNAPSHOT_ID;
  if(!toolchain)throw new Error("An immutable sandbox toolchain identifier is required");
  if (![resolve(root,"generated")+sep,"/private/tmp/"].some(prefix=>output.startsWith(prefix))) throw new Error("Evidence must remain in an ignored/private directory");
  const snapshot=JSON.parse(await readFile(snapshotFile,"utf8"));
  if (sha256(JSON.stringify({problems:snapshot.problems,contests:snapshot.contests}))!==snapshot.contentHash) throw new Error("Snapshot fingerprint mismatch");
  const revision=await currentJudgeRevision(root);
  if (revision!==EDITORIAL_JUDGE_REVISION) throw new Error("Judge pipeline changed: update the reviewed revision before validating content");
  const selected=option("only")?.split(","), problems: AuditProblem[]=snapshot.problems;
  if (selected?.some(slug=>!problems.some(p=>p.slug===slug))) throw new Error("Unknown selected problem");
  const review=JSON.parse(await readFile(resolve(root,"packages/db/audit/launch-candidate-review.json"),"utf8"));
  const manifests=new Map<string,BatteryManifest>();
  for (const file of await readdir(resolve(root,"packages/db/audit/battery-manifests"))) if(file.endsWith(".json")) {
    const m=JSON.parse(await readFile(resolve(root,"packages/db/audit/battery-manifests",file),"utf8"));manifests.set(m.slug,m);
  }
  await mkdir(output,{recursive:true,mode:0o700});
  const summary: {slug:string; status:string; candidates:number; failures:number}[]=[];
  for(const p of problems.filter(p=>!selected||selected.includes(p.slug))) {
    const candidates: CheckedCandidate[]=[];
    const editorial=await loadEditorial(root,p.slug);
    const verification=editorial?await loadVerification(root,p.slug):null;
    const legacy=planLegacyCandidates(manifests.get(p.slug)?.candidates??[],review.reviews.filter((r:CandidateReview&{slug:string})=>r.slug===p.slug),verification?.review.retiredLegacyCandidates);
    candidates.push(...legacy.active);
    for(const c of review.additionalCandidates.filter((c: {slug:string})=>c.slug===p.slug)) candidates.push({...c,expectation:c.tag==="correct"?"AC":"REJECT"});
    if(editorial) for(const solution of editorial.solutions) candidates.push({tag:"correct",label:"Official editorial reference",...solution,expectation:"AC",editorialContentHash:editorialHash(editorial)});
    if(verification&&editorial) for(const mutation of verification.review.mutations) {
      const reference=editorial.solutions.find(s=>s.languageKey===mutation.languageKey);
      if(!reference||!mutation.find||reference.sourceCode.split(mutation.find).length!==2)throw new Error(`Stale or ambiguous mutation: ${p.slug}/${mutation.id}`);
      candidates.push({tag:mutation.expectation==="AC"?"correct":"custom",label:mutation.label,languageKey:reference.languageKey,sourceCode:reference.sourceCode.replace(mutation.find,mutation.replace),expectation:mutation.expectation??"REJECT"});
    }
    if(!p.testCases.length||!candidates.length) {
      summary.push({slug:p.slug,status:!p.testCases.length?"MISSING_LOCAL_CASES":"MISSING_CANDIDATES",candidates:candidates.length,failures:0});continue;
    }
    const fingerprint=judgeFingerprint(p), planHash=sha256(JSON.stringify({candidates:candidates.map(c=>({source:c.sourceCode,language:c.languageKey,expectation:c.expectation,content:c.editorialContentHash})),verificationHash:verification?.verificationHash,oracleHash:verification?.oracleHash}));
    const path=resolve(output,p.slug+".json");
    if(process.argv.includes("--resume")) {
      try { const prev=JSON.parse(await readFile(path,"utf8")); if(prev.complete&&prev.judgeFingerprint===fingerprint&&prev.planHash===planHash&&prev.judgeRevision===revision&&prev.backend===backend&&prev.toolchain===toolchain) {
        // Earlier audit versions distinguished successful execution from approval only
        // inside candidate reports. Surface unresolved expectations in the summary too.
        const unresolved=prev.reports.some((r:{expectation:string})=>r.expectation==="OBSERVE");
        const row={...prev.summary,status:prev.summary.failures||unresolved?"REQUIRES_REVIEW":"EXECUTION_PASSED"};
        summary.push(row);console.log(`${p.slug}: resumed ${row.status}`);continue;
      } }
      catch(error) { if((error as NodeJS.ErrnoException).code!=="ENOENT") throw error; }
    }
    const reports=[];let failures=0;
    for(const candidate of candidates) {
      const fixture=backend==="docker"?await createDockerSandbox(toolchain):await createVercelSandbox();
      const rows:CaseResult[]=[];let compileStatus="OK",submitStatus:string|undefined;
      try {
        const lang=LANGUAGES[candidate.languageKey];if(!lang)throw new Error("Unsupported candidate language");
        const compile=await compileInSandbox(fixture.sandbox,lang,candidate.sourceCode);
        if(!compile.ok) { compileStatus="CE";rows.push({kind:"hidden",ord:-1,verdict:"CE",diagnostic:compile.compileError}); }
        else {
          for(const group of [{kind:"sample" as const,cases:p.samples},{kind:"hidden" as const,cases:p.testCases}]) for(const tc of group.cases) {
            try {
              const run=await runOneCase(fixture.sandbox,lang.runCmd({memKb:p.memoryLimitKb}),tc.input,p.timeLimitMs*lang.timeMultiplier,p.memoryLimitKb,lang.ulimitMemory);
              const verdict=runtimeVerdict(run,p.memoryLimitKb)??(checkProblemOutput(p,tc.input,tc.output,run.stdout)?"AC":"WA");
              rows.push({kind:group.kind,ord:tc.ord,verdict,timeMs:run.timeMs,memoryKb:run.memoryKb,actualOutput:run.stdout,diagnostic:run.stderr});
            } catch { rows.push({kind:group.kind,ord:tc.ord,verdict:"SE"}); }
          }
          // Exercise Submit's actual aggregate evaluator too; this is separate from the loop
          // above, which deliberately keeps running every case after a mismatch.
          submitStatus=(await evaluateInSandbox(fixture.sandbox,p,p.testCases,candidate.languageKey,candidate.sourceCode)).status;
        }
      } catch { compileStatus="SE"; }
      finally { await fixture.stop(); }
      const hidden=rows.filter(r=>r.kind==="hidden"), aggregate=hidden.find(r=>r.verdict!=="AC")?.verdict??"AC";
      const infrastructureFailed=compileStatus!=="OK"||rows.some(r=>r.verdict==="SE")||submitStatus!==aggregate;
      const matched=candidate.expectation==="OBSERVE"?null:!infrastructureFailed&&(candidate.expectation==="AC"?rows.length===p.samples.length+p.testCases.length&&rows.every(r=>r.verdict==="AC"):hidden.some(r=>["WA","TLE","MLE","RE","OLE"].includes(r.verdict)));
      if(matched===false||infrastructureFailed)failures++;
      reports.push({tag:candidate.tag,label:candidate.label,languageKey:candidate.languageKey,sourceHash:sha256(candidate.sourceCode),editorialContentHash:candidate.editorialContentHash,expectation:candidate.expectation,compileStatus,submitStatus,matched,rows});
      console.log(`${p.slug}: ${candidate.label}: submit=${submitStatus??compileStatus}, samples=${rows.filter(r=>r.kind==="sample"&&r.verdict!=="AC").length} failures, expected=${candidate.expectation}`);
    }
    const unresolved=candidates.some(c=>c.expectation==="OBSERVE");
    const row={slug:p.slug,status:failures||unresolved?"REQUIRES_REVIEW":"EXECUTION_PASSED",candidates:candidates.length,failures};summary.push(row);
    await writeFile(path+".tmp",JSON.stringify({complete:true,checkedAt:new Date().toISOString(),backend,toolchain,judgeRevision:revision,judgeFingerprint:fingerprint,planHash,verificationHash:verification?.verificationHash,oracleHash:verification?.oracleHash,retiredLegacyCandidates:legacy.retired,summary:row,reports},null,2)+"\n",{mode:0o600});await rename(path+".tmp",path);
    await writeFile(resolve(output,"summary.json"),JSON.stringify({complete:false,snapshotHash:snapshot.contentHash,rows:summary},null,2)+"\n",{mode:0o600});
  }
  await writeFile(resolve(output,"summary.json"),JSON.stringify({complete:true,checkedAt:new Date().toISOString(),snapshotHash:snapshot.contentHash,backend,toolchain,judgeRevision:revision,rows:summary},null,2)+"\n",{mode:0o600});
  console.log(JSON.stringify({processed:summary.length,passed:summary.filter(r=>r.status==="EXECUTION_PASSED").length,review:summary.filter(r=>r.status==="REQUIRES_REVIEW").length,missing:summary.filter(r=>r.status.startsWith("MISSING")).length}));
  if(summary.some(r=>r.status!=="EXECUTION_PASSED"))process.exitCode=1;
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Editorial audit failed");process.exitCode=1;});
