import { expect,it } from "vitest";
import { checkProblemOutput } from "../apps/judge/src/local/checkers";
import { supportsLocalChecker } from "../packages/shared/src/judge";

const problem={uvaId:100,checkerType:"SPECIAL" as const,floatEps:null};
it("accepts the multiple separating spaces explicitly allowed by UVa 100",()=>{
  expect(supportsLocalChecker(problem)).toBe(true);
  for(const output of ["1 10 20\n10 1 20\n","1   10   20\n10  1  20\r\n","  +001  10  020 \n10\t1\t20\n"])
    expect(checkProblemOutput(problem,"1 10\n10 1\n","1 10 20\n10 1 20\n",output)).toBe(true);
});
it("still rejects wrong values, changed endpoint order, missing lines and diagnostic text",()=>{
  for(const output of ["1 10 19\n10 1 20\n","1 10 20\n1 10 20\n","1 10 20 10 1 20\n","1 10 20\n","1 10 20\n\n10 1 20\n","1 10 20\n10 1 2e1\n","1 10 20\n10 1 20\nDone\n"])
    expect(checkProblemOutput(problem,"1 10\n10 1\n","1 10 20\n10 1 20\n",output)).toBe(false);
});
it("does not change a problem that explicitly requires one space or a case separator",()=>{
  expect(checkProblemOutput({uvaId:441,checkerType:"IGNORE_TRAILING_WS",floatEps:null},"","1 2 3 4 5 6\n","1  2 3 4 5 6\n")).toBe(false);
  expect(checkProblemOutput({uvaId:11005,checkerType:"IGNORE_TRAILING_WS",floatEps:null},"","Case 1:\nX\n\nCase 2:\nY\n","Case 1:\nX\nCase 2:\nY\n")).toBe(false);
});
