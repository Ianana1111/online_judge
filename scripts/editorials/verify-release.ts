/** Offline release gate. Reads original/proposed snapshots and actual evidence; never
 * connects to the application database, creates sandboxes, publishes or edits a case.
 *
 * --original=... --proposed=... --audit-root=... --out=generated/.../release.json
 * [--only=slug,...] JUDGE_SANDBOX_SNAPSHOT_ID must identify the intended live toolchain.
 * Reports may be split between current-vercel/, continuation-vercel/ and batch/vercel/. Each oracle
 * family retains its own source hash; reports are not relabelled or merged as one oracle.
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { EDITORIAL_JUDGE_REVISION } from "../../packages/shared/src/editorial";
import { currentJudgeRevision, judgeFingerprint, loadEditorial, loadVerification, sha256, validateSpecChanges, type AuditProblem } from "./evidence";
import { validatePublication } from "./publication";

const option=(name:string)=>process.argv.find(s=>s.startsWith(`--${name}=`))?.slice(name.length+3);
const read=async(file:string)=>JSON.parse(await readFile(file,"utf8"));
async function optionalRead(file:string){
  try{return await read(file);}catch(error){if((error as NodeJS.ErrnoException).code==="ENOENT")return null;throw error;}
}

async function main(){
  const originalFile=option("original"),proposedFile=option("proposed"),auditRoot=option("audit-root"),out=resolve(option("out")??"");
  if(!originalFile||!proposedFile||!auditRoot||![resolve("generated")+sep,"/private/tmp/"].some(p=>out.startsWith(p)))throw new Error("Explicit snapshots, evidence root and private output required");
  const toolchain=process.env.JUDGE_SANDBOX_SNAPSHOT_ID;
  if(!toolchain)throw new Error("Intended live sandbox snapshot required");
  const revision=await currentJudgeRevision();if(revision!==EDITORIAL_JUDGE_REVISION)throw new Error("Judge source revision changed");
  const original=await read(originalFile),proposed=await read(proposedFile);
  for(const snapshot of [original,proposed])if(snapshot.contentHash!==sha256(JSON.stringify({problems:snapshot.problems,contests:snapshot.contests})))throw new Error("Snapshot fingerprint mismatch");
  const selected=option("only")?.split(",");
  if(selected?.some(slug=>!proposed.problems.some((p:AuditProblem)=>p.slug===slug)))throw new Error("Unknown selected problem");
  const oracles=[];
  const vercelDirectories=[resolve(auditRoot,"current-vercel"),resolve(auditRoot,"continuation-vercel")];
  for(const directory of await readdir(auditRoot,{withFileTypes:true}))if(directory.isDirectory()){
    vercelDirectories.push(resolve(auditRoot,directory.name,"vercel"));
    const file=resolve(auditRoot,directory.name,"corrected-oracle/oracle-report.json"),report=await optionalRead(file);
    if(report)oracles.push({file,report});
  }
  const rows=[];
  for(const after of proposed.problems as AuditProblem[]){
    if(selected&&!selected.includes(after.slug))continue;
    const content=await loadEditorial(process.cwd(),after.slug);
    if(!content){if(selected)throw new Error("Selected problem has no editorial");continue;}
    const before=original.problems.find((p:AuditProblem)=>p.slug===after.slug);
    if(!before)throw new Error("Original problem missing");
    const verification=await loadVerification(process.cwd(),after.slug);
    await validateSpecChanges(process.cwd(),before,after,verification.review);
    const oracle=oracles.find(o=>o.report.oracleHash===verification.oracleHash&&o.report.problems?.some((p:{slug:string})=>p.slug===after.slug));
    const paths={docker:resolve(auditRoot,`current-baseline/${after.slug}.json`),runDocker:resolve(auditRoot,`all-run-docker/${after.slug}.json`),runVercel:resolve(auditRoot,`all-run-vercel/${after.slug}.json`)};
    const docker=await optionalRead(paths.docker),runDocker=await optionalRead(paths.runDocker),runVercel=await optionalRead(paths.runVercel);
    const vercelPaths=vercelDirectories.map(d=>resolve(d,`${after.slug}.json`));
    const vercelReports=await Promise.all(vercelPaths.map(optionalRead));
    const candidates=vercelReports.flatMap((report,index)=>report?[{report,file:vercelPaths[index]}]:[]);
    const missing=[...(!docker?["Docker audit"]:[]),...(!runDocker?["Docker Run"]:[]),...(!runVercel?["Vercel Run"]:[]),...(!candidates.length?["Vercel audit"]:[]),...(!oracle?["Independent oracle"]:[])];
    if(missing.length){rows.push({slug:after.slug,status:"MISSING_EVIDENCE",missing});continue;}
    let accepted=false,reason="Evidence does not match the current source and corpus";
    for(const candidate of candidates){
      try{
        const proof=validatePublication(after,content,verification,{docker,vercel:candidate.report,runDocker,runVercel,oracle:oracle!.report},toolchain);
        rows.push({slug:after.slug,status:"VERIFIED_NOT_PUBLISHED",proof,files:{...paths,vercel:candidate.file,oracle:oracle!.file},beforeFingerprint:judgeFingerprint(before)});
        accepted=true;break;
      }catch(error){
        // Do not dump validation objects: they may contain private diagnostics.
        reason=error instanceof Error&&error.message.startsWith(after.slug+":")?error.message:"Evidence schema failed validation";
      }
    }
    if(!accepted)rows.push({slug:after.slug,status:"REQUIRES_REVIEW",reason});
  }
  const ready=rows.filter(r=>r.status==="VERIFIED_NOT_PUBLISHED").length;
  const report={checkedAt:new Date().toISOString(),scope:"Offline evidence only; live database state and deployment are not checked",originalSnapshotHash:original.contentHash,proposedSnapshotHash:proposed.contentHash,judgeRevision:revision,toolchain,ready,pending:rows.length-ready,rows};
  await mkdir(dirname(out),{recursive:true,mode:0o700});await writeFile(out,JSON.stringify(report,null,2)+"\n",{mode:0o600});
  console.log(JSON.stringify({checked:rows.length,ready,pending:rows.length-ready,scope:report.scope}));
  if(report.pending)process.exitCode=1;
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Release verification failed");process.exitCode=1;});
