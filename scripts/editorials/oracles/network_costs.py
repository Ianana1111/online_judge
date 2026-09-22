"""Independent queue relaxation, directed reachability/matching, bounded-weight buckets, tree matchings, monotone belt cuts and weighted medians."""
import argparse,hashlib,json,random,re,collections,itertools
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def fill_best(capacity,target):
 start=(0,0,capacity[2]);cost={start:0};queue=collections.deque([start]);pending={start}
 while queue:
  state=queue.popleft();pending.remove(state)
  for source in range(3):
   for dest in range(3):
    if source==dest:continue
    volume=min(state[source],capacity[dest]-state[dest])
    if not volume:continue
    nxt=list(state);nxt[source]-=volume;nxt[dest]+=volume;nxt=tuple(nxt);candidate=cost[state]+volume
    if candidate<cost.get(nxt,10**30):
     cost[nxt]=candidate
     if nxt not in pending:pending.add(nxt);queue.append(nxt)
 best_volume=-1;best_cost=0
 for state,value in cost.items():
  for volume in state:
   if volume<=target and (volume>best_volume or volume==best_volume and value<best_cost):best_volume,best_cost=volume,value
 return best_cost,best_volume
def fill(data):
 a=list(map(int,data.split()));t=a[0];assert t>=1 and len(a)==1+4*t;out=[]
 for i in range(t):
  x,y,z,d=a[1+4*i:5+4*i];assert all(1<=v<=200 for v in [x,y,z,d]);out.append('%d %d'%fill_best((x,y,z),d))
 return '\n'.join(out)+'\n'
def plug_unmatched(outlets,devices,adapters):
 graph={}
 for source,dest in adapters:graph.setdefault(source,set()).add(dest)
 choices=[]
 for typ in devices:
  seen={typ};stack=[typ]
  while stack:
   for nxt in graph.get(stack.pop(),[]):
    if nxt not in seen:seen.add(nxt);stack.append(nxt)
  choices.append([i for i,kind in enumerate(outlets) if kind in seen])
 match=[-1]*len(outlets)
 def augment(device,seen):
  for outlet in choices[device]:
   if outlet in seen:continue
   seen.add(outlet)
   if match[outlet]==-1 or augment(match[outlet],seen):match[outlet]=device;return True
  return False
 return len(devices)-sum(augment(device,set()) for device in range(len(devices)))
def plugs(data):
 a=data.split();t=int(a[0]);i=1;assert t>=1;out=[]
 word=lambda s:re.fullmatch('[a-zA-Z0-9]{1,24}',s) is not None
 for _ in range(t):
  n=int(a[i]);i+=1;assert 1<=n<=100;outlets=a[i:i+n];i+=n;assert len(set(outlets))==n and all(word(s) for s in outlets);m=int(a[i]);i+=1;assert 1<=m<=100;names=[];devices=[]
  for _ in range(m):names.append(a[i]);devices.append(a[i+1]);i+=2
  assert len(set(names))==m and all(word(s) for s in names+devices);k=int(a[i]);i+=1;assert 1<=k<=100;adapters=[]
  for _ in range(k):u,v=a[i:i+2];i+=2;assert word(u) and word(v);adapters.append((u,v))
  assert len(set(adapters))==k;out.append(str(plug_unmatched(outlets,devices,adapters)))
 assert i==len(a);return '\n\n'.join(out)+'\n'
def maze_cost(grid):
 n=len(grid);m=len(grid[0]);size=n*m;distance=[10**30]*size;distance[0]=grid[0][0];buckets=[collections.deque() for _ in range(10)];buckets[distance[0]%10].append((0,distance[0]));pending=1;current=distance[0]
 while pending:
  while not buckets[current%10]:current+=1
  node,cost=buckets[current%10].popleft();pending-=1
  if distance[node]!=cost:continue
  assert cost==current
  if node==size-1:return cost
  r,c=divmod(node,m)
  for rr,cc in [(r-1,c),(r+1,c),(r,c-1),(r,c+1)]:
   if 0<=rr<n and 0<=cc<m:
    v=rr*m+cc;candidate=cost+grid[rr][cc]
    if candidate<distance[v]:distance[v]=candidate;buckets[candidate%10].append((v,candidate));pending+=1
 raise AssertionError('grid disconnected')
