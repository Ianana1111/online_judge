import { describe, expect, it } from "vitest";
import { checkFormattingText } from "../apps/judge/src/local/formattingTextChecker";
import { checkProblemOutput } from "../apps/judge/src/local/checkers";
describe("formatting-text semantic checker", () => {
  const input = "7\na bb\n\n10\nhi\n\n0\n", expected = "a    bb\n\nhi\n\n";
  it("accepts full-width lines, unpadded singletons and CRLF", () => {
    expect(checkFormattingText(input, expected, expected)).toBe(true);
    expect(checkFormattingText(input, expected, expected.replace(/\n/g, "\r\n"))).toBe(true);
    expect(checkProblemOutput({ checkerType: "SPECIAL", uvaId: 709, floatEps: null }, input, expected, expected)).toBe(true);
  });
  it("rejects altered words, missing paragraphs and ignored whitespace", () => {
    for (const bad of [expected.replace("bb", "bc"), expected.replace("a    bb", "a bb"), expected.replace("hi", "hi        "), expected.replace(/\n\n/g, "\n"), "\n" + expected]) expect(checkFormattingText(input, expected, bad)).toBe(false);
  });
  it("rejects same-cost gaps placed in the wrong order", () => {
    expect(checkFormattingText("8\na b c\n\n0\n", "a  b   c\n", "a   b  c\n")).toBe(false);
  });
  it("compares gaps across singleton and different line breaks", () => {
    const lengths = [14,32,6,8,6,15,34,31,23,22,2,9,18,19,20,3,23,30,11], words = lengths.map((n,i) => String.fromCharCode(65+i).repeat(n));
    const format = (ends: number[]) => { let i = 0; return ends.map(end => { const row = words.slice(i,end); i=end; const count=row.length-1, spaces=34-row.join("").length; return row.map((word,k)=> (k ? " ".repeat(Math.floor(spaces/count)+(k-1>=count-spaces%count?1:0)) : "")+word).join(""); }).join("\n"); };
    const good=format([1,2,3,6,7,8,9,11,13,14,15,17,18,19]), bad=format([1,2,4,6,7,8,9,11,13,14,15,17,18,19]);
    expect(checkFormattingText("34\n"+words.join(" ")+"\n\n0\n",good,good)).toBe(true);
    expect(checkFormattingText("34\n"+words.join(" ")+"\n\n0\n",good,bad)).toBe(false);
  });
  it("fails closed on invalid input and expected witnesses", () => {
    expect(()=>checkFormattingText("81\nx\n\n0\n","x","x")).toThrow();
    expect(()=>checkFormattingText(input,"a bb\n\nhi",expected)).toThrow();
  });
});
