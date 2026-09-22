"""Independent factor tables, forbidden stack patterns, Cartesian trees and prime-pair enumeration."""
import argparse,hashlib,json,random,math,itertools,bisect
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
@lru_cache(None)
def is_prime(n):
 if n<2:return False
 if n%2==0:return n==2
 return all(n%d for d in range(3,math.isqrt(n)+1,2))
@lru_cache(None)
def smallest_factors():
 spf=list(range(32768));spf[1]=1
 for p in range(2,182):
  if spf[p]==p:
   for multiple in range(p*p,32768,p):
    if spf[multiple]==multiple:spf[multiple]=p
 return spf

def table_factor(n):
 answer={};spf=smallest_factors()
 while n>1:p=spf[n];answer[p]=answer.get(p,0)+1;n//=p
 return sorted(answer.items(),reverse=True)

def factorial_counts(n):
 counts={}
 for value in range(2,n+1):
  for p,e in table_factor(value):counts[p]=counts.get(p,0)+e
 return [counts[p] for p in sorted(counts)]
def factorials(data):
 values=list(map(int,data.split()));assert values and values[-1]==0 and all(2<=n<=100 for n in values[:-1]);out=[]
 for n in values[:-1]:
  exponents=factorial_counts(n)
  for i in range(0,len(exponents),15):out.append((f'{n:3}! =' if i==0 else ' '*6)+''.join(f'{v:3}' for v in exponents[i:i+15]))
 return '\n'.join(out)+'\n'

def primelands(data):
 lines=data.splitlines();assert lines and lines[-1].strip()=='0';out=[]
 for line in lines[:-1]:
  a=list(map(int,line.split()));assert len(a)>0 and len(a)%2==0;primes=a[::2];exponents=a[1::2];assert all(is_prime(p) for p in primes) and all(e>0 for e in exponents) and all(p>q for p,q in zip(primes,primes[1:]));value=math.prod(p**e for p,e in zip(primes,exponents));assert 2<value<=32767;out.append(' '.join(str(x) for factor in table_factor(value-1) for x in factor))
 return '\n'.join(out)+'\n'

def rail_possible(order):
 # A stack output permutation must avoid a312 pattern; a prefix maximum supplies the3.
 remaining=list(range(1,len(order)+1));largest=0
 for value in order:
  remaining.pop(bisect.bisect_left(remaining,value));next_index=bisect.bisect_right(remaining,value)
  if next_index<len(remaining) and remaining[next_index]<largest:return False
  largest=max(largest,value)
 return True

def rails(data):
 a=list(map(int,data.split()));i=0;blocks=[];ended=False
 while i<len(a):
  n=a[i];i+=1
  if n==0:assert i==len(a);ended=True;break
  assert 1<=n<=1000;out=[]
  while a[i]!=0:
   values=a[i:i+n];i+=n;assert len(values)==n and sorted(values)==list(range(1,n+1));out.append('Yes' if rail_possible(values) else 'No')
  i+=1;blocks.append('\n'.join(out)+'\n')
 assert ended;return '\n'.join(blocks)+'\n'

