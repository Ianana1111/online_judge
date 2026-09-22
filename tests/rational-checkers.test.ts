import { describe, expect, it } from "vitest";
import { checkOutputRows, decimalKey, rounded } from "../apps/judge/src/local/roundedOutput";
import { checkCenterOfMass, checkFlooded, checkHayPoints, checkHuffman, checkIntersectingLines, checkPrimeTime, checkRockPaperScissors, checkTightWords } from "../apps/judge/src/local/rationalCheckers";

describe("exact rational output fields",()=>{
  it("accepts both midpoint roundings, signs and zero; rejects adjacent non-midpoints",()=>{
    const rows=[[rounded(1n,8n,2)," ",rounded(-1n,8n,2)," ",rounded(0n,1n,2)]];
    expect(checkOutputRows(rows,"0.12 -0.13 -0.00\n")).toBe(true);
    expect(checkOutputRows(rows,"0.13 -0.12 0.00")).toBe(true);
    for(const output of ["0.11 -0.12 0.00","0.14 -0.12 0.00","NaN -0.12 0.00","0.125 -0.12 0.00","0.12 -0.12 0.00 extra"])expect(checkOutputRows(rows,output)).toBe(false);
    expect(checkOutputRows([[rounded(12349n,100000n,2)]],"0.13")).toBe(false);
    expect(checkOutputRows([[rounded(12349n,100000n,2)]],"0.12")).toBe(true);
  });
  it("handles huge leading zeros without huge integer conversion or quadratic blank trimming",()=>{
    expect(checkOutputRows([["x=",rounded(1n,1n,2)]],"\n".repeat(100000)+"x="+"0".repeat(100000)+"1.00\n")).toBe(true);
    expect(checkOutputRows([[rounded(1n,1n,2)]],"9".repeat(100000)+".00")).toBe(false);
  });
  it("preserves mandatory internal separators and literal labels",()=>{
    const rows=[["Case 1: ",rounded(1n,2n,2)],[""],["Case 2: ",rounded(1n,1n,2)],[""]];
    expect(checkOutputRows(rows,"Case 1: 0.50\n\nCase 2: 1.00\n\n")).toBe(true);
    expect(checkOutputRows(rows,"Case 1: 0.50\nCase 2: 1.00")).toBe(false);
    expect(checkOutputRows(rows,"Case 7: 0.50\n\nCase 2: 1.00")).toBe(false);
  });
  it("normalizes exact finite decimal spellings without unsafe exponent expansion",()=>{
    for(const text of ["150","150.0","+0015e1",".15e3","150000e-3"])expect(decimalKey(text)).toBe(decimalKey("150"));
    for(const text of ["NaN","Infinity","0x96","150 extra","1e9999999999999999999999999999"])expect(decimalKey(text)).toBe(null);
    expect(decimalKey("-0.000e9999999999999999999999999999")).toBe("0");
    expect(checkHayPoints("700150\n150\n","700150.00\n1.5e2\n")).toBe(true);
    expect(checkHayPoints("0.30000000000000000001","0.3")).toBe(false);
  });
});