def mazes(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert t>=1;out=[]
 for _ in range(t):
  n,m=a[i:i+2];i+=2;assert 1<=n<=999 and 1<=m<=999;grid=[a[i+r*m:i+(r+1)*m] for r in range(n)];i+=n*m;assert all(len(row)==m and all(0<=v<=9 for v in row) for row in grid);out.append(str(maze_cost(grid)))
 assert i==len(a);return '\n'.join(out)+'\n'
def valid_tree(n,edges):
 assert len(edges)==n-1 and len(set(tuple(sorted((u,v))) for u,v,*_ in edges))==n-1
 graph=[[] for _ in range(n)]
 for edge in edges:
  u,v=edge[:2];assert 0<=u<n and 0<=v<n and u!=v;graph[u].append(v);graph[v].append(u)
 seen={0};stack=[0]
 while stack:
  for v in graph[stack.pop()]:
   if v not in seen:seen.add(v);stack.append(v)
 assert len(seen)==n;return graph
def tree_matching(n,edges):
 graph=valid_tree(n,edges);degree=list(map(len,graph));alive=[True]*n;leaves=collections.deque(i for i in range(n) if degree[i]<=1);matching=0
 while leaves:
  u=leaves.popleft()
  if not alive[u] or degree[u]!=1:continue
  v=next(v for v in graph[u] if alive[v]);matching+=1;alive[u]=alive[v]=False
  for x in graph[v]:
   if alive[x]:degree[x]-=1;leaves.append(x) if degree[x]<=1 else None
 return matching
def strategy(data):
 lines=[line.strip() for line in data.splitlines() if line.strip()];i=0;out=[]
 while i<len(lines):
  n=int(lines[i]);i+=1;assert 1<=n<=1500;seen=set();edges=[]
  for _ in range(n):
   match=re.fullmatch(r'(\d+)\s*:\s*\((\d+)\)\s*(.*)',lines[i]);i+=1;assert match;u,k=int(match[1]),int(match[2]);neighbors=list(map(int,match[3].split()));assert 0<=u<n and u not in seen and k==len(neighbors);seen.add(u);edges.extend((u,v) for v in neighbors)
  out.append(str(tree_matching(n,edges)))
 return '\n'.join(out)+ ('\n' if out else '')
def mining_best(west,north):
 width=len(west[0]);dp=[0]*(width+1)
 for y,b in zip(west,north):
  profit=sum(b);next_dp=[];prefix=-1
  for cut in range(width+1):
   if cut:profit+=y[cut-1]-b[cut-1]
   prefix=max(prefix,dp[cut]);next_dp.append(prefix+profit)
  dp=next_dp
 return max(dp)
def mining(data):
 a=list(map(int,data.split()));i=0;out=[]
 while True:
  n,m=a[i:i+2];i+=2
  if n==m==0:break
  assert 1<=n<=500 and 1<=m<=500;boards=[]
  for _ in range(2):
   board=[a[i+r*m:i+(r+1)*m] for r in range(n)];i+=n*m;assert all(len(row)==m and all(0<=v<=1000 for v in row) for row in board);boards.append(board)
  out.append(str(mining_best(*boards)))
 assert i==len(a);return '\n'.join(out)+ ('\n' if out else '')
def weighted_medians(n,edges,frequencies):
 graph=valid_tree(n,edges);weights={tuple(sorted((u,v))):cost for u,v,cost in edges};parent=[-1]*n;parent[0]=0;order=[0]
 for u in order:
  for v in graph[u]:
   if v!=parent[u]:parent[v]=u;order.append(v)
 subtree=frequencies.copy();total=sum(frequencies)
 for u in reversed(order[1:]):subtree[parent[u]]+=subtree[u]
 centers=[]
 for u in range(n):
  largest=total-subtree[u]
  for v in graph[u]:
   if parent[v]==u:largest=max(largest,subtree[v])
  if largest*2<=total:centers.append(u)
 assert centers;start=centers[0];stack=[(start,-1,0)];cost=0
 while stack:
  u,previous,distance=stack.pop();cost+=2*distance*frequencies[u]
  for v in graph[u]:
   if v!=previous:stack.append((v,u,distance+weights[tuple(sorted((u,v)))]))
 return cost,[u+1 for u in centers]
def nuremberg(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert 1<=t<=200;out=[]
 for _ in range(t):
  n=a[i];i+=1;assert 1<=n<=50000;edges=[]
  for _ in range(n-1):u,v,c=a[i:i+3];i+=3;assert 1<=c<=300;edges.append((u-1,v-1,c))
  m=a[i];i+=1;assert 0<=m<=n;frequencies=[0]*n
  for _ in range(m):u,f=a[i:i+2];i+=2;assert 1<=u<=n and 1<=f<=500 and frequencies[u-1]==0;frequencies[u-1]=f
  cost,centers=weighted_medians(n,edges,frequencies);out.extend([str(cost),' '.join(map(str,centers))])
 assert i==len(a);return '\n'.join(out)+'\n'
ORACLES={'uva-10603-fill':fill,'uva-753-a-plug-for-unix':plugs,'uva-929-number-maze':mazes,'uva-1292-strategic-game':strategy,'uva-1366-martian-mining':mining,'uva-12223-moving-to-nuremberg':nuremberg}
def additions():
 rng=random.Random(10603);jugs=[(2,3,4,2),(96,97,199,62),(1,1,1,200),(200,199,198,200),(200,200,200,199),(200,199,200,1)]+[tuple(rng.randint(1,200) for _ in range(4)) for _ in range(100)]
 plugcases=[(['B'],['A'],[('B','A')]),(['B'],['A','A'],[('A','X'),('X','B')]),(['B','C'],['A','A'],[('A','B'),('A','C'),('B','A')])]
 for _ in range(25):
  kinds=['T'+str(i) for i in range(25)];outlets=rng.sample(kinds,rng.randint(1,25));devices=[rng.choice(kinds) for j in range(100)];pairs=rng.sample(list(itertools.product(kinds,kinds)),100);plugcases.append((outlets,devices,pairs))
 plugcases.append((['B','C'],['A','A'],[('A','X'),('X','B'),('X','C')]))
 plugcases.append((['T'+str(i) for i in range(100)],['X']*100,[('X','T'+str(i)) for i in range(100)]))
 labyrinth=[[9]*7 for _ in range(5)]
 for r,c in [(0,0),(1,0),(2,0),(2,1),(2,2),(1,2),(0,2),(0,3),(0,4),(1,4),(2,4),(3,4),(4,4),(4,5),(4,6)]:labyrinth[r][c]=0
 labyrinth[0][0]=7;labyrinth[-1][-1]=5
 grids=[[[7]],labyrinth,[[9]*999 for _ in range(999)],[[0]*999 for _ in range(999)],[[rng.randrange(10) for _ in range(999)] for _ in range(999)],[[rng.randrange(10)] for _ in range(999)]]
 for _ in range(35):grids.append([[rng.randrange(10) for j in range(rng.randint(1,1)+9)] for i in range(rng.randint(1,15))])
 trees=[(1,[]),(1500,[(i-1,i) for i in range(1,1500)]),(1500,[(0,i) for i in range(1,1500)])]
 for _ in range(50):
  n=rng.randint(2,100);edges=[(rng.randrange(i),i) for i in range(1,n)];rng.shuffle(edges);trees.append((n,edges))
 treeinput=''
 for n,edges in trees:
  adjacency=[[] for _ in range(n)]
  for u,v in edges:
   if rng.randrange(2):u,v=v,u
   adjacency[u].append(v)
  order=list(range(n));rng.shuffle(order);treeinput+=str(n)+'\n'+''.join(f'{u}:({len(adjacency[u])})'+(' '+' '.join(map(str,adjacency[u])) if adjacency[u] else '')+'\n' for u in order)
 mines=[([[0]],[[0]]),([[1000]],[[999]]),([[1000]*500 for _ in range(500)],[[1000]*500 for _ in range(500)])]
 for _ in range(40):
  n,m=rng.randint(1,20),rng.randint(1,20);mines.append(([[rng.randint(0,1000) for j in range(m)] for i in range(n)],[[rng.randint(0,1000) for j in range(m)] for i in range(n)]))
 cities=[(1,[],[]),(50000,[(i-1,i,300) for i in range(1,50000)],[(i,500) for i in range(50000)]),(50000,[(0,i,1) for i in range(1,50000)],[]),(5,[(i-1,i,1) for i in range(1,5)],[(0,1),(4,1)])]
 for _ in range(196):
  n=rng.randint(1,100);edges=[(rng.randrange(i),i,rng.randint(1,300)) for i in range(1,n)];destinations=rng.sample(range(n),rng.randint(0,n));cities.append((n,edges,[(u,rng.randint(1,500)) for u in destinations]))
 return {'uva-10603-fill':str(len(jugs))+'\n'+''.join(' '.join(map(str,row))+'\n' for row in jugs),'uva-753-a-plug-for-unix':str(len(plugcases))+'\n\n'+'\n'.join(str(len(outlets))+'\n'+'\n'.join(outlets)+'\n'+str(len(devices))+'\n'+''.join(f'D{i} {kind}\n' for i,kind in enumerate(devices))+str(len(adapters))+'\n'+''.join(f'{u} {v}\n' for u,v in adapters) for outlets,devices,adapters in plugcases),'uva-929-number-maze':str(len(grids))+'\n'+''.join(f'{len(grid)}\n{len(grid[0])}\n'+''.join(' '.join(map(str,row))+'\n' for row in grid) for grid in grids),'uva-1292-strategic-game':treeinput,'uva-1366-martian-mining':''.join(f'{len(west)} {len(west[0])}\n'+''.join(' '.join(map(str,row))+'\n' for board in [west,north] for row in board) for west,north in mines)+'0 0\n','uva-12223-moving-to-nuremberg':str(len(cities))+'\n'+''.join(str(n)+'\n'+''.join(f'{u+1} {v+1} {c}\n' for u,v,c in edges)+str(len(visits))+'\n'+''.join(f'{u+1} {f}\n' for u,f in visits) for n,edges,visits in cities)}

def adapter_reach(types,edges):
 graph={v:set() for v in types}
 for u,v in edges:graph[u].add(v)
 reach={}
 for u in types:
  seen={u};stack=[u]
  while stack:
   for v in graph[stack.pop()]:
    if v not in seen:seen.add(v);stack.append(v)
  reach[u]=seen
 return reach

def repair_input(slug,data,expected):
 if slug=='uva-1292-strategic-game':
  lines=[line.strip() for line in data.splitlines() if line.strip()];i=0;out=[];changed=False
  while i<len(lines):
   n=int(lines[i]);i+=1;out.append(str(n));seen=set()
   for _ in range(n):
    match=re.fullmatch(r'(\d+)\s*:\s*\((\d+)\)\s*(.*)',lines[i]);i+=1;assert match;u,k=int(match[1]),int(match[2]);neighbors=list(map(int,match[3].split()));keep=[]
    if len(neighbors)!=k:assert k==0 and len(neighbors)==1 and tuple(sorted((u,neighbors[0]))) in seen
    for v in neighbors:
     edge=tuple(sorted((u,v)))
     if edge in seen:changed=True;continue
     seen.add(edge);keep.append(v)
    out.append(f'{u}:({len(keep)})'+(' '+' '.join(map(str,keep)) if keep else ''))
  assert changed;fixed='\n'.join(out)+'\n';assert strategy(fixed).strip()==expected.strip();return fixed,'Remove undeclared reverse-edge entries on five zero-degree rows; these repeat already recorded tree edges. Preserve every unique edge, every vertex, every originally declared degree and original minimum-cover answer.'
 if slug=='uva-753-a-plug-for-unix':
  a=data.split();i=1;assert a[0]=='1';n=int(a[i]);i+=1;outlets=a[i:i+n];i+=n;m=int(a[i]);i+=1;devices=[tuple(a[j:j+2]) for j in range(i,i+2*m,2)];i+=2*m;k=int(a[i]);i+=1;edges=[tuple(a[j:j+2]) for j in range(i,i+2*k,2)];i+=2*k;assert i==len(a);oldoutlets=outlets.copy();oldedges=edges.copy();types=set(outlets+[v for _,v in devices]+[v for e in edges for v in e]);oldreach=adapter_reach(types,edges)
  if k==0:
   assert 'SpareFrom' not in types and 'SpareTo' not in types;edges=[('SpareFrom','SpareTo')];reason='Replace forbidden zero adapter varieties with one isolated unused adapter; preserve every outlet, device and possible connection.'
  else:
   assert n==100 and len(set(outlets))==26 and k==100 and len(types)==27
   unseen=set(types);components=[]
   while unseen:
    u=min(unseen);component=sorted(v for v in unseen if v in oldreach[u] and u in oldreach[v]);unseen-=set(component);components.append(component)
   assert sorted(map(len,components))==[1,1,25]
   edges=[]
   for component in components:
    if len(component)>1:edges.extend(zip(component,component[1:]+component[:1]))
   assert adapter_reach(types,edges)==oldreach
   seen=set()
   for index,kind in enumerate(outlets):
    if kind in seen:
     alias='Socket'+str(index);assert alias not in types;outlets[index]=alias;edges.append((kind,alias))
    seen.add(kind)
   assert len(set(outlets))==100 and len(edges)==99
   reason='Preserve all100 physical outlets by assigning unique names to74 duplicate types; replace the25-type adapter SCC with an equivalent directed cycle, then add alias adapters (99 total). Prove every original type reachability and every device-to-physical-outlet relation unchanged; no outlet/device removed.'
  newtypes=set(outlets+[v for _,v in devices]+[v for e in edges for v in e]);newreach=adapter_reach(newtypes,edges)
  for _,kind in devices:
   for before,after in zip(oldoutlets,outlets):assert (before in oldreach[kind])==(after in newreach[kind])
  before=plug_unmatched(oldoutlets,[v for _,v in devices],oldedges);assert str(before)==expected.strip();fixed='1\n\n'+str(n)+'\n'+'\n'.join(outlets)+'\n'+str(m)+'\n'+''.join(f'{name} {kind}\n' for name,kind in devices)+str(len(edges))+'\n'+''.join(f'{u} {v}\n' for u,v in edges);assert plugs(fixed).strip()==expected.strip();return fixed,reason
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
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';repair=repair_input(p['slug'],c['input'],c['output'])
                    if repair is not None:
                        corrected,reason=repair;row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':reason})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'weighted pouring vs move count, directed unlimited adapters, all four maze directions, arbitrary tree orientation,500x500 mining and50000-station weighted medians','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
