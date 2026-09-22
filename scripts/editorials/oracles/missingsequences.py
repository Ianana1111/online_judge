"""Independent Fenwick, minimax partition DP, prefix extrema and algebraic enumeration."""
import argparse,hashlib,json,random,math,bisect
from collections import Counter,defaultdict
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def wavio_length(values):
 ranks={x:i+1 for i,x in enumerate(sorted(set(values)))}
 def ending(a):
  tree=[0]*(len(ranks)+1);lengths=[]
  for x in a:
   i=ranks[x]-1;best=0
   while i:best=max(best,tree[i]);i-=i&-i
   lengths.append(best+1);i=ranks[x]
   while i<len(tree):tree[i]=max(tree[i],best+1);i+=i&-i
  return lengths
 return max(2*min(a,b)-1 for a,b in zip(ending(values),ending(values[::-1])[::-1]))

def wavios(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n=a[i];i+=1;assert 1<=n<=10000;v=a[i:i+n];i+=n;assert len(v)==n;out.append(str(wavio_length(v)))
 assert 0<len(out)<75;return '\n'.join(out)+'\n'

def container_capacity(values,m):
 n=len(values)
 if m>=n:return max(values)
 prefix=[0]
 for x in values:prefix.append(prefix[-1]+x)
 previous=prefix[:]
 for groups in range(2,m+1):
  current=[10**30]*(n+1)
  for end in range(groups,n+1):
   lo,hi=groups-1,end-1
   # previous[j] increases and last group sum decreases as the cut moves right.
   while lo<hi:
    mid=(lo+hi)//2
    if previous[mid]>=prefix[end]-prefix[mid]:hi=mid
    else:lo=mid+1
   current[end]=min(max(previous[j],prefix[end]-prefix[j]) for j in {lo,max(groups-1,lo-1)})
  previous=current
 return previous[n]

def containers(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n,m=a[i:i+2];i+=2;assert 1<=n<=1000 and 1<=m<=1000000;v=a[i:i+n];i+=n;assert len(v)==n and all(1<=x<=1000000 for x in v);out.append(str(container_capacity(v,m)))
 return '\n'.join(out)+'\n'

def maximum_gain(values):
 prefix=minimum=answer=0
 for x in values:prefix+=x;answer=max(answer,prefix-minimum);minimum=min(minimum,prefix)
 return answer

def jackpots(data):
 a=list(map(int,data.split()));i=0;out=[];ended=False
 while i<len(a):
  n=a[i];i+=1
  if n==0:assert i==len(a);ended=True;break
  assert 1<=n<=10000;v=a[i:i+n];i+=n;assert len(v)==n and all(0<abs(x)<1000 for x in v);answer=maximum_gain(v);out.append(f'The maximum winning streak is {answer}.' if answer>0 else 'Losing streak.')
 assert ended;return '\n'.join(out)+'\n'

def robot_position(instructions):
 answer=0
 for i in range(len(instructions)):
  j=i
  while isinstance(instructions[j],int):assert 0<=instructions[j]<j;j=instructions[j]
  assert instructions[j] in ('LEFT','RIGHT');answer+=1 if instructions[j]=='RIGHT' else -1
 return answer

def robots(data):
 lines=data.splitlines();t=int(lines[0]);assert 1<=t<=100;i=1;out=[]
 for _ in range(t):
  n=int(lines[i]);i+=1;assert 1<=n<=100;instructions=[]
  for j in range(n):
   words=lines[i].split();i+=1
   if len(words)==1:assert words[0] in ('LEFT','RIGHT');instructions.append(words[0])
   else:assert len(words)==3 and words[:2]==['SAME','AS'] and 1<=int(words[2])<=j;instructions.append(int(words[2])-1)
  out.append(str(robot_position(instructions)))
 assert i==len(lines);return '\n'.join(out)+'\n'

def is_subsequence(s,t):
 locations=defaultdict(list)
 for i,ch in enumerate(t):locations[ch].append(i)
 last=-1
 for ch in s:
  indices=locations[ch];pos=bisect.bisect_right(indices,last)
  if pos==len(indices):return False
  last=indices[pos]
 return True

def subsequences(data):
 a=data.split();assert len(a)%2==0 and all(x.isascii() and x.isalnum() for x in a);return ''.join(('Yes' if is_subsequence(s,t) else 'No')+'\n' for s,t in zip(a[::2],a[1::2]))

def book_pair(prices,target):
 count=Counter(prices);valid=[]
 for a in count:
  b=target-a
  if a<=b and count[b]>0 and (a!=b or count[a]>=2):valid.append((b-a,a,b))
 assert valid;return min(valid)[1:]

def books(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n=a[i];i+=1;assert 2<=n<=10000;v=a[i:i+n];i+=n;target=a[i];i+=1;assert len(v)==n and all(0<=x<=1000000 for x in v);lo,hi=book_pair(v,target);out.append(f'Peter should buy books whose prices are {lo} and {hi}.')
 return '\n\n'.join(out)+'\n\n'

def bigmods(data):
 a=list(map(int,data.split()));assert len(a)%3==0;out=[]
 for b,p,m in zip(a[::3],a[1::3],a[2::3]):assert 0<=b<=2147483647 and 0<=p<=2147483647 and 1<=m<=46340;out.append(str(pow(b,p,m)))
 return '\n'.join(out)+'\n'

def quirks(digits):
 assert digits in (2,4,6,8);base=10**(digits//2);answers=[]
 for first in range(base):
  disc=1+4*first*(base-1);root=math.isqrt(disc)
  if root*root!=disc:continue
  # For first=0, both roots of s(s-1)=0 matter.
  for total in {(1+root)//2,(1-root)//2}:
   second=total-first
   if 0<=second<base and total>=0 and total*total==first*base+second:answers.append(first*base+second)
 return sorted(set(answers))

def quirksomes(data):return ''.join(f'{x:0{digits}d}\n' for digits in map(int,data.split()) for x in quirks(digits))
ORACLES={'gpe-11179-wavio-sequence':wavios,'gpe-21964-fill-the-containers':containers,'gpe-23651-the-jackpot':jackpots,'gpe-24911-robot-instructions':robots,'gpe-11009-all-in-all':subsequences,'gpe-11058-exact-sum':books,'gpe-22151-big-mod':bigmods,'gpe-22351-quirksome-squares':quirksomes}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(11413);waves=[[1],[2]*10000,list(range(10000)),list(range(10000,0,-1)),list(range(5000))+list(range(5000,0,-1)),[1,2,2,3,2,2,1],[1,2,3,4,3],[3,2,1,2,3]]
 waves += [[rng.randrange(-20,21) for _ in range(rng.randrange(1,101))] for _ in range(74-len(waves))]
 vessels=[([1],1000000),([1000000]*1000,1),([1000000]*1000,1000),([1]*1000,499),([10,1,1,10],2),([4,78,9],2)]
 vessels += [([rng.randrange(1,1000001) for _ in range(rng.randrange(2,30))],rng.randrange(1,15)) for _ in range(50)]
 gains=[[-1],[-999]*10000,[999]*10000,[1,-1],[-10,4,9,-20,5],[5,-1,5],[-1,1]]
 gains += [[rng.choice([-1,1])*rng.randrange(1,1000) for _ in range(rng.randrange(1,100))] for _ in range(50)]
 commands=[['LEFT']+[f'SAME AS {i}' for i in range(1,100)],['RIGHT'],['LEFT','RIGHT','SAME AS 1','SAME AS 3']]
 for _ in range(97):
  n=rng.randrange(1,101);row=[rng.choice(['LEFT','RIGHT'])]
  for j in range(1,n):row.append(rng.choice(['LEFT','RIGHT',f'SAME AS {rng.randrange(1,j+1)}']))
  commands.append(row)
 pairs=[('a','A'),('aa','a'),('ab','axb'),('ba','ab'),('A0Z','xA0xxZ'),('a'*100000,'a'*100000),('b','a'*100000)]
 for _ in range(100):pairs.append((''.join(rng.choice('aAbB01') for _ in range(rng.randrange(1,15))),''.join(rng.choice('aAbB01') for _ in range(rng.randrange(1,60)))))
 bookcases=[([40,40],80),([1,4,5,9],10),([1,2,4,6,8,9],10),([1000000]*10000,2000000)]
 for _ in range(50):
  prices=[rng.randrange(1,1000001) for _ in range(rng.randrange(2,100))];a,b=rng.sample(range(len(prices)),2);bookcases.append((prices,prices[a]+prices[b]))
 modular=[(0,0,1),(0,0,46340),(0,1,46340),(2147483647,0,1),(2147483647,2147483647,46340),(46340,2,46340),(7,13,19)]
 modular += [(rng.randrange(2147483648),rng.randrange(2147483648),rng.randrange(1,46341)) for _ in range(500)]
 return {'gpe-11179-wavio-sequence':''.join(str(len(v))+'\n'+' '.join(map(str,v))+'\n' for v in waves),'gpe-21964-fill-the-containers':''.join(f'{len(v)} {m}\n'+' '.join(map(str,v))+'\n' for v,m in vessels),'gpe-23651-the-jackpot':''.join(str(len(v))+'\n'+' '.join(map(str,v))+'\n' for v in gains)+'0\n','gpe-24911-robot-instructions':'100\n'+''.join(str(len(row))+'\n'+'\n'.join(row)+'\n' for row in commands),'gpe-11009-all-in-all':''.join(f'{s} {t}\n' for s,t in pairs),'gpe-11058-exact-sum':''.join(str(len(v))+'\n'+' '.join(map(str,v))+f'\n{m}\n\n' for v,m in bookcases),'gpe-22151-big-mod':''.join(f'{b}\n{p}\n{m}\n\n' for b,p,m in modular),'gpe-22351-quirksome-squares':'2\n4\n6\n8\n8\n2\n6\n4\n'}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'strict balanced wavio, ordered partition boundaries, loss-only streaks, chained references, case-sensitive subsequences, distinct book indices, exponent zero and all quirksome digit lengths','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