describe("problem-specific rational contracts",()=>{
  it("validates every Euler polynomial singleton against independent odd trial division",()=>{
    let input="",expected="";
    for(let n=0;n<=10000;n++){
      const value=n*n+n+41;let prime=true;
      for(let d=3;d*d<=value;d+=2)if(value%d===0){prime=false;break;}
      input+=`${n} ${n}\n`;expected+=(prime?"100.00":"0.00")+"\n";
    }
    expect(checkPrimeTime(input,expected)).toBe(true);
    expect(checkPrimeTime("0 40\n39 40\n","97.56\n50.00")).toBe(true);
    expect(checkPrimeTime("0 40","97.57")).toBe(false);
  });
  it("accepts exact tournament midpoints but excludes drawn games from denominators",()=>{
    const games=["1 rock 2 scissors",...Array<string>(15).fill("1 rock 2 paper"),...Array<string>(4).fill("1 paper 2 paper")];
    const input=`2 20\n${games.join("\n")}\n1 1\n0\n`;
    expect(checkRockPaperScissors(input,"0.062\n0.938\n\n-")).toBe(true);
    expect(checkRockPaperScissors(input,"0.063\n0.937\n\n-")).toBe(true);
    expect(checkRockPaperScissors(input,"0.050\n0.750\n\n-")).toBe(false);
    expect(checkRockPaperScissors(input,"0.062\n0.938\n\n0.000")).toBe(false);
  });
  it("counts tight words independently by full enumeration of small alphabets",()=>{
    let input="",answer="";
    for(let k=0;k<=4;k++)for(let n=1;n<=6;n++){
      let count=0;const total=(k+1)**n;
      for(let code=0;code<total;code++){
        let copy=code,previous=-1,valid=true;
        for(let i=0;i<n;i++){const digit=copy%(k+1);copy=Math.floor(copy/(k+1));if(previous>=0&&Math.abs(digit-previous)>1)valid=false;previous=digit;}
        if(valid)count++;
      }
      input+=`${k} ${n}\n`;answer+=(100*count/total).toFixed(5)+"\n";
    }
    expect(checkTightWords(input,answer)).toBe(true);
    expect(checkTightWords("0 100\n1 100\n","100.00000\n100.00000")).toBe(true);
    expect(checkTightWords("2 5","40.74075")).toBe(false);
  });
  it("distinguishes coincident/parallel lines and exact positive and negative rounding ties",()=>{
    const input="4\n0 0 1 0 0 1 1 1\n0 0 1 1 2 2 3 3\n0 0 1 0 0 1 1 -7\n0 0 1 0 0 1 -1 -7\n";
    expect(checkIntersectingLines(input,"INTERSECTING LINES OUTPUT\nNONE\nLINE\nPOINT 0.12 0.00\nPOINT -0.13 -0.00\nEND OF OUTPUT")).toBe(true);
    expect(checkIntersectingLines(input,"INTERSECTING LINES OUTPUT\nNONE\nLINE\nPOINT 0.13 0.00\nPOINT -0.12 0.00\nEND OF OUTPUT")).toBe(true);
    expect(checkIntersectingLines("1\n0 0 1 0 0 1 1 -2","INTERSECTING LINES OUTPUT\nPOINT 0.34 0.00\nEND OF OUTPUT")).toBe(false);
  });
  it("counts only strictly submerged cells, including zero water and negative elevations",()=>{
    const input="1 2\n0 10\n1000\n1 2\n-10 -10\n0\n1 2\n-10 -10\n1\n0 0\n";
    expect(checkFlooded(input,"Region 1\nWater level is 10.00 meters.\n50.00 percent of the region is under water.\n\nRegion 2\nWater level is -10.00 meters.\n0.00 percent of the region is under water.\n\nRegion 3\nWater level is -10.00 meters.\n100.00 percent of the region is under water.\n")).toBe(true);
    expect(checkFlooded("1 2 0 10 1000 0 0","Region 1\nWater level is 10.00 meters.\n100.00 percent of the region is under water.")).toBe(false);
  });
  it("sorts unordered polygon vertices and uses area weights, not vertex averages",()=>{
    expect(checkCenterOfMass("4 0 1 1 0 0 0 1 1\n1\n","0.500 0.500")).toBe(true);
    expect(checkCenterOfMass("4 0 0 4 0 2 2 0 2\n0\n","1.556 0.889")).toBe(true);
    expect(checkCenterOfMass("4 0 0 4 0 2 2 0 2\n0\n","1.500 1.000")).toBe(false);
  });
  it("retains mandated Huffman codes while accepting either rational average midpoint",()=>{
    const input="2 3 1 1 14\n0",expected="Set 1; average length 1.13\n    A: 00\n    B: 01\n    C: 1\n";
    expect(checkHuffman(input,expected,expected)).toBe(true);
    expect(checkHuffman(input,expected,expected.replace("1.13","1.12"))).toBe(true);
    expect(checkHuffman(input,expected,expected.replace("1.13","1.14"))).toBe(false);
    expect(checkHuffman(input,expected,expected.replace("A: 00","A: 01").replace("B: 01","B: 00"))).toBe(false);
  });
});
