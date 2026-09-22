/** Parse only as many rows/tokens as the declared problem can consume. Numeric
 * output is bounded before conversion; no untrusted BigInt or exponent parsing. */
function integer(text: string, maximum: number): number | null {
  if (!/^\+?\d+$/.test(text)) return null;
  const digits = text.replace(/^\+?0*/, "") || "0";
  if (digits.length > String(maximum).length) return null;
  const value = Number(digits);
  return value <= maximum ? value : null;
}
function signedInteger(text: string, maximum: number): number | null {
  if (!/^[+-]?\d+$/.test(text)) return null;
  const magnitude = integer(text.replace(/^[+-]/, ""), maximum);
  return magnitude === null ? null : (text[0] === "-" ? -magnitude : magnitude);
}
function lines(text: string): string[] {
  const result = text.replace(/\r\n/g, "\n").split("\n").map(row => row.trim());
  let start = 0, end = result.length;
  while (start < end && result[start] === "") start++;
  while (end > start && result[end - 1] === "") end--;
  return result.slice(start, end);
}
function numbers(row: string, count: number, maximum: number): number[] | null {
  const tokens = row.split(/\s+/, count + 1);
  if (tokens.length !== count) return null;
  const values = tokens.map(token => integer(token, maximum));
  return values.some(value => value === null) ? null : values as number[];
}

/** Any minimum cover is valid, but its segments must be input occurrences and
 * must be printed in the explicitly requested order of left endpoints. */
export function checkMinimalCoverage(input: string, actual: string): boolean {
  const source = input.trim().split(/\s+/).map(Number), output = lines(actual);
  const tests = source[0];
  if (!Number.isInteger(tests) || tests < 1) throw new Error("Invalid coverage case count");
  let at = 1, row = 0;
  for (let test = 0; test < tests; test++) {
    const target = source[at++], segments: [number, number][] = [], copies = new Map<string,number>();
    if (!Number.isInteger(target) || target < 1 || target > 5000) throw new Error("Invalid coverage target");
    while (true) {
      const a = source[at++], b = source[at++];
      if (a === 0 && b === 0) break;
      if (!Number.isInteger(a) || !Number.isInteger(b) || a > b || Math.abs(a) > 50000 || Math.abs(b) > 50000 || segments.length >= 100000) throw new Error("Invalid coverage segment");
      segments.push([a,b]);const key=`${a},${b}`;copies.set(key,(copies.get(key)??0)+1);
    }
    segments.sort((a,b)=>a[0]-b[0]||b[1]-a[1]);
    let covered=0,index=0,optimum=0;
    while(covered<target){
      let farthest=covered;
      while(index<segments.length&&segments[index][0]<=covered)farthest=Math.max(farthest,segments[index++][1]);
      if(farthest===covered){optimum=0;break;}
      covered=farthest;optimum++;
    }
    if(test&&output[row++]!=="")return false;
    const count=integer(output[row++]??"",segments.length);
    if(count===null||count!==optimum)return false;
    let lastLeft=-Infinity,reach=0;
    for(let i=0;i<count;i++){
      const match=/^([+-]?\d+)\s+([+-]?\d+)$/.exec(output[row++]??"");
      if(!match)return false;
      const a=signedInteger(match[1],50000),b=signedInteger(match[2],50000);
      if(a===null||b===null)return false;
      const key=`${a},${b}`,available=copies.get(key)??0;
      if(!available||a<lastLeft||a>reach)return false;
      copies.set(key,available-1);lastLeft=a;reach=Math.max(reach,b);
    }
    if(count&&reach<target)return false;
  }
  if(at!==source.length)throw new Error("Extra coverage input");
  return row===output.length;
}

/** A maximum elephant chain may choose any original record IDs. Strict weight
 * and IQ inequalities are verified separately from the maximum length. */
