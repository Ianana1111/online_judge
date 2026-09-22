"""Independent tournament ancestors, restricted BFS, demand matching, interval DP, graph bounds and mask-path BFS."""
import argparse,collections,hashlib,heapq,itertools,json,math,random
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
EURO='uva-10666-the-eurocup-is-here';DRM='uva-11336-drm';LAMPS='uva-12382-grid-of-lamps';INTEREST='uva-12385-interesting-sequences';GATES='uva-12428-enemy-at-the-gates';LETTERS='uva-12797-letters'
def ranks(n,x):
 if x==0:return 1,1
 ancestors=0;team=x
 while team:
  roundsize=2
  while team%roundsize==0:roundsize*=2
  team-=roundsize//2;ancestors+=1
 descendants=0;block=2
 while x%block==0:descendants+=block//2;block*=2
 return ancestors+1,2**n-descendants
def euro(data):
 a=list(map(int,data.split()));t=a[0];assert t>0 and len(a)==2*t+1;out=[]
 for n,x in zip(a[1::2],a[2::2]):
  assert 1<=n<=30 and 0<=x<2**n;out.append('%d %d'%ranks(n,x))
 return '\n'.join(out)+'\n'
def read_maps(data):
 lines=iter(data.splitlines());result=[]
 def graph(name):
  assert name and len(name.split())==1 and name!='END';edges=[];seen=set()
  for line in lines:
   if line=='* * *':break
   pair=line.split();assert len(pair)==2;u,v=pair;edge=tuple(sorted(pair));assert edge not in seen;seen.add(edge);edges.append((u,v))
  else:raise AssertionError('missing map terminator')
  return name,edges
 for line in lines:
  if line=='END':assert not list(lines);return result
  old=graph(line);new=graph(next(lines));result.append((old,new))
 raise AssertionError('missing END')
def detailed(old,new):
 oldnodes={v for edge in old for v in edge};adj=collections.defaultdict(set)
 for u,v in new:adj[u].add(v);adj[v].add(u)
 if not oldnodes<=set(adj):return False
 needed=collections.defaultdict(set)
 for u,v in old:needed[u].add(v);needed[v].add(u)
 for source in oldnodes:
  reached={source};seen={source};queue=collections.deque([source])
  while queue:
   u=queue.popleft()
   for v in adj[u]:
    if v in seen:continue
    seen.add(v)
    if v in oldnodes:reached.add(v)
    else:queue.append(v)
  if not needed[source]<=reached:return False
 return True
def drm(data):
 out=[]
 for (a,old),(b,new) in read_maps(data):
  good=detailed(old,new);out.append(('YES: ' if good else 'NO: ')+b+' is '+('' if good else 'not ')+'a more detailed version of '+a)
 return '\n'.join(out)+'\n'
def lamps_value(rows,columns):
 # Maximum shared row/column demand via the bipartite degree exchange rule.
 # Row units unable to match a positive column demand still light a distinct cell.
 heap=[-b for b in columns];heapq.heapify(heap)
 for amount in sorted(rows,reverse=True):
  chosen=[]
  for _ in range(amount):
   remaining=-heapq.heappop(heap);chosen.append(-max(0,remaining-1))
  for value in chosen:heapq.heappush(heap,value)
 return sum(rows)-sum(heap)
