import {describe,expect,it} from "vitest";
import {checkKnowledgeGame,checkOreon} from "../apps/judge/src/local/setTreeCheckers";
describe("unordered knowledge sets",()=>{
  const input="10 4\n2 0\n2 100",expected="3\n2 5\n3 6\n3 10\n1\n1 2\n0";
  it("accepts permutations and opposite unordered endpoints",()=>expect(checkKnowledgeGame(input,expected,"3\n10 3\n5 2\n6 3\n1\n2 1\n0\n")).toBe(true));
  it("rejects duplicate, omitted, impossible and cross-dataset pairs",()=>{
    for(const output of [expected.replace("3 6","2 5"),expected.replace("3 6\n",""),expected.replace("3 10","3 3"),expected.replace("1 2","1 3"),expected+"\n0",expected.replace("3 6","3e0 6")])expect(checkKnowledgeGame(input,expected,output)).toBe(false);
  });
  it("rejects invalid trusted expected records",()=>expect(()=>checkKnowledgeGame("2 0","1\n1 1","1\n1 2")).toThrow());
});
describe("minimum tunnel tree witnesses",()=>{
  const input="1\n4\n0,1,1,1\n1,0,1,1\n1,1,0,1\n1,1,1,0";
  it("accepts different minimum trees and arbitrary edge ordering",()=>{
    expect(checkOreon(input,"Case 1:\nA-B 1\nA-C 1\nA-D 1")).toBe(true);
    expect(checkOreon(input,"Case 1:\nD-C 1\nB-A 1\nC-B 1")).toBe(true);
  });
  it("rejects cycles, wrong weights, endpoints, omissions and headers",()=>{
    for(const answer of ["Case 1:\nA-B 1\nB-C 1\nC-A 1","Case 1:\nA-B 1\nA-C 1\nA-D 0","Case 1:\nA-B 1\nA-C 1\nA-Z 1","Case 1:\nA-B 1\nA-C 1","Case 2:\nA-B 1\nA-C 1\nA-D 1"])expect(checkOreon(input,answer)).toBe(false);
  });
  it("rejects a valid but nonminimum spanning tree and absent zero edges",()=>{
    const data="1\n3\n0 1 3\n1 0 1\n3 1 0";expect(checkOreon(data,"Case 1:\nA-B 1\nA-C 3")).toBe(false);
    expect(checkOreon("1\n3\n0 1 0\n1 0 1\n0 1 0","Case 1:\nA-B 1\nA-C 0")).toBe(false);
  });
  it("handles exact large integer weights and a one-city empty tree",()=>{
    expect(checkOreon("2\n1\n0\n2\n0 9007199254740993\n9007199254740993 0","Case 1:\nCase 2:\nB-A 9007199254740993")).toBe(true);
    expect(checkOreon("1\n2\n0 9007199254740993\n9007199254740993 0","Case 1:\nA-B 9007199254740992")).toBe(false);
  });
});
