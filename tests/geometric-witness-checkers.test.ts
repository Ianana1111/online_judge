import {describe,expect,it} from "vitest";
import {checkSnowClearing,checkSuperman,checkCircleBox,circleBoxWidth,integerSquareRoot} from "../apps/judge/src/local/geometricWitnessCheckers";
describe("geometric nearest rounding",()=>{
  it("recognizes exact big-integer roots without floating conversions",()=>{
    const n=12345678901234567890n;expect(integerSquareRoot(n*n)).toBe(n);expect(integerSquareRoot(n*n-1n)).toBe(n-1n);expect(integerSquareRoot(n*n+1n)).toBe(n);expect(integerSquareRoot(0n)).toBe(0n);
  });
  it("accepts both exact half-minute answers and rejects nonnearest times",()=>{
    const input="2\n\n0 0\n0 0 250 0\n\n0 0\n0 0 1000 0\n",expected="0:02\n\n0:06";
    expect(checkSnowClearing(input,expected,"0:01\n\n0:06")).toBe(true);expect(checkSnowClearing(input,expected,expected)).toBe(true);
    for(const bad of ["0:00\n\n0:06","0:02\n\n0:05","0:02\n0:06","0:02\n\n0:60"])expect(checkSnowClearing(input,expected,bad)).toBe(false);
    expect(checkSnowClearing("1\n\n0 0\n0 0 249 1\n","0:01","0:02")).toBe(false);
  });
  it("clips spheres to the actual segment and rejects infinite chords",()=>{
    const input="Half\n0 0 0 10 0 0\n1\n0 0 0 5\nInside\n0 0 0 10 0 0\n1\n5 0 0 10\nTangent\n0 0 0 10 0 0\n1\n5 1 0 1";
    expect(checkSuperman(input,"Half\n50.00\nInside\n100.00\nTangent\n0.00","Half\n+50.00\nInside\n100.00\nTangent\n-0.00")).toBe(true);
    expect(checkSuperman(input,"Half\n50.00\nInside\n100.00\nTangent\n0.00","Half\n100.00\nInside\n100.00\nTangent\n0.00")).toBe(false);
  });
  it("allows an exact percentage midpoint but not its further neighbors",()=>{
    // Flight length32; only the final1 metre is inside a radius1 sphere: 3.125%.
    const input="Tie\n-16 0 0 16 0 0\n1\n16 0 0 1";
    expect(checkSuperman(input,"Tie\n3.12","Tie\n3.13")).toBe(true);expect(checkSuperman(input,"Tie\n3.13","Tie\n3.12")).toBe(true);expect(checkSuperman(input,"Tie\n3.12","Tie\n3.14")).toBe(false);
  });
  it("requires the independently rounded unique irrational percentage",()=>{
    const input="Irr\n-10 0 0 10 0 0\n1\n0 1 0 2";
    expect(checkSuperman(input,"Irr\n17.32","Irr\n+17.32")).toBe(true);expect(checkSuperman(input,"Irr\n17.32","Irr\n17.33")).toBe(false);
  });
  it("accepts both nearest box midpoint values but not adjacent errors",()=>{
    expect(checkCircleBox("1\n1 0.000250","0.000")).toBe(true);expect(checkCircleBox("1\n1 0.000250","0.001")).toBe(true);expect(checkCircleBox("1\n1 0.000250","0.002")).toBe(false);
    expect(checkCircleBox("1\n3 2 1 2","9.657")).toBe(true);expect(checkCircleBox("1\n3 2 1 2","9.658")).toBe(false);
    expect(checkCircleBox("1\n2 100 1","200.000")).toBe(true);
  });
  it("checks all previous circles, not just neighbors",()=>{
    expect(circleBoxWidth([4,0.01,4])).toBeCloseTo(16,10);expect(checkCircleBox("1\n3 4 0.01 4","8.800")).toBe(false);
  });
  it("enforces finite, exactly six-decimal radius inputs",()=>{
    expect(checkCircleBox("1\n1 1e-6","0.000")).toBe(true);expect(checkCircleBox("1\n1 1e4","20000.000")).toBe(true);
    for(const radius of ["0","-1","Infinity","NaN","1.0000001","1e-7","10000.000001","1e100000"])expect(()=>checkCircleBox("1\n1 "+radius,"0.000")).toThrow();
  });
});
