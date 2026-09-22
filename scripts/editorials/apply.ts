import { prisma, Prisma } from "../../packages/db/src/index";
import type { OfficialEditorial } from "../../packages/shared/src/editorial";
import { judgeFingerprint, type AuditProblem } from "./evidence";
import type { validatePublication } from "./publication";

export type PublicationPlan={slug:string;before:AuditProblem;after:AuditProblem;content:OfficialEditorial;proof:ReturnType<typeof validatePublication>};

/** Internal transaction step. The CLI must validate every plan before calling this.
 * Separating it allows rollback/idempotency checks on synthetic isolated fixtures. */
export async function applyPublications(plans:PublicationPlan[],apply:boolean){
  return prisma.$transaction(async tx=>{
    if(!apply)await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const rows=[];
    // Stable lock order avoids deadlocks if separate reviewed batches overlap.
    for(const plan of plans.sort((a,b)=>a.slug.localeCompare(b.slug))){
      if(apply)await tx.$queryRaw`SELECT id FROM problems WHERE slug = ${plan.slug} FOR UPDATE`;
      const current=await tx.problem.findUnique({where:{slug:plan.slug},include:{samples:{orderBy:{ord:"asc"}},testCases:{orderBy:{ord:"asc"}}}});
      if(!current||!current.visibility)throw new Error("Visible target problem required");
      const hash=judgeFingerprint(current);
      if(hash!==judgeFingerprint(plan.before)&&hash!==plan.proof.judgeFingerprint)throw new Error("Live content changed since the reviewed snapshot");
      const changesTitle = plan.before.title !== plan.after.title;
      if (changesTitle && current.title !== plan.before.title && current.title !== plan.after.title) throw new Error("Live title changed since the reviewed snapshot");
      const active=await tx.problemEditorial.findFirst({where:{problemId:current.id,publishedAt:{not:null},supersededAt:null}});
      const alreadyCurrent=active&&hash===plan.proof.judgeFingerprint&&active.contentHash===plan.proof.contentHash&&active.verifiedProblemVersion===current.judgeDataVersion&&active.judgeRevision===plan.proof.judgeRevision&&active.judgeFingerprint===hash;
      if(alreadyCurrent&&(!changesTitle||current.title===plan.after.title)){rows.push({slug:plan.slug,status:"ALREADY_PUBLISHED",revision:active!.revision});continue;}
      if(!apply){rows.push({slug:plan.slug,status:"READY",samples:plan.after.samples.length,hidden:plan.after.testCases.length});continue;}
      const metadata: Prisma.ProblemUpdateInput = {};
      if (changesTitle && current.title !== plan.after.title) metadata.title = plan.after.title;
      for (const field of ["checkerType", "statementMd", "inputSpecMd", "outputSpecMd"] as const) if (current[field] !== plan.after[field]) Object.assign(metadata, { [field]: plan.after[field] });
      if (Object.keys(metadata).length) await tx.problem.update({where:{id:current.id},data:metadata});
      if(hash!==plan.proof.judgeFingerprint){
        for(const kind of ["samples","testCases"] as const){
          if(current[kind].some(c=>!plan.after[kind].some(a=>a.ord===c.ord)))throw new Error("Deleting existing cases is not supported");
          for(const desired of plan.after[kind]){
            const existing=current[kind].find(c=>c.ord===desired.ord);
            if(existing&&existing.input===desired.input&&existing.output===desired.output)continue;
            const data={input:desired.input,output:desired.output};
            if(kind==="samples"){
              if(existing)await tx.sample.update({where:{id:existing.id},data});
              else await tx.sample.create({data:{...data,problemId:current.id,ord:desired.ord}});
            }else{
              if(existing)await tx.testCase.update({where:{id:existing.id},data});
              else await tx.testCase.create({data:{...data,problemId:current.id,ord:desired.ord}});
            }
          }
        }
      }
      const verified=await tx.problem.findUniqueOrThrow({where:{id:current.id},include:{samples:true,testCases:true}});
      if(judgeFingerprint(verified)!==plan.proof.judgeFingerprint)throw new Error("Post-write corpus differs from the validated corpus");
      if(changesTitle&&verified.title!==plan.after.title)throw new Error("Post-write title differs from the reviewed title");
      const now=new Date(),last=await tx.problemEditorial.aggregate({where:{problemId:current.id},_max:{revision:true}});
      if(active)await tx.problemEditorial.update({where:{id:active.id},data:{supersededAt:now}});
      const revision=(last._max.revision??0)+1;
      await tx.problemEditorial.create({data:{problemId:current.id,revision,content:plan.content,contentHash:plan.proof.contentHash,judgeFingerprint:plan.proof.judgeFingerprint,judgeRevision:plan.proof.judgeRevision,verifiedProblemVersion:verified.judgeDataVersion,verifiedAt:plan.proof.verifiedAt,validationReport:JSON.parse(JSON.stringify(plan.proof)) as Prisma.InputJsonValue,publishedAt:now}});
      rows.push({slug:plan.slug,status:"PUBLISHED",revision});
    }
    return rows;
  },{maxWait:10_000,timeout:60_000,isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
}
