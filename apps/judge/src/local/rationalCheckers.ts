import { checkOutputRows, decimalKey, rounded, type OutputField } from "./roundedOutput.js";

let primePrefix: number[] | undefined;
function eulerPrimePrefix(): number[] {
  if (primePrefix) return primePrefix;
  const composite = new Uint8Array(10002), primes: number[] = [];
  for (let i = 2; i <= 10001; i++) {
    if (composite[i]) continue;
    primes.push(i);
    for (let j = i * i; j <= 10001; j += i) composite[j] = 1;
  }
  const prefix = [0];
  for (let n = 0; n <= 10000; n++) {
    const value = n * n + n + 41;
    let prime = true;
    for (const divisor of primes) {
      if (divisor * divisor > value) break;
      if (value % divisor === 0) { prime = false; break; }
    }
    prefix.push(prefix[n] + Number(prime));
  }
  primePrefix = prefix;
  return prefix;
}
export function checkPrimeTime(input: string, actual: string): boolean {
  const tokens = input.trim().split(/\s+/).map(Number), prefix = eulerPrimePrefix(), rows: OutputField[][] = [];
  if (tokens.length % 2) throw new Error("Invalid Prime Time input");
  for (let i = 0; i < tokens.length; i += 2) {
    const a = tokens[i], b = tokens[i + 1];
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || a > b || b > 10000) throw new Error("Invalid Prime Time interval");
    rows.push([rounded(BigInt(prefix[b + 1] - prefix[a]) * 100n, BigInt(b - a + 1), 2)]);
  }
  return checkOutputRows(rows, actual);
}
export function checkRockPaperScissors(input: string, actual: string): boolean {
  const tokens = input.trim().split(/\s+/), rows: OutputField[][] = [];
  let at = 0, cases = 0;
  const beats: Record<string, string> = { rock: "scissors", scissors: "paper", paper: "rock" };
  while (at < tokens.length) {
    const n = Number(tokens[at++]);
    if (n === 0) { if (at !== tokens.length) throw new Error("Extra tournament input"); break; }
    const k = Number(tokens[at++]);
    if (!Number.isInteger(n) || n < 1 || n > 100 || !Number.isInteger(k) || k < 1 || k > 100) throw new Error("Invalid tournament size");
    const wins = Array<number>(n).fill(0), losses = Array<number>(n).fill(0);
    for (let game = 0; game < k * n * (n - 1) / 2; game++) {
      const a = Number(tokens[at++]) - 1, x = tokens[at++], b = Number(tokens[at++]) - 1, y = tokens[at++];
      if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || a >= n || b < 0 || b >= n || a === b || !Object.hasOwn(beats, x) || !Object.hasOwn(beats, y)) throw new Error("Invalid tournament game");
      if (x === y) continue;
      if (beats[x] === y) { wins[a]++; losses[b]++; } else { wins[b]++; losses[a]++; }
    }
    if (cases++) rows.push([""]);
    for (let player = 0; player < n; player++) rows.push(wins[player] + losses[player] ? [rounded(BigInt(wins[player]), BigInt(wins[player] + losses[player]), 3)] : ["-"]);
  }
  return checkOutputRows(rows, actual);
}
export function checkTightWords(input: string, actual: string): boolean {
  const tokens = input.trim().split(/\s+/).map(Number), rows: OutputField[][] = [];
  if (tokens.length % 2) throw new Error("Invalid tight words input");
  for (let i = 0; i < tokens.length; i += 2) {
    const k = tokens[i], n = tokens[i + 1];
    if (!Number.isInteger(k) || k < 0 || k > 9 || !Number.isInteger(n) || n < 1 || n > 100) throw new Error("Invalid tight word dimensions");
    let counts = Array<bigint>(k + 1).fill(1n);
    for (let length = 2; length <= n; length++) counts = counts.map((value, digit) => value + (counts[digit - 1] ?? 0n) + (counts[digit + 1] ?? 0n));
    rows.push([rounded(counts.reduce((a, b) => a + b, 0n) * 100n, BigInt(k + 1) ** BigInt(n), 5)]);
  }
  return checkOutputRows(rows, actual);
}
export function checkIntersectingLines(input: string, actual: string): boolean {
  const tokens = input.trim().split(/\s+/), count = Number(tokens[0]), rows: OutputField[][] = [["INTERSECTING LINES OUTPUT"]];
  if (!Number.isInteger(count) || count < 1 || count > 10 || tokens.length !== 1 + count * 8) throw new Error("Invalid line input");
  for (let i = 0; i < count; i++) {
    const [x1,y1,x2,y2,x3,y3,x4,y4] = tokens.slice(1 + 8 * i, 9 + 8 * i).map(BigInt);
    const a1 = y2-y1, b1 = x1-x2, c1 = a1*x1+b1*y1, a2 = y4-y3, b2 = x3-x4, c2 = a2*x3+b2*y3, det = a1*b2-a2*b1;
    if (!det) rows.push([a1*x3+b1*y3 === c1 ? "LINE" : "NONE"]);
    else rows.push(["POINT ", rounded(c1*b2-c2*b1,det,2), " ", rounded(a1*c2-a2*c1,det,2)]);
  }
  rows.push(["END OF OUTPUT"]);
  return checkOutputRows(rows, actual);
}
export function checkFlooded(input: string, actual: string): boolean {
  const tokens = input.trim().split(/\s+/), rows: OutputField[][] = [];
  let at = 0, region = 0;
  while (at < tokens.length) {
    const m = Number(tokens[at++]), n = Number(tokens[at++]);
    if (m === 0 && n === 0) { if (at !== tokens.length) throw new Error("Extra flood input"); break; }
    if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || m >= 30 || n < 1 || n >= 30) throw new Error("Invalid flood dimensions");
    const heights = tokens.slice(at,at+m*n).map(BigInt).sort((a,b)=>a<b?-1:a>b?1:0);at+=m*n;
    const water=BigInt(tokens[at++]);if(water<0n)throw new Error("Negative water volume");
    let count=1,sum=heights[0];
    while(count<heights.length && 100n*(heights[count]*BigInt(count)-sum)<=water)sum+=heights[count++];
    const numerator=100n*sum+water,denominator=100n*BigInt(count);
    const submerged=heights.filter(height=>height*denominator<numerator).length;
    rows.push([`Region ${++region}`],["Water level is ",rounded(numerator,denominator,2)," meters."],[rounded(BigInt(submerged)*100n,BigInt(heights.length),2)," percent of the region is under water."],[""]);
  }
  return checkOutputRows(rows,actual);
}
export function checkCenterOfMass(input:string,actual:string):boolean {
  const tokens=input.trim().split(/\s+/),rows:OutputField[][]=[];let at=0;
  type Point=[bigint,bigint];
  const cross=(a:Point,b:Point,c:Point)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  while(at<tokens.length){
    const n=Number(tokens[at++]);if(n<3){if(at!==tokens.length)throw new Error("Extra centroid input");break;}
    if(!Number.isInteger(n)||n>100)throw new Error("Invalid centroid dimensions");
    const points:Point[]=[];for(let i=0;i<n;i++)points.push([BigInt(tokens[at++]),BigInt(tokens[at++])]);
    points.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:a[1]<b[1]?-1:a[1]>b[1]?1:0);
    const chain=(items:Point[])=>{const result:Point[]=[];for(const p of items){while(result.length>1&&cross(result.at(-2)!,result.at(-1)!,p)<=0n)result.pop();result.push(p);}return result;};
    const hull=[...chain(points).slice(0,-1),...chain([...points].reverse()).slice(0,-1)];
    if(hull.length!==n)throw new Error("Centroid input is not a strict convex polygon");
    let area=0n,x=0n,y=0n;
    for(let i=0;i<n;i++){const a=hull[i],b=hull[(i+1)%n],weight=a[0]*b[1]-a[1]*b[0];area+=weight;x+=(a[0]+b[0])*weight;y+=(a[1]+b[1])*weight;}
    rows.push([rounded(x,3n*area,3)," ",rounded(y,3n*area,3)]);
  }
  return checkOutputRows(rows,actual);
}
/** Salaries have no prescribed number of decimal places. The independently audited
 * exact answer defines the value; equivalent decimal/exponent spellings are valid. */
