/** Opt-in execution evidence, using the real Run handler and sandbox compiler/runtime.
 * Only its read-only database lookup and standby-pool allocation are replaced. This
 * does not claim HTTP/queue delivery coverage; API/queue tests cover that separately.
 */
import { it, expect, vi } from "vitest";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import type { Sandbox } from "@vercel/sandbox";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createDockerSandbox } from "./support/docker-sandbox";
import { runTestCases } from "../apps/judge/src/local/testRun";
import { evaluateInSandbox } from "../apps/judge/src/local/evaluate";
import { sampleRevision } from "../packages/shared/src/sampleRevision";
import { EDITORIAL_JUDGE_REVISION } from "../packages/shared/src/editorial";
import { currentJudgeRevision, editorialHash, judgeFingerprint, loadEditorial, sha256, type AuditProblem } from "../scripts/editorials/evidence";

const state=vi.hoisted(()=>({problem:null as unknown,sandbox:null as unknown}));
vi.mock("../packages/db/src/index.ts",()=>({prisma:{problem:{findUnique:async()=>state.problem}}}));
vi.mock("../apps/judge/src/local/sandboxPool.js",()=>({notePoolActivity:()=>{},tryClaimPooledSandbox:async()=>null}));
vi.mock("../apps/judge/src/local/sandboxRun.js",async importOriginal=>({
  ...await importOriginal<typeof import("../apps/judge/src/local/sandboxRun")>(),
  createJudgeSandbox:async()=>state.sandbox,
}));

it.skipIf(!process.env.EDITORIAL_RUN_SNAPSHOT)("executes every available editorial through real Run and sample Submit handlers",async()=>{
  const snapshot=JSON.parse(await readFile(process.env.EDITORIAL_RUN_SNAPSHOT!,"utf8"));
  const selected=process.env.EDITORIAL_RUN_ONLY?.split(",");
  if(selected?.some(slug=>!snapshot.problems.some((p:AuditProblem)=>p.slug===slug)))throw new Error("Unknown selected Run problem");
  expect(sha256(JSON.stringify({problems:snapshot.problems,contests:snapshot.contests}))).toBe(snapshot.contentHash);
  expect(await currentJudgeRevision()).toBe(EDITORIAL_JUDGE_REVISION);
  const backend=process.env.RUN_VERCEL_SANDBOX_TESTS==="1"?"vercel":"docker";
  const output=resolve(process.env.EDITORIAL_RUN_OUT??"generated/editorial-run");
  if(![resolve("generated")+sep,"/private/tmp/"].some(prefix=>output.startsWith(prefix)))throw new Error("Private evidence directory required");
  await mkdir(output,{recursive:true,mode:0o700});
  const toolchain=backend==="docker"?(await promisify(execFile)("docker",["image","inspect","oj-readiness-sandbox-fixture","--format","{{.Id}}"])).stdout.trim():process.env.JUDGE_SANDBOX_SNAPSHOT_ID!;
  const actual=await vi.importActual<typeof import("../apps/judge/src/local/sandboxRun")>("../apps/judge/src/local/sandboxRun");
  const originalSnapshotId=process.env.JUDGE_SANDBOX_SNAPSHOT_ID;
  if(backend==="docker")process.env.JUDGE_SANDBOX_SNAPSHOT_ID="isolated-docker-fixture";
  let checked=0;
  try{
    for(const p of (snapshot.problems as AuditProblem[]).filter(p=>!selected||selected.includes(p.slug))){
      const content=await loadEditorial(process.cwd(),p.slug);
      if(!content){if(selected)throw new Error("Selected Run problem has no editorial");continue;}
      state.problem={...p,visibility:true};
      const reports=[];
      for(const solution of content.solutions){
        const fixture=backend==="docker"?await createDockerSandbox(toolchain):await (async()=>{const sandbox=await actual.createJudgeSandbox(toolchain,120_000);return {sandbox,stop:()=>sandbox.stop()};})();
        let stopped:Promise<unknown>|undefined;
        const stop=()=>stopped??=fixture.stop();
        state.sandbox=new Proxy(fixture.sandbox,{get(target,property){if(property==="stop")return stop;const value=Reflect.get(target,property);return typeof value==="function"?value.bind(target):value;}}) as Sandbox;
        try{
          // Submit is exercised first because Run stops its sandbox on completion.
          const submit=await evaluateInSandbox(fixture.sandbox,p,p.samples,solution.languageKey,solution.sourceCode);
          const run=await runTestCases(`editorial-${p.slug}`,p.id,solution.languageKey,solution.sourceCode,await Promise.all(p.samples.map(async sample=>({id:`sample-${sample.ord}`,sampleOrd:sample.ord,sampleRevision:await sampleRevision(sample.input,sample.output)}))));
          reports.push({languageKey:solution.languageKey,sourceHash:sha256(solution.sourceCode),run,submit});
        }finally{await stop();}
      }
      const complete=reports.every(r=>r.submit.status==="AC"&&r.run.status==="DONE"&&r.run.cases?.length===p.samples.length&&r.run.cases.every(c=>c.verdict==="AC"));
      await writeFile(resolve(output,`${p.slug}.json`),JSON.stringify({complete,scope:"real-handlers-with-read-only-snapshot-lookup",backend,toolchain,checkedAt:new Date().toISOString(),judgeRevision:EDITORIAL_JUDGE_REVISION,judgeFingerprint:judgeFingerprint(p),editorialContentHash:editorialHash(content),reports},null,2)+"\n",{mode:0o600});
      expect(complete,`${p.slug}: Run/Submit reference mismatch`).toBe(true);checked++;
    }
    expect(checked).toBeGreaterThan(0);
  }finally{if(originalSnapshotId===undefined)delete process.env.JUDGE_SANDBOX_SNAPSHOT_ID;else process.env.JUDGE_SANDBOX_SNAPSHOT_ID=originalSnapshotId;}
},1_800_000);
