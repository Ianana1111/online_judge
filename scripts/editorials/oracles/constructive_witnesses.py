"""Independent optimal-cover DP, batched Fenwick chains, capacity inequalities
and transportation BFS. Validate witnesses rather than exact answer choices."""
import argparse,bisect,collections,hashlib,itertools,json,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
COVER='gpe-10608-minimal-coverage';ELEPHANT='gpe-10658-is-bigger-smarter';DINNER='gpe-10741-the-grand-dinner';MATRIX='gpe-10906-matrix-decompressing'
def parse_covers(data):
 values=list(map(int,data.split()));tests=values[0];assert tests>=1;at=1;cases=[]
 for _ in range(tests):
  target=values[at];at+=1;assert 1<=target<=5000;segments=[]
  while True:
   a,b=values[at:at+2];at+=2
   if a==b==0:break
   assert -50000<=a<=b<=50000;segments.append((a,b))
  assert len(segments)<=100000;cases.append((target,segments))
 assert at==len(values);return cases
def cover_path(target,segments):
 rights=sorted({b for a,b in segments if b>0});size=1
 while size<len(rights):size*=2
 infinity=len(segments)+1;tree=[(infinity,-1)]*(2*size);parent=[None]*len(rights)
 def query(left,right):
  best=(infinity,-1);left+=size;right+=size
  while left<right:
   if left&1:best=min(best,tree[left]);left+=1
   if right&1:right-=1;best=min(best,tree[right])
   left//=2;right//=2
  return best
 for index in sorted(range(len(segments)),key=lambda i:segments[i][1]):
  a,b=segments[index]
  if b<=0:continue
  end=bisect.bisect_left(rights,b);cost,previous=(0,-1) if a<=0 else query(bisect.bisect_left(rights,a),end)
  if cost+1<tree[size+end][0]:
   parent[end]=(previous,index);position=size+end;tree[position]=(cost+1,end)
   while position>1:position//=2;tree[position]=min(tree[2*position],tree[2*position+1])
 count,end=query(bisect.bisect_left(rights,target),len(rights))
 if count==infinity:return None
 answer=[]
 while end>=0:end,index=parent[end];answer.append(index)
 return sorted(answer,key=lambda i:segments[i][0])
def cover_output(data):
 output=[]
 for target,segments in parse_covers(data):
  path=cover_path(target,segments);output.append('0' if path is None else str(len(path))+'\n'+'\n'.join(f'{segments[i][0]} {segments[i][1]}' for i in path))
 return '\n\n'.join(output)+'\n'
def cover_valid(data,output):
 lines=output.strip().splitlines();row=0
 try:
  for case,(target,segments) in enumerate(parse_covers(data)):
   if case:assert lines[row].strip()=='';row+=1
   count=int(lines[row]);row+=1;path=cover_path(target,segments);assert count==(len(path) if path is not None else 0);copies=collections.Counter(segments);reach=0;left=-50001
   for _ in range(count):
    a,b=map(int,lines[row].split());row+=1;assert copies[(a,b)]>0 and a>=left and a<=reach;copies[(a,b)]-=1;reach=max(reach,b);left=a
   assert not count or reach>=target
  return row==len(lines)
 except (AssertionError,ValueError,IndexError):return False
def format_covers(cases):return str(len(cases))+'\n\n'+'\n'.join(str(target)+'\n'+''.join(f'{a} {b}\n' for a,b in segments)+'0 0\n' for target,segments in cases)
def parse_elephants(data):
 lines=data.splitlines();assert 1<=len(lines)<=1000;records=[tuple(map(int,line.split())) for line in lines];assert all(len(row)==2 and all(1<=v<=10000 for v in row) for row in records);return records
def elephant_path(records):
 order=sorted(range(len(records)),key=lambda i:records[i][0]);tree=[(0,-1)]*10002;length=[0]*len(records);parent=[-1]*len(records);at=0
 def query(index):
  answer=(0,-1)
  while index:answer=max(answer,tree[index]);index-=index&-index
  return answer
 while at<len(order):
  end=at
  while end<len(order) and records[order[end]][0]==records[order[at]][0]:end+=1
  for i in order[at:end]:value,previous=query(10000-records[i][1]);length[i]=value+1;parent[i]=previous
  for i in order[at:end]:
   index=10001-records[i][1]
   while index<len(tree):tree[index]=max(tree[index],(length[i],i));index+=index&-index
  at=end
 last=max(range(len(records)),key=lambda i:(length[i],i));path=[]
 while last>=0:path.append(last);last=parent[last]
 return path[::-1]
def elephant_output(data):
 path=elephant_path(parse_elephants(data));return str(len(path))+'\n'+'\n'.join(str(i+1) for i in path)+'\n'
