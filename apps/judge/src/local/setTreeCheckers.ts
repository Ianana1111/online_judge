const rows=(text:string)=>text.trim().split(/\r?\n/).map(line=>line.trim());
const integer=(text:string,maximum:number)=>/^\+?\d+$/.test(text)&&Number.isSafeInteger(Number(text))&&Number(text)<=maximum?Number(text):null;
/** Game's independently verified expected set is unordered. Pair orientation is
 * irrelevant, but counts, uniqueness, bounds and every dataset remain mandatory. */
export function checkKnowledgeGame(input:string,expected:string,actual:string):boolean {
  const tokens=input.trim().split(/\s+/).map(Number),reference=rows(expected),answer=rows(actual);let left=0,right=0;
  if(!tokens.length||tokens.length%2)throw new Error("Invalid knowledge-game input");
  for(let at=0;at<tokens.length;at+=2){
    const n=tokens[at],m=tokens[at+1];if(!Number.isInteger(n)||n<2||n>200||!Number.isInteger(m)||m<0||m>100)throw new Error("Invalid knowledge-game bounds");
    const count=integer(reference[left++]??"",n*(n-1)/2);if(count===null)throw new Error("Invalid expected pair count");
    if(integer(answer[right++]??"",n*(n-1)/2)!==count)return false;
    const parse=(line:string)=>{
      const fields=line.split(/\s+/);if(fields.length!==2)return null;const a=integer(fields[0],n),b=integer(fields[1],n);
      return a===null||b===null||a<1||b<1||a===b?null:`${Math.min(a,b)},${Math.max(a,b)}`;
    };
    const wanted=new Set<string>();
    for(let i=0;i<count;i++){const key=parse(reference[left++]??"");if(key===null||wanted.has(key))throw new Error("Invalid expected pairs");wanted.add(key);}
    for(let i=0;i<count;i++){const key=parse(answer[right++]??"");if(key===null||!wanted.delete(key))return false;}
  }
  if(left!==reference.length)throw new Error("Extra expected game output");
  return right===answer.length;
}

/** Require an actual tree of input tunnels whose integer cost equals dense Prim.
 * BigInts preserve exact input weights; no arbitrary tie-selected MST is imposed. */
export function checkOreon(input:string,actual:string):boolean {
  const source=input.replace(/,/g," ").trim().split(/\s+/),answer=rows(actual);let at=0,row=0;
  const tests=integer(source[at++]??"",Number.MAX_SAFE_INTEGER);if(tests===null||tests<1)throw new Error("Invalid Oreon count");
  for(let test=1;test<=tests;test++){
    const n=integer(source[at++]??"",26);if(n===null||n<1)throw new Error("Invalid city count");
    let weightDigits=1;const matrix=Array.from({length:n},()=>Array<bigint>(n).fill(0n));
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      const value=source[at++];if(!/^\+?\d+$/.test(value??""))throw new Error("Invalid tunnel weight");
      matrix[i][j]=BigInt(value);weightDigits=Math.max(weightDigits,matrix[i][j].toString().length);
    }
    for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(matrix[i][j]!==matrix[j][i]||(i===j&&matrix[i][j]!==0n))throw new Error("Invalid tunnel matrix");
    const used=Array<boolean>(n).fill(false),distance=Array<bigint|null>(n).fill(null);distance[0]=0n;let optimum=0n;
    for(let step=0;step<n;step++){
      let vertex=-1;
      for(let i=0;i<n;i++)if(!used[i]&&distance[i]!==null&&(vertex<0||distance[i]!<distance[vertex]!))vertex=i;
      if(vertex<0)throw new Error("Disconnected tunnel graph");used[vertex]=true;optimum+=distance[vertex]!;
      for(let i=0;i<n;i++)if(!used[i]&&matrix[vertex][i]>0n&&(distance[i]===null||matrix[vertex][i]<distance[i]!))distance[i]=matrix[vertex][i];
    }
    if(answer[row++]!==`Case ${test}:`)return false;
    const parent=Array.from({length:n},(_,i)=>i);const find=(v:number):number=>{while(parent[v]!==v){parent[v]=parent[parent[v]];v=parent[v];}return v;};let cost=0n;
    for(let i=0;i<n-1;i++){
      const match=/^([A-Z])-([A-Z])\s+([+]?\d+)$/.exec(answer[row++]??"");if(!match)return false;
      const a=match[1].charCodeAt(0)-65,b=match[2].charCodeAt(0)-65,digits=match[3].replace(/^\+?0*/,"")||"0";
      if(a>=n||b>=n||a===b||digits.length>weightDigits)return false;
      const weight=BigInt(digits);if(weight===0n||matrix[a][b]!==weight||find(a)===find(b))return false;
      parent[find(a)]=find(b);cost+=weight;
    }
    if(cost!==optimum)return false;
  }
  if(at!==source.length)throw new Error("Extra Oreon input");
  return row===answer.length;
}
