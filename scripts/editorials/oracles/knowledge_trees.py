"""Independent alternating bipartite degree-one peeling and dense Prim MST.
Validate unordered pair sets and arbitrary optimal spanning-tree witnesses."""
import argparse,collections,functools,hashlib,itertools,json,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
GAME='uva-1657-game';OREON='uva-1208-oreon'
@functools.lru_cache(None)
def knowledge_rounds(n):
 pairs=[(a,b) for a in range(1,n+1) for b in range(a+1,n+1)];keys=[[(a+b,a*b)[side] for a,b in pairs] for side in range(2)];buckets=[collections.defaultdict(set),collections.defaultdict(set)]
 for side in range(2):
  for index,key in enumerate(keys[side]):buckets[side][key].add(index)
 pending=[{next(iter(group)) for group in partition.values() if len(group)==1} for partition in buckets];alive=set(range(len(pairs)));answers=[]
 for turn in range(101):
  side=turn%2;removed=sorted(index for index in pending[side] if index in alive and len(buckets[side][keys[side][index]])==1);pending[side]=set();answers.append(tuple(pairs[i] for i in removed))
  for index in removed:
   alive.remove(index)
   for half in range(2):
    group=buckets[half][keys[half][index]];group.remove(index)
    if len(group)==1:pending[half].add(next(iter(group)))
 return tuple(answers)
def game_queries(data):
 values=list(map(int,data.split()));assert values and len(values)%2==0;queries=list(zip(values[::2],values[1::2]));assert all(2<=n<=200 and 0<=m<=100 for n,m in queries);return queries
def game_output(data):
 lines=[]
 for n,m in game_queries(data):
  answers=knowledge_rounds(n)[m];lines.append(str(len(answers)));lines.extend(f'{a} {b}' for a,b in answers)
 return '\n'.join(lines)+'\n'
def game_valid(data,output):
 lines=output.strip().splitlines();at=0
 try:
  for n,m in game_queries(data):
   wanted=set(knowledge_rounds(n)[m]);count=int(lines[at]);at+=1;assert count==len(wanted);got=[]
   for _ in range(count):
    row=list(map(int,lines[at].split()));at+=1;assert len(row)==2;got.append(tuple(sorted(row)))
   assert len(set(got))==count and set(got)==wanted
  return at==len(lines)
 except (AssertionError,ValueError,IndexError):return False

def parse_graphs(data):
 values=list(map(int,data.replace(',',' ').split()));tests=values[0];assert tests>0;at=1;matrices=[]
 for _ in range(tests):
  n=values[at];at+=1;assert 1<=n<=26;matrix=[]
  for _ in range(n):matrix.append(values[at:at+n]);at+=n
  assert all(len(row)==n for row in matrix) and all(matrix[i][i]==0 for i in range(n)) and all(matrix[i][j]==matrix[j][i]>=0 for i in range(n) for j in range(n));matrices.append(matrix)
 assert at==len(values);return matrices
def prim(matrix):
 n=len(matrix);used={0};edges=[]
 while len(used)<n:
  crossing=[(matrix[a][b],a,b) for a in used for b in range(n) if b not in used and matrix[a][b]>0];assert crossing;weight,a,b=min(crossing);edges.append((weight,a,b));used.add(b)
 return edges
def oreon_output(data):
 lines=[]
 for case,matrix in enumerate(parse_graphs(data),1):
  lines.append(f'Case {case}:');lines.extend(f'{chr(65+a)}-{chr(65+b)} {weight}' for weight,a,b in prim(matrix))
 return '\n'.join(lines)+'\n'
def oreon_valid(data,output):
 lines=output.strip().splitlines();at=0
 try:
  for case,matrix in enumerate(parse_graphs(data),1):
   n=len(matrix);assert lines[at].strip()==f'Case {case}:';at+=1;edges=set();graph=[[] for _ in matrix];total=0
   for _ in range(n-1):
    match=re.fullmatch(r'([A-Z])-([A-Z])\s+([+]?[0-9]+)',lines[at].strip());at+=1;assert match;a=ord(match[1])-65;b=ord(match[2])-65;weight=int(match[3]);assert 0<=a<n and 0<=b<n and a!=b and weight>0 and matrix[a][b]==weight;edge=tuple(sorted((a,b)));assert edge not in edges;edges.add(edge);graph[a].append(b);graph[b].append(a);total+=weight
   reached={0};queue=[0]
   for vertex in queue:
    for neighbor in graph[vertex]:
     if neighbor not in reached:reached.add(neighbor);queue.append(neighbor)
   assert len(reached)==n and total==sum(weight for weight,a,b in prim(matrix))
  return at==len(lines)
 except (AssertionError,ValueError,IndexError):return False

def format_graphs(matrices):return str(len(matrices))+'\n'+''.join(str(len(matrix))+'\n'+'\n'.join(', '.join(map(str,row)) for row in matrix)+'\n' for matrix in matrices)
def additions():
 queries=[(n,m) for n in range(2,41) for m in range(21)]+[(n,m) for n in [100,199,200] for m in range(101)];rng=random.Random(1208);graphs=[[[0]],[[0,1,3],[1,0,1],[3,1,0]],[[0,3,0],[3,0,5],[0,5,0]],[[int(i!=j) for j in range(26)] for i in range(26)]]
 for n in range(2,27):
  graph=[[0]*n for _ in range(n)]
  for a in range(n):
   for b in range(a+1,n):graph[a][b]=graph[b][a]=rng.randrange(1,1001) if b==a+1 or rng.randrange(4)>0 else 0
  graphs.append(graph)
 return {GAME:[''.join(f'{n} {m}\n' for n,m in queries),''.join(f'{n} 0\n{n} 100\n' for n in range(2,201))],OREON:[format_graphs(graphs)]}
ORACLES={GAME:(game_output,game_valid),OREON:(oreon_output,oreon_valid)}
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
    if p['slug']==GAME and check['status']=='INPUT_REQUIRES_REVIEW':
     tokens=list(map(int,c['input'].split()));assert len(tokens)%2==0 and all(2<=n<=200 and m>=0 for n,m in zip(tokens[::2],tokens[1::2]));repaired=''.join(f'{n} {min(m,100)}\n' for n,m in zip(tokens[::2],tokens[1::2]));answer=game_output(repaired);assert game_valid(repaired,answer)
     row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':repaired,'output':answer,'reason':'Legacy rounds 179/148/105/137 exceed the explicit M<=100 constraint. Keep every dataset and N, cap only out-of-range rounds at the legal maximum100, and independently recompute complete pair sets using alternating bipartite leaf peeling. No invalid out-of-domain round is used to reject a contestant.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):
    answer=oracle(data);assert valid(data,answer);row['proposedAdditions'].append({'label':'alternating epistemic leaf peeling,allN2..200,M0/100,fullrounds smallN andN200;26city equalweight/connected sparse graphs and varied weights;completeunorderedpairsets and anyoptimalspanningtree','input':data,'output':answer})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
