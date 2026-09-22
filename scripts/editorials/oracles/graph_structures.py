"""Independent BFS deletion, threshold connectivity, residual paths, literal sets and sign trees."""
import argparse,hashlib,json,random,itertools,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def distances(graph,start,banned=-1):
 distance=[-1]*len(graph);distance[start]=0;queue=collections.deque([start])
 while queue:
  u=queue.popleft()
  for v in graph[u]:
   if v!=banned and distance[v]<0:distance[v]=distance[u]+1;queue.append(v)
 return distance

def degrees(data):
 a=data.split();i=0;out=[];tc=0
 while True:
  n,r=map(int,a[i:i+2]);i+=2
  if (n,r)==(0,0):break
  assert 2<=n<=50 and r>=1;names={};graph=[set() for _ in range(n)]
  def index(name):
   if name not in names:names[name]=len(names)
   return names[name]
  for _ in range(r):
   u,v=map(index,a[i:i+2]);i+=2;assert u<n and v<n and u!=v;graph[u].add(v);graph[v].add(u)
  all_dist=[distances(graph,v) for v in range(n)];answer='DISCONNECTED' if any(-1 in row for row in all_dist) else str(max(map(max,all_dist)));tc+=1;out.append(f'Network {tc}: {answer}')
 assert i==len(a);return '\n\n'.join(out)+'\n\n'

def cut_count(graph):
 n=len(graph);assert n and all(d>=0 for d in distances(graph,0));answer=0
 for removed in range(n):
  start=next((v for v in range(n) if v!=removed),None)
  if start is not None and sum(d>=0 for d in distances(graph,start,removed))<n-1:answer+=1
 return answer

def networks(data):
 lines=iter(data.splitlines());out=[]
 for line in lines:
  if not line.strip():continue
  n=int(line)
  if n==0:assert not any(line.strip() for line in lines);break
  assert 1<=n<100;graph=[set() for _ in range(n)];rows=0
  for line in lines:
   a=list(map(int,line.split()))
   if a==[0]:break
   rows+=1;assert rows<=n and len(a)>=1 and all(1<=v<=n for v in a)
   for v in a[1:]:assert v!=a[0];graph[a[0]-1].add(v-1);graph[v-1].add(a[0]-1)
  out.append(str(cut_count(graph)))
 return '\n'.join(out)+'\n'

def cargo_capacity(n,edges,s,t):
 assert s!=t;parent=list(range(n));size=[1]*n
 def root(v):
  while v!=parent[v]:v=parent[v]
  return v
 for u,v,w in sorted(edges,key=lambda edge:-edge[2]):
  a,b=root(u),root(v)
  if a!=b:
   if size[a]<size[b]:a,b=b,a
   parent[b]=a;size[a]+=size[b]
  if root(s)==root(t):return w
 return 0

def cargo(data):
 a=data.split();i=0;out=[];tc=0
 while True:
  n,r=map(int,a[i:i+2]);i+=2
  if (n,r)==(0,0):break
  assert 2<=n<=200 and 1<=r<=19900;names={};edges=[]
  def index(name):
   assert 1<=len(name)<=30
   if name not in names:names[name]=len(names)
   return names[name]
  for _ in range(r):
   u,v=index(a[i]),index(a[i+1]);w=int(a[i+2]);i+=3;assert u<n and v<n and u!=v and 0<=w<=10000;edges.append((u,v,w))
  s,t=index(a[i]),index(a[i+1]);i+=2;assert s<n and t<n;tc+=1;out.append(f'Scenario #{tc}\n{cargo_capacity(n,edges,s,t)} tons')
 assert i==len(a);return '\n\n'.join(out)+'\n\n'

def bandwidth_value(n,edges,s,t):
 capacity=[[0]*n for _ in range(n)]
 for u,v,w in edges:capacity[u][v]+=w;capacity[v][u]+=w
 answer=0
 while True:
  parent=[-1]*n;parent[s]=s;queue=collections.deque([s])
  while queue and parent[t]<0:
   u=queue.popleft()
   for v,w in enumerate(capacity[u]):
    if w>0 and parent[v]<0:parent[v]=u;queue.append(v)
  if parent[t]<0:return answer
  path=[];v=t
  while v!=s:u=parent[v];path.append((u,v));v=u
  flow=min(capacity[u][v] for u,v in path);answer+=flow
  for u,v in path:capacity[u][v]-=flow;capacity[v][u]+=flow

