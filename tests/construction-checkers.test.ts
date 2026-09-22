import { describe, expect, it } from "vitest";
import { checkMinimalCoverage, checkElephantChain, checkGrandDinner, checkMatrixDecompression } from "../apps/judge/src/local/constructionCheckers";

describe("constructive answers",()=>{
  it("accepts different optimal covers and rejects invented, redundant, unordered or gapped segments",()=>{
    const input="1\n5\n-1 3\n0 3\n3 5\n2 5\n0 1\n1 2\n0 0\n";
    for(const answer of ["2\n-1 3\n3 5","2\n0 3\n2 5","2\n+0000000000000 3\n2 5"])expect(checkMinimalCoverage(input,answer)).toBe(true);
    for(const answer of ["0","1\n0 5","2\n2 5\n0 3","3\n0 1\n1 2\n2 5","2\n0 1\n2 5","2\n0 3\n0 3","2\n0 3\n2 6","2\n0 3\n2 5\nextra"])expect(checkMinimalCoverage(input,answer)).toBe(false);
  });
  it("handles impossible and maximum zero-free point cases with required case separators",()=>{
    const input="2\n1\n-1 0\n2 5\n0 0\n1\n-1 0\n0 1\n1 1\n0 0\n";
    expect(checkMinimalCoverage(input,"0\n\n1\n0 1")).toBe(true);
    expect(checkMinimalCoverage(input,"0\n1\n0 1")).toBe(false);
    expect(checkMinimalCoverage(input,"0\n\n1\n-1 0")).toBe(false);
  });
  it("bounds malicious coordinate and count parsing",()=>{
    const input="1\n1\n0 1\n0 0\n";
    expect(checkMinimalCoverage(input,"1\n"+"9".repeat(100000)+" 1")).toBe(false);
    expect(checkMinimalCoverage(input,"9".repeat(100000))).toBe(false);
    expect(checkMinimalCoverage(input,"1\n0 NaN")).toBe(false);
  });
  it("accepts every optimal strict elephant chain, independent of reference IDs",()=>{
    const input="1 9\n2 8\n2 8\n3 7\n4 7\n";
    expect(checkElephantChain(input,"3\n1\n2\n4")).toBe(true);
    expect(checkElephantChain(input,"3\n1\n3\n5")).toBe(true);
    for(const answer of ["2\n1\n2","4\n1\n2\n3\n4","3\n1\n2\n2","3\n1\n2\n6","3\n1\n4\n5","3\n1\n2 4"])expect(checkElephantChain(input,answer)).toBe(false);
  });
  it("does not chain equal weights or equal IQs",()=>{
    expect(checkElephantChain("1 2\n1 1\n","1\n2")).toBe(true);
    expect(checkElephantChain("1 2\n1 1\n","2\n1\n2")).toBe(false);
    expect(checkElephantChain("1 1\n2 1\n","2\n1\n2")).toBe(false);
  });
  it("accepts alternate dinner assignments and rejects false impossibility, duplicate tables and overcapacity",()=>{
    const input="3 3\n2 2 2\n2 2 2\n0 0\n";
    expect(checkGrandDinner(input,"1\n1 2\n2 3\n1 3")).toBe(true);
    expect(checkGrandDinner(input,"1\n3 2\n1 3\n2 1")).toBe(true);
    for(const answer of ["0","1\n1 1\n2 3\n2 3","1\n1 2\n1 2\n1 2","1\n1 4\n2 3\n1 2","1\n1\n2 3\n1 2","1\n1 2\n2 3\n1 3\nextra"])expect(checkGrandDinner(input,answer)).toBe(false);
  });
  it("checks all team-subset capacity inequalities, not just total seats",()=>{
    const input="3 3\n3 3 3\n100 2 2\n1 2\n3\n100 100\n0 0\n";
    expect(checkGrandDinner(input,"0\n0")).toBe(true);
    expect(checkGrandDinner(input,"1\n1 2 3\n1 2 3\n1 2 3\n0")).toBe(false);
  });
  it("capacity inequalities agree with exhaustive small seating feasibility",()=>{
    const feasible=(teams:number[],caps:number[],at=0):boolean=>{
      if(at===teams.length)return true;
      for(let mask=0;mask<1<<caps.length;mask++){
        const chosen=caps.map((_,i)=>i).filter(i=>mask>>i&1);
        if(chosen.length!==teams[at]||chosen.some(i=>!caps[i]))continue;
        const next=[...caps];for(const i of chosen)next[i]--;
        if(feasible(teams,next,at+1))return true;
      }
      return false;
    };
    for(let a=1;a<=4;a++)for(let b=1;b<=4;b++)for(let c=1;c<=4;c++)for(let x=2;x<=4;x++)for(let y=2;y<=4;y++){
      const teams=[a,b,c],caps=[x,y,2],input=`3 3\n${teams.join(" ")}\n${caps.join(" ")}\n0 0\n`;
      expect(checkGrandDinner(input,"0")).toBe(!feasible(teams,caps));
    }
  });
  it("accepts any matrix matching both cumulative directions and cell bounds",()=>{
    const input="2\n2 2\n4 8\n4 8\n2 2\n4 8\n4 8\n";
    expect(checkMatrixDecompression(input,"Matrix 1\n1 3\n3 1\n\nMatrix 2\n2 2\n2 2")).toBe(true);
    expect(checkMatrixDecompression(input,"Matrix 1\n3 1\n1 3\nMatrix 2\n2 2\n2 2")).toBe(true);
    for(const answer of ["Matrix 1\n0 4\n4 0\nMatrix 2\n2 2\n2 2","Matrix 1\n1 3\n1 3\nMatrix 2\n2 2\n2 2","Matrix 1\n1 3\n3 1\nMatrix 2\n2 2\n2 3","Matrix 1\n1 3\n\n3 1\nMatrix 2\n2 2\n2 2","Matrix 7\n1 3\n3 1\nMatrix 2\n2 2\n2 2"])expect(checkMatrixDecompression(input,answer)).toBe(false);
  });
  it("rejects superficially matching cumulative totals with entries above twenty",()=>{
    const input="1\n2 2\n22 44\n22 44\n";
    expect(checkMatrixDecompression(input,"Matrix 1\n11 11\n11 11")).toBe(true);
    expect(checkMatrixDecompression(input,"Matrix 1\n21 1\n1 21")).toBe(false);
    expect(checkMatrixDecompression(input,"Matrix 1\n11 11\n11 11\nextra")).toBe(false);
  });
});
