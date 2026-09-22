"""Independent shortest-path, synchronous bitmap, SCC, sieve-DAG and leaf-cut models."""
import argparse,hashlib,json,random,heapq
from collections import deque
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def dungeon_distance(levels):
 l,r,c=len(levels),len(levels[0]),len(levels[0][0]);start=end=None
 for z in range(l):
  for y in range(r):
   for x in range(c):
    if levels[z][y][x]=='S':assert start is None;start=(z,y,x)
    if levels[z][y][x]=='E':assert end is None;end=(z,y,x)
 assert start is not None and end is not None
 distance={start:0};heap=[(0,start)]
 while heap:
  d,v=heapq.heappop(heap)
  if distance[v]!=d:continue
  if v==end:return d
  for axis in range(3):
   for sign in (-1,1):
    w=list(v);w[axis]+=sign;z,y,x=w;w=tuple(w)
    if 0<=z<l and 0<=y<r and 0<=x<c and levels[z][y][x]!='#' and d+1<distance.get(w,10**9):distance[w]=d+1;heapq.heappush(heap,(d+1,w))
 return -1

def dungeons(data):
 tokens=data.split();i=0;out=[];ended=False
 while i<len(tokens):
  l,r,c=map(int,tokens[i:i+3]);i+=3
  if (l,r,c)==(0,0,0):assert i==len(tokens);ended=True;break
  assert 1<=l<=30 and 1<=r<=30 and 1<=c<=30
  rows=tokens[i:i+l*r];i+=l*r;assert len(rows)==l*r and all(len(row)==c and set(row)<=set('.#SE') for row in rows)
  answer=dungeon_distance([rows[z*r:(z+1)*r] for z in range(l)]);out.append('Trapped!' if answer<0 else f'Escaped in {answer} minute(s).')
 assert ended;return '\n'.join(out)+'\n'

def fire_escape(rows):
 r,c=len(rows),len(rows[0]);stride=c+2;allowed=fire=joe=border=0;starts=0
 # Row masks avoid quadratic repeated shifts while constructing a million-cell board.
 for y,row in enumerate(rows):
  a=f=j=b=0
  for x,ch in enumerate(row):
   if ch!='#':a|=1<<x
   if ch=='F':f|=1<<x
   if ch=='J':j|=1<<x;starts+=1
   if y in (0,r-1) or x in (0,c-1):b|=1<<x
  offset=(y+1)*stride+1;allowed|=a<<offset;fire|=f<<offset;joe|=j<<offset;border|=b<<offset
 assert starts==1;visited=joe;minute=0
 def spread(bits):return ((bits<<1)|(bits>>1)|(bits<<stride)|(bits>>stride))&allowed
 while joe:
  if joe&border:return minute+1
  fire|=spread(fire);joe=spread(joe)&~fire&~visited;visited|=joe;minute+=1
 return None

def fires(data):
 v=data.split();t=int(v[0]);assert t>=0;i=1;out=[]
 for _ in range(t):
  r,c=map(int,v[i:i+2]);i+=2;assert 1<=r<=1000 and 1<=c<=1000;rows=v[i:i+r];i+=r
  assert len(rows)==r and all(len(row)==c and set(row)<=set('.#JF') for row in rows)
  answer=fire_escape(rows);out.append('IMPOSSIBLE' if answer is None else str(answer))
 assert i==len(v);return '\n'.join(out)+'\n'

def falling(n,edges,seeds):
 adj=[[] for _ in range(n)];rev=[[] for _ in range(n)]
 for a,b in edges:adj[a].append(b);rev[b].append(a)
 seen=set();order=[]
 for start in range(n):
  if start in seen:continue
  stack=[(start,False)]
  while stack:
   v,done=stack.pop()
   if done:order.append(v);continue
   if v in seen:continue
   seen.add(v);stack.append((v,True))
   for w in adj[v]:
    if w not in seen:stack.append((w,False))
 comp=[-1]*n;sizes=[]
 for start in reversed(order):
  if comp[start]>=0:continue
  number=len(sizes);comp[start]=number;stack=[start];size=0
  while stack:
   v=stack.pop();size+=1
   for w in rev[v]:
    if comp[w]<0:comp[w]=number;stack.append(w)
  sizes.append(size)
 dag=[set() for _ in sizes];indegree=[0]*len(sizes)
 for a,b in edges:
  x,y=comp[a],comp[b]
  if x!=y and y not in dag[x]:dag[x].add(y);indegree[y]+=1
 active={comp[v] for v in seeds};ready=deque(i for i,d in enumerate(indegree) if d==0)
 while ready:
  v=ready.popleft()
  for w in dag[v]:
   if v in active:active.add(w)
   indegree[w]-=1
   if indegree[w]==0:ready.append(w)
 return sum(sizes[i] for i in active)

