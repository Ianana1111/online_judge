"""Independent sixth-unit portion scan, exponent-pair enumeration, BVH rectangle contacts, Fraction flights and augmenting-path vertex cuts."""
import argparse,collections,hashlib,itertools,json,math,random,re
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
FOOD='uva-11633-food-portion-size';LCM='uva-12546-lcm-pair-sum';CITY='uva-12882-city-park';PILOTS='uva-12970-alcoholic-pilots';CABLE='uva-1660-cable-tv-network';MOD=1000000007
def portion_cost(a,b,amounts):
 frequency=collections.Counter(amounts);total=sum(amounts);best=None
 # All relevant y/k boundaries(k<=3) lie on this exhaustive sixth-unit lattice.
 for sixths in range(2*max(amounts),6*max(amounts)+1):
  visits=sum(count*((6*y+sixths-1)//sixths) for y,count in frequency.items());cost=Fraction(a*(sixths*visits-6*total)+6*b*visits,6)
  if best is None or cost<best:best=cost
 return best
def food(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n=a[i];i+=1
  if n==0:assert i==len(a);break
  wa,wb=a[i:i+2];i+=2;values=a[i:i+n];i+=n;assert 1<=n<=1000 and len(values)==n and 1<=wa<=10 and 1<=wb<=10 and all(1<=x<=100 for x in values);value=portion_cost(wa,wb,values);out.append(str(value.numerator) if value.denominator==1 else f'{value.numerator} / {value.denominator}')
 else:raise AssertionError('missing0')
 return '\n'.join(out)+'\n'
def isprime(n):return n>=2 and all(n%d for d in range(2,math.isqrt(n)+1))
def lcm_sum(factors):
 ordered=1;n=1
 for prime,exponent in factors:
  powers=[prime**i for i in range(exponent+1)];weighted=0
  for left in range(exponent+1):
   for right in range(exponent+1):
    if max(left,right)==exponent:weighted+=powers[left]
  ordered*=weighted;n*=powers[-1]
 return (ordered+n)%MOD
def lcm_pairs(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=500;i=1;out=[]
 for case in range(1,t+1):
  count=a[i];i+=1;assert 1<=count<=15;factors=[];seen=set()
  for _ in range(count):
   prime,exponent=a[i:i+2];i+=2;assert 2<=prime<=1000 and isprime(prime) and prime not in seen and 1<=exponent<=50;seen.add(prime);factors.append((prime,exponent))
  out.append(f'Case {case}: {lcm_sum(factors)}')
 assert i==len(a);return '\n'.join(out)+'\n'
def surface_area(rectangles):
 boxes=[(x,y,x+w,y+h) for x,y,w,h in rectangles];parent=list(range(len(boxes)));areas=[w*h for x,y,w,h in rectangles]
 def find(x):
  while parent[x]!=x:parent[x]=parent[parent[x]];x=parent[x]
  return x
 def join(a,b):
  a=find(a);b=find(b)
  if a!=b:
   if areas[a]<areas[b]:a,b=b,a
   parent[b]=a;areas[a]+=areas[b]
 def bounds(ids):return (min(boxes[i][0] for i in ids),min(boxes[i][1] for i in ids),max(boxes[i][2] for i in ids),max(boxes[i][3] for i in ids))
 def build(ids):
  box=bounds(ids)
  if len(ids)<=8:return box,ids,None,None
  axis=0 if box[2]-box[0]>=box[3]-box[1] else 1;ids.sort(key=lambda i:boxes[i][axis]+boxes[i][axis+2]);mid=len(ids)//2;return box,None,build(ids[:mid]),build(ids[mid:])
 root=build(list(range(len(boxes))))
 def overlaps(a,b):return a[0]<=b[2] and b[0]<=a[2] and a[1]<=b[3] and b[1]<=a[3]
 for i,box in enumerate(boxes):
  stack=[root]
  while stack:
   node,ids,left,right=stack.pop()
   if not overlaps(box,node):continue
   if ids is not None:
    for j in ids:
     if j<=i or not overlaps(box,boxes[j]):continue
     other=boxes[j];assert not(max(box[0],other[0])<min(box[2],other[2]) and max(box[1],other[1])<min(box[3],other[3]));join(i,j)
   else:stack.extend([left,right])
 answer=max(areas[find(i)] for i in range(len(boxes)));assert answer<=2147483647;return answer
def city(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n=a[i];i+=1;assert 1<=n<=50000;rectangles=[]
  for _ in range(n):
   x,y,w,h=a[i:i+4];i+=4;assert 1<=w<=500 and 1<=h<=500 and all(-2147483648<=v<=2147483647 for v in [x,y,x+w,y+h]);rectangles.append((x,y,w,h))
  out.append(str(surface_area(rectangles)))
 assert i==len(a);return '\n'.join(out)+'\n'
def flight(v1,d1,v2,d2):
 first=Fraction(d1,v1);second=Fraction(d2,v2);assert first!=second;return first<second,(first+second)/2
def pilots(data):
 a=list(map(int,data.split()));assert len(a)%4==0;out=[]
 for i in range(0,len(a),4):
  row=a[i:i+4]
  if row==[0]*4:assert i+4==len(a);break
  assert all(1<=v<=10**9 for v in row);win,average=flight(*row);out.append(f'Case #{i//4+1}: '+('You owe me a beer!' if win else 'No beer for the captain.'));out.append('Avg. arrival time: '+str(average))
 else:raise AssertionError('missing0000')
 return '\n'.join(out)+'\n'
def vertex_safety(n,edges):
 neighbors=[set() for _ in range(n)]
 for u,v in edges:neighbors[u].add(v);neighbors[v].add(u)
 if not n:return 0
 answer=min(map(len,neighbors))
 if answer==n-1:return n
 # Independent Edmonds-Karp, unit split vertices; original cables cannot be cut.
 for source in range(n):
  for sink in range(source+1,n):
   if sink in neighbors[source]:continue
   size=2*n;capacity=[[0]*size for _ in range(size)];adj=[set() for _ in range(size)]
   def edge(u,v,c):capacity[u][v]=c;adj[u].add(v);adj[v].add(u)
   for v in range(n):edge(2*v,2*v+1,n if v in [source,sink] else 1)
   for u,v in edges:edge(2*u+1,2*v,n);edge(2*v+1,2*u,n)
   start=2*source+1;end=2*sink;flow=0
   while flow<answer:
    parent=[-1]*size;parent[start]=start;queue=collections.deque([start])
    while queue and parent[end]<0:
     u=queue.popleft()
     for v in adj[u]:
      if capacity[u][v]>0 and parent[v]<0:parent[v]=u;queue.append(v)
    if parent[end]<0:break
    v=end
    while v!=start:u=parent[v];capacity[u][v]-=1;capacity[v][u]+=1;v=u
    flow+=1
   answer=min(answer,flow)
   if not answer:return 0
 return answer
def cables(data):
 pattern=r'\((\d+),(\d+)\)';tokens=re.findall(r'\(\d+,\d+\)|\d+',data);assert ''.join(tokens)==re.sub(r'\s+','',data);i=0;out=[]
 while i<len(tokens):
  n,m=int(tokens[i]),int(tokens[i+1]);i+=2;assert 0<=n<=50 and m>=0;edges=[]
  for _ in range(m):
   match=re.fullmatch(pattern,tokens[i]);i+=1;assert match;u,v=map(int,match.groups());assert 0<=u<v<n;edges.append((u,v))
  out.append(str(vertex_safety(n,set(edges))))
 return '\n'.join(out)+'\n'
ORACLES={FOOD:food,LCM:lcm_pairs,CITY:city,PILOTS:pilots,CABLE:cables}
def additions():
 rng=random.Random(12882);meals=[(1,1,[3,7,1,9,12]),(10,1,[11,13,17]),(2,3,[6,3]),(10,10,[100]*1000),(1,10,list(range(1,101))*10),(10,1,[1]*999+[100])]
 meals.extend((rng.randint(1,10),rng.randint(1,10),[rng.randint(1,100) for _ in range(rng.randint(1,1000))]) for _ in range(45))
 primes=[p for p in range(2,1001) if isprime(p)];factors=[[(2,1)],[(2,50)],[(997,50)],[(p,50) for p in primes[-15:]],[(2,1),(3,1)],[(2,2),(3,1)]]
 for _ in range(100):factors.append([(p,rng.randint(1,50)) for p in rng.sample(primes,rng.randint(1,15))])
 parks=[[(0,0,3,1),(1,1,1,1)],[(0,0,1,1),(1,1,1,1)],[(0,0,1,1),(2,0,1,1)],[(0,0,1,10)]+[(1,2*y,2,1) for y in range(5)],[(-2147483648,-2147483648,500,500),(2147483147,2147483147,500,500)],[(i*200,0,200,200) for i in range(50000)],[(i%250*501,i//250*501,500,500) for i in range(50000)]]
 for _ in range(20):
  rectangles=[]
  for y in range(10):
   for x in range(10):
    if rng.random()<.5:rectangles.append((x*5,y*5,rng.randint(1,5),rng.randint(1,5)))
  parks.append(rectangles)
 flights=[(999999999,999999998,1000000000,999999999),(1000000000,999999999,999999999,999999998),(1,1000000000,1000000000,1),(4,7,4,9),(2,4,1,3)]
 for _ in range(100):
  row=tuple(rng.randint(1,10**9) for _ in range(4))
  if row[0]*row[3]!=row[2]*row[1]:flights.append(row)
 graphs=[(7,sorted(set(itertools.combinations(range(4),2))|set(itertools.combinations(range(3,7),2)))),(0,[]),(1,[]),(2,[]),(2,[(0,1)]),(50,list(itertools.combinations(range(50),2))),(50,[(i,i+1) for i in range(49)]),(50,[(i,(i+1)%50) if i<49 else (0,49) for i in range(50)]),(50,[(i,j) for i in range(25) for j in range(25,50)])]
 for n in range(3,11):
  for _ in range(6):graphs.append((n,[edge for edge in itertools.combinations(range(n),2) if rng.random()<.45]))
 return {FOOD:[''.join(str(len(values))+'\n'+f'{a} {b}\n'+' '.join(map(str,values))+'\n' for a,b,values in meals)+'0\n'],LCM:[str(len(factors))+'\n'+''.join(str(len(row))+'\n'+''.join(f'{p} {e}\n' for p,e in row) for row in factors)],CITY:[''.join(str(len(rects))+'\n'+''.join('%d %d %d %d\n'%r for r in rects) for rects in parks)],PILOTS:[''.join('%d %d %d %d\n'%row for row in flights)+'0 0 0 0\n'],CABLE:[''.join(f'{n} {len(edges)} '+''.join(f'({u},{v}) ' for u,v in edges)+'\n' for n,edges in graphs)]}

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
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'third-portions,max50primeexponents,pointtouch/50000rectangles,near-equal rational times,empty/complete/vertexcutgraphs','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
