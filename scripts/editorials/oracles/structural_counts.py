"""Independent blocked-point combinatorics, bipartite components, clause propagation, multiplicative divisor counts, rope slices and digit DP."""
import argparse,hashlib,json,random,itertools,math
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def grid_count(w,h,obstacles):
 points=sorted(set((x,y) for x,y in obstacles if x<=w and y<=h));points.append((w,h));counts=[]
 for i,(x,y) in enumerate(points):
  count=math.comb(x+y,x)
  for j,(a,b) in enumerate(points[:i]):
   if a<=x and b<=y:count-=counts[j]*math.comb(x-a+y-b,x-a)
  counts.append(count)
 return counts[-1]
def riding(data):
 a=list(map(int,data.split()));i=0;out=[]
 while True:
  w,h=a[i:i+2];i+=2
  if w==h==0:break
  n=a[i];i+=1;assert 1<=w<=100 and 1<=h<=100 and 0<=n<=100;points=[]
  for _ in range(n):
   x,y=a[i:i+2];i+=2;assert 0<=x<=100 and 0<=y<=100 and (x,y) not in [(0,0),(w,h)];points.append((x,y))
  count=grid_count(w,h,points);assert 0<=count<=2**32-1
  out.append('There is no path.' if count==0 else "There is one path from Little Red Riding Hood's house to her grandmother's house." if count==1 else f"There are {count} paths from Little Red Riding Hood's house to her grandmother's house.")
 assert i==len(a);return '\n'.join(out)+ ('\n' if out else '')
def lying_possible(n,edges):
 parent=list(range(2*n));size=[1]*(2*n)
 def root(u):
  while parent[u]!=u:parent[u]=parent[parent[u]];u=parent[u]
  return u
 edges=set(edges)
 for u,v in edges:
  u=root(u);v=root(n+v)
  if u!=v:
   if size[u]<size[v]:u,v=v,u
   parent[v]=u;size[u]+=size[v]
 left={};right={};count={}
 for u in range(n):r=root(u);left[r]=left.get(r,0)+1;r=root(u+n);right[r]=right.get(r,0)+1
 for u,v in edges:r=root(u);count[r]=count.get(r,0)+1
 return all(count.get(r,0)==left.get(r,0)*right.get(r,0) for r in set(left)|set(right))
