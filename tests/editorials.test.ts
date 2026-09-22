import { describe, expect, it } from "vitest";
import { EDITORIAL_JUDGE_REVISION, officialEditorialSchema } from "../packages/shared/src/editorial";
import { currentJudgeRevision, judgeFingerprint, loadStatementCorrection, sha256, validateSpecChanges, validateTextCorrections, type AuditProblem } from "../scripts/editorials/evidence";

import { editorialFixture } from "./support/editorial-fixture";

describe("official editorial content and evidence fingerprints", () => {
  it("requires full sections, explanations, exact language identities and no duplicate language", () => {
    const content=editorialFixture();expect(officialEditorialSchema.safeParse(content).success).toBe(true);
    expect(officialEditorialSchema.safeParse({...content,bodyMd:content.bodyMd.replace("## 正確性","## 其他")}).success).toBe(false);
    expect(officialEditorialSchema.safeParse({...content,solutions:[...content.solutions,...content.solutions]}).success).toBe(false);
    expect(officialEditorialSchema.safeParse({...content,validationReport:{private:true}}).success).toBe(false);
  });
  it("binds the revision to the actual Submit and Run pipeline, not a manually asserted label", async () => {
    expect(await currentJudgeRevision()).toBe(EDITORIAL_JUDGE_REVISION);
  });
  it("invalidates evidence for answer, sample, statement and limit edits, independent of database IDs", () => {
    const p:AuditProblem={id:"one",slug:"echo",title:"Echo",uvaId:null,uvaPid:null,statementMd:"Echo input.",inputSpecMd:"Integer",outputSpecMd:"Same integer",sourceUrl:null,timeLimitMs:1000,memoryLimitKb:65536,checkerType:"EXACT",floatEps:null,samples:[{ord:1,input:"1\n",output:"1\n"}],testCases:[{ord:2,input:"2\n",output:"2\n"},{ord:1,input:"3\n",output:"3\n"}]};
    const hash=judgeFingerprint(p);
    expect(judgeFingerprint({...p,id:"another",testCases:[...p.testCases].reverse()})).toBe(hash);
    for(const change of [{statementMd:"Different requirement"},{timeLimitMs:2000},{checkerType:"IGNORE_TRAILING_WS" as const},{samples:[{ord:1,input:"1\n",output:"2\n"}]},{testCases:[...p.testCases,{ord:3,input:"4\n",output:"4\n"}]}]) expect(judgeFingerprint({...p,...change})).not.toBe(hash);
  });
  it("allows only the exact reviewed statement correction and refuses unrelated specification changes",async()=>{
    const before:AuditProblem={id:"fixture",slug:"uva-10908-largest-squares",title:"Largest Square",uvaId:10908,uvaPid:null,statementMd:"Old incorrect statement",inputSpecMd:"",outputSpecMd:"",sourceUrl:"https://onlinejudge.org/external/109/10908.pdf",timeLimitMs:2000,memoryLimitKb:65536,checkerType:"IGNORE_TRAILING_WS",floatEps:null,samples:[],testCases:[]};
    const correction={beforeHash:sha256(before.statementMd),file:"content/editorials/uva-10908-largest-squares/statement.md",reason:"Restores official centre-based problem",source:before.sourceUrl!};
    const statementMd=await loadStatementCorrection(process.cwd(),correction);
    const review={sources:[before.sourceUrl!],constraints:["Reviewed bounds"],independentMethod:"Independent oracle",oracleFile:"scripts/editorials/oracles/foundations.py",mutations:[],statementCorrection:correction};
    const after={...before,statementMd};
    await expect(validateSpecChanges(process.cwd(),before,after,review)).resolves.toBeUndefined();
    await expect(validateSpecChanges(process.cwd(),{...before,statementMd:"Changed concurrently"},after,review)).rejects.toThrow("Unreviewed statement");
    await expect(validateSpecChanges(process.cwd(),before,{...after,statementMd:statementMd+"\nUnreviewed extra rule"},review)).rejects.toThrow("Unreviewed statement");
    await expect(validateSpecChanges(process.cwd(),before,after,{...review,statementCorrection:undefined})).rejects.toThrow("Unreviewed statement");
    await expect(validateSpecChanges(process.cwd(),before,{...after,timeLimitMs:1},review)).rejects.toThrow("Other specification");
    await expect(loadStatementCorrection(process.cwd(),{...correction,file:"../../private/data"})).rejects.toThrow("Invalid statement");
  });
  it("binds local-only statement provenance to the reviewed slug and original hash",async()=>{
    const before:AuditProblem={id:"local",slug:"uva-10908-largest-squares",title:"Archived fixture",uvaId:null,uvaPid:null,statementMd:"Locally archived statement without a source URL",inputSpecMd:"",outputSpecMd:"",sourceUrl:null,timeLimitMs:2000,memoryLimitKb:65536,checkerType:"IGNORE_TRAILING_WS",floatEps:null,samples:[],testCases:[]};
    const beforeHash=sha256(before.statementMd);
    const correction={beforeHash,file:`content/editorials/${before.slug}/statement.md`,reason:"Explicit local clarification of the archived contract",source:`local-statement:${before.slug}:sha256:${beforeHash}`};
    const statementMd=await loadStatementCorrection(process.cwd(),correction);
    const review={sources:[correction.source],constraints:["Local archived statement"],independentMethod:"Independent oracle",oracleFile:"scripts/editorials/oracles/foundations.py",mutations:[],statementCorrection:correction};
    await expect(validateSpecChanges(process.cwd(),before,{...before,statementMd},review)).resolves.toBeUndefined();
    await expect(loadStatementCorrection(process.cwd(),{...correction,source:`local-statement:another-problem:sha256:${beforeHash}`})).rejects.toThrow("Invalid statement");
    await expect(loadStatementCorrection(process.cwd(),{...correction,source:`local-statement:${before.slug}:sha256:${"0".repeat(64)}`})).rejects.toThrow("Invalid statement");
    await expect(validateSpecChanges(process.cwd(),{...before,statementMd:"Changed archived bytes"},{...before,statementMd},review)).rejects.toThrow("Unreviewed statement");
  });
  it("accepts only reviewed text fields with exact before/after bytes, preserving judge evidence for title-only edits",async()=>{
    const before:AuditProblem={id:"text",slug:"echo",title:"Wrong imported title",uvaId:null,uvaPid:null,statementMd:"Echo input",inputSpecMd:"Old limit",outputSpecMd:"Echo output",sourceUrl:null,timeLimitMs:1000,memoryLimitKb:65536,checkerType:"EXACT",floatEps:null,samples:[],testCases:[]};
    const title={field:"title" as const,beforeHash:sha256(before.title),value:"Reviewed title",reason:"Restore the original problem identity",source:"https://example.test/official.pdf"};
    const input={field:"inputSpecMd" as const,beforeHash:sha256(before.inputSpecMd),value:"Reviewed limit",reason:"Match the official input bounds",source:title.source};
    const review={sources:[title.source],constraints:["Reviewed"],independentMethod:"Independent",oracleFile:"scripts/editorials/oracles/foundations.py",mutations:[],textCorrections:[title,input]};
    const after={...before,title:title.value,inputSpecMd:input.value};
    await expect(validateSpecChanges(process.cwd(),before,after,review)).resolves.toBeUndefined();
    expect(judgeFingerprint({...before,title:title.value})).toBe(judgeFingerprint(before));
    expect(judgeFingerprint(after)).not.toBe(judgeFingerprint(before));
    await expect(validateSpecChanges(process.cwd(),before,after,{...review,textCorrections:[]})).rejects.toThrow("Unreviewed text");
    await expect(validateSpecChanges(process.cwd(),{...before,title:"Concurrent edit"},after,review)).rejects.toThrow("Unreviewed text");
    await expect(validateSpecChanges(process.cwd(),before,{...after,inputSpecMd:"Unreviewed limit"},review)).rejects.toThrow("Unreviewed text");
    expect(()=>validateTextCorrections([title,title])).toThrow("Invalid text");
    expect(()=>validateTextCorrections([{...title,field:"timeLimitMs"} as never])).toThrow("Invalid text");
    expect(()=>validateTextCorrections([{...title,beforeHash:"invalid"}])).toThrow("Invalid text");
    expect(()=>validateTextCorrections([{...title,source:"file:///private/source"}])).toThrow("Invalid text");
  });
});
