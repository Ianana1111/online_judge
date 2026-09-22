import {checkOutputRows,rounded,type OutputField} from "./roundedOutput.js";
/** These problems have independently certified, uniquely rounded decimal answers.
 * Keep every literal/header/blank row and decimal place. Numeric +/- signs and
 * signed zero carry their usual meaning; adjacent rounded values remain wrong. */
export function checkFixedDecimalOutput(expected:string,actual:string):boolean {
  const lines=expected.replace(/\r\n/g,"\n").split("\n").map(line=>line.trimEnd());let first=0,last=lines.length;
  while(first<last&&!lines[first])first++;while(last>first&&!lines[last-1])last--;
  const rows:OutputField[][]=lines.slice(first,last).map(line=>{
    const fields:OutputField[]=[];let at=0;
    for(const match of line.matchAll(/[+-]?\d+\.\d+/g)){
      const index=match.index!;fields.push(line.slice(at,index));const places=match[0].length-match[0].indexOf(".")-1;
      fields.push(rounded(BigInt(match[0].replace(".","")),10n**BigInt(places),places));at=index+match[0].length;
    }
    fields.push(line.slice(at));return fields;
  });
  return checkOutputRows(rows,actual);
}
