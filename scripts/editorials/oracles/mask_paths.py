"""Independent count-bitsets, shortest tour costs, interval-walk inclusion/exclusion, game search, last occurrences and exact backward paths."""
import argparse,hashlib,json,random,itertools,heapq,re
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def expression_extrema(n,m,values):
 k=min(n,m);states={0:1};mask=(1<<(k+1))-1
 for v in values:
  old=states;states=old.copy()
  for total,bits in old.items():states[total+v]=states.get(total+v,0)|((bits<<1)&mask)
 total=sum(values);products=[s*(total-s) for s,bits in states.items() if bits>>k&1];return max(products),min(products)
def expressions(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n,m=a[i:i+2];i+=2;values=a[i:i+n+m];i+=n+m;assert 1<=n<=50 and 1<=m<=50 and len(values)==n+m and all(-50<=x<=50 for x in values);out.append('%d %d'%expression_extrema(n,m,values))
 assert len(out)<=110;return '\n'.join(out)+'\n'
def cents(value):
 assert re.fullmatch(r'\d+\.\d{2}',value);d,c=value.split('.');return int(d)*100+int(c)
def shopping_best(n,edges,offers):
 graph=[[] for _ in range(n+1)]
 for u,v,c in edges:graph[u].append((v,c));graph[v].append((u,c))
 savings={}
 for node,value in offers:savings[node]=savings.get(node,0)+value
 nodes=[0]+sorted(savings);dist=[]
 for start in nodes:
  d=[None]*(n+1);d[start]=0;heap=[(0,start)]
  while heap:
   cost,u=heapq.heappop(heap)
   if d[u]!=cost:continue
   for v,w in graph[u]:
    candidate=cost+w
    if d[v] is None or candidate<d[v]:d[v]=candidate;heapq.heappush(heap,(candidate,v))
  assert all(x is not None for x in d);dist.append([d[x] for x in nodes])
 k=len(savings);profits=[0]*(1<<k);dp=[{} for _ in range(1<<k)];dp[0][0]=0;best=0
 for mask in range(1<<k):
  if mask:
   bit=mask&-mask;profits[mask]=profits[mask^bit]+savings[nodes[bit.bit_length()]]
  for last,cost in dp[mask].items():
   best=max(best,profits[mask]-cost-dist[last][0])
   for j in range(k):
    if mask>>j&1:continue
    nxt=mask|1<<j;value=cost+dist[last][j+1];prior=dp[nxt].get(j+1)
    if prior is None or value<prior:dp[nxt][j+1]=value
 return best
def shopping(data):
 a=data.split();t=int(a[0]);i=1;assert t>=1;out=[]
 for _ in range(t):
  n,m=map(int,a[i:i+2]);i+=2;assert 1<=n<=50 and 1<=m<=1000;edges=[]
  for _ in range(m):
   u,v=map(int,a[i:i+2]);c=cents(a[i+2]);i+=3;assert 0<=u<=n and 0<=v<=n;edges.append((u,v,c))
  p=int(a[i]);i+=1;assert 1<=p<=12;offers=[]
  for _ in range(p):
   u=int(a[i]);v=cents(a[i+1]);i+=2;assert 1<=u<=n and v>0;offers.append((u,v))
  best=shopping_best(n,edges,offers);out.append(f'Daniel can save ${best//100}.{best%100:02d}' if best>0 else "Don't leave the house")
 assert i==len(a);return '\n'.join(out)+'\n'
MOD=1000000007
@lru_cache(None)
def beautiful_counts(n):
 def interval_counts(lo,hi):
  dp=[int(lo<=x<=hi and x>0) for x in range(n)];result=[0]
  for length in range(1,101):
   result.append(sum(dp)%MOD);dp=[((dp[x-1] if x>lo else 0)+(dp[x+1] if x<hi else 0))%MOD if lo<=x<=hi else 0 for x in range(n)]
  return result
 a=interval_counts(0,n-1);b=interval_counts(1,n-1);c=interval_counts(0,n-2);d=interval_counts(1,n-2);result=[0]
 for length in range(1,101):result.append((result[-1]+a[length]-b[length]-c[length]+d[length])%MOD)
 return result
def beautiful(data):
 a=list(map(int,data.split()));t=a[0];assert 0<=t<100 and len(a)==1+2*t;out=[]
 for n,m in zip(a[1::2],a[2::2]):assert 2<=n<=10 and 0<=m<=100;out.append(str(beautiful_counts(n)[m]))
 return '\n'.join(out)+ ('\n' if out else '')
@lru_cache(None)
def game_win(counts):
 memo={};stack=[(counts,False)]
 while stack:
  state,ready=stack.pop()
  if state in memo:continue
  residue=(state[1]+2*state[2])%3;children=[]
  for r in range(3):
   if state[r] and (residue-r)%3==0:
    nxt=list(state);nxt[r]-=1;children.append(tuple(nxt))
  if not ready:stack.append((state,True));stack.extend((child,False) for child in children if child not in memo)
  else:memo[state]=any(not memo[child] for child in children)
 return memo[counts]
def games(data):
 a=data.split();t=int(a[0]);assert 0<=t<60 and len(a)==t+1;out=[]
 for case,s in enumerate(a[1:],1):
  assert 1<=len(s)<=1000 and set(s)<=set('123456789');counts=tuple(sum(int(ch)%3==r for ch in s) for r in range(3));out.append(f"Case {case}: {'S' if game_win(counts) else 'T'}")
 return '\n'.join(out)+ ('\n' if out else '')
def sequence_values(n,m):
 a,b,c=1,2,3;yield a;yield b;yield c
 for _ in range(3,n):a,b,c=b,c,(a+b+c)%m+1;yield c
def minimum_window(n,m,k):
 size=1
 while size<k:size*=2
 tree=[n+1]*(size*2)
 for j in range(k):tree[size+j]=-1
 for j in range(size-1,0,-1):tree[j]=min(tree[j*2],tree[j*2+1])
 best=n+1
 for right,value in enumerate(sequence_values(n,m)):
  if value<=k:
   pos=size+value-1;tree[pos]=right;pos//=2
   while pos:tree[pos]=min(tree[pos*2],tree[pos*2+1]);pos//=2
  if tree[1]>=0:best=min(best,right-tree[1]+1)
  if tree[1]>=0 and best==k:return best
 return best if best<=n else None
def windows(data):
 a=list(map(int,data.split()));t=a[0];assert 0<=t<100 and len(a)==1+3*t;out=[]
 for case in range(t):
  n,m,k=a[1+3*case:4+3*case];assert 3<=n<=1000000 and 1<=m<=1000 and 2<=k<=100;answer=minimum_window(n,m,k);out.append(f'Case {case+1}: '+(str(answer) if answer is not None else 'sequence nai'))
 return '\n'.join(out)+ ('\n' if out else '')
def checker_count(board):
 n=len(board);ways=[[0]*n for _ in range(n)]
 for col in range(n):ways[0][col]=int(board[0][col]!='B')
 for row in range(1,n):
  for col in range(n):
   if board[row][col]=='B':continue
   for direction in (-1,1):
    near=col+direction
    if not 0<=near<n:continue
    if board[row-1][near]!='B':ways[row][col]+=ways[row-1][near]
    elif row>=2 and 0<=col+2*direction<n and board[row-2][col+2*direction]!='B':ways[row][col]+=ways[row-2][col+2*direction]
 for row in range(n):
  if 'W' in board[row]:return ways[row][board[row].index('W')]%1000007
 raise AssertionError('white checker missing')
def checkers(data):
 a=data.split();t=int(a[0]);i=1;assert 0<=t<=100;out=[]
 for case in range(1,t+1):
  n=int(a[i]);i+=1;board=a[i:i+n];i+=n;assert 1<=n<=100 and len(board)==n and all(len(row)==n and set(row)<=set('.BW') for row in board) and sum(row.count('W') for row in board)==1;out.append(f'Case {case}: {checker_count(board)}')
 assert i==len(a);return '\n'.join(out)+ ('\n' if out else '')
ORACLES={'uva-10690-expression-again':expressions,'uva-11284-shopping-trip':shopping,'uva-11472-beautiful-numbers':beautiful,'uva-11489-integer-game':games,'uva-11536-smallest-sub-array':windows,'uva-11957-checkers':checkers}
def beautiful_files():
 cases=[(n,m) for n in range(2,11) for m in range(101)];return [str(len(cases[i:i+99]))+'\n'+''.join(f'{n} {m}\n' for n,m in cases[i:i+99]) for i in range(0,len(cases),99)]
def additions():
 rng=random.Random(11472);expr=[(50,50,[-50]*50+[50]*50),(50,50,[50]*100),(50,50,[-50]*100),(1,50,[-50]*50+[50]),(1,1,[0,0])]
 for _ in range(105):n=rng.randint(1,50);m=rng.randint(1,50);expr.append((n,m,[rng.randint(-50,50) for j in range(n+m)]))
 trips=[(1,[(0,1,100)],[(1,150),(1,150)]),(1,[(0,1,150)],[(1,300)]),(1,[(0,1,1)],[(1,3)]),(2,[(0,1,0),(1,2,1),(0,2,1000)],[(1,1),(2,2)])]
 for _ in range(35):
  n=rng.randint(1,50);edges=[(i,rng.randrange(i),rng.randrange(10001)) for i in range(1,n+1)]
  for j in range(rng.randrange(80)):u,v=rng.sample(range(n+1),2);edges.append((u,v,rng.randrange(10001)))
  trips.append((n,edges,[(rng.randint(1,n),rng.randint(1,10000)) for j in range(12)]))
 trips.append((50,[(i,i+1,1) for i in range(50)],[(i,1000) for i in range(1,13)]))
 money=lambda c:f'{c//100}.{c%100:02d}'
 integers=['1','3','33','12','771','1234','3'*1000,'3'*999,'1'*1000,'2'*1000]+[''.join(rng.choice('123456789') for j in range(rng.randint(1,1000))) for _ in range(49)]
 ranges=[(3,1,2),(3,1,3),(1000000,1,4),(1000000,1000,100),(1000000,100,100)]+[(rng.randint(3,10000),rng.randint(1,1000),rng.randint(2,100)) for _ in range(94)]
 boards=[['W'],['...','.B.','W..'],['..B','.B.','W..'],['....','....','....','..W.']]
 for _ in range(96):
  n=100 if _<3 else rng.randint(1,40);board=[['B' if _>=3 and rng.random()<.3 else '.' for j in range(n)] for i in range(n)];r,c=(n-1,n//2) if _<3 else (rng.randrange(n),rng.randrange(n));board[r][c]='W';boards.append([''.join(row) for row in board])
 return {'uva-10690-expression-again':''.join(f'{n} {m}\n'+ ' '.join(map(str,v))+'\n' for n,m,v in expr),'uva-11284-shopping-trip':str(len(trips))+'\n\n'+'\n'.join(f'{n} {len(edges)}\n'+''.join(f'{u} {v} {money(c)}\n' for u,v,c in edges)+str(len(offers))+'\n'+''.join(f'{u} {money(v)}\n' for u,v in offers) for n,edges,offers in trips),'uva-11472-beautiful-numbers':beautiful_files()[0],'uva-11489-integer-game':str(len(integers))+'\n'+'\n'.join(integers)+'\n','uva-11536-smallest-sub-array':str(len(ranges))+'\n'+''.join(f'{n} {m} {k}\n' for n,m,k in ranges),'uva-11957-checkers':str(len(boards))+'\n'+''.join(str(len(b))+'\n'+'\n'.join(b)+'\n' for b in boards)}

def repair_input(slug,data,expected):
 if slug!='uva-11536-smallest-sub-array':return None
 a=list(map(int,data.split()));t=a[0];assert 0<=t<100 and len(a)==1+3*t;rows=[a[i:i+3] for i in range(1,len(a),3)];changed=[]
 for index,(n,m,k) in enumerate(rows):
  if not (3<=n<=1000000 and 1<=m<=1000 and 2<=k<=100):
   assert (n,m,k) in [(3782,3435,6),(3,5,1)];rows[index]=[n,min(m,1000),max(k,2)];changed.append(index)
 if not changed:return None
 result=str(t)+'\n'+''.join('%d %d %d\n'%tuple(row) for row in rows);new=windows(result).splitlines();old=expected.splitlines();assert len(new)==len(old) and all(new[i]==old[i] for i in range(t) if i not in changed);return result

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Clamp the two identified invalid fields to the closest legal boundary (M3435 to1000 and K1 to2); preserve every other field and independently confirm every unchanged query retains its original answer.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'count-constrained signed sums, exact cents/duplicate offers/return home, all909 digit walk limits, residue games, million-element windows and checkers modulo','input':data,'output':oracle(data)})
        if p['slug']=='uva-11472-beautiful-numbers':
            for data in beautiful_files()[1:]:
                if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'Exhaustive legal base/maximum-length pairs, at most99 queries per file','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
