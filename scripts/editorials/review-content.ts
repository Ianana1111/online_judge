/** Record a completed teaching review against an immutable, already executed baseline.
 * --baseline=directory --release=accepted-release.json --snapshot=proposed.json
 * --out=generated/.../content-revisions --only=slug,... --reviewed
 * This checks source equality and all existing execution evidence. It does not
 * translate text, claim a new Sandbox run, publish content, or edit old reports. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { editorialHash, loadEditorial, loadVerification, currentJudgeRevision, sha256, type AuditProblem } from "./evidence";
import { validateContentRevision } from "./content-revision";
import { EDITORIAL_JUDGE_REVISION } from "../../packages/shared/src/editorial";

async function main() {
  const option=(name:string)=>process.argv.find(s=>s.startsWith(`--${name}=`))?.slice(name.length+3);
  const baseline=option("baseline"), releaseFile=option("release"), snapshotFile=option("snapshot"), output=resolve(option("out")??""), slugs=option("only")?.split(",");
  if(!baseline||!releaseFile||!snapshotFile||!slugs?.length||!process.argv.includes("--reviewed"))throw new Error("Explicit baseline, accepted release, snapshot, reviewed slugs and output are required");
  if(![resolve("generated")+sep,"/private/tmp/"].some(p=>output.startsWith(p)))throw new Error("Private review output required");
  const read=async(file:string)=>JSON.parse(await readFile(file,"utf8"));
  const release=await read(releaseFile),snapshot=await read(snapshotFile);
  if(sha256(JSON.stringify({problems:snapshot.problems,contests:snapshot.contests}))!==snapshot.contentHash||release.proposedSnapshotHash!==snapshot.contentHash)throw new Error("Reviewed corpus changed");
  if(await currentJudgeRevision()!==EDITORIAL_JUDGE_REVISION||release.judgeRevision!==EDITORIAL_JUDGE_REVISION)throw new Error("Judge changed; fresh execution required");
  await mkdir(output,{recursive:true,mode:0o700});
  for(const slug of slugs){
    const accepted=release.rows.find((r:{slug:string})=>r.slug===slug);
    if(accepted?.status!=="VERIFIED_NOT_PUBLISHED")throw new Error(`${slug}: no accepted baseline`);
    const problem=snapshot.problems.find((p:AuditProblem)=>p.slug===slug);
    const previousContent=await loadEditorial(resolve(baseline),slug),content=await loadEditorial(process.cwd(),slug);
    if(!problem||!previousContent||!content?.translations?.en)throw new Error(`${slug}: incomplete bilingual review`);
    const verification=await loadVerification(process.cwd(),slug);
    const files={docker:await read(accepted.files.docker),vercel:await read(accepted.files.vercel),runDocker:await read(accepted.files.runDocker),runVercel:await read(accepted.files.runVercel),oracle:await read(accepted.files.oracle)};
    const revision={schemaVersion:1,previousContent,review:{slug,previousContentHash:editorialHash(previousContent),revisedContentHash:editorialHash(content),reviewedAt:new Date().toISOString(),checklist:{chineseTeaching:true,englishTeaching:true,workedExample:true,correctnessAndComplexity:true,sourceUnchanged:true}}};
    const proof=validateContentRevision(problem,content,verification,files,release.toolchain,revision);
    if(JSON.stringify(proof.artifacts)!==JSON.stringify(accepted.proof.artifacts))throw new Error(`${slug}: original execution artifacts changed`);
    await writeFile(resolve(output,`${slug}.json`),JSON.stringify(revision,null,2)+"\n",{mode:0o600});
    console.log(`${slug}: bilingual teaching reviewed; exact previously judged source retained`);
  }
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Teaching review refused");process.exitCode=1;});
