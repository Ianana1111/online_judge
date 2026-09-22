"""Independent pair balances, merge inversions, capacity-two flow and directional DP."""
import argparse,hashlib,json,random
from collections import Counter,deque
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def exchange(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n=values[i];i+=1
  if n==0:break
  assert 1<=n<=500000;balance=Counter()
  for _ in range(n):
   a,b=values[i:i+2];i+=2;assert a>=0 and b>=0 and a!=b;balance[a,b]+=1;balance[b,a]-=1
  out.append('YES' if all(v==0 for v in balance.values()) else 'NO')
 assert i==len(values)
 return '\n'.join(out)+'\n'
def inversion_count(a):
 def merge(a):
  if len(a)<=1:return a,0
  mid=len(a)//2;left,x=merge(a[:mid]);right,y=merge(a[mid:]);result=[];i=j=0;count=x+y
  while i<len(left) and j<len(right):
   if left[i]<=right[j]:result.append(left[i]);i+=1
   else:result.append(right[j]);j+=1;count+=len(left)-i
  result.extend(left[i:]);result.extend(right[j:]);return result,count
 return merge(list(a))[1]
def inversions(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n=values[i];i+=1
  if n==0:break
  assert 1<=n<500000;a=values[i:i+n];i+=n;assert len(a)==n and len(set(a))==n and all(0<=x<=999999999 for x in a)
  out.append(str(inversion_count(a)))
 assert i==len(values)
 return '\n'.join(out)+'\n'
def frog_distance(stones,d):
 points=[0]+[p for _,p in stones]+[d];caps=[2]+[1 if kind=='S' else 2 for kind,_ in stones]+[2];n=len(points)
 def feasible(jump):
  graph=[[] for _ in range(2*n)]
  def edge(a,b,c):graph[a].append([b,c,len(graph[b])]);graph[b].append([a,0,len(graph[a])-1])
  for i in range(n):edge(2*i,2*i+1,caps[i])
  for i in range(n):
   for j in range(i+1,n):
    if points[j]-points[i]>jump:break
    edge(2*i+1,2*j,2)
  for _ in range(2):
   parents=[None]*(2*n);parents[0]=(-1,-1);todo=deque([0])
   while todo and parents[-1] is None:
    a=todo.popleft()
    for k,(b,c,_) in enumerate(graph[a]):
     if c>0 and parents[b] is None:parents[b]=(a,k);todo.append(b)
   if parents[-1] is None:return False
   b=2*n-1
   while b:
    a,k=parents[b];reverse=graph[a][k][2];graph[a][k][1]-=1;graph[b][reverse][1]+=1;b=a
  return True
 low=0;high=d
 while low<high:
  mid=(low+high)//2
  if feasible(mid):high=mid
  else:low=mid+1
 return low

def frog(data):
 words=data.split();t=int(words[0]);assert 1<=t<100;i=1;out=[]
 for case in range(1,t+1):
  n,d=map(int,words[i:i+2]);i+=2;assert 0<=n<=100 and 1<=d<=10**9;stones=[]
  for _ in range(n):
   kind,value=words[i].split('-');i+=1;p=int(value);assert kind in ('B','S') and 0<p<d and (not stones or stones[-1][1]<p);stones.append((kind,p))
  out.append(f'Case {case}: {frog_distance(stones,d)}')
 assert i==len(words)
 return '\n'.join(out)+'\n'
def antimonotone(a):
 n=len(a);odd=[0]*(n+1);even=[0]*(n+1);answer=1
 def query(tree,i):
  best=0
  while i:best=max(best,tree[i]);i-=i&-i
  return best
 def update(tree,i,value):
  while i<=n:tree[i]=max(tree[i],value);i+=i&-i
 for x in a:
  prior_odd=query(odd,n-x);prior_even=query(even,x-1)
  odd_here=prior_even+1 if prior_even else 1;even_here=prior_odd+1 if prior_odd else 0
  update(odd,n+1-x,odd_here)
  if even_here:update(even,x,even_here)
  answer=max(answer,odd_here,even_here)
 return answer

def alternating(data):
 values=list(map(int,data.split()));t=values[0];assert 1<=t<=50;i=1;out=[]
 for _ in range(t):
  n=values[i];i+=1;assert 1<=n<=30000;a=values[i:i+n];i+=n;assert len(a)==n and sorted(a)==list(range(1,n+1));out.append(str(antimonotone(a)))
 assert i==len(values)
 return '\n'.join(out)+'\n'
def classify(ops):
 surviving=[]
 for name in ['stack','queue','priority queue']:
  records=[];good=True
  for stamp,(op,x) in enumerate(ops):
   if op==1:records.append((stamp,x));continue
   if not records:good=False;break
   if name=='stack':chosen=max(records,key=lambda r:r[0])
   elif name=='queue':chosen=min(records,key=lambda r:r[0])
   else:chosen=max(records,key=lambda r:r[1])
   if chosen[1]!=x:good=False;break
   records.remove(chosen)
  if good:surviving.append(name)
 return 'impossible' if not surviving else surviving[0] if len(surviving)==1 else 'not sure'
def bags(data):
 values=list(map(int,data.split()));i=0;out=[]
 while i<len(values):
  n=values[i];i+=1;assert 1<=n<=1000;ops=[]
  for _ in range(n):
   op,x=values[i:i+2];i+=2;assert op in (1,2) and 1<=x<=100;ops.append((op,x))
  out.append(classify(ops))
 return '\n'.join(out)+'\n'
ORACLES={'uva-10763-foreign-exchange':exchange,'uva-10810-ultra-quicksort':inversions,'uva-11157-dynamic-frog':frog,'uva-11240-antimonotonicity':alternating,'uva-11995-i-can-guess-the-data-structure':bags}
def repair_input(slug,data):
 if slug=='uva-11240-antimonotonicity' and hashlib.sha256(data.encode()).hexdigest()=='14e9166442099353d8002d65723850f557c83237676649f1b1cc0263c7003918':
  return '1\n1 1\n'
 return None

def additions():
 rng=random.Random(1076311995)
 exchanges=[[(1,2)],[(1,2),(2,1)],[(1,2),(1,2),(2,1)],[(1,2),(2,3),(3,1)],[(0,1),(1,0)]*250000]
 for _ in range(30):
  a=[tuple(rng.sample(range(10),2)) for _ in range(rng.randrange(1,30))];exchanges.extend([a,a+[(b,a) for a,b in a]])
 arrays=[[0],[0,999999999],[999999999,0],list(range(499998,-1,-1))]
 arrays += [rng.sample(range(10000),rng.randrange(1,80)) for _ in range(30)]
 frogs=[([],1),([],10**9),([('S',5)],10),([('B',5)],10),([('S',3),('S',7)],10),([('S',i) for i in range(1,101)],101),([('B',i*9999999) for i in range(1,101)],10**9)]
 for _ in range(40):
  d=rng.randrange(2,100);positions=sorted(rng.sample(range(1,d),rng.randrange(min(d,15))));frogs.append(([(rng.choice('BS'),p) for p in positions],d))
 permutations=[[1],[1,2],[2,1],[2,4,1,3],list(range(1,30001)),list(range(30000,0,-1)),[x for i in range(15000) for x in (30000-i,i+1)]]
 for _ in range(30):
  a=list(range(1,rng.randrange(3,100)));rng.shuffle(a);permutations.append(a)
 traces=[[(2,1)],[(1,2),(1,3),(1,1),(2,3)],[(1,1),(1,2),(2,2)],[(1,2),(1,3),(1,1),(2,1),(2,3),(2,2)],[(1,2),(1,3),(1,1),(2,2),(2,3),(2,1)],[(1,1),(1,1),(2,1),(2,1)],[(1,100)]*500+[(2,100)]*500]
 traces += [[(rng.choice([1,2]),rng.randrange(1,101)) for _ in range(rng.randrange(1,50))] for _ in range(50)]
 return {'uva-10763-foreign-exchange':''.join(str(len(a))+'\n'+''.join(f'{x} {y}\n' for x,y in a) for a in exchanges)+'0\n',
 'uva-10810-ultra-quicksort':''.join(str(len(a))+'\n'+'\n'.join(map(str,a))+'\n' for a in arrays)+'0\n',
 'uva-11157-dynamic-frog':str(len(frogs))+'\n'+''.join(f'{len(s)} {d}\n'+' '.join(f'{t}-{p}' for t,p in s)+'\n' for s,d in frogs),
 'uva-11240-antimonotonicity':str(len(permutations))+'\n'+''.join(str(len(a))+' '+' '.join(map(str,a))+'\n' for a in permutations),
 'uva-11995-i-can-guess-the-data-structure':''.join(str(len(a))+'\n'+''.join(f'{op} {x}\n' for op,x in a) for a in traces)}

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: the singleton permutation must contain 1 rather than an out-of-range value. Its length, comparisons and expected answer stay unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'reciprocal multiplicities, largest legal distinct inversion sequence, single-use stones, fixed first direction, duplicate values and ambiguous containers','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
