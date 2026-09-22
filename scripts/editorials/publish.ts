/** Default: review-only. --apply atomically applies guarded corpus changes and publishes
 * immutable verified editorial revisions. Never creates or rejudges user submissions.
 * Required: --original=... --proposed=... --evidence=... --only=slug,...
 * Evidence layout: docker/, vercel/, run-docker/, run-vercel/, corrected-oracle/.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { prisma } from "../../packages/db/src/index";
import { EDITORIAL_JUDGE_REVISION } from "../../packages/shared/src/editorial";
import { currentJudgeRevision, loadEditorial, loadVerification, sha256, validateSpecChanges, type AuditProblem } from "./evidence";
import { validatePublication } from "./publication";
import { applyPublications, type PublicationPlan } from "./apply";

async function main(){
  const option=(name:string)=>process.argv.find(s=>s.startsWith(`--${name}=`))?.slice(name.length+3);
  const originalFile=option("original"),proposedFile=option("proposed"),evidenceDir=option("evidence"),slugs=option("only")?.split(",");
  if(!originalFile||!proposedFile||!evidenceDir||!slugs?.length||slugs.length>25||new Set(slugs).size!==slugs.length)throw new Error("Explicit snapshots, evidence and at most 25 unique slugs are required");
  if(await currentJudgeRevision()!==EDITORIAL_JUDGE_REVISION)throw new Error("Judge revision changed");
  const read=async(file:string)=>JSON.parse(await readFile(file,"utf8"));
  const original=await read(originalFile),proposed=await read(proposedFile);
  for(const snapshot of [original,proposed])if(snapshot.contentHash!==sha256(JSON.stringify({problems:snapshot.problems,contests:snapshot.contests})))throw new Error("Snapshot fingerprint mismatch");
  const oracle=await read(resolve(evidenceDir,"corrected-oracle/oracle-report.json"));
  const plans:PublicationPlan[]=[];
  for(const slug of slugs){
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error("Invalid slug");
    const before=original.problems.find((p:AuditProblem)=>p.slug===slug) as AuditProblem|undefined;
    const after=proposed.problems.find((p:AuditProblem)=>p.slug===slug) as AuditProblem|undefined;
    const content=await loadEditorial(process.cwd(),slug);
    if(!before||!after||!content)throw new Error("Problem or editorial missing");
    const verification=await loadVerification(process.cwd(),slug);
    await validateSpecChanges(process.cwd(),before,after,verification.review);
    const files={docker:await read(resolve(evidenceDir,`docker/${slug}.json`)),vercel:await read(resolve(evidenceDir,`vercel/${slug}.json`)),runDocker:await read(resolve(evidenceDir,`run-docker/${slug}.json`)),runVercel:await read(resolve(evidenceDir,`run-vercel/${slug}.json`)),oracle};
    const proof=validatePublication(after,content,verification,files,process.env.JUDGE_SANDBOX_SNAPSHOT_ID??"");
    plans.push({slug,before,after,content,proof});
  }
  const apply=process.argv.includes("--apply");
  const result=await applyPublications(plans,apply);
  console.log(JSON.stringify({apply,problems:result},null,2));
}
main().catch(()=>{console.error("Publication refused: evidence or live-state checks failed. No partial transaction was committed.");process.exitCode=1;}).finally(()=>prisma.$disconnect());