def recovered_postorder(preorder,inorder):
 assert len(preorder)==len(inorder) and len(set(preorder))==len(preorder) and set(preorder)==set(inorder) and 1<=len(preorder)<=26 and set(preorder)<=set('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
 n=len(preorder);priority={ch:i for i,ch in enumerate(preorder)};left=[-1]*n;right=[-1]*n;stack=[]
 for i,ch in enumerate(inorder):
  last=-1
  while stack and priority[inorder[stack[-1]]]>priority[ch]:last=stack.pop()
  if stack:right[stack[-1]]=i
  left[i]=last;stack.append(i)
 root=stack[0];pre=[];post=[];pending=[(root,False)]
 while pending:
  v,done=pending.pop()
  if v<0:continue
  if done:post.append(inorder[v]);continue
  pre.append(inorder[v]);pending.extend([(v,True),(right[v],False),(left[v],False)])
 assert ''.join(pre)==preorder;return ''.join(post)

def trees(data):
 a=data.split();assert len(a)%2==0;return ''.join(recovered_postorder(pre,ino)+'\n' for pre,ino in zip(a[::2],a[1::2]))

def merge_inversions(s):
 if len(s)<2:return list(s),0
 middle=len(s)//2;a,x=merge_inversions(s[:middle]);b,y=merge_inversions(s[middle:]);merged=[];i=j=0;count=x+y
 while i<len(a) and j<len(b):
  if a[i]<=b[j]:merged.append(a[i]);i+=1
  else:merged.append(b[j]);j+=1;count+=len(a)-i
 return merged+a[i:]+b[j:],count

def dnas(data):
 a=data.split();t=int(a[0]);assert t>=1;i=1;groups=[]
 for _ in range(t):
  n,m=map(int,a[i:i+2]);i+=2;assert 1<=n<=50 and 1<=m<=100;strings=a[i:i+m];i+=m;assert len(strings)==m and all(len(s)==n and set(s)<=set('ACGT') for s in strings);ordered=sorted(enumerate(strings),key=lambda p:(merge_inversions(p[1])[1],p[0]));groups.append('\n'.join(s for _,s in ordered))
 assert i==len(a);return '\n\n'.join(groups)+'\n'

@lru_cache(None)
def goldbach_pair(n):
 for small in range(3,n//2+1,2):
  if is_prime(small) and is_prime(n-small):return small,n-small
 return None

def goldbach(data):
 a=list(map(int,data.split()));assert a and a[-1]==0 and all(6<=n<1000000 and n%2==0 for n in a[:-1]);out=[]
 for n in a[:-1]:
  pair=goldbach_pair(n);out.append(f'{n} = {pair[0]} + {pair[1]}' if pair else "Goldbach's conjecture is wrong.")
 return '\n'.join(out)+'\n'

@lru_cache(None)
def goldbach_counts():
 primes=[n for n in range(2,32768) if is_prime(n)];counts=[0]*32768
 for i,a in enumerate(primes):
  for b in primes[i:]:
   if a+b>=32768:break
   counts[a+b]+=1
 return counts

def goldbach2(data):
 a=list(map(int,data.split()));assert a and a[-1]==0 and all(4<=n<32768 and n%2==0 for n in a[:-1]);counts=goldbach_counts();return ''.join(str(counts[n])+'\n' for n in a[:-1])
ORACLES={'uva-160-factors-and-factorials':factorials,'uva-516-prime-land':primelands,'uva-514-rails':rails,'uva-536-tree-recovery':trees,'uva-612-dna-sorting':dnas,'uva-543-goldbach-s-conjecture':goldbach,'uva-686-goldbach-s-conjecture-ii':goldbach2}
@lru_cache(None)
def tiny_dna_buckets(n):
 buckets={}
 for letters in itertools.product('ACGT',repeat=n):
  text=''.join(letters);score=merge_inversions(text)[1];buckets.setdefault(score,[]).append(text)
 return buckets

def dna_with_score(n,score,used,rng):
 if n<=7:return next(s for s in tiny_dna_buckets(n)[score] if s not in used)
 for attempt in range(1000):
  counts=[n//4+(i<n%4) for i in range(4)];rng.shuffle(counts);remaining=score;letters=[]
  for _ in range(n):
   options=list(range(4));rng.shuffle(options)
   for ch in options:
    if counts[ch]==0:continue
    counts[ch]-=1;contribution=sum(counts[:ch]);size=sum(counts);maximum=(size*size-sum(v*v for v in counts))//2
    if 0<=remaining-contribution<=maximum:letters.append('ACGT'[ch]);remaining-=contribution;break
    counts[ch]+=1
   else:raise AssertionError('every integer inversion count up to multiset maximum is realizable')
  result=''.join(letters);assert remaining==0 and merge_inversions(result)[1]==score
  if result not in used:return result
 raise AssertionError('could not preserve distinct strings')

def repair_input(slug,data,expected=None):
 if slug=='uva-514-rails':
  a=list(map(int,data.split()));i=0;lines=[];outputs=iter(expected.split());changed=False
  while a[i]:
   n=a[i];i+=1;lines.append(str(n))
   while a[i]:
    values=a[i:i+n];i+=n;verdict=next(outputs);missing=set(range(1,n+1))-set(values)
    if missing:
     assert len(missing)==1 and all(1<=v<=n for v in values);replacement=next(iter(missing));duplicates={v for v in values if values.count(v)>1};assert len(duplicates)==1;duplicate=next(iter(duplicates));fixed=None
     for position,value in enumerate(values):
      if value!=duplicate:continue
      candidate=values[:];candidate[position]=replacement
      if ('Yes' if rail_possible(candidate) else 'No')==verdict:fixed=candidate;break
     assert fixed is not None;values=fixed;changed=True
    lines.append(' '.join(map(str,values)))
   i+=1;lines.append('0')
  assert i==len(a)-1;lines.append('0');assert next(outputs,None) is None
  return '\n'.join(lines)+'\n' if changed else None
 if slug=='uva-516-prime-land':
  lines=data.splitlines();changed=False;result=[]
  for line in lines[:-1]:
   a=list(map(int,line.split()));factors=dict(zip(a[::2],a[1::2]));value=math.prod(p**e for p,e in factors.items())
   if value>32767:
    while value>32767:
     prime=min(factors);value//=prime;factors[prime]-=1
     if factors[prime]==0:del factors[prime]
    assert 2<value<=32767;line=' '.join(str(v) for p in sorted(factors,reverse=True) for v in (p,factors[p]));changed=True
   result.append(line)
  return '\n'.join(result+['0'])+'\n' if changed else None
 if slug=='uva-612-dna-sorting':
  a=data.split();t=int(a[0]);i=1;groups=[];old_outputs=[];mapped_outputs=[];rng=random.Random(612);changed=False
  for _ in range(t):
   n,m=map(int,a[i:i+2]);i+=2;original=a[i:i+m];i+=m;scores=[merge_inversions(text)[1] for text in original];mapping={text:text for text in original if set(text)<=set('ACGT')};used=set(mapping.values())
   for text,score in zip(original,scores):
    if text not in mapping:mapping[text]=dna_with_score(n,score,used,rng);used.add(mapping[text]);changed=True
   strings=[mapping[text] for text in original];assert len(set(strings))==len(set(original)) and all(len(text)==n and merge_inversions(text)[1]==score for text,score in zip(strings,scores))
   order=sorted(range(m),key=lambda j:(scores[j],j));old_outputs.extend(original[j] for j in order);mapped_outputs.append('\n'.join(strings[j] for j in order));groups.append(f'{n} {m}\n'+'\n'.join(strings))
  assert i==len(a) and old_outputs==expected.split();result=str(t)+'\n\n'+'\n\n'.join(groups)+'\n';assert dnas(result).strip()=='\n\n'.join(mapped_outputs).strip()
  return result if changed else None
 return None


def additions():
 rng=random.Random(536);railblocks=[]
 for n in range(1,8):railblocks.append((n,list(itertools.permutations(range(1,n+1)))))
 large=[list(range(1,1001)),list(range(1000,0,-1)),[1000]+list(range(1,1000))]
 for _ in range(50):a=list(range(1,1001));rng.shuffle(a);large.append(a)
 railblocks.append((1000,large));treecases=[('A','A'),('ABCDEFGHIJKLMNOPQRSTUVWXYZ','ABCDEFGHIJKLMNOPQRSTUVWXYZ'),('ABCDEFGHIJKLMNOPQRSTUVWXYZ','ZYXWVUTSRQPONMLKJIHGFEDCBA'),('DBACEGF','ABCDEFG')]
 def make_tree(inorder):
  if not inorder:return ''
  at=rng.randrange(len(inorder));return inorder[at]+make_tree(inorder[:at])+make_tree(inorder[at+1:])
 for _ in range(300):
  n=rng.randrange(1,27);ino=''.join(rng.sample('ABCDEFGHIJKLMNOPQRSTUVWXYZ',n));treecases.append((make_tree(ino),ino))
 dna_groups=[(1,['T','G','C','A']),(2,['CA','AA']),(50,['T'*50,'A'*50,'C'*50,'G'*50])]
 allfour=[''.join(s) for s in itertools.product('ACGT',repeat=4)];rng.shuffle(allfour)
 for i in range(0,len(allfour),100):dna_groups.append((4,allfour[i:i+100]))
 for _ in range(30):
  n=rng.randrange(1,51);dna_groups.append((n,[''.join(rng.choice('ACGT') for _ in range(n)) for _ in range(100)]))
 gold_queries=list(range(6,2002,2))+list(range(999800,1000000,2))+[2*rng.randrange(3,500000) for _ in range(2000)]
 return {'uva-160-factors-and-factorials':'\n'.join(map(str,range(2,101)))+'\n0\n','uva-516-prime-land':'\n'.join(' '.join(str(v) for pair in table_factor(n) for v in pair) for n in range(3,32768))+'\n0\n','uva-514-rails':''.join(str(n)+'\n'+'\n'.join(' '.join(map(str,row)) for row in permutations)+'\n0\n' for n,permutations in railblocks)+'0\n','uva-536-tree-recovery':''.join(f'{pre} {ino}\n' for pre,ino in treecases),'uva-612-dna-sorting':str(len(dna_groups))+'\n\n'+'\n\n'.join(f'{n} {len(strings)}\n'+'\n'.join(strings) for n,strings in dna_groups)+'\n','uva-543-goldbach-s-conjecture':'\n'.join(map(str,gold_queries))+'\n0\n','uva-686-goldbach-s-conjecture-ii':'\n'.join(map(str,range(4,32768,2)))+'\n0\n'}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args()
    output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/')
    output.mkdir(parents=True,exist_ok=True,mode=0o700)
    digest=lambda text:hashlib.sha256(text.encode()).hexdigest()
    normalize=lambda text:'\n'.join(line.rstrip(' \t\r') for line in text.split('\n')).strip('\n')
    snapshot=json.loads(Path(args.snapshot).read_text());extra=additions()
    report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
    for p in snapshot['problems']:
        oracle=ORACLES.get(p['slug'])
        if not oracle:continue
        spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}}
        row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
        for kind in ('samples','testCases'):
            for c in p[kind]:
                check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
                try:
                    answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
                    if p['slug']=='uva-160-factors-and-factorials' and check['status']=='WRONG_EXPECTED_OUTPUT':
                        assert answer.split()==c['output'].split()
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Restore explicitly required width3 number fields,15 exponent fields per line and six-space continuation indent. All numeric tokens and inputs are unchanged.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'],c['output'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Repair only invalid-domain data: Rails replaces one duplicated coach label by the missing label while independently preserving each original verdict; Prime Land reduces only exponents of out-of-range products until the declared32767 bound is met; DNA maps invalid-alphabet strings to distinct legal DNA strings of the same length and exact inversion count, preserving all tie order. Valid groups and cases remain unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all factorial inputs and prime-land values, every tiny train permutation, unique-label tree traversals, stable DNA ties, maximal Goldbach gap and all unordered-pair query values','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