def dominos(data):
 a=list(map(int,data.split()));t=a[0];assert t>=0;i=1;out=[]
 for _ in range(t):
  n,m,l=a[i:i+3];i+=3;assert 1<=n<=10000 and 0<=m<=10000 and 0<=l<=10000
  edges=[(a[j]-1,a[j+1]-1) for j in range(i,i+2*m,2)];i+=2*m;seeds=[v-1 for v in a[i:i+l]];i+=l
  assert len(seeds)==l and all(0<=v<n for e in edges for v in e) and all(0<=v<n for v in seeds);out.append(str(falling(n,edges,seeds)))
 assert i==len(a);return '\n'.join(out)+'\n'

def transformation(s,t):
 if s>t:return -1
 prime=[True]*(t+1)
 if t>=0:prime[0]=False
 if t>=1:prime[1]=False
 factors=[[] for _ in range(t+1)]
 for p in range(2,t+1):
  if prime[p]:
   for multiple in range(2*p,t+1,p):prime[multiple]=False;factors[multiple].append(p)
 dp=[10**9]*(t+1);dp[s]=0
 for v in range(s,t+1):
  for p in factors[v]:
   if v+p<=t:dp[v+p]=min(dp[v+p],dp[v]+1)
 return dp[t] if dp[t]<10**9 else -1

def transformations(data):
 a=list(map(int,data.split()));assert len(a)%2==0 and a[-2:]==[0,0];out=[]
 for s,t in zip(a[:-2:2],a[1:-2:2]):
  assert 1<=s<=100 and 1<=t<=1000;out.append(f'Case {len(out)+1}: {transformation(s,t)}')
 return '\n'.join(out)+'\n'

def largest_continent(rows,start):
 r,c=len(rows),len(rows[0]);land=rows[start[0]][start[1]];parent=list(range(r*c));size=[1]*(r*c)
 def find(v):
  while v!=parent[v]:parent[v]=parent[parent[v]];v=parent[v]
  return v
 def union(a,b):
  a,b=find(a),find(b)
  if a==b:return
  if size[a]<size[b]:a,b=b,a
  parent[b]=a;size[a]+=size[b]
 for y in range(r):
  for x in range(c):
   if rows[y][x]!=land:continue
   for yy,xx in [(y,(x+1)%c),(y+1,x)]:
    if yy<r and rows[yy][xx]==land:union(y*c+x,yy*c+xx)
 origin=find(start[0]*c+start[1]);roots={find(y*c+x) for y in range(r) for x in range(c) if rows[y][x]==land};return max((size[v] for v in roots if v!=origin),default=0)

def continents(data):
 a=data.split();i=0;out=[]
 while i<len(a):
  r,c=map(int,a[i:i+2]);i+=2;assert 1<=r<=20 and 1<=c<=20;rows=a[i:i+r];i+=r;x,y=map(int,a[i:i+2]);i+=2
  assert len(rows)==r and all(len(row)==c and row.isalpha() and row.isascii() for row in rows) and len(set(''.join(rows)))<=2 and 0<=x<r and 0<=y<c;out.append(str(largest_continent(rows,(x,y))))
 return '\n'.join(out)+'\n'

def marble_moves(counts,edges):
 n=len(counts);assert sum(counts)==n and all(v>=0 for v in counts) and len(edges)==n-1
 adj=[set() for _ in counts]
 for a,b in edges:assert 0<=a<n and 0<=b<n and a!=b;adj[a].add(b);adj[b].add(a)
 degree=[len(a) for a in adj];balance=[v-1 for v in counts];leaves=deque(i for i,d in enumerate(degree) if d<=1);removed=set();answer=0
 while leaves:
  v=leaves.popleft()
  if v in removed:continue
  removed.add(v)
  for w in adj[v]:
   if w not in removed:
    answer+=abs(balance[v]);balance[w]+=balance[v];degree[w]-=1
    if degree[w]==1:leaves.append(w)
 assert len(removed)==n;return answer

def marbles(data):
 a=list(map(int,data.split()));i=0;out=[];ended=False
 while i<len(a):
  n=a[i];i+=1
  if n==0:assert i==len(a);ended=True;break
  assert 1<=n<=10000;counts=[0]*n;seen=set();edges=[];indegree=[0]*n
  for _ in range(n):
   v,k,d=a[i:i+3];i+=3;v-=1;assert 0<=v<n and v not in seen and k>=0 and 0<=d<n;seen.add(v);counts[v]=k
   for w in a[i:i+d]:assert 1<=w<=n;edges.append((v,w-1));indegree[w-1]+=1
   i+=d
  assert indegree.count(0)==1 and all(v<=1 for v in indegree);out.append(str(marble_moves(counts,edges)))
 assert ended;return '\n'.join(out)+'\n'