export function checkHayPoints(expected:string,actual:string):boolean {
  const lines=(text:string)=>text.trim().split(/\r?\n/).map(line=>line.trim());
  const reference=lines(expected),answer=lines(actual);
  return reference.length===answer.length&&reference.every((line,i)=>{const value=decimalKey(line);return value!==null&&value===decimalKey(answer[i]);});
}
/** Huffman codes have a mandated deterministic tie rule; only the rounded weighted
 * average is non-unique at exact midpoints. Preserve every prescribed code and row. */
export function checkHuffman(input:string,expected:string,actual:string):boolean {
  const tokens=input.trim().split(/\s+/),lines=expected.replace(/\r\n/g,"\n").trim().split("\n"),rows:OutputField[][]=[];let at=0,line=0,set=0;
  while(at<tokens.length){
    const radix=Number(tokens[at++]);if(radix===0){if(at!==tokens.length)throw new Error("Extra Huffman input");break;}
    const n=Number(tokens[at++]);if(!Number.isInteger(radix)||radix<2||radix>10||!Number.isInteger(n)||n<2||n>26)throw new Error("Invalid Huffman dimensions");
    const frequencies=tokens.slice(at,at+n).map(BigInt);at+=n;
    while(lines[line]==="")line++;
    if(!new RegExp(`^Set ${++set}; average length \\d+\\.\\d{2}$`).test(lines[line++]??""))throw new Error("Invalid Huffman expected header");
    const codes:string[]=[];let weighted=0n,total=0n;
    for(let i=0;i<n;i++){
      const match=new RegExp(`^    ${String.fromCharCode(65+i)}: ([0-${radix-1}]+)$`).exec(lines[line++]??"");
      if(!match)throw new Error("Invalid Huffman expected code");
      codes.push(match[0]);weighted+=frequencies[i]*BigInt(match[1].length);total+=frequencies[i];
    }
    rows.push([`Set ${set}; average length `,rounded(weighted,total,2)],...codes.map(code=>[code]),[""]);
  }
  while(lines[line]==="")line++;
  if(line!==lines.length)throw new Error("Extra Huffman expected rows");
  return checkOutputRows(rows,actual);
}
