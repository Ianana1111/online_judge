"""Independent disjoint-pair counts, Manacher radii, Z periods and exact factorials."""
import argparse,hashlib,json,math,random
from collections import Counter
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def sumset_value(values):
 pairs=Counter(a+b for i,a in enumerate(values) for b in values[i+1:]);present=set(values)
 for d in sorted(values,reverse=True):
  for c in values:
   if c==d:continue
   target=d-c
   excluded=int(target-c in present and target-c!=c)+int(target-d in present and target-d!=d)-int(c+d==target)
   if pairs[target]>excluded:return d
 return None

def sumsets(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n=values[i];i+=1
  if n==0:break
  assert 1<=n<=1000;a=values[i:i+n];i+=n;assert len(a)==n and len(set(a))==n and all(-536870912<=x<=536870911 for x in a);answer=sumset_value(a);out.append('no solution' if answer is None else str(answer))
 assert i==len(values)
 return '\n'.join(out)+'\n'
def palindrome_extension(s):
 n=len(s);odd=[0]*n;left=0;right=-1;longest=1
 for i in range(n):
  radius=1 if i>right else min(odd[left+right-i],right-i+1)
  while i-radius>=0 and i+radius<n and s[i-radius]==s[i+radius]:radius+=1
  odd[i]=radius
  if i+radius-1==n-1:longest=max(longest,2*radius-1)
  if i+radius-1>right:left=i-radius+1;right=i+radius-1
 even=[0]*n;left=0;right=-1
 for i in range(n):
  radius=0 if i>right else min(even[left+right-i+1],right-i+1)
  while i-radius-1>=0 and i+radius<n and s[i-radius-1]==s[i+radius]:radius+=1
  even[i]=radius
  if i+radius-1==n-1:longest=max(longest,2*radius)
  if i+radius-1>right:left=i-radius;right=i+radius-1
 return s+s[:n-longest][::-1]
def extend(data):
 lines=data.splitlines();assert lines and all(1<=len(s)<=100000 and all('a'<=ch<='z' or 'A'<=ch<='Z' for ch in s) for s in lines)
 return ''.join(palindrome_extension(s)+'\n' for s in lines)
def exponent(s):
 n=len(s);z=[0]*n;left=right=0
 for i in range(1,n):
  if i<=right:z[i]=min(right-i+1,z[i-left])
  while i+z[i]<n and s[z[i]]==s[i+z[i]]:z[i]+=1
  if i+z[i]-1>right:left=i;right=i+z[i]-1
 for width in range(1,n):
  if n%width==0 and z[width]>=n-width:return n//width
 return 1

def power(data):
 lines=data.splitlines();assert lines[-1]=='.';out=[]
 for s in lines[:-1]:
  assert s!='.' and 1<=len(s)<=1000000 and all(32<=ord(ch)<=126 for ch in s);out.append(str(exponent(s)))
 return '\n'.join(out)+'\n'
def factorial_sums(data):
 values=list(map(int,data.split()));assert values and all(0<=n<=1000 for n in values)
 return '\n'.join(str(sum(map(int,str(math.factorial(n))))) for n in values)+'\n'
@lru_cache(maxsize=1)
def prime_sum_counts():
 sieve=bytearray(b'\x01')*10001;sieve[0:2]=b'\x00\x00'
 for p in range(2,101):
  if sieve[p]:
   for multiple in range(p*p,10001,p):sieve[multiple]=0
 primes=[p for p in range(2,10001) if sieve[p]];counts=[0]*10001
 for start in range(len(primes)):
  total=0
  for value in primes[start:]:
   total+=value
   if total>10000:break
   counts[total]+=1
 return counts

def prime_sums(data):
 values=list(map(int,data.split()));assert values[-1]==0 and all(2<=n<=10000 for n in values[:-1]);counts=prime_sum_counts()
 return '\n'.join(str(counts[n]) for n in values[:-1])+'\n'
ORACLES={'gpe-10655-sumsets':sumsets,'gpe-24931-extend-to-palindromes':extend,'gpe-10582-power-strings':power,'gpe-10559-i-love-big-numbers':factorial_sums,'gpe-24461-sum-of-consecutive-prime-numbers':prime_sums}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(1065511475)
 sets=[[1],[1,2,3],[2,3,5,7,12],[-6,-3,-2,-1],[-536870912,536870911,-1,0,1],list(range(-500,500)),list(range(1,1001)),list(range(1000000,1001000))]
 sets += [rng.sample(range(-100,101),rng.randrange(1,25)) for _ in range(80)]
 strings=['a','abba','abac','Aa','xyz','a'*100000,'a'*99999+'b','ab'*50000,'A'*49999+'bc'+'A'*49999]
 strings += [''.join(rng.choice('abABxyz') for _ in range(rng.randrange(1,101))) for _ in range(100)]
 repeated=['a','aaaa','abcabcabc','ababa','..','a a a a ',' '*100,'a'*1000000,'ab'*500000,'a'*999999+'b','ab'*499999+'a']
 repeated += [''.join(rng.choice('ab 09!?') for _ in range(rng.randrange(1,101))) for _ in range(50)]
 return {'gpe-10655-sumsets':''.join(str(len(a))+'\n'+'\n'.join(map(str,a))+'\n' for a in sets)+'0\n',
 'gpe-24931-extend-to-palindromes':'\n'.join(strings)+'\n',
 'gpe-10582-power-strings':'\n'.join(repeated+['.'])+'\n',
 'gpe-10559-i-love-big-numbers':'\n'.join(map(str,range(1001)))+'\n',
 'gpe-24461-sum-of-consecutive-prime-numbers':'\n'.join(map(str,list(range(2,10001))+[0]))+'\n'}

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
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: append missing single-zero final sentinel after the valid sequence. Sequence values and expected numeric result are unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'distinct signed sumsets, shortest palindromic suffix at100000letters, exact million-character periods, all factorials0..1000 and every target2..10000','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