def lamps(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=100;i=1;out=[]
 for _ in range(t):
  m,n=a[i:i+2];i+=2;rows=a[i:i+m];i+=m;columns=a[i:i+n];i+=n
  assert 1<=m<=1000 and 1<=n<=1000 and len(rows)==m and len(columns)==n and all(0<=x<=n for x in rows) and all(0<=x<=m for x in columns);out.append(str(lamps_value(rows,columns)))
 assert i==len(a);return '\n'.join(out)+'\n'
def interesting(values):
 best={};answer=0
 for value in values:
  if value in best:answer=max(answer,best[value]+1)
  best[value]=max(best.get(value,0),answer)
 return answer
def sequences(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=100;i=1;out=[]
 for _ in range(t):
  n=a[i];i+=1;values=a[i:i+n];i+=n;assert 1<=n<=100000 and len(values)==n and all(1<=v<=100000 for v in values);out.append(str(interesting(values)))
 assert i==len(a);return '\n'.join(out)+'\n'
def bridges(n,m):
 excess=m-(n-1)
 if not excess:return n-1
 root=math.isqrt(1+8*excess);k=(3+root)//2
 while (k-1)*(k-2)//2<excess:k+=1
 while k>1 and (k-2)*(k-3)//2>=excess:k-=1
 return n-k
def gates(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=50 and len(a)==2*t+1;out=[]
 for n,m in zip(a[1::2],a[2::2]):
  assert 2<=n<=100000 and n-1<=m<=n*(n-1)//2;out.append(str(bridges(n,m)))
 return '\n'.join(out)+'\n'
def shortest_letters(grid):
 n=len(grid);codes=[ord(c)-ord('a') if c.islower() else ord(c)-ord('A')+10 for row in grid for c in row];masks=[[] for _ in codes];start=1<<codes[0];masks[0].append(start);queue=collections.deque([(0,start,1)])
 while queue:
  at,used,distance=queue.popleft()
  if at==n*n-1:return distance
  row,col=divmod(at,n)
  for nr,nc in [(row-1,col),(row+1,col),(row,col-1),(row,col+1)]:
   if not(0<=nr<n and 0<=nc<n):continue
   nxt=nr*n+nc;code=codes[nxt]
   if used>>(code+10 if code<10 else code-10)&1:continue
   updated=used|(1<<code)
   if any(prior&updated==prior for prior in masks[nxt]):continue
   masks[nxt].append(updated);queue.append((nxt,updated,distance+1))
 return -1
def letters(data):
 lines=data.splitlines();i=0;out=[]
 while i<len(lines):
  n=int(lines[i]);i+=1;grid=lines[i:i+n];i+=n;assert 2<=n<=100 and len(grid)==n and all(len(row)==n and set(row)<=set('abcdefghijABCDEFGHIJ') for row in grid);out.append(str(shortest_letters(grid)))
 return '\n'.join(out)+'\n'
ORACLES={EURO:euro,DRM:drm,LAMPS:lamps,INTEREST:sequences,GATES:gates,LETTERS:letters}
def additions():
 rng=random.Random(12382);teams=[(n,x) for n in range(1,11) for x in range(2**n)]+[(30,x) for x in [0,1,2**29,2**30-1,2**30-2,715827882]]
 maps=[('loop',[('a','a')],'loopNew',[('a','b')]),('missingLoop',[('a','a')],'absent',[('b','c')]),('old',[('a','b'),('b','c')],'new',[('a','c'),('b','c')]),('Old',[('a','b')],'New',[('a','x'),('x','y')]),('V1',[('a','b'),('b','c')],'V2',[('a','x'),('b','x'),('c','x')]),('A',[('a','b'),('c','d')],'B',[('a','x'),('x','y'),('y','b'),('c','d')]),('C',[('city','City')],'D',[('city','NEW'),('City','NEW')])]
 for index in range(40):
  oldnodes=list('abcdef');allold=list(itertools.combinations(oldnodes,2));old=rng.sample(allold,rng.randint(1,15));nodes=oldnodes+list('wxyz');new=rng.sample(list(itertools.combinations(nodes,2)),rng.randint(1,35));maps.append((f'old{index}',old,f'new{index}',new))
 demands=[([2,0],[0,2]),([0],[0]),([1],[1]),([3],[1,0,1,1]),([0]*1000,[0]*1000),([1000]*1000,[1000]*1000),([1000]*500+[0]*500,[1000]*500+[0]*500),([1000],[1]*1000),([1]*1000,[1000])]
 for _ in range(65):
  m=rng.randint(1,15);n=rng.randint(1,15);demands.append(([rng.randint(0,n) for _ in range(m)],[rng.randint(0,m) for _ in range(n)]))
 seqs=[[1],[1]*100000,list(range(1,100001)),[1,2,1,3,1],[1,2,3,2,1,3],[1,2]*50000]
 seqs.extend([rng.randint(1,10) for _ in range(rng.randint(1,500))] for _ in range(70))
 networks=[]
 for n in [2,3,4,5,6,100000]:
  for m in sorted({n-1,n*(n-1)//2,min(n,n*(n-1)//2)}):networks.append((n,m))
 for k in [3,4,10,400,99999]:
  e=(k-1)*(k-2)//2
  for delta in [-1,0,1]:
   m=99999+e+delta
   if 99999<=m<=100000*99999//2:networks.append((100000,m))
 layouts=[['aa','aa'],['aA','Aa'],['ab','BA'],['ab','ba'],['a'*100]*100,['a'*99+'A']+['a'*100]*99]
 for n in range(2,8):
  for _ in range(10):layouts.append([''.join(rng.choice('abcABC') for _ in range(n)) for row in range(n)])
 # Force a long snake path; incompatible uppercase A acts as a wall.
 maze=[['A']*100 for _ in range(100)]
 for r in range(0,100,2):
  maze[r]=['a']*100
  if r+1<100:maze[r+1][99 if (r//2)%2==0 else 0]='a'
 maze[99]=['a']*100;layouts.append([''.join(row) for row in maze])
 return {EURO:[str(len(teams))+'\n'+''.join(f'{n} {x}\n' for n,x in teams)],DRM:[''.join(a+'\n'+''.join(u+' '+v+'\n' for u,v in old)+'* * *\n'+b+'\n'+''.join(u+' '+v+'\n' for u,v in new)+'* * *\n' for a,old,b,new in maps)+'END\n'],LAMPS:[str(len(demands))+'\n'+''.join(f'{len(a)} {len(b)}\n'+' '.join(map(str,a))+'\n'+' '.join(map(str,b))+'\n' for a,b in demands)],INTEREST:[str(len(seqs))+'\n'+''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in seqs)],GATES:[str(len(networks))+'\n'+''.join(f'{n} {m}\n' for n,m in networks)],LETTERS:[''.join(str(len(grid))+'\n'+'\n'.join(grid)+'\n' for grid in layouts)]}
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
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all small tournament IDs,forbidden old intermediate cities,full1000x1000lamp demands,shared interval endpoints,64bit roads and long consistent letter paths','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
