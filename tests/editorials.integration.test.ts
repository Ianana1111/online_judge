import { seedFromSample, appendTestCase } from "../packages/db/scripts/testcase-seed-helper";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../packages/db/src/index";
import { EDITORIAL_JUDGE_REVISION } from "../packages/shared/src/editorial";
import { EditorialsService } from "../apps/api/src/problems/editorials.service";
import { editorialFixture } from "./support/editorial-fixture";
import { applyPublications, type PublicationPlan } from "../scripts/editorials/apply";
import { editorialHash, judgeFingerprint } from "../scripts/editorials/evidence";

describe.skipIf(process.env.RUN_DB_TESTS!=="1")("official editorial publication and data-version gates",()=>{
  const service=new EditorialsService(), problems:string[]=[], users:string[]=[], contests:string[]=[];
  let reader: Awaited<ReturnType<typeof user>>;
  beforeAll(async()=>{const u=new URL(process.env.DATABASE_URL??"invalid:");if(u.hostname!=="127.0.0.1"||u.port!=="55432"||u.pathname!=="/oj_test")throw new Error("Disposable database required");reader=await user();});
  afterAll(async()=>{await prisma.contest.deleteMany({where:{id:{in:contests}}});await prisma.problem.deleteMany({where:{id:{in:problems}}});await prisma.user.deleteMany({where:{id:{in:users}}});await prisma.$disconnect();});
  async function problem(){const p=await prisma.problem.create({data:{slug:randomUUID(),title:"Editorial test",statementMd:"Echo input"}});problems.push(p.id);return p;}
  async function user(){const u=await prisma.user.create({data:{handle:`ed_${randomUUID()}`,email:`${randomUUID()}@example.test`,plan:"PRO",planExpiresAt:new Date(Date.now()+3600_000)}});users.push(u.id);return u;}
  async function publish(id:string,overrides:Record<string,unknown>={}){
    const p=await prisma.problem.findUniqueOrThrow({where:{id}}),latest=await prisma.problemEditorial.findFirst({where:{problemId:id},orderBy:{revision:"desc"}});
    await prisma.problemEditorial.updateMany({where:{problemId:id,publishedAt:{not:null},supersededAt:null},data:{supersededAt:new Date()}});
    return prisma.problemEditorial.create({data:{problemId:id,revision:(latest?.revision??0)+1,content:editorialFixture(p.slug),contentHash:"fixture",judgeFingerprint:"fixture",judgeRevision:EDITORIAL_JUDGE_REVISION,verifiedProblemVersion:p.judgeDataVersion,verifiedAt:new Date(),validationReport:{privateCanary:"must-not-leak"},publishedAt:new Date(),...overrides}});
  }
  it("never returns paid content to anonymous, free, expired or refunded accounts", async () => {
    const p=await problem(), account=await user();await publish(p.id);
    expect(await service.detail(p.slug,null)).toEqual({status:"AUTH_REQUIRED"});
    for(const data of [
      {plan:"FREE" as const,planExpiresAt:new Date(Date.now()+3600_000)},
      {plan:"PRO" as const,planExpiresAt:null},
      {plan:"PRO" as const,planExpiresAt:new Date(Date.now()-1000)},
      {plan:"FREE" as const,planExpiresAt:null},
    ]){
      await prisma.user.update({where:{id:account.id},data});
      // The original request object still says PRO: access must use current DB state.
      expect(await service.detail(p.slug,account)).toEqual({status:"PRO_REQUIRED"});
      expect(await service.detail(p.slug,account,"en")).toEqual({status:"PRO_REQUIRED"});
    }
  });
  it("serves both languages to active Pro, keeps prepaid access after cancellation, and honors existing grants", async () => {
    const p=await problem(), account=await user();await publish(p.id);
    await prisma.user.update({where:{id:account.id},data:{planCancelRequested:true}});
    const zh=await service.detail(p.slug,account), en=await service.detail(p.slug,account,"en");
    expect(zh.status).toBe("AVAILABLE");expect(en.status).toBe("AVAILABLE");
    if(zh.status!=="AVAILABLE"||en.status!=="AVAILABLE")throw new Error("Expected Pro content");
    expect(zh.editorial.locale).toBe("zh-TW");expect(en.editorial.locale).toBe("en");
    expect(en.editorial.bodyMd).toContain("## Building the approach");
    expect(en.editorial.solutions[0].sourceCode).toBe(zh.editorial.solutions[0].sourceCode);
    expect(en.editorial).not.toHaveProperty("translations");expect(en.accessExpiresAt).not.toBeNull();
    await prisma.user.update({where:{id:account.id},data:{plan:"FREE",planExpiresAt:null,isStudent:true}});
    expect(await service.detail(p.slug,account)).toMatchObject({status:"AVAILABLE",accessExpiresAt:null});
    await prisma.user.update({where:{id:account.id},data:{isStudent:false,role:"ADMIN"}});
    expect(await service.detail(p.slug,{...account,role:"ADMIN"})).toMatchObject({status:"AVAILABLE",accessExpiresAt:null});
  });
  it("fails closed until English and Chinese explanations are both complete", async () => {
    const p=await problem();const {translations: _english,...legacy}=editorialFixture(p.slug);
    await publish(p.id,{content:legacy});
    expect(await service.detail(p.slug,reader)).toEqual({status:"REVIEW_REQUIRED"});
    expect(await service.detail(p.slug,reader,"en")).toEqual({status:"REVIEW_REQUIRED"});
  });
  it("checks current administrator authority before revealing hidden problem content", async () => {
    const p=await problem(), account=await user();await publish(p.id);
    await prisma.problem.update({where:{id:p.id},data:{visibility:false}});
    const staleAdmin={...account,role:"ADMIN" as const};
    await expect(service.detail(p.slug,staleAdmin)).rejects.toThrow("Problem not found");
    await prisma.user.update({where:{id:account.id},data:{role:"ADMIN"}});
    expect(await service.detail(p.slug,account)).toMatchObject({status:"AVAILABLE"});
    await prisma.user.update({where:{id:account.id},data:{role:"USER",plan:"FREE",planExpiresAt:null}});
    await expect(service.detail(p.slug,staleAdmin,"en")).rejects.toThrow("Problem not found");
  });
  it("keeps drafts unavailable, exposes only valid published content and never returns private evidence",async()=>{
    const p=await problem();expect(await service.detail(p.slug,reader)).toEqual({status:"NOT_READY"});
    const draft=await publish(p.id,{publishedAt:null});expect(await service.detail(p.slug,reader)).toEqual({status:"NOT_READY"});
    await prisma.problemEditorial.update({where:{id:draft.id},data:{publishedAt:new Date()}});
    const result=await service.detail(p.slug,reader);expect(result.status).toBe("AVAILABLE");expect(JSON.stringify(result)).not.toContain("must-not-leak");expect(JSON.stringify(result)).not.toContain("judgeFingerprint");
    await prisma.problem.update({where:{id:p.id},data:{visibility:false}});await expect(service.detail(p.slug,reader)).rejects.toThrow("Problem not found");
  });
  it("blocks that user's active exam even on a direct editorial URL, and opens it after expiry",async()=>{
    const [p,a,b]=await Promise.all([problem(),user(),user()]);await publish(p.id);
    const c=await prisma.contest.create({data:{slug:randomUUID(),title:"Editorial exam",problems:{create:{problemId:p.id,label:"A",ord:1}}}});contests.push(c.id);
    const attempt=await prisma.contestParticipant.create({data:{contestId:c.id,userId:a.id,endsAt:new Date(Date.now()+60_000)}});
    expect(await service.detail(p.slug,a)).toEqual({status:"EXAM_LOCKED"});expect((await service.detail(p.slug,b)).status).toBe("AVAILABLE");
    await prisma.contestParticipant.update({where:{id:attempt.id},data:{endsAt:new Date(Date.now()-1000)}});expect((await service.detail(p.slug,a)).status).toBe("AVAILABLE");
  });
  it("invalidates on case insert, answer update and deletion, but keeps no-op writes valid",async()=>{
    const p=await problem();await publish(p.id);
    const tc=await prisma.testCase.create({data:{problemId:p.id,ord:1,input:"1\n",output:"1\n"}});
    expect(await service.detail(p.slug,reader)).toEqual({status:"REVIEW_REQUIRED"});await publish(p.id);
    await prisma.testCase.update({where:{id:tc.id},data:{output:"1\n"}});expect((await service.detail(p.slug,reader)).status).toBe("AVAILABLE");
    await prisma.testCase.update({where:{id:tc.id},data:{output:"2\n"}});expect(await service.detail(p.slug,reader)).toEqual({status:"REVIEW_REQUIRED"});await publish(p.id);
    await prisma.testCase.delete({where:{id:tc.id}});expect(await service.detail(p.slug,reader)).toEqual({status:"REVIEW_REQUIRED"});
  });
  it("invalidates sample edits and changes to the statement, limits or checker",async()=>{
    const p=await problem();await publish(p.id);const sample=await prisma.sample.create({data:{problemId:p.id,ord:1,input:"1",output:"1"}});
    expect((await service.detail(p.slug,reader)).status).toBe("REVIEW_REQUIRED");await publish(p.id);
    await prisma.sample.update({where:{id:sample.id},data:{output:"2"}});expect((await service.detail(p.slug,reader)).status).toBe("REVIEW_REQUIRED");
    for(const data of [{statementMd:"New semantics"},{timeLimitMs:1234},{memoryLimitKb:32768},{checkerType:"EXACT" as const}]) {await publish(p.id);await prisma.problem.update({where:{id:p.id},data});expect((await service.detail(p.slug,reader)).status).toBe("REVIEW_REQUIRED");}
  });
  it("invalidates both problems when a sample is moved",async()=>{
    const [a,b]=await Promise.all([problem(),problem()]);const s=await prisma.sample.create({data:{problemId:a.id,ord:1,input:"1",output:"1"}});await publish(a.id);await publish(b.id);
    await prisma.sample.update({where:{id:s.id},data:{problemId:b.id}});expect((await service.detail(a.slug,reader)).status).toBe("REVIEW_REQUIRED");expect((await service.detail(b.slug,reader)).status).toBe("REVIEW_REQUIRED");
  });
  it("preserves the old published snapshot and requires a new revision for content edits",async()=>{
    const p=await problem(), first=await publish(p.id);
    await expect(prisma.problemEditorial.update({where:{id:first.id},data:{content:{changed:true}}})).rejects.toThrow();
    await expect(prisma.problemEditorial.create({data:{...first,id:randomUUID(),revision:2}})).rejects.toThrow();
    const second=await publish(p.id);expect(second.revision).toBe(2);
    const old=await prisma.problemEditorial.findUniqueOrThrow({where:{id:first.id}});expect(old.content).toEqual(first.content);expect(old.supersededAt).not.toBeNull();expect((await service.detail(p.slug,reader))).toMatchObject({status:"AVAILABLE",revision:2});
  });
  it("fails closed for an old judge implementation or malformed publication",async()=>{
    const p=await problem();await publish(p.id,{judgeRevision:"outdated-pipeline"});expect(await service.detail(p.slug,reader)).toEqual({status:"REVIEW_REQUIRED"});
    await publish(p.id,{content:{invalid:true}});expect(await service.detail(p.slug,reader)).toEqual({status:"REVIEW_REQUIRED"});
  });
  async function syntheticPlan():Promise<PublicationPlan>{
    const p=await problem();
    await prisma.sample.create({data:{problemId:p.id,ord:1,input:"1\n",output:"1\n"}});
    await prisma.testCase.create({data:{problemId:p.id,ord:1,input:"2\n",output:"incorrect\n"}});
    const before=await prisma.problem.findUniqueOrThrow({where:{id:p.id},include:{samples:true,testCases:true}});
    const after={...before,statementMd:"Corrected reviewed echo specification",checkerType:"EXACT" as const,testCases:before.testCases.map(c=>({...c,output:"2\n"}))};
    const content=editorialFixture(p.slug);
    // Transaction behavior only. This synthetic plan bypasses the CLI's separately
    // tested proof validator and is never written outside the disposable database.
    return {slug:p.slug,before,after,content,proof:{schemaVersion:1,judgeFingerprint:judgeFingerprint(after),contentHash:editorialHash(content),judgeRevision:EDITORIAL_JUDGE_REVISION,verificationHash:"synthetic",oracleHash:"synthetic",verifiedAt:new Date(),counts:{samples:1,hidden:1,solutions:1,mutations:2},artifacts:{synthetic:"synthetic"},toolchains:[],runScope:"synthetic-test"}};
  }
  it("previews without writes, applies corpus+publication atomically, and is idempotent",async()=>{
    const plan=await syntheticPlan();
    expect((await applyPublications([plan],false))[0].status).toBe("READY");
    expect((await prisma.testCase.findFirstOrThrow({where:{problemId:plan.before.id}})).output).toBe("incorrect\n");
    expect(await service.detail(plan.slug,reader)).toEqual({status:"NOT_READY"});
    expect((await applyPublications([plan],true))[0]).toMatchObject({status:"PUBLISHED",revision:1});
    expect((await service.detail(plan.slug,reader)).status).toBe("AVAILABLE");
    expect((await prisma.testCase.findFirstOrThrow({where:{problemId:plan.before.id}})).output).toBe("2\n");
    expect((await prisma.problem.findUniqueOrThrow({where:{id:plan.before.id}})).statementMd).toBe(plan.after.statementMd);
    const version=(await prisma.problem.findUniqueOrThrow({where:{id:plan.before.id}})).judgeDataVersion;
    expect((await applyPublications([plan],true))[0]).toMatchObject({status:"ALREADY_PUBLISHED",revision:1});
    expect((await prisma.problem.findUniqueOrThrow({where:{id:plan.before.id}})).judgeDataVersion).toBe(version);
  });
  it("rolls back the whole batch if a later problem changed after validation",async()=>{
    const plans=[await syntheticPlan(),await syntheticPlan()].sort((a,b)=>a.slug.localeCompare(b.slug));
    await prisma.problem.update({where:{id:plans[1].before.id},data:{statementMd:"Concurrent editor changed the statement"}});
    await expect(applyPublications(plans,true)).rejects.toThrow("Live content changed");
    expect((await prisma.testCase.findFirstOrThrow({where:{problemId:plans[0].before.id}})).output).toBe("incorrect\n");
    expect(await prisma.problemEditorial.count({where:{problemId:{in:plans.map(p=>p.before.id)}}})).toBe(0);
  });
  it("atomically applies reviewed titles and input/output specifications, including a later title-only correction",async()=>{
    const plan=await syntheticPlan();
    plan.after={...plan.after,title:"Correct problem title",inputSpecMd:"Reviewed input",outputSpecMd:"Reviewed output"};
    plan.proof={...plan.proof,judgeFingerprint:judgeFingerprint(plan.after)};
    expect((await applyPublications([plan],false))[0].status).toBe("READY");
    expect((await prisma.problem.findUniqueOrThrow({where:{id:plan.before.id}})).title).toBe(plan.before.title);
    await applyPublications([plan],true);
    const current=await prisma.problem.findUniqueOrThrow({where:{id:plan.before.id},include:{samples:true,testCases:true}});
    expect(current).toMatchObject({title:plan.after.title,inputSpecMd:plan.after.inputSpecMd,outputSpecMd:plan.after.outputSpecMd});
    const titleOnly={...plan,before:current,after:{...current,title:"Refined official title"}};
    expect(judgeFingerprint(titleOnly.after)).toBe(plan.proof.judgeFingerprint);
    expect((await applyPublications([titleOnly],true))[0].status).toBe("PUBLISHED");
    expect((await prisma.problem.findUniqueOrThrow({where:{id:current.id}})).title).toBe(titleOnly.after.title);
    expect((await applyPublications([titleOnly],true))[0].status).toBe("ALREADY_PUBLISHED");
  });
  it("refuses a concurrent title edit and rolls back earlier writes in the same batch",async()=>{
    const plans=[await syntheticPlan(),await syntheticPlan()].sort((a,b)=>a.slug.localeCompare(b.slug));
    plans[1].after.title="Reviewed correction";
    await prisma.problem.update({where:{id:plans[1].before.id},data:{title:"Concurrent title"}});
    await expect(applyPublications(plans,true)).rejects.toThrow("Live title changed");
    expect((await prisma.testCase.findFirstOrThrow({where:{problemId:plans[0].before.id}})).output).toBe("incorrect\n");
    expect(await prisma.problemEditorial.count({where:{problemId:{in:plans.map(p=>p.before.id)}}})).toBe(0);
  });
  it("blocks legacy replacement and append after any verified editorial, preserving all rows and versions",async()=>{
    for (const publishedAt of [null,new Date()]) {
      const p=await problem();
      await prisma.sample.create({data:{problemId:p.id,ord:1,input:"sample",output:"sample"}});
      await prisma.testCase.create({data:{problemId:p.id,ord:7,input:"reviewed",output:"reviewed"}});
      await publish(p.id,{publishedAt});
      const before=await prisma.problem.findUniqueOrThrow({where:{id:p.id},include:{testCases:true}});
      await expect(seedFromSample(p.slug,[{input:"old",output:"wrong"}])).rejects.toThrow("verified editorial corpus is protected");
      await expect(appendTestCase(p.slug,{input:"old",output:"wrong"})).rejects.toThrow("verified editorial corpus is protected");
      const after=await prisma.problem.findUniqueOrThrow({where:{id:p.id},include:{testCases:true}});
      expect(after.testCases).toEqual(before.testCases);expect(after.judgeDataVersion).toBe(before.judgeDataVersion);
    }
  });
  it("serializes concurrent legacy appends, preserves sparse ordinals and leading empty answers",async()=>{
    const p=await problem();await prisma.testCase.create({data:{problemId:p.id,ord:7,input:"original",output:"original"}});
    await Promise.all([appendTestCase(p.slug,{input:"A\r\n",output:"\nA\r\n"}),appendTestCase(p.slug,{input:"B\n",output:"B\n"})]);
    const rows=await prisma.testCase.findMany({where:{problemId:p.id},orderBy:{ord:"asc"}});
    expect(rows.map(row=>row.ord)).toEqual([7,8,9]);expect(rows[0].input).toBe("original");expect(rows.find(row=>row.input==="A\n")?.output).toBe("\nA\n");
    await prisma.sample.create({data:{problemId:p.id,ord:1,input:"bad sample",output:"bad sample"}});
    await seedFromSample(p.slug,[{input:"new\r\n",output:"new\r\n"}],0);
    expect(await prisma.testCase.findMany({where:{problemId:p.id},select:{ord:true,input:true,output:true}})).toEqual([{ord:1,input:"new\n",output:"new\n"}]);
  });

});