def bandwidth(data):
 a=list(map(int,data.split()));i=0;out=[];tc=0
 while a[i]:
  n=a[i];s,t,c=a[i+1:i+4];i+=4;assert 2<=n<=100 and 1<=s<=n and 1<=t<=n and s!=t and c>=0;edges=[]
  for _ in range(c):
   u,v,w=a[i:i+3];i+=3;assert 1<=u<=n and 1<=v<=n and u!=v and 0<=w<=1000;edges.append((u-1,v-1,w))
  tc+=1;out.append(f'Network {tc}\nThe bandwidth is {bandwidth_value(n,edges,s-1,t-1)}.')
 assert i==len(a)-1;return '\n\n'.join(out)+'\n\n'

def almost(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n,m=a[i:i+2];i+=2;assert 1<=n<=100000 and 1<=m<=100000;owner=list(range(n+1));groups=[{v} for v in range(n+1)];totals=list(range(n+1))
  for _ in range(m):
   op,p=a[i:i+2];i+=2;assert op in (1,2,3) and 1<=p<=n;left=owner[p]
   if op==3:out.append(f'{len(groups[left])} {totals[left]}');continue
   q=a[i];i+=1;assert 1<=q<=n;right=owner[q]
   if left==right:continue
   if op==2:groups[left].remove(p);totals[left]-=p;groups[right].add(p);totals[right]+=p;owner[p]=right
   else:
    if len(groups[left])>len(groups[right]):left,right=right,left
    for element in groups[left]:owner[element]=right
    groups[right].update(groups[left]);totals[right]+=totals[left];groups[left].clear();totals[left]=0
 return '\n'.join(out)+ ('\n' if out else '')

def products(data):
 a=data.split();i=0;out=[]
 while i<len(a):
  n,k=map(int,a[i:i+2]);i+=2;assert 1<=n<=100000 and 1<=k<=100000;values=list(map(int,a[i:i+n]));i+=n;assert len(values)==n and all(-100<=v<=100 for v in values);tree=[1]*(2*n);tree[n:]=[(v>0)-(v<0) for v in values]
  for v in range(n-1,0,-1):tree[v]=tree[2*v]*tree[2*v+1]
  answer=[]
  for _ in range(k):
   op=a[i];left,right=map(int,a[i+1:i+3]);i+=3;assert 1<=left<=n
   if op=='C':
    assert -100<=right<=100;at=n+left-1;tree[at]=(right>0)-(right<0)
    while at>1:at//=2;tree[at]=tree[2*at]*tree[2*at+1]
   else:
    assert op=='P' and left<=right<=n;l=n+left-1;r=n+right;sign=1
    while l<r:
     if l&1:sign*=tree[l];l+=1
     if r&1:r-=1;sign*=tree[r]
     l//=2;r//=2
    answer.append({-1:'-',0:'0',1:'+'}[sign])
  assert answer;out.append(''.join(answer))
 return '\n'.join(out)+'\n'
ORACLES={'uva-1056-degrees-of-separation':degrees,'uva-315-network':networks,'uva-544-heavy-cargo':cargo,'uva-820-internet-bandwidth':bandwidth,'uva-11987-almost-union-find':almost,'uva-12532-interval-product':products}
def additions():
 rng=random.Random(11987);degree_cases=[(3,[(0,1)]),(2,[(0,1)]),(50,[(v,v+1) for v in range(49)]),(50,list(itertools.combinations(range(50),2)))];network_cases=[];cargo_cases=[];flow_cases=[]
 for n in range(1,6):
  possible=list(itertools.combinations(range(n),2))
  for mask in range(1<<len(possible)):
   edges=[edge for j,edge in enumerate(possible) if mask>>j&1];g=[set() for _ in range(n)]
   for u,v in edges:g[u].add(v);g[v].add(u)
   if all(d>=0 for d in distances(g,0)):network_cases.append((n,edges))
 network_cases.extend([(99,[(v,v+1) for v in range(98)]),(99,[(0,v) for v in range(1,99)]),(99,list(itertools.combinations(range(99),2)))])
 cargo_cases.extend([(2,[(0,1,0)],0,1),(4,[(0,1,90),(1,3,10),(0,2,50),(2,3,50)],0,3),(3,[(0,1,5),(0,1,9),(1,2,8)],0,2)])
 flow_cases.extend([(2,[(0,1,0)],0,1),(2,[(0,1,10),(0,1,20),(1,0,30)],0,1),(4,[(0,1,20),(0,2,10),(1,2,5),(1,3,10),(2,3,20)],0,3),(3,[(0,1,5)],0,2)])
 for _ in range(120):
  n=rng.randrange(2,18);edges=[(v,rng.randrange(v)) for v in range(1,n)]
  edges+=rng.sample(list(itertools.combinations(range(n),2)),rng.randrange(n*(n-1)//2+1));degree_cases.append((n,edges));weighted=[(u,v,rng.randrange(10001)) for u,v in edges];s,t=rng.sample(range(n),2);cargo_cases.append((n,weighted,s,t));flow_cases.append((n,[(u,v,w%1001) for u,v,w in weighted],s,t))
 cargo_cases.append((200,[(u,v,(u*7919+v*37)%10001) for u,v in itertools.combinations(range(200),2)],0,199));flow_cases.append((100,[(u,v,1000) for u,v in itertools.combinations(range(100),2)],0,99))
 almost_cases=[(5,[(1,1,2),(1,2,3),(2,1,4),(3,2),(3,1),(2,2,5),(3,3),(2,3,3),(3,3),(1,3,1),(3,4)])]
 for _ in range(30):
  n=rng.randrange(1,80);commands=[]
  for j in range(500):
   op=rng.randrange(1,4);p=rng.randrange(1,n+1);commands.append((op,p) if op==3 else (op,p,rng.randrange(1,n+1)))
  almost_cases.append((n,commands))
 almost_cases.append((100000,[(1,1,v) for v in range(2,100001)]+[(3,99999)]))
 product_cases=[([-1,0,1],[('P',1,3),('C',2,-1),('P',1,3),('C',1,1),('P',1,3),('C',3,0),('P',3,3),('C',3,0),('P',1,2)])]
 for _ in range(40):
  n=rng.randrange(1,100);values=[rng.randrange(-100,101) for _ in range(n)];commands=[('P',1,n)]
  for j in range(300):
   left=rng.randrange(1,n+1);commands.append(('C',left,rng.randrange(-100,101)) if rng.randrange(2) else ('P',left,rng.randrange(left,n+1)))
  product_cases.append((values,commands))
 product_cases.append(([-1]*100000,[('P',1,100000-j%100000) if j%3 else ('C',1,(-1,0,1)[j//3%3]) for j in range(100000)]))
 def edge_rows(edges):return '\n'.join(f'{u+1} {v+1} {w}' for u,v,w in edges)
 return {'uva-1056-degrees-of-separation':''.join(f'{n} {len(edges)}\n'+''.join(f'N{u} N{v}\n' for u,v in edges) for n,edges in degree_cases)+'0 0\n','uva-315-network':''.join(str(n)+'\n'+''.join(str(u+1)+' '+ ' '.join(str(v+1) for a,v in edges if a==u)+'\n' for u in range(n) if any(a==u for a,v in edges))+'0\n' for n,edges in network_cases)+'0\n','uva-544-heavy-cargo':''.join(f'{n} {len(edges)}\n'+''.join(f'N{u} N{v} {w}\n' for u,v,w in edges)+f'N{s} N{t}\n' for n,edges,s,t in cargo_cases)+'0 0\n','uva-820-internet-bandwidth':''.join(f'{n}\n{s+1} {t+1} {len(edges)}\n'+edge_rows(edges)+'\n' for n,edges,s,t in flow_cases)+'0\n','uva-11987-almost-union-find':''.join(f'{n} {len(commands)}\n'+'\n'.join(' '.join(map(str,row)) for row in commands)+'\n' for n,commands in almost_cases),'uva-12532-interval-product':''.join(f'{len(values)} {len(commands)}\n'+' '.join(map(str,values))+'\n'+'\n'.join(' '.join(map(str,row)) for row in commands)+'\n' for values,commands in product_cases)}
def repair_input(slug,data,expected=None):
 if slug!='uva-315-network':return None
 lines=iter(data.splitlines());out=[];changed=False
 for line in lines:
  n=int(line);out.append(str(n))
  if n==0:break
  rows=[]
  for line in lines:
   values=list(map(int,line.split()))
   if values==[0]:break
   rows.append(values)
  if len(rows)>n:
   merged={}
   for row in rows:merged.setdefault(row[0],set()).update(row[1:])
   rows=[[u]+sorted(merged[u]) for u in sorted(merged)];changed=True
  out.extend(' '.join(map(str,row)) for row in rows);out.append('0')
 result='\n'.join(out)+'\n';assert networks(result).split()==expected.split()
 return result if changed else None

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
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'],c['output'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Merge repeated source-node adjacency rows so the file meets its at-most-N-row format. Preserve every undirected edge and independently verify the entire original answer remains unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'connected articulation graphs, unnamed isolated vertices, bottleneck alternative routes, undirected parallel flows, identity-preserving set moves and zero/negative range updates','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
