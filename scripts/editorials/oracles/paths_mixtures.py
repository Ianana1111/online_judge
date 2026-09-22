"""Independent Prim complements, reverse deadline feasibility, Fraction mixtures,
and a nondeterministic automaton compiled from the quotation grammar."""
import argparse,bisect,hashlib,heapq,itertools,json,random
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
RACE='uva-1234-racing';ALI='uva-1632-alibaba';POOL='uva-13242-pool-filling';QUOTE='uva-1746-string-theory'

def parse_roads(data,strict=True):
 values=list(map(int,data.split()));count=values[0];at=1;result=[];assert count>0
 for _ in range(count):
  n,m=values[at:at+2];at+=2;assert 1<=n<10000 and 1<=m<100000;edges=[]
  for _ in range(m):
   u,v,w=values[at:at+3];at+=3;assert 1<=u<=n and 1<=v<=n and u!=v and 1<=w<=1000;edges.append((u,v,w))
  if strict:assert len({tuple(sorted((u,v))) for u,v,w in edges})==m
  result.append((n,edges))
 assert values[at:]==[0];return result
def camera_cost(n,edges):
 graph=[[] for _ in range(n+1)]
 for u,v,w in edges:graph[u].append((-w,v));graph[v].append((-w,u))
 seen=set();heap=[(0,1)];kept=0
 while heap:
  minus,u=heapq.heappop(heap)
  if u in seen:continue
  seen.add(u);kept-=minus
  for edge in graph[u]:
   if edge[1] not in seen:heapq.heappush(heap,edge)
 assert len(seen)==n;return sum(w for u,v,w in edges)-kept
def roads(data):return ''.join(str(camera_cost(n,edges))+'\n' for n,edges in parse_roads(data))
def format_roads(cases):return str(len(cases))+'\n'+''.join(f'{n} {len(edges)}\n'+''.join(f'{u} {v} {w}\n' for u,v,w in edges) for n,edges in cases)+'0\n'
def repair_roads(data):
 cases=parse_roads(data,strict=False);changes=0;out=[]
 for n,edges in cases:
  # Reserve ALL original pairs, so a replacement never displaces a later valid original edge.
  reserved={tuple(sorted((u,v))) for u,v,w in edges};seen=set();fresh=((u,u+d) for d in range(1,n) for u in range(1,n-d+1) if (u,u+d) not in reserved);new=[]
  for u,v,w in edges:
   pair=tuple(sorted((u,v)))
   if pair in seen:u,v=next(fresh);changes+=1
   else:seen.add(pair)
   new.append((u,v,w))
  assert [w for u,v,w in new]==[w for u,v,w in edges];out.append((n,new))
 return (format_roads(out),changes) if changes else None

def parse_treasures(data):
 values=list(map(int,data.split()));at=0;out=[]
 while at<len(values):
  n=values[at];at+=1;assert 1<=n<=10000;row=[]
  for _ in range(n):x,deadline=values[at:at+2];at+=2;row.append((x,deadline))
  assert all(row[i][0]<row[i+1][0] for i in range(n-1));out.append(row)
 return out
def treasure_time(row,inclusive=False):
 positions=[x for x,d in row];limits=[d if inclusive else d-1 for x,d in row];n=len(row)
 if any(d<0 for d in limits):return None
 span=positions[-1]-positions[0]
 if all(x-positions[0]<=d for x,d in zip(positions,limits)) or all(positions[-1]-x<=d for x,d in zip(positions,limits)):return span
 # An integer deadline1 forces this to be the first collected treasure. Starting
 # there at0 dominates reaching it later. The two endpoint visit orders give
 # lower bounds; a feasible one-turn route attaining the smaller bound is exact.
 forced=[i for i,d in enumerate(limits) if d==0]
 if len(forced)>1:return None
 if forced:
  middle=forced[0];x=positions[middle];orders=[];certified=[]
  left=x-positions[0];right=positions[-1]-x
  if left<=limits[0] and left+span<=limits[-1]:
   bound=left+span;orders.append(bound)
   if all((x-p if i<=middle else left+p-positions[0])<=d for i,(p,d) in enumerate(zip(positions,limits))):certified.append(bound)
  if right<=limits[-1] and right+span<=limits[0]:
   bound=right+span;orders.append(bound)
   if all((p-x if i>=middle else right+positions[-1]-p)<=d for i,(p,d) in enumerate(zip(positions,limits))):certified.append(bound)
  if not orders:return None
  if certified and min(certified)==min(orders):return min(certified)
 def feasible(finish):
  left=right=[finish]
  for length in range(n-1,0,-1):
   next_left=[];next_right=[]
   for l in range(n-length+1):
    r=l+length-1;a=b=-10**100
    if l>0:
     latest=min(left[l-1],limits[l-1]);a=latest-(positions[l]-positions[l-1]);b=latest-(positions[r]-positions[l-1])
    if r+1<n:
     latest=min(right[l],limits[r+1]);a=max(a,latest-(positions[r+1]-positions[l]));b=max(b,latest-(positions[r+1]-positions[r]))
    next_left.append(a);next_right.append(b)
   left,right=next_left,next_right
  return any(min(left[i],limits[i])>=0 for i in range(n))
 upper=min((n-1)*span,max(limits))
 if upper<span or not feasible(upper):return None
 lower=span
 while lower<upper:
  middle=(lower+upper)//2
  if feasible(middle):upper=middle
  else:lower=middle+1
 return lower
