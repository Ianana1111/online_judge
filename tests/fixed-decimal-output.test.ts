import {describe,expect,it} from "vitest";
import {checkFixedDecimalOutput} from "../apps/judge/src/local/fixedDecimalOutput";
describe("uniquely rounded geometry answers",()=>{
  it("accepts positive signs, signed zero and leading numeric zeros",()=>{
    expect(checkFixedDecimalOutput("0.00\n212.13","-0.00\n+00212.13")).toBe(true);
    expect(checkFixedDecimalOutput("Scenario #1\nFrog Distance = 5.000\n\nScenario #2\nFrog Distance = 1.414","Scenario #1\nFrog Distance = +5.000\n\nScenario #2\nFrog Distance = +1.414")).toBe(true);
  });
  it("rejects a wrong final digit and incorrect precision",()=>{
    for(const got of ["212.12","212.14","212.130","212.1","2.1213e2","NaN","Infinity"])expect(checkFixedDecimalOutput("212.13",got)).toBe(false);
  });
  it("preserves case labels, paragraph separation and all fields",()=>{
    const expected="Scenario #1\nFrog Distance = 1.414\n\nScenario #2\nFrog Distance = 5.000";
    for(const got of [expected.replace("#1","#2"),expected.replace("\n\n","\n"),expected+"\n0.000",expected.replace("1.414","1.415")])expect(checkFixedDecimalOutput(expected,got)).toBe(false);
  });
  it("compares decimal magnitude without losing integer precision",()=>{
    expect(checkFixedDecimalOutput("9007199254740993.00","9007199254740992.00")).toBe(false);
    expect(checkFixedDecimalOutput("9007199254740993.00","+9007199254740993.00")).toBe(true);
  });
});
