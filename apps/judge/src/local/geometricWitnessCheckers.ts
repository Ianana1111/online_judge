import {checkOutputRows,rounded,type OutputField} from "./roundedOutput.js";
const normalizedLines=(text:string)=>text.replace(/\r\n/g,"\n").split("\n");
export function integerSquareRoot(n:bigint):bigint {
  if(n<0n)throw new Error("Negative square root");if(n<2n)return n;
  let x=1n<<BigInt(Math.ceil(n.toString(2).length/2)),y=(x+n/x)/2n;
  while(y<x){x=y;y=(x+n/x)/2n;}return x;
}
const coordinate=(token:string,bound:number):bigint=>{
  if(!/^[+-]?\d+$/.test(token??"")||!Number.isSafeInteger(Number(token))||Math.abs(Number(token))>bound)throw new Error("Invalid geometric coordinate");return BigInt(token);
};
const timeValue=(text:string,maxDigits=20):bigint|null=>{
  const match=/^(\d+):(\d{2})$/.exec(text);if(!match||Number(match[2])>=60)return null;
  const hours=match[1].replace(/^0+/,"")||"0";if(hours.length>maxDigits)return null;return BigInt(hours)*60n+BigInt(match[2]);
};
/** A sum of positive integer square roots is rational only if every radical is
 * rational. This recognizes real half-minute ties without a wide time epsilon. */
export function checkSnowClearing(input:string,expected:string,actual:string):boolean {
  const source=normalizedLines(input),reference=normalizedLines(expected),answer=normalizedLines(actual);let at=0,left=0,right=0;
  const count=Number(source[at++]);if(!Number.isInteger(count)||count<1||count>100)throw new Error("Invalid snow testcase count");
  for(let test=0;test<count;test++){
    while(source[at]?.trim()==="")at++;
    const hangar=(source[at++]??"").trim().split(/\s+/);if(hangar.length!==2)throw new Error("Invalid hangar");for(const token of hangar)coordinate(token,1e9);
    let exact=true,total=0n,roads=0;
    while(at<source.length&&source[at].trim()!==""){
      const tokens=source[at++].trim().split(/\s+/);if(tokens.length!==4||++roads>100)throw new Error("Invalid road");
      const [x1,y1,x2,y2]=tokens.map(value=>coordinate(value,1e9)),dx=x2-x1,dy=y2-y1,square=dx*dx+dy*dy;
      if(square===0n)throw new Error("Zero-length street");const root=integerSquareRoot(square);if(root*root!==square)exact=false;total+=root;
    }
    if(test){if(reference[left++]?.trim()!=="")throw new Error("Invalid expected snow separator");if(answer[right++]?.trim()!=="")return false;}
    const wanted=timeValue(reference[left++]?.trim()??""),got=timeValue(answer[right++]?.trim()??"");if(wanted===null)throw new Error("Invalid expected time");if(got===null)return false;
    if(exact&&6n*total%1000n===500n){const floor=6n*total/1000n;if(wanted!==floor&&wanted!==floor+1n)throw new Error("Wrong expected half-minute");if(got!==floor&&got!==floor+1n)return false;}
    else if(got!==wanted)return false;
  }
  if(source.slice(at).some(line=>line.trim())||reference.slice(left).some(line=>line.trim()))throw new Error("Extra snow data");
  return answer.slice(right).every(line=>!line.trim());
}

/** Partial-sphere interval lengths are positive radical contributions plus a
 * rational term. All partial radicals must be rational for a true decimal tie. */
