import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { prisma } from "../packages/db/src/index";
async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "invalid:"); assert.equal(url.hostname,"127.0.0.1"); assert.equal(url.port,"55432"); assert.equal(url.pathname,"/oj_test");
  const snapshot = JSON.parse(await readFile(process.argv[2],"utf8")); assert.equal(createHash("sha256").update(JSON.stringify({ problems:snapshot.problems, contests:snapshot.contests })).digest("hex"),snapshot.contentHash);
  const changes = JSON.parse(await readFile(new URL("../packages/db/audit/iteration-regressions.json",import.meta.url),"utf8"));
  const slugs = changes.cases.map((c: {slug:string})=>c.slug), ids: string[]=[];
  assert.equal(await prisma.problem.count({ where: {slug:{in:slugs}} }),0,"Use an empty disposable fixture namespace");
  try {
    for(const slug of slugs) {
      const p = snapshot.problems.find((row:{slug:string})=>row.slug===slug);
      const row = await prisma.problem.create({data:{slug,title:p.title,statementMd:p.statementMd,testCases:{create:p.testCases.map((c:{ord:number;input:string;output:string})=>({ord:c.ord,input:c.input,output:c.output}))},samples:{create:{ord:1,input:p.testCases[0].input,output:p.testCases[0].output}}}}); ids.push(row.id);
    }
    // Execute the actual SQL under test; repeated application must not add duplicates or alter
    // already-correct output. Migration deploy is verified separately after the fixture check.
    const sql = await readFile(new URL("../packages/db/prisma/migrations/20260913040000_judge_and_operations/migration.sql",import.meta.url),"utf8");
    const {spawn} = await import("node:child_process");
    for(let run=0;run<2;run++) await new Promise<void>((resolve,reject)=>{
      const child=spawn("docker",["compose","-p","oj-readiness","-f","compose.test.yml","exec","-T","postgres","psql","-X","-v","ON_ERROR_STOP=1","-U","oj_test","-d","oj_test"],{cwd:fileURLToPath(new URL("../",import.meta.url)),stdio:["pipe","ignore","pipe"]});
      child.on("error",reject);child.stdin.on("error",reject);child.on("exit",(code)=>code===0?resolve():reject(new Error("Migration fixture SQL failed")));child.stdin.end(sql);
    });
    for(const change of changes.cases){const p=await prisma.problem.findUniqueOrThrow({where:{slug:change.slug},include:{testCases:true}});const matches=p.testCases.filter(c=>c.input===change.input);assert.equal(matches.length,1);assert.equal(matches[0].output,change.output);}
    for(const change of changes.corrections){const p=await prisma.problem.findUniqueOrThrow({where:{slug:change.slug},include:{testCases:true}});assert.equal(p.testCases.find(c=>c.input===change.input)?.output,change.output);}
    console.log(JSON.stringify({migrationFixture:"passed",problems:slugs.length,newCases:changes.cases.length,correctedOutputs:changes.corrections.length,reapply:"idempotent"}));
  } finally {await prisma.problem.deleteMany({where:{id:{in:ids}}});await prisma.$disconnect();}
  await promisify(execFile)("pnpm",["--filter","@oj/db","exec","prisma","migrate","deploy"],{cwd:fileURLToPath(new URL("../",import.meta.url)),env:process.env});
}
main().catch(error=>{console.error(error instanceof Error?error.message:"Migration verification failed");process.exitCode=1;});