def lying(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert 0<=t<220;out=[]
 for case in range(1,t+1):
  n,k=a[i:i+2];i+=2;assert 0<=n<=300 and k>=0;edges=[]
  for _ in range(k):u,v=a[i:i+2];i+=2;assert 0<=u<n and 0<=v<n;edges.append((u,v))
  out.append(f"Case #{case}: {'Yes' if lying_possible(n,edges) else 'No'}")
 assert i==len(a);return '\n'.join(out)+ ('\n' if out else '')
def reliable_max(n,assertions):
 clauses=list(set((-x,y) for x,y in assertions));best=0;full=(1<<n)-1
 def status(lit,yes,no):
  bit=1<<(abs(lit)-1)
  if yes&bit:return 1 if lit>0 else -1
  if no&bit:return -1 if lit>0 else 1
  return 0
 def search(yes,no):
  nonlocal best
  while True:
   changed=False
   for x,y in clauses:
    sx,sy=status(x,yes,no),status(y,yes,no)
    if sx==1 or sy==1:continue
    if sx==sy==-1:return
    forced=y if sx==-1 else x if sy==-1 else 0
    if forced:
     bit=1<<(abs(forced)-1)
     if forced>0:yes|=bit
     else:no|=bit
     changed=True
   if not changed:break
  if n-bin(no).count('1')<=best:return
  free=full^(yes|no)
  if not free:best=bin(yes).count('1');return
  bit=free&-free;search(yes|bit,no);search(yes,no|bit)
 search(0,0);return best
def informants(data):
 a=list(map(int,data.split()));i=0;out=[]
 while True:
  n,k=a[i:i+2];i+=2
  if n==k==0:break
  assert 1<=n<=20 and 0<=k<=800;statements=[]
  for _ in range(k):x,y=a[i:i+2];i+=2;assert 1<=x<=n and 1<=abs(y)<=n;statements.append((x,y))
  out.append(str(reliable_max(n,statements)))
 assert i==len(a);return '\n'.join(out)+ ('\n' if out else '')
@lru_cache(None)
def divisor_table():
 bound=1000000;least=[0]*(bound+1);powers=[0]*(bound+1);counts=[0]*(bound+1);primes=[];counts[1]=1
 for n in range(2,bound+1):
  if not least[n]:least[n]=n;powers[n]=1;counts[n]=2;primes.append(n)
  for p in primes:
   v=n*p
   if v>bound:break
   least[v]=p
   if p==least[n]:powers[v]=powers[n]+1;counts[v]=counts[n]//(powers[n]+1)*(powers[v]+1);break
   powers[v]=1;counts[v]=counts[n]*2
 best=[0]*(bound+1);record=1
 for n in range(1,bound+1):
  if counts[n]>=counts[record]:record=n
  best[n]=record
 return counts,best
def divisors(data):
 a=list(map(int,data.split()));t=a[0];assert 0<=t<=50000 and len(a)==t+1 and all(1<=n<=1000000 for n in a[1:]);best=divisor_table()[1];return ''.join(str(best[n])+'\n' for n in a[1:])
LENGTHS=[1,1]
while len(LENGTHS)<=47:LENGTHS.append(LENGTHS[-2]+LENGTHS[-1])
def fibonacci_slice(n,left,right):
 if n>47:n=46+(n-46)%2
 out=[];stack=[(n,left,right)]
 while stack:
  level,lo,hi=stack.pop()
  if level<2:out.append(str(level));continue
  split=LENGTHS[level-2]
  if hi>=split:stack.append((level-1,max(0,lo-split),hi-split))
  if lo<split:stack.append((level-2,lo,min(hi,split-1)))
 return ''.join(out)
def fibonacci(data):
 a=list(map(int,data.split()));t=a[0];assert 0<=t<=100 and len(a)==1+3*t;out=[]
 for i in range(t):
  n,lo,hi=a[1+3*i:4+3*i];assert 0<=n<=2**31-1 and 0<=lo<=hi<=2**31-1 and hi-lo<=10000 and (n>=46 or hi<LENGTHS[n]);out.append(fibonacci_slice(n,lo,hi))
 return '\n'.join(out)+ ('\n' if out else '')
def ones_prefix(n):
 if n<0:return 0
 states={True:(1,0)}
 for digit in bin(n)[2:]:
  current=int(digit);following={}
  for tight,(ways,total) in states.items():
   for chosen in range((current if tight else 1)+1):
    key=tight and chosen==current;oldways,oldtotal=following.get(key,(0,0));following[key]=(oldways+ways,oldtotal+total+chosen*ways)
  states=following
 return sum(total for ways,total in states.values())
def ones(data):
 a=list(map(int,data.split()));assert len(a)%2==0 and a[-2:]==[0,0] and len(a)//2-1<=11000;out=[]
 for case,(lo,hi) in enumerate(zip(a[0:-2:2],a[1:-2:2]),1):assert 0<=lo<=hi<=2000000000 and hi>0;out.append(f'Case {case}: {ones_prefix(hi)-ones_prefix(lo-1)}')
 return '\n'.join(out)+ ('\n' if out else '')
ORACLES={'uva-11067-little-red-riding-hood':riding,'uva-11175-from-d-to-e-and-back':lying,'uva-11659-informants':informants,'uva-11960-divisor-game':divisors,'uva-12041-bfs-binary-fibonacci-string':fibonacci,'uva-12208-how-many-ones-needed':ones}
def additions():
 rng=random.Random(11175)
 grids=[(1,1,[]),(1,1,[(0,1)]),(1,1,[(0,1),(1,0)]),(17,17,[]),(100,100,[(99,100),(100,99)]),(18,17,[(0,1)]),(1,100,[(0,y) for y in range(1,101)]),(2,2,[(100,100),(1,1),(1,1)])]
 for _ in range(100):
  w,h=rng.randint(1,12),rng.randint(1,12);available=[(x,y) for x in range(w+1) for y in range(h+1) if (x,y) not in [(0,0),(w,h)]];grids.append((w,h,rng.sample(available,rng.randrange(min(100,len(available))+1))))
 graphs=[(0,[]),(3,[(0,1),(0,2),(1,1)]),(300,[(u,v) for u in range(300) for v in range(300)])]
 for _ in range(50):
  m=rng.randint(1,100);nodes=[(rng.randrange(15),rng.randrange(15)) for i in range(m)];edges=[(u,v) for u in range(m) for v in range(m) if nodes[u][1]==nodes[v][0]];graphs.append((m,edges))
 for _ in range(100):
  m=rng.randint(1,25);graphs.append((m,[(u,v) for u in range(m) for v in range(m) if rng.random()<.15]))
 people=[(20,[]),(1,[(1,-1)]),(2,[(1,-2)]),(20,[(i,j) for i in range(1,21) for j in list(range(1,21))+list(range(-20,0))])]
 for _ in range(35):
  n=20 if _<5 else rng.randint(1,12);people.append((n,[(rng.randint(1,n),rng.choice([-1,1])*rng.randint(1,n)) for j in range(rng.randrange(100))]))
 counts,best=divisor_table();queries=list(range(1,10001))+[1000000,999999]
 for n in range(2,1000001):
  if best[n]!=best[n-1]:queries.extend([n-1,n,min(1000000,n+1)])
 queries=queries[:50000]
 while len(queries)<50000:queries.append(rng.randint(1,1000000))
 slices=[(0,0,0),(1,0,0),(46,2**31-10001,2**31-1),(47,1836311898,1836311908),(2**31-1,2**31-10001,2**31-1),(2**31-2,0,10000)]
 for _ in range(94):
  n=rng.choice([rng.randrange(48),rng.randrange(48,2**31)]);limit=min(2**31,LENGTHS[n] if n<48 else 2**31);lo=rng.randrange(limit);hi=min(limit-1,lo+rng.randrange(10001));slices.append((n,lo,hi))
 ranges=[(0,2000000000),(2000000000,2000000000),(0,1),(1,1)]
 for bit in range(1,31):
  center=1<<bit;ranges.extend([(center-1,center),(0,center),(center,center)])
 while len(ranges)<11000:lo=rng.randrange(2000000001);hi=rng.randrange(max(1,lo),2000000001);ranges.append((lo,hi))
 return {'uva-11067-little-red-riding-hood':''.join(f'{w} {h}\n{len(points)}\n'+''.join(f'{x} {y}\n' for x,y in points) for w,h,points in grids)+'0 0\n','uva-11175-from-d-to-e-and-back':str(len(graphs))+'\n'+''.join(f'{n}\n{len(edges)}\n'+''.join(f'{u} {v}\n' for u,v in edges) for n,edges in graphs),'uva-11659-informants':''.join(f'{n} {len(statements)}\n'+''.join(f'{x} {y}\n' for x,y in statements) for n,statements in people)+'0 0\n','uva-11960-divisor-game':str(len(queries))+'\n'+'\n'.join(map(str,queries))+'\n','uva-12041-bfs-binary-fibonacci-string':str(len(slices))+'\n'+''.join(f'{n} {lo} {hi}\n' for n,lo,hi in slices),'uva-12208-how-many-ones-needed':''.join(f'{lo} {hi}\n' for lo,hi in ranges)+'0 0\n'}

def repair_input(slug,data,expected):
 if slug=='uva-11067-little-red-riding-hood':
  a=list(map(int,data.split()));i=0
  while a[i:i+2]!=[0,0]:i+=3+2*a[i+2]
  assert a[i:]==[0,0,0,0];lines=data.splitlines();assert lines[-2:]==['0 0','0 0'];fixed='\n'.join(lines[:-1])+'\n';assert riding(fixed).strip()==expected.strip();return fixed,[], 'Remove only a duplicated terminal zero pair; every grid, obstacle and expected answer is unchanged.'
 if slug=='uva-12208-how-many-ones-needed':
  rows=data.splitlines();assert len(rows)==11003 and rows[-1]=='0 0';first='\n'.join(rows[:11000]+['0 0'])+'\n';tail='\n'.join(rows[11000:])+'\n';left=ones(first).splitlines();right=ones(tail).splitlines();old=expected.splitlines();assert left==old[:11000] and [r.split()[-1] for r in right]==[r.split()[-1] for r in old[11000:]];return first,[tail], 'Split11002 valid queries into legal files of11000 and2, preserving every query and numeric answer; only per-file case serials restart.'
 return None

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
                    if p['slug']=='uva-11067-little-red-riding-hood' and check['status']=='WRONG_EXPECTED_OUTPUT':
                        assert normalize(answer)==normalize(c['output'].replace('’',"'"));row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Restore ASCII apostrophes in the public sample output; preserve all counts and words, matching the output specification and existing hidden cases.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';repair=repair_input(p['slug'],c['input'],c['output'])
                    if repair is not None:
                        corrected,overflow,reason=repair;row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':reason})
                        for chunk in overflow:row['proposedAdditions'].append({'label':'Preserved overflow queries from overlong existing case','input':chunk,'output':oracle(chunk)})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'blocked paths with large dead ends, biclique line-graph characterization, optional liar assertions, largest tied divisor record, billion-level Fibonacci rope slices and bit-count ranges','input':data,'output':oracle(data)})
        if p['slug']=='uva-12041-bfs-binary-fibonacci-string':
            data='1\n2147483647 0 10000\n'
            if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'Huge odd level at the first two characters, which distinguish opposite parity prefixes','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