export function checkSuperman(input:string,expected:string,actual:string):boolean {
  const tokens=input.trim().split(/\s+/),reference=expected.trim().split(/\r?\n/);let at=0,row=0;const rows:OutputField[][]=[];
  while(at<tokens.length){
    const city=tokens[at++];if(!/^[A-Za-z0-9]{1,8}$/.test(city))throw new Error("Invalid city");
    const start=tokens.slice(at,at+3).map(value=>coordinate(value,20));at+=3;const end=tokens.slice(at,at+3).map(value=>coordinate(value,20));at+=3;
    if(start.length!==3||end.length!==3)throw new Error("Incomplete path");const v=end.map((value,i)=>value-start[i]),a=v.reduce((sum,x)=>sum+x*x,0n);if(a===0n)throw new Error("Zero-length flight");
    const n=Number(tokens[at++]);if(!Number.isInteger(n)||n<1||n>10)throw new Error("Invalid region count");let rational=true,numerator=0n;
    const spheres:{center:bigint[];radius:bigint}[]=[];
    for(let i=0;i<n;i++){
      const center=tokens.slice(at,at+3).map(value=>coordinate(value,20));at+=3;const radius=coordinate(tokens[at++],20);if(center.length!==3||radius<1n)throw new Error("Invalid region");
      for(const previous of spheres){const distance=center.reduce((sum,x,k)=>sum+(x-previous.center[k])**2n,0n);if(distance<(radius+previous.radius)**2n)throw new Error("Overlapping region interiors");}spheres.push({center,radius});
      const offset=start.map((x,k)=>x-center[k]),b=offset.reduce((sum,x,k)=>sum+x*v[k],0n),c=offset.reduce((sum,x)=>sum+x*x,-radius*radius),discriminant=b*b-a*c;
      if(c<=0n&&a+2n*b+c<=0n){numerator+=a;continue;}
      if(discriminant<=0n||(c>0n&&a+2n*b+c>0n&&(b>=0n||b<=-a)))continue;
      const root=integerSquareRoot(discriminant);
      if(root*root!==discriminant){rational=false;continue;}
      const enter=-b-root>0n?-b-root:0n,leave=-b+root<a?-b+root:a;if(leave>enter)numerator+=leave-enter;
    }
    if(reference[row++]?.trimEnd()!==city)throw new Error("Mismatched expected city");
    const supplied=reference[row++]?.trim()??"";if(!/^[+-]?\d+\.\d{2}$/.test(supplied))throw new Error("Invalid expected percentage");
    rows.push([city],[rational?rounded(100n*numerator,a,2):rounded(BigInt(supplied.replace(".","")),100n,2)]);
  }
  if(row!==reference.length)throw new Error("Extra expected pollution output");return checkOutputRows(rows,actual);
}

const widthCache=new Map<string,number>();
export function circleBoxWidth(radii:number[]):number {
  const order=[...radii].sort((a,b)=>a-b),key=order.join(","),cached=widthCache.get(key);if(cached!==undefined)return cached;
  let best=2*order.reduce((sum,x)=>sum+x,0);const n=order.length;
  for(;;){
    const x:number[]=[];let right=0;
    for(let i=0;i<n;i++){
      let position=order[i];for(let j=0;j<i;j++)position=Math.max(position,x[j]+2*Math.sqrt(order[i]*order[j]));x.push(position);right=Math.max(right,position+order[i]);if(right>=best)break;
    }
    best=Math.min(best,right);
    let pivot=n-2;while(pivot>=0&&order[pivot]>=order[pivot+1])pivot--;if(pivot<0)break;
    let successor=n-1;while(order[successor]<=order[pivot])successor--;[order[pivot],order[successor]]=[order[successor],order[pivot]];
    for(let left=pivot+1,right=n-1;left<right;left++,right--)[order[left],order[right]]=[order[right],order[left]];
  }
  if(widthCache.size>=128)widthCache.delete(widthCache.keys().next().value!);widthCache.set(key,best);return best;
}
const radiusValue=(text:string):number=>{
  const match=/^\+?(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d+))?$/.exec(text);if(!match)throw new Error("Invalid radius numeral");
  const fraction=match[2]??match[3]??"",raw=(match[1]??"")+fraction,nonzero=raw.replace(/^0+/,""),digits=nonzero.replace(/0+$/,"");
  const exponent=Number(match[4]??"0");if(!digits||!Number.isSafeInteger(exponent))throw new Error("Invalid circle radius");
  const scale=fraction.length-exponent-(nonzero.length-digits.length),power=6-scale;
  if(!Number.isSafeInteger(power)||power<0||digits.length+power>11)throw new Error("Invalid radius precision or bound");
  const micros=Number(digits)*10**power;if(micros<1||micros>1e10)throw new Error("Invalid circle radius");return micros/1e6;
};
export function checkCircleBox(input:string,actual:string):boolean {
  const source=input.trim().split(/\s+/),tests=Number(source[0]);let at=1;const rows:OutputField[][]=[];
  if(!Number.isInteger(tests)||tests<1||tests>50)throw new Error("Invalid circle testcase count");
  for(let test=0;test<tests;test++){
    const n=Number(source[at++]);if(!Number.isInteger(n)||n<1||n>8)throw new Error("Invalid circle count");const radii=source.slice(at,at+n).map(radiusValue);at+=n;
    if(radii.length!==n)throw new Error("Missing circle radii");
    const value=circleBoxWidth(radii),error=128*Number.EPSILON*Math.max(1,2*radii.reduce((sum,r)=>sum+r,0));rows.push([{value,error,places:3}]);
  }
  if(at!==source.length)throw new Error("Extra circle input");return checkOutputRows(rows,actual);
}