def treasures(data):return ''.join(('No solution' if (value:=treasure_time(row)) is None else str(value))+'\n' for row in parse_treasures(data))
def format_treasures(cases):return ''.join(str(len(row))+'\n'+''.join(f'{x} {deadline}\n' for x,deadline in row) for row in cases)

def parse_pools(data):
 values=list(map(int,data.split()));at=1;out=[];assert values[0]>0
 for _ in range(values[0]):
  capacity,target,n=values[at:at+3];at+=3;assert capacity>0 and 1<=n<=3000;jars=[]
  for _ in range(n):v,t=values[at:at+2];at+=2;assert v>=0;jars.append((v,t))
  out.append((capacity,target,jars))
 assert at==len(values);return out
def pool_choice(capacity,target,jars):
 volume=[0];heat=[0]
 for v,t in jars:volume.append(volume[-1]+v);heat.append(heat[-1]+v*t)
 best=None;minimum=max(1,(capacity+1)//2)
 for end in range(1,len(volume)):
  lo=bisect.bisect_left(volume,volume[end]-capacity,0,end);hi=bisect.bisect_right(volume,volume[end]-minimum,lo,end)
  for start in range(lo,hi):
   difference=abs(Fraction(heat[end]-heat[start],volume[end]-volume[start])-target)
   if difference<=5:
    candidate=(difference,start,end-1)
    if best is None or candidate<best:best=candidate
 return None if best is None else best[1:]
def pools(data):
 answers=[]
 for capacity,target,jars in parse_pools(data):
  answer=pool_choice(capacity,target,jars);answers.append('Not possible' if answer is None else ' '.join(map(str,answer)))
 return '\n'.join(answers)+'\n'
def format_pools(cases):return str(len(cases))+'\n'+''.join(f'{capacity} {target}\n{len(jars)}\n'+''.join(f'{v} {t}\n' for v,t in jars) for capacity,target,jars in cases)

@lru_cache(None)
def quotation_machine(level):
 epsilon=[];quote=[];text=[]
 def state():epsilon.append([]);quote.append([]);text.append([]);return len(epsilon)-1
 def chain(start,count):
  for _ in range(count):destination=state();quote[start].append(destination);start=destination
  return start
 starts={};ends={}
 for k in range(1,level+1):
  start=state();starts[k]=start;inside=chain(start,k);text[inside].append(inside)
  if k==1:ends[k]=chain(inside,1)
  else:
   after=state();text[after].append(after);epsilon[inside].append(starts[k-1]);epsilon[ends[k-1]].append(after);epsilon[after].append(starts[k-1]);ends[k]=chain(after,k)
 def closure(u):
  reached={u};stack=[u]
  for v in stack:
   for w in epsilon[v]:
    if w not in reached:reached.add(w);stack.append(w)
  return sum(1<<v for v in reached)
 closed=[closure(u) for u in range(len(epsilon))]
 transitions=[]
 for rows in [quote,text]:
  table=[]
  for row in rows:
   bits=0
   for destination in row:bits|=closed[destination]
   table.append(bits)
  transitions.append(table)
 return closed[starts[level]],1<<ends[level],transitions
def grammar_accept(runs,level):
 active,final,transitions=quotation_machine(level);cache={}
 for index,count in enumerate(runs):
  for symbol in [0]*count+([1] if index+1<len(runs) else []):
   key=(active,symbol)
   if key in cache:active=cache[key];continue
   original=active;result=0;table=transitions[symbol]
   while active:
    bit=active&-active;result|=table[bit.bit_length()-1];active-=bit
   active=result;cache[(original,symbol)]=result
   if not active:return False
 return bool(active&final)
def quotation_level(runs):
 total=sum(runs)
 for level in range(min(runs[0],runs[-1]),0,-1):
  if level*(level+1)<=total and grammar_accept(runs,level):return level
 return None
def quotations(data):
 values=list(map(int,data.split()));at=0;out=[]
 while at<len(values):
  n=values[at];at+=1;row=values[at:at+n];at+=n;assert 1<=n<=100 and len(row)==n and all(1<=x<=100 for x in row);answer=quotation_level(row);out.append('no quotation' if answer is None else str(answer))
 return '\n'.join(out)+'\n'
def format_quotes(cases):return ''.join(str(len(row))+'\n'+' '.join(map(str,row))+'\n' for row in cases)

ORACLES={RACE:roads,ALI:treasures,POOL:pools,QUOTE:quotations}
def additions():
 rng=random.Random(163213242);graphs=[(2,[(1,2,1000)]),(3,[(1,2,1000),(2,3,999),(1,3,1)]),(4,[(u,v,50) for u,v in itertools.combinations(range(1,5),2)])]
 for _ in range(40):
  n=rng.randint(3,20);pairs={(i,i+1) for i in range(1,n)}
  for _ in range(n*2):pairs.add(tuple(sorted(rng.sample(range(1,n+1),2))))
  graphs.append((n,[(u,v,rng.randint(1,1000)) for u,v in sorted(pairs)]))
 small=[[(1,10),(10,1),(19,28)],[(1,10),(10,1),(19,27)],[(5,1)],[(0,1),(1,2)],[(0,1),(1,1)],[(1,100),(10,100),(19,100)]]
 for n in range(2,13):
  for _ in range(6):small.append(list(zip(sorted(rng.sample(range(100),n)),[rng.randrange(1,200) for _ in range(n)])))
 # Tight middle start on 10000 points: route from mid to left then all the way right has known optimum.
 n=10000;middle=n//2;route=[(i,1 if i==middle else middle-i+1 if i<middle else middle+i+1) for i in range(n)]
 pool_small=[(10,20,[(3,10),(3,30)]),(10,20,[(5,25)]),(11,20,[(5,20),(1,40)]),(10,20,[(5,21),(5,21),(5,21)]),(10,20,[(0,100),(5,20),(0,0)]),(10,20,[(0,20)]),(1000000,50,[(499999,49),(1,50),(500000,51)])]
 for _ in range(80):pool_small.append((rng.randint(1,200),rng.randint(5,50),[(rng.randrange(0,100),rng.randint(0,60)) for _ in range(rng.randint(1,15))]))
 quote_cases=[[x] for x in range(1,101)]+[[1,1],[2,2],[2,1,1,1,3],[100]*100,[99]+[100]*98+[99]]
 for _ in range(100):quote_cases.append([rng.randint(1,100) for _ in range(rng.randint(1,100))])
 return {RACE:[format_roads(graphs)],ALI:[format_treasures(small),format_treasures([route])],POOL:[format_pools(pool_small),format_pools([(3000,50,[(1,51)]*3000),(3001,50,[(1,49+i%3) for i in range(3000)])])],QUOTE:[format_quotes(quote_cases)]}

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();normalize=lambda s:'\n'.join(line.rstrip(' \t\r') for line in s.split('\n')).strip('\n');snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  oracle=ORACLES.get(p['slug'])
  if not oracle:continue
  spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:
     answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):
     check['status']='INPUT_REQUIRES_REVIEW'
     if p['slug']==RACE:
      repaired=repair_roads(c['input'])
      if repaired:
       data,count=repaired;row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':data,'output':oracle(data),'reason':f'User explicitly authorized repairing parallel roads on2026-09-22. Rewire only {count} repeated unordered endpoint pairs to deterministic unused pairs. Preserve vertex and edge counts, every edge cost in its original order, and the first occurrence of every original pair; reserve all original pairs before rewiring. Original connectivity is retained by its original first-occurrence edges. Recompute the answer with independent maximum Prim; keep original circuit minimum of three roads and state the simple-graph guarantee explicitly.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'simple-road cycles;strict deadline equality and10000points;exact rational pool boundaries and3000jars;quotation grammar and100runs','input':data,'output':oracle(data)})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
