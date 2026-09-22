/** Build a private proposed corpus. No database mutation. All replacements are guarded
 * by both input and expected-output hashes from the reviewed original snapshot. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { loadStatementCorrection, loadVerification, sha256 } from "./evidence";

async function main() {
  const option=(name:string)=>process.argv.find(s=>s.startsWith(`--${name}=`))?.slice(name.length+3);
  const input=option("snapshot"), reportFile=option("report"), out=resolve(option("out")??"");
  if(!input||!reportFile||![resolve("generated")+sep,"/private/tmp/"].some(p=>out.startsWith(p)))throw new Error("Explicit private paths required");
  const snapshot=JSON.parse(await readFile(input,"utf8")), report=JSON.parse(await readFile(reportFile,"utf8"));
  if(snapshot.contentHash!==sha256(JSON.stringify({problems:snapshot.problems,contests:snapshot.contests}))||snapshot.contentHash!==report.snapshotHash)throw new Error("Original snapshot mismatch");
  let replacements=0,additions=0;
  for(const row of report.problems) {
    const problem=snapshot.problems.find((p:{slug:string})=>p.slug===row.slug);
    if(!problem)throw new Error("Unknown problem");
    const verification=await loadVerification(process.cwd(),row.slug);
    if(report.oracleHash!==verification.oracleHash)throw new Error("Oracle source changed");
    for (const correction of verification.review.textCorrections ?? []) {
      if (problem[correction.field] === correction.value) continue;
      if (sha256(problem[correction.field]) !== correction.beforeHash) throw new Error("Text changed since review");
      problem[correction.field] = correction.value;
    }
    const correction=verification.review.statementCorrection;
    if(correction){
      const desired=await loadStatementCorrection(process.cwd(),correction);
      if(problem.statementMd!==desired){
        if(sha256(problem.statementMd)!==correction.beforeHash)throw new Error("Statement changed since review");
        problem.statementMd=desired;
      }
    }
    const change=verification.review.checkerChange;
    if(change&&problem.checkerType!==change.to){
      if(problem.checkerType!==change.from)throw new Error("Checker changed since review");
      problem.checkerType=change.to;
    }
    for(const replacement of row.proposedReplacements??[]) {
      if(!["samples","testCases"].includes(replacement.kind))throw new Error("Unknown case kind");
      const tc=problem[replacement.kind].find((c:{ord:number})=>c.ord===replacement.ord);
      if(!tc||sha256(tc.input)!==replacement.inputHash||sha256(tc.output)!==replacement.outputHash)throw new Error("Before-value mismatch");
      tc.input=replacement.input;tc.output=replacement.output;replacements++;
    }
    for(const addition of row.proposedAdditions??[]) {
      const existing=problem.testCases.find((c:{input:string})=>c.input===addition.input);
      if(existing){if(existing.output!==addition.output)throw new Error("Conflicting answer for an existing input");continue;}
      const ord=Math.max(0,...problem.testCases.map((c:{ord:number})=>c.ord))+1;
      problem.testCases.push({ord,input:addition.input,output:addition.output});additions++;
    }
  }
  snapshot.originalContentHash=snapshot.contentHash;
  snapshot.contentHash=sha256(JSON.stringify({problems:snapshot.problems,contests:snapshot.contests}));
  snapshot.proposedAt=new Date().toISOString();
  await writeFile(out,JSON.stringify(snapshot)+"\n",{mode:0o600});
  console.log(JSON.stringify({replacements,additions,contentHash:snapshot.contentHash}));
}
main().catch(()=>{console.error("Could not build guarded pilot proposal");process.exitCode=1;});