def elephant_valid(data,output):
 try:
  records=parse_elephants(data);lines=output.strip().splitlines();count=int(lines[0]);ids=[int(line)-1 for line in lines[1:]];assert count==len(ids)==len(elephant_path(records)) and len(set(ids))==len(ids) and all(0<=i<len(records) for i in ids)
  return all(records[a][0]<records[b][0] and records[a][1]>records[b][1] for a,b in zip(ids,ids[1:]))
 except (AssertionError,ValueError,IndexError):return False

def parse_dinners(data):
 values=list(map(int,data.split()));at=0;cases=[];ended=False
 while at<len(values):
  m,n=values[at:at+2];at+=2
  if m==n==0:assert at==len(values);ended=True;break
  assert 1<=m<=70 and 1<=n<=50;teams=values[at:at+m];at+=m;capacities=values[at:at+n];at+=n;assert len(teams)==m and len(capacities)==n and all(1<=x<=100 for x in teams) and all(2<=x<=100 for x in capacities);cases.append((teams,capacities))
 assert ended;return cases
def dinner_feasible(teams,capacities):
 ordered=sorted(teams,reverse=True);total=0
 for k,value in enumerate(ordered,1):
  total+=value
  if total>sum(min(k,c) for c in capacities):return False
 return True
def dinner_assignment(teams,capacities):
 if not dinner_feasible(teams,capacities):return None
 capacities=list(capacities);answer=[[] for _ in teams]
 for team in sorted(range(len(teams)),key=lambda i:(-teams[i],i)):
  tables=sorted(range(len(capacities)),key=lambda i:(-capacities[i],-i))[:teams[team]];assert len(tables)==teams[team] and all(capacities[i]>0 for i in tables)
  for table in tables:capacities[table]-=1
  answer[team]=tables
 return answer
def dinner_output(data):
 output=[]
 for teams,capacities in parse_dinners(data):
  answer=dinner_assignment(teams,capacities)
  if answer is None:output.append('0')
  else:output.append('1');output.extend(' '.join(str(i+1) for i in row) for row in answer)
 return '\n'.join(output)+'\n'
def dinner_valid(data,output):
 lines=output.strip().splitlines();row=0
 try:
  for teams,capacities in parse_dinners(data):
   status=lines[row].strip();row+=1;possible=dinner_feasible(teams,capacities);assert status in ['0','1'] and (status=='1')==possible
   if not possible:continue
   remaining=list(capacities)
   for size in teams:
    tables=[int(token)-1 for token in lines[row].split()];row+=1;assert len(tables)==size and len(set(tables))==size and all(0<=i<len(capacities) for i in tables)
    for i in tables:remaining[i]-=1;assert remaining[i]>=0
  return row==len(lines)
 except (AssertionError,ValueError,IndexError):return False
def format_dinners(cases):return ''.join(f'{len(teams)} {len(capacities)}\n'+' '.join(map(str,teams))+'\n'+' '.join(map(str,capacities))+'\n' for teams,capacities in cases)+'0 0\n'
def parse_matrices(data):
 values=list(map(int,data.split()));tests=values[0];assert 1<=tests<=100;at=1;cases=[]
 for _ in range(tests):
  r,c=values[at:at+2];at+=2;assert 1<=r<=20 and 1<=c<=20;rows=values[at:at+r];at+=r;columns=values[at:at+c];at+=c;assert len(rows)==r and len(columns)==c;row=[x-y for x,y in zip(rows,[0]+rows[:-1])];col=[x-y for x,y in zip(columns,[0]+columns[:-1])];assert sum(row)==sum(col) and all(c<=x<=20*c for x in row) and all(r<=x<=20*r for x in col);cases.append((r,c,rows,columns,row,col))
 assert at==len(values);return cases
def transportation(row,col):
 r,c=len(row),len(col);source=r+c;target=source+1;n=target+1;capacity=[[0]*n for _ in range(n)];adj=[[] for _ in range(n)]
 def add(a,b,value):capacity[a][b]=value;adj[a].append(b);adj[b].append(a)
 for i,amount in enumerate(row):add(source,i,amount-c)
 for j,amount in enumerate(col):add(r+j,target,amount-r)
 for i in range(r):
  for j in range(c):add(i,r+j,19)
 total=0
 while True:
  parent=[-1]*n;parent[source]=source;queue=collections.deque([source])
  while queue and parent[target]<0:
   u=queue.popleft()
   for v in adj[u]:
    if capacity[u][v]>0 and parent[v]<0:parent[v]=u;queue.append(v)
  if parent[target]<0:break
  amount=10**9;v=target
  while v!=source:amount=min(amount,capacity[parent[v]][v]);v=parent[v]
  v=target
  while v!=source:u=parent[v];capacity[u][v]-=amount;capacity[v][u]+=amount;v=u
  total+=amount
 assert total==sum(row)-r*c;return [[20-capacity[i][r+j] for j in range(c)] for i in range(r)]
