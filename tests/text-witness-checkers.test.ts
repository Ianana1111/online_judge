import { describe, expect, it } from "vitest";
import { checkExcuses,checkAnagrams,checkAustralianVoting,checkEquationSteps,equationState } from "../apps/judge/src/local/textWitnessCheckers";

describe("textual witnesses",()=>{
  it("accepts any tied excuse order while preserving each original byte and duplicate occurrence",()=>{
    const input='1 3\ndog\n  Dog dog!  \nDOG2dog\ndogmatic DOG\n1 2\nx\nSame text.\nSame text.\n';
    const good='Excuse Set #1\nDOG2dog\n  Dog dog!  \n\nExcuse Set #2\nSame text.\nSame text.\n';
    expect(checkExcuses(input,good)).toBe(true);
    expect(checkExcuses(input,good.replace('  Dog dog!  ','Dog dog!'))).toBe(false);
    expect(checkExcuses(input,good.replace('DOG2dog','dogmatic DOG'))).toBe(false);
    expect(checkExcuses(input,good.replace('Same text.\nSame text.','Same text.'))).toBe(false);
  });
  it("counts repeated keywords, alphabetic boundaries and all-zero ties",()=>{
    expect(checkExcuses('1 3\na\na a a\na1a\nbaab\n','Excuse Set #1\na a a')).toBe(true);
    expect(checkExcuses('1 2\na\nbbb\n123!?\n','Excuse Set #1\n123!?\nbbb')).toBe(true);
    expect(checkExcuses('1 2\na\nbbb\n123!?\n','Excuse Set #1\nbbb')).toBe(false);
  });
  it("accepts reordered anagrams but retains vocabulary multiplicity and consecutive width-three numbering",()=>{
    const input='1\n\n4\natol\nlato\natol\nabc\ntola\nzzz\nEND\n';
    const answer='Anagrams for: tola\n  1) lato\n  2) atol\n  3) atol\nAnagrams for: zzz\nNo anagrams for: zzz\n';
    expect(checkAnagrams(input,answer)).toBe(true);
    expect(checkAnagrams(input,answer.replace('  3) atol\n',''))).toBe(false);
    expect(checkAnagrams(input,answer.replace('  3) atol','  3) tola'))).toBe(false);
    expect(checkAnagrams(input,answer.replace('  2) atol','  4) atol'))).toBe(false);
    expect(checkAnagrams(input,answer.replace('  1) lato','1) lato'))).toBe(false);
    expect(checkAnagrams(input,answer.replace('No anagrams for: zzz','No anagrams for: aaa'))).toBe(false);
  });
  it("resets anagram query numbering and preserves dataset separators",()=>{
    const input='2\n1\na\na\na\nEND\n1\nb\nb\nEND\n';
    const answer='Anagrams for: a\n  1) a\nAnagrams for: a\n  1) a\n\nAnagrams for: b\n  1) b';
    expect(checkAnagrams(input,answer)).toBe(true);
    expect(checkAnagrams(input,answer.replace('\n\nAnagrams','\nAnagrams'))).toBe(false);
  });
  it("requires strict majority and allows tied winners in either order",()=>{
    const input='1\n\n3\nAlpha\nBeta\nGamma\n1 2 3\n1 2 3\n1 2 3\n2 1 3\n2 1 3\n3 2 1\n';
    expect(checkAustralianVoting(input,'Alpha\nBeta')).toBe(true);
    expect(checkAustralianVoting(input,'Beta\nAlpha')).toBe(true);
    expect(checkAustralianVoting(input,'Alpha')).toBe(false);
    expect(checkAustralianVoting(input,'Alpha\nGamma')).toBe(false);
  });
  it("eliminates all equal minima simultaneously and preserves identical candidate names",()=>{
    const input='2\n\n3\nAlpha\nBeta\nGamma\n1 2 3\n1 2 3\n2 3 1\n3 2 1\n\n2\nAlex\nAlex\n1 2\n2 1\n';
    expect(checkAustralianVoting(input,'Alpha\n\nAlex\nAlex')).toBe(true);
    expect(checkAustralianVoting(input,'Alpha\nGamma\n\nAlex\nAlex')).toBe(false);
    expect(checkAustralianVoting(input,'Alpha\n\nAlex')).toBe(false);
    expect(checkAustralianVoting('1\n\n2\n  First  \nSecond\n','Second\n  First  ')).toBe(true);
    expect(checkAustralianVoting('1\n\n1\n\n','\n')).toBe(true);
  });
  it("normalizes unary integer signs and operator spacing without allowing split numbers",()=>{
    expect(equationState(' 2 * - 003 + +0004 = Var ')).toBe(equationState('2*-3+4=Var'));
    expect(equationState('-0+0000=x')).toBe(equationState('0+0=x'));
    for(const malformed of ['1 2+3=x','1.0+2=x','1e2+3=x','--1+2=x','1+2=x=y','1+2=123','1+2=toolongname'])expect(equationState(malformed)).toBe(null);
  });
  it("requires every exact algebra state and variable, accepting compact formatting only",()=>{
    const expected='2 * -3 + -6 - 4 = r\n-6 + -6 - 4 = r\n-12 - 4 = r\n-16 = r\n\n1 + 2 = xyz\n3 = xyz\n';
    const answer='2*-3+-6-+4=r\n-6+-6-4=r\n-12-4=r\n-16=r\n\n+1+02=xyz\n3=xyz';
    expect(checkEquationSteps(expected,answer)).toBe(true);
    expect(checkEquationSteps(expected,answer.replace('-6+-6-4=r\n',''))).toBe(false);
    expect(checkEquationSteps(expected,answer.replace('-12-4=r','-10-6=r'))).toBe(false);
    expect(checkEquationSteps(expected,answer.replace('3=xyz','3=XYZ'))).toBe(false);
    expect(checkEquationSteps(expected,answer.replace('\n\n','\n'))).toBe(false);
  });
});