export function checkElephantChain(input: string, actual: string): boolean {
  const values=input.trim().split(/\s+/).map(Number),output=lines(actual);
  if(!values.length||values.length%2||values.length>2000||values.some(value=>!Number.isInteger(value)||value<1||value>10000))throw new Error("Invalid elephant input");
  const records: [number,number][]=[];
  for(let i=0;i<values.length;i+=2)records.push([values[i],values[i+1]]);
  const sorted=records.map((record,id)=>({weight:record[0],iq:record[1],id})).sort((a,b)=>a.weight-b.weight);
  const best=Array<number>(records.length).fill(1);let optimum=0;
  for(let i=0;i<sorted.length;i++){
    for(let j=0;j<i;j++)if(sorted[j].weight<sorted[i].weight&&sorted[j].iq>sorted[i].iq)best[i]=Math.max(best[i],best[j]+1);
    optimum=Math.max(optimum,best[i]);
  }
  const count=integer(output[0]??"",records.length);
  if(count!==optimum||output.length!==optimum+1)return false;
  const used=new Set<number>();let previous:[number,number]|undefined;
  for(const line of output.slice(1)){
    const id=integer(line,records.length);
    if(id===null||id<1||used.has(id))return false;
    const record=records[id-1];
    if(previous&&(previous[0]>=record[0]||previous[1]<=record[1]))return false;
    used.add(id);previous=record;
  }
  return true;
}

/** Bipartite capacity inequalities determine whether NO is truthful. For YES,
 * validate every team member and actual table capacity, accepting any seating. */
export function checkGrandDinner(input: string, actual: string): boolean {
  const source=input.trim().split(/\s+/).map(Number),output=lines(actual);let at=0,row=0,ended=false;
  while(at<source.length){
    const m=source[at++],n=source[at++];
    if(m===0&&n===0){ended=true;break;}
    if(!Number.isInteger(m)||m<1||m>70||!Number.isInteger(n)||n<1||n>50)throw new Error("Invalid dinner dimensions");
    const teams=source.slice(at,at+m);at+=m;const capacities=source.slice(at,at+n);at+=n;
    if(teams.length!==m||capacities.length!==n||teams.some(x=>!Number.isInteger(x)||x<1||x>100)||capacities.some(x=>!Number.isInteger(x)||x<2||x>100))throw new Error("Invalid dinner capacities");
    let total=0,possible=true;
    const descending=[...teams].sort((a,b)=>b-a);
    for(let k=1;k<=m;k++){total+=descending[k-1];if(total>capacities.reduce((sum,c)=>sum+Math.min(c,k),0))possible=false;}
    const status=output[row++];
    if(status==="0"){if(possible)return false;continue;}
    if(status!=="1"||!possible)return false;
    const load=Array<number>(n).fill(0);
    for(let team=0;team<m;team++){
      const tables=numbers(output[row++]??"",teams[team],n);
      if(!tables||new Set(tables).size!==tables.length||tables.some(table=>table<1))return false;
      for(const table of tables)if(++load[table-1]>capacities[table-1])return false;
    }
  }
  if(!ended||at!==source.length)throw new Error("Invalid dinner termination");
  return row===output.length;
}

/** The encoding specifies row and column cumulative sums, not a unique grid.
 * Validate the supplied 1..20 entries directly; no reference-grid comparison. */
export function checkMatrixDecompression(input: string, actual: string): boolean {
  const source=input.trim().split(/\s+/).map(Number),output=lines(actual);let at=1,row=0;
  const tests=source[0];if(!Number.isInteger(tests)||tests<1||tests>100)throw new Error("Invalid matrix count");
  for(let test=1;test<=tests;test++){
    const rows=source[at++],columns=source[at++];
    if(!Number.isInteger(rows)||rows<1||rows>20||!Number.isInteger(columns)||columns<1||columns>20)throw new Error("Invalid matrix dimensions");
    const rowSums=source.slice(at,at+rows);at+=rows;const colSums=source.slice(at,at+columns);at+=columns;
    if(rowSums.length!==rows||colSums.length!==columns||[...rowSums,...colSums].some(x=>!Number.isSafeInteger(x)||x<1||x>8000))throw new Error("Invalid cumulative sums");
    if(test>1)while(output[row]==="")row++;
    if(output[row++]!==`Matrix ${test}`)return false;
    const columnTotals=Array<number>(columns).fill(0);let rowTotal=0;
    for(let i=0;i<rows;i++){
      const entries=numbers(output[row++]??"",columns,20);
      if(!entries||entries.some(value=>value<1))return false;
      for(let j=0;j<columns;j++){rowTotal+=entries[j];columnTotals[j]+=entries[j];}
      if(rowTotal!==rowSums[i])return false;
    }
    let columnTotal=0;
    for(let j=0;j<columns;j++){columnTotal+=columnTotals[j];if(columnTotal!==colSums[j])return false;}
  }
  if(at!==source.length)throw new Error("Extra matrix input");
  return row===output.length;
}