ORACLES={'uva-532-dungeon-master':dungeons,'uva-11624-fire':fires,'uva-11518-dominos-2':dominos,'uva-11730-number-transformation':transformations,'uva-11094-continents':continents,'uva-10672-marbles-on-a-tree':marbles}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(532);mazes=[['SE'],['S#E'],['S#','.E']]
 dungeon_cases=[(1,len(rows),len(rows[0]),rows) for rows in mazes]
 dungeon_cases += [(2,1,1,['S','E']),(30,30,30,['S'+'.'*29]+['.'*30]*898+['.'*29+'E'])]
 for _ in range(30):
  l,r,c=[rng.randrange(1,6) for _ in range(3)]
  if l*r*c<2:c=2
  a=['#' if rng.random()<.3 else '.' for _ in range(l*r*c)];a[0]='S';a[-1]='E';dungeon_cases.append((l,r,c,[''.join(a[i:i+c]) for i in range(0,len(a),c)]))
 firecases=[['J'],['FJ'],['###','#J.','#.F'],['...','.J.','...'],['###','#J#','###'],['F..','.#.','..J'],['....F','.J...','.....']]
 for _ in range(100):
  r,c=rng.randrange(1,10),rng.randrange(1,10);a=[rng.choices('.#F',[7,3,1])[0] for _ in range(r*c)];a[rng.randrange(r*c)]='J';firecases.append([''.join(a[i:i+c]) for i in range(0,len(a),c)])
 huge=['.'*1000 for _ in range(1000)];huge[500]='.'*500+'J'+'.'*499;firecases.append(huge)
 huge2=list(huge);huge2[0]='F'+'.'*998+'F';huge2[-1]='F'+'.'*998+'F';firecases.append(huge2)
 graphs=[(1,[],[]),(1,[],[0,0]),(3,[(0,1),(1,2)],[2]),(4,[(0,1),(1,0),(1,2)],[0,0]),(10000,[(i,i+1) for i in range(9999)],[0]),(10000,[(i,(i+1)%10000) for i in range(10000)],[9999])]
 for _ in range(40):
  n=rng.randrange(1,50);graphs.append((n,[(rng.randrange(n),rng.randrange(n)) for _ in range(rng.randrange(100))],[rng.randrange(n) for _ in range(rng.randrange(20))]))
 queries=[(s,t) for s in range(1,101) for t in [1,s,100,999,1000]]+[(s,t) for s in range(1,21) for t in range(1,101)]
 maps=[(['x'],(0,0)),(['xyx','yyy','xyy'],(0,0)),(['xxx','yyy','xxx'],(0,0)),(['www','lll','wlw'],(0,0)),(['a'*20]*20,(19,19))]
 for _ in range(50):
  r,c=rng.randrange(1,21),rng.randrange(1,21);maps.append(([''.join(rng.choice('ab') for _ in range(c)) for _ in range(r)],(rng.randrange(r),rng.randrange(c))))
 trees=[([1],[]),([0,0,3],[(2,0),(0,1)]),([10000]+[0]*9999,[(i+1,i) for i in range(9999)])]
 for n in [2,3,5,10,50,100]:
  for _ in range(8):
   labels=list(range(n));rng.shuffle(labels);edges=[(labels[rng.randrange(i)],labels[i]) for i in range(1,n)];counts=[0]*n
   for _ in range(n):counts[rng.randrange(n)]+=1
   trees.append((counts,edges))
 treeinputs=[]
 for counts,edges in trees:
  children=[[] for _ in counts]
  for a,b in edges:children[a].append(b+1)
  labels=list(range(len(counts)));rng.shuffle(labels);treeinputs.append(str(len(counts))+'\n'+''.join(' '.join(map(str,[v+1,counts[v],len(children[v])]+children[v]))+'\n' for v in labels))
 return {'uva-532-dungeon-master':''.join(f'{l} {r} {c}\n'+'\n\n'.join('\n'.join(rows[z*r:(z+1)*r]) for z in range(l))+'\n\n' for l,r,c,rows in dungeon_cases)+'0 0 0\n','uva-11624-fire':str(len(firecases))+'\n'+''.join(f'{len(rows)} {len(rows[0])}\n'+'\n'.join(rows)+'\n' for rows in firecases),'uva-11518-dominos-2':str(len(graphs))+'\n'+''.join(f'{n} {len(edges)} {len(seeds)}\n'+''.join(f'{a+1} {b+1}\n' for a,b in edges)+''.join(f'{v+1}\n' for v in seeds) for n,edges,seeds in graphs),'uva-11730-number-transformation':''.join(f'{s} {t}\n' for s,t in queries)+'0 0\n','uva-11094-continents':''.join(f'{len(rows)} {len(rows[0])}\n'+'\n'.join(rows)+f'\n{x} {y}\n\n' for rows,(x,y) in maps),'uva-10672-marbles-on-a-tree':''.join(treeinputs)+'0\n'}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'3D movement, synchronous multi-source fire, directed SCC reachability, proper prime factors, horizontal-only wrapping and arbitrary tree roots','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