def matrix_output(data):
 output=[]
 for case,(r,c,rows,columns,row,col) in enumerate(parse_matrices(data),1):
  grid=transportation(row,col);output.append(f'Matrix {case}\n'+'\n'.join(' '.join(map(str,line)) for line in grid))
 return '\n\n'.join(output)+'\n'
def matrix_valid(data,output):
 lines=output.strip().splitlines();at=0
 try:
  for case,(r,c,rows,columns,row,col) in enumerate(parse_matrices(data),1):
   if case>1:
    while lines[at].strip()=='':at+=1
   assert lines[at].strip()==f'Matrix {case}';at+=1;grid=[]
   for _ in range(r):
    values=list(map(int,lines[at].split()));at+=1;assert len(values)==c and all(1<=x<=20 for x in values);grid.append(values)
   assert list(itertools.accumulate(map(sum,grid)))==rows and list(itertools.accumulate(sum(grid[i][j] for i in range(r)) for j in range(c)))==columns
  return at==len(lines)
 except (AssertionError,ValueError,IndexError):return False
def format_matrices(grids):
 lines=[str(len(grids))]
 for grid in grids:
  r,c=len(grid),len(grid[0]);lines.extend([f'{r} {c}',' '.join(map(str,itertools.accumulate(map(sum,grid)))),' '.join(map(str,itertools.accumulate(sum(grid[i][j] for i in range(r)) for j in range(c))))])
 return '\n'.join(lines)+'\n'
ORACLES={COVER:(cover_output,cover_valid),ELEPHANT:(elephant_output,elephant_valid),DINNER:(dinner_output,dinner_valid),MATRIX:(matrix_output,matrix_valid)}
def additions():
 rng=random.Random(11082);covers=[(5,[(-1,3),(0,3),(2,5),(3,5),(0,1),(1,2)]),(5,[(0,1),(2,5)]),(1,[(-1,0),(0,1),(1,1)]),(5000,[(-50000,50000)])]
 for _ in range(30):
  intervals=[tuple(sorted((rng.randrange(-10,30),rng.randrange(-10,30)))) for _ in range(20)];intervals=[pair for pair in intervals if pair!=(0,0)];covers.append((rng.randrange(1,20),intervals))
 large=[(i,i+1) for i in range(5000)]+[(-i-1,-i) for i in range(45000)]+[(i,i+1) for i in range(5000,50000)]+[(i,i+1) for i in range(5000)];assert len(large)==100000;rng.shuffle(large)
 elephants=[[(5,90),(5,80),(5,70)],[(1,9),(2,8),(2,8),(3,7),(4,7)],[(i+1,10000-i) for i in reversed(range(1000))],[(i//2+1,10000-i//3) for i in range(1000)],[(rng.randrange(1,10001),rng.randrange(1,10001)) for _ in range(1000)]]
 dinners=[([1,2,2],[2,3]),([3,3,3],[100,2,2]),([100],[100]*50),([50]*70,[70]*50),([2,2,2],[2,2,2])]
 for _ in range(50):dinners.append(([rng.randrange(1,12) for _ in range(rng.randrange(1,15))],[rng.randrange(2,15) for _ in range(rng.randrange(1,12))]))
 matrices=[[[1]],[[20]],[[11,11],[11,11]],[[1]*20 for _ in range(20)],[[20]*20 for _ in range(20)],[[rng.randrange(1,21) for _ in range(20)] for _ in range(20)]]
 for _ in range(24):r,c=rng.randrange(1,10),rng.randrange(1,10);matrices.append([[rng.randrange(1,21) for _ in range(c)] for _ in range(r)])
 maximum=[[[rng.randrange(1,21) for _ in range(20)] for _ in range(20)] for _ in range(100)]
 return {COVER:[format_covers(covers),format_covers([(5000,large)])],ELEPHANT:[''.join(f'{w} {s}\n' for w,s in row) for row in elephants],DINNER:[format_dinners(dinners)],MATRIX:[format_matrices(matrices),format_matrices(maximum)]}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  functions=ORACLES.get(p['slug'])
  if not functions:continue
  oracle,valid=functions;spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:answer=oracle(c['input']);assert valid(c['input'],answer);check['status']='MATCH' if valid(c['input'],c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):
    answer=oracle(data);assert valid(data,answer);row['proposedAdditions'].append({'label':'alternateoptimalcover/elephantchains;100000segments/1000elephants;residualrerouting and70x50tables;1..20cellbounds,100matrices20x20;allwitnessesvalidatedsemantically','input':data,'output':answer})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
