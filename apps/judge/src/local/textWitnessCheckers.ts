/** Output rows retain data whitespace. Headers and separators may trim their own
 * padding, but an excuse or candidate name is checked exactly as read. */
const outputLines=(text:string)=>text.replace(/\r\n/g,"\n").split("\n");
const remainingBlank=(rows:string[],at:number)=>rows.slice(at).every(row=>row.trim()==="");
const takeMultiset=(wanted:string[],rows:string[],at:number):boolean=>{
  const copies=new Map<string,number>();for(const word of wanted)copies.set(word,(copies.get(word)??0)+1);
  for(let i=0;i<wanted.length;i++){const count=copies.get(rows[at+i])??0;if(!count)return false;copies.set(rows[at+i],count-1);}
  return true;
};

export function checkExcuses(input:string,actual:string):boolean {
  const source=outputLines(input),output=outputLines(actual);let at=0,row=0,set=0;
  while(at<source.length){
    if(source[at].trim()===""){at++;continue;}
    const header=source[at++].trim().split(/\s+/).map(Number),[k,e]=header;
    if(header.length!==2||!Number.isInteger(k)||k<1||k>20||!Number.isInteger(e)||e<1||e>20)throw new Error("Invalid excuse header");
    const keys=new Set(source.slice(at,at+k));at+=k;
    if([...keys].some(word=>!/^[a-z]{1,20}$/.test(word)))throw new Error("Invalid excuse keyword");
    const excuses=source.slice(at,at+e);at+=e;
    if(excuses.length!==e||excuses.some(text=>text.length>70||!text.trim()||!/^[A-Za-z0-9 ".,!?]+$/.test(text)))throw new Error("Invalid excuse text");
    const counts=excuses.map(text=>(text.toLowerCase().match(/[a-z]+/g)??[]).reduce((sum,word)=>sum+Number(keys.has(word)),0));
    const maximum=Math.max(...counts),wanted=excuses.filter((_,i)=>counts[i]===maximum);
    if(set&&output[row++]?.trim()!=="")return false;
    if(output[row++]?.trim()!==`Excuse Set #${++set}`||!takeMultiset(wanted,output,row))return false;
    row+=wanted.length;
  }
  return remainingBlank(output,row);
}

export function checkAnagrams(input:string,actual:string):boolean {
  const tokens=input.trim().split(/\s+/),output=outputLines(actual);const tests=Number(tokens[0]);let at=1,row=0;
  if(!Number.isInteger(tests)||tests<1)throw new Error("Invalid anagram count");
  const signature=(word:string)=>[...word].sort().join("");
  for(let test=0;test<tests;test++){
    const count=Number(tokens[at++]);if(!Number.isInteger(count)||count<0||count>=1000)throw new Error("Invalid vocabulary count");
    const dictionary=tokens.slice(at,at+count);at+=count;
    if(dictionary.length!==count||dictionary.some(word=>!/^[a-z]{1,20}$/.test(word)))throw new Error("Invalid vocabulary");
    const groups=new Map<string,string[]>();for(const word of dictionary){const key=signature(word);const group=groups.get(key)??[];group.push(word);groups.set(key,group);}
    if(test&&output[row++]?.trim()!=="")return false;
    while(tokens[at]!=="END"){
      const query=tokens[at++];if(!/^[a-z]{1,20}$/.test(query??""))throw new Error("Invalid anagram query");
      if(output[row++]?.trimEnd()!==`Anagrams for: ${query}`)return false;
      const wanted=groups.get(signature(query))??[];
      if(!wanted.length){if(output[row++]?.trimEnd()!==`No anagrams for: ${query}`)return false;continue;}
      const supplied:string[]=[];
      for(let i=0;i<wanted.length;i++){
        const match=/^([ 0-9]{3})\) ([a-z]{1,20})[ \t]*$/.exec(output[row++]??"");
        if(!match||!/^ *\d+$/.test(match[1])||Number(match[1])!==i+1)return false;
        supplied.push(match[2]);
      }
      if(!takeMultiset(wanted,supplied,0))return false;
    }
    at++;
  }
  if(at!==tokens.length)throw new Error("Extra anagram input");
  return remainingBlank(output,row);
}

export function checkAustralianVoting(input:string,actual:string):boolean {
  const source=outputLines(input),output=outputLines(actual);let at=0,row=0;
  while(source[at]?.trim()==="")at++;
  const tests=Number(source[at++]);if(!Number.isInteger(tests)||tests<1)throw new Error("Invalid voting count");
  for(let test=0;test<tests;test++){
    while(source[at]?.trim()==="")at++;
    const n=Number(source[at++]);if(!Number.isInteger(n)||n<1||n>20)throw new Error("Invalid candidate count");
    const names=source.slice(at,at+n);at+=n;if(names.length!==n||names.some(name=>name.length>80))throw new Error("Invalid candidate names");
    const ballots:number[][]=[];
    while(at<source.length&&source[at].trim()!==""){
      const ballot=source[at++].trim().split(/\s+/).map(Number);
      if(ballot.length!==n||new Set(ballot).size!==n||ballot.some(id=>!Number.isInteger(id)||id<1||id>n)||ballots.length>=1000)throw new Error("Invalid voting ballot");
      ballots.push(ballot.map(id=>id-1));
    }
    const alive=Array<boolean>(n).fill(true);let winners:number[]=[];
    while(!winners.length){
      const votes=Array<number>(n).fill(0);
      for(const ballot of ballots){const id=ballot.find(id=>alive[id]);if(id===undefined)throw new Error("No remaining candidate");votes[id]++;}
      const active=alive.flatMap((ok,id)=>ok?[id]:[]),least=Math.min(...active.map(id=>votes[id])),most=Math.max(...active.map(id=>votes[id]));
      if(most*2>ballots.length)winners=active.filter(id=>votes[id]===most);
      else if(least===most)winners=active;
      else for(const id of active)if(votes[id]===least)alive[id]=false;
    }
    if(test&&output[row++]?.trim()!=="")return false;
    if(!takeMultiset(winners.map(id=>names[id]),output,row))return false;
    row+=winners.length;
  }
  if(!remainingBlank(source,at))throw new Error("Extra voting input");
  return remainingBlank(output,row);
}

/** Tokenize a single algebra state. Unary signs belong to integer operands;
 * operator order and every reduction step remain mandatory. */
export function equationState(line:string):string|null {
  const equal=line.indexOf("=");if(equal<0||line.indexOf("=",equal+1)>=0)return null;
  const variable=line.slice(equal+1).trim();if(!/^[A-Za-z]{1,8}$/.test(variable))return null;
  const expression=line.slice(0,equal),tokens:string[]=[];let at=0,operations=0;
  while(true){
    const match=/^\s*([+-]?)\s*(\d+)/.exec(expression.slice(at));if(!match)return null;
    const digits=match[2].replace(/^0+/,"")||"0";tokens.push((match[1]==="-"&&digits!=="0"?"-":"")+digits);at+=match[0].length;
    const remainder=expression.slice(at);if(!remainder.trim())break;
    const operator=/^\s*([+\-*/])/.exec(remainder);if(!operator||++operations>20)return null;
    tokens.push(operator[1]);at+=operator[0].length;
  }
  return JSON.stringify([tokens,variable]);
}
export function checkEquationSteps(expected:string,actual:string):boolean {
  const normalized=(text:string)=>{
    const rows=outputLines(text);let first=0,last=rows.length;
    while(first<last&&rows[first].trim()==="")first++;
    while(last>first&&rows[last-1].trim()==="")last--;
    return rows.slice(first,last);
  };
  const reference=normalized(expected),answer=normalized(actual);if(reference.length!==answer.length)return false;
  return reference.every((line,i)=>{
    if(!line.trim())return !answer[i].trim();
    const state=equationState(line);if(state===null)throw new Error("Invalid expected equation state");
    return state===equationState(answer[i]);
  });
}
