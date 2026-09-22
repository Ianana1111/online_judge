"""Independent exact-edge walk DP, unique-matching adversary count, and certified knight pairings."""
import argparse,collections,hashlib,itertools,json,math,random
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
WALKS='uva-10740-first-love';THIEF='uva-12918-lucky-thief';KNIGHTS='uva-696-how-many-knights'
def kth_walk(n,edges,source,target,k):
 adjacency=[[] for _ in range(n)]
 for u,v,w in edges:adjacency[u].append((v,w))
 layer=[[] for _ in range(n)];layer[source]=[0];best=[]
 # Exact lengths keep each edge-walk counted once; at most N*K edges suffice.
 for length in range(1,n*k+1):
  upcoming=[[] for _ in range(n)];cap=best[-1] if len(best)==k else None
  for u,values in enumerate(layer):
   for v,w in adjacency[u]:upcoming[v].extend(value+w for value in values if cap is None or value+w<=cap)
  layer=[sorted(values)[:k] for values in upcoming];best=sorted(best+layer[target])[:k]
  if not any(layer):break
 return best[-1] if len(best)==k else -1
def walks(data):
 values=list(map(int,data.split()));at=0;out=[];done=False
 while at<len(values):
  n,m=values[at:at+2];at+=2
  if n==m==0:assert at==len(values);done=True;break
  assert 2<=n<=100 and 1<=m<=1000;source,target,k=values[at:at+3];at+=3;assert 1<=source<=n and 1<=target<=n and source!=target and 2<=k<=10;edges=[]
  for _ in range(m):
   u,v,w=values[at:at+3];at+=3;assert 1<=u<=n and 1<=v<=n and 0<=w<=10000;edges.append((u-1,v-1,w))
  reached={source-1};queue=[source-1]
  for u in queue:
   for a,v,w in edges:
    if a==u and v not in reached:reached.add(v);queue.append(v)
  assert target-1 in reached;out.append(str(kth_walk(n,edges,source-1,target-1,k)))
 assert done;return '\n'.join(out)+'\n'
def thief_value(n,m):return n*m-math.comb(n+1,2)
def thieves(data):
 values=list(map(int,data.split()));t=values[0];assert 1<=t<=100000 and len(values)==2*t+1;out=[]
 for n,m in zip(values[1::2],values[2::2]):assert 1<=n<=m<=100000;out.append(str(thief_value(n,m)))
 return '\n'.join(out)+'\n'
MOVES=[(a,b) for a,b in itertools.product([-2,-1,1,2],repeat=2) if abs(a)+abs(b)==3]
@lru_cache(None)
def knight_matching(rows,columns):
 adjacency={}
 for r in range(rows):
  for c in range(columns):
   if (r+c)%2==0:adjacency[(r,c)]=[(r+a,c+b) for a,b in MOVES if 0<=r+a<rows and 0<=c+b<columns]
 match={}
 def augment(u,seen):
  for v in adjacency[u]:
   if v in seen:continue
   seen.add(v)
   if v not in match or augment(match[v],seen):match[v]=u;return True
  return False
 for u in adjacency:augment(u,set())
 edges=tuple((u,v) for v,u in match.items());assert len({cell for edge in edges for cell in edge})==2*len(edges)
 assert all(sorted([abs(a-c),abs(b-d)])==[1,2] for (a,b),(c,d) in edges);return edges
def tile_sizes(n):
 assert n>=3
 remainder={0:0,1:5,2:6,3:3}[n%4];return ([remainder] if remainder else [])+[4]*((n-remainder)//4)
def knight_count(rows,columns):
 if not rows or not columns:return 0
 if min(rows,columns)<3:return rows*columns-len(knight_matching(rows,columns))
 matching=0
 for r in tile_sizes(rows):
  for c in tile_sizes(columns):
   pairs=knight_matching(r,c);assert len(pairs)==r*c//2;matching+=len(pairs)
 upper=rows*columns-matching;lower=(rows*columns+1)//2;assert upper==lower;return upper
def knights(data):
 values=list(map(int,data.split()));assert len(values)%2==0 and values[-2:]==[0,0];out=[]
 for rows,columns in zip(values[:-2:2],values[1:-2:2]):
  assert 0<=rows<=500 and 0<=columns<=500 and rows+columns>0;out.append(f'{knight_count(rows,columns)} knights may be placed on a {rows} row {columns} column board.')
 return '\n'.join(out)+'\n'
ORACLES={WALKS:walks,THIEF:thieves,KNIGHTS:knights}
def additions():
 rng=random.Random(10740);graphs=[(2,[(0,1,5)],0,1,2),(2,[(0,1,5),(1,1,2)],0,1,10),(2,[(0,0,0),(0,1,7)],0,1,10),(2,[(0,1,0),(1,1,0)],0,1,10),(2,[(0,1,2)]*10,0,1,10),(3,[(0,1,0),(1,0,0),(1,2,3)],0,2,10)]
 for _ in range(25):
  n=rng.randint(2,9);edges=[(i,i+1,rng.randrange(10)) for i in range(n-1)];edges.extend((rng.randrange(n),rng.randrange(n),rng.randrange(10)) for _ in range(30));graphs.append((n,edges,0,n-1,rng.randint(2,10)))
 n=100;edges=[(i,i+1,10000) for i in range(n-1)];edges.extend((rng.randrange(n),rng.randrange(n),rng.randint(1,10000)) for _ in range(1000-len(edges)));graphs.append((n,edges,0,n-1,10))
 graphs.append((100,[(i,i+1,10000) for i in range(99)]+[(99,0,10000)],0,99,10))
 queries=[(n,m) for m in range(1,21) for n in range(1,m+1)]+[(1,100000),(99999,100000),(100000,100000)]
 queries.extend((n,100000) for n in range(1,100001-len(queries)))
 boards=[(r,c) for r in range(1,13) for c in range(1,13)]+[(0,5),(5,0),(1,500),(2,500),(500,2),(3,500),(500,3),(499,499),(500,500),(499,500)]
 return {WALKS:[''.join(f'{n} {len(edges)}\n{source+1} {target+1} {k}\n'+''.join(f'{u+1} {v+1} {w}\n' for u,v,w in edges) for n,edges,source,target,k in graphs)+'0 0\n'],THIEF:[str(len(queries))+'\n'+''.join(f'{n} {m}\n' for n,m in queries)],KNIGHTS:[''.join(f'{r} {c}\n' for r,c in boards)+'0 0\n']}
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
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'zero-weight walks/equal multiplicity/100nodes1000edges;100000key queries and64bit answers;thin/empty/500x500knight boards','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
