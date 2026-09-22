import { createHash } from 'node:crypto';
import { expect,it } from 'vitest';
import { planLegacyCandidates, type CandidateReview, type LegacyRetirement } from '../scripts/editorials/candidates';
import type { Candidate } from '../apps/judge/src/audit/battery-types';
const hash=(text:string)=>createHash('sha256').update(text).digest('hex');
const candidate:Candidate={tag:'custom',label:'Unproven signed-overflow allegation',languageKey:'cpp17',sourceCode:'int main(){return 0;}'};
const review:CandidateReview={index:0,sourceHash:hash(JSON.stringify(candidate.sourceCode)),expected:'OBSERVE',reason:'No demonstrated incorrect output.'};
const retired:LegacyRetirement={index:0,sourceHash:hash(candidate.sourceCode),classification:'UNSUITABLE_MUTANT',reason:'This exact legacy candidate demonstrates a portability concern, but no wrong-output witness under the pinned toolchain. Retain historical execution records and replace with semantically incorrect targeted mutants.'};
it('retains observations unless the editorial explicitly reviews that exact source',()=>{
 expect(planLegacyCandidates([candidate],[review]).active[0].expectation).toBe('OBSERVE');
 const result=planLegacyCandidates([candidate],[review],[retired]);
 expect(result.active).toEqual([]);expect(result.retired).toEqual([retired]);
});
it('refuses to retire references, known rejections, changed code, duplicates or vague reasons',()=>{
 expect(()=>planLegacyCandidates([{...candidate,tag:'correct'}],[review],[retired])).toThrow();
 expect(()=>planLegacyCandidates([candidate],[{...review,expected:'REJECT'}],[retired])).toThrow();
 expect(()=>planLegacyCandidates([{...candidate,sourceCode:candidate.sourceCode+' '}],[review],[retired])).toThrow();
 expect(()=>planLegacyCandidates([candidate],[review],[retired,retired])).toThrow();
 expect(()=>planLegacyCandidates([candidate],[review],[{...retired,reason:'Ignore it'}])).toThrow();
 expect(()=>planLegacyCandidates([candidate],[review],[{...retired,index:1}])).toThrow();
});
it('continues guarding review hashes even when no candidate is retired',()=>{
 expect(()=>planLegacyCandidates([candidate],[{...review,sourceHash:'0'.repeat(64)}])).toThrow();
});
