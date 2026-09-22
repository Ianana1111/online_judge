"""Independent interval-cover DP, intersection groups, Fleury tours,
minimax partition DP and vertex-deletion maze paths."""
import argparse,bisect,collections,hashlib,itertools,json,random,re
from decimal import Decimal,localcontext
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
GRASS='uva-10382-watering-grass';RADAR='uva-1193-radar-installation';TRIP='uva-302-john-s-trip';BOOK='uva-714-copying-books';MAZE='gpe-25081-solving-maze-problems'
def grass_count(length,width,sprinklers):
 if length==0:return 0
 with localcontext() as context:
  context.prec=100;intervals=[]
  for x,r in sprinklers:
   if 4*r*r<=width*width:continue
   half=Decimal(4*r*r-width*width).sqrt()/2;intervals.append((Decimal(x)+half,Decimal(x)-half))
  intervals.sort();ends=sorted({right for right,left in intervals if right>0});size=1
  while size<len(ends):size*=2
  infinity=len(intervals)+1;tree=[infinity]*(2*size)
  def query(l,r):
   result=infinity;l+=size;r+=size
   while l<r:
    if l&1:result=min(result,tree[l]);l+=1
    if r&1:r-=1;result=min(result,tree[r])
    l//=2;r//=2
   return result
  def update(index,value):
   index+=size;tree[index]=min(tree[index],value)
   while index>1:index//=2;tree[index]=min(tree[2*index],tree[2*index+1])
  for right,left in intervals:
   if right<=0:continue
   index=bisect.bisect_left(ends,right)
   best=0 if left<=0 else query(bisect.bisect_left(ends,left),index)
   if best<infinity:update(index,best+1)
  answer=query(bisect.bisect_left(ends,length),len(ends));return -1 if answer==infinity else answer
def grasses(data):
 values=list(map(int,data.split()));at=0;out=[]
 while at<len(values):
  n,length,width=values[at:at+3];at+=3;assert 0<=n<=10000 and length>=0 and width>=0;row=[]
  for _ in range(n):x,r=values[at:at+2];at+=2;assert r>=0;row.append((x,r))
  out.append(str(grass_count(length,width,row)))
 return '\n'.join(out)+'\n'
def parse_radars(data,strict=True):
 values=list(map(int,data.split()));at=0;out=[];done=False
 while at<len(values):
  n,r=values[at:at+2];at+=2
  if n==r==0:assert at==len(values);done=True;break
  assert 1<=n<=1000 and r>=0;row=[]
  for _ in range(n):
   x,y=values[at:at+2];at+=2
   if strict:assert y>=0
   row.append((x,y))
  out.append((r,row))
 assert done;return out
def radar_count(radius,islands):
 if any(y>radius for x,y in islands):return -1
 with localcontext() as context:
  context.prec=100;intervals=[]
  for x,y in islands:
   delta=Decimal(radius*radius-y*y).sqrt();intervals.append((Decimal(x)-delta,Decimal(x)+delta))
  intervals.sort();groups=0;upper=None
  for left,right in intervals:
   if upper is None or left>upper:groups+=1;upper=right
   else:upper=min(upper,right)
  return groups
def radars(data):return ''.join(f'Case {i}: {radar_count(radius,row)}\n' for i,(radius,row) in enumerate(parse_radars(data),1))
def repair_radars(data):
 parse_radars(data,strict=False);tokens=list(re.finditer(r'\S+',data));at=0;replacements=[]
 while at<len(tokens):
  n,r=int(tokens[at].group()),int(tokens[at+1].group());at+=2
  if n==r==0:break
  for _ in range(n):
   token=tokens[at+1];y=int(token.group())
   if y<0:replacements.append((token.start(),token.end(),str(-y)))
   at+=2
 result=data
 for begin,end,value in reversed(replacements):result=result[:begin]+value+result[end:]
 return (result,len(replacements)) if replacements else None
def format_radars(cases):return ''.join(f'{len(row)} {radius}\n'+''.join(f'{x} {y}\n' for x,y in row) for radius,row in cases)+'0 0\n'

def parse_towns(data):
 values=list(map(int,data.split()));at=0;out=[];current=[];done=False
 while at<len(values):
  u,v=values[at:at+2];at+=2
  if u==v==0:
   if not current:assert at==len(values);done=True;break
   assert len({e[2] for e in current})==len(current);out.append(current);current=[]
  else:
   label=values[at];at+=1;assert 1<=u<=44 and 1<=v<=44 and 1<=label<1995;current.append((u,v,label))
 assert done;return out
def euler_tour(edges):
 start=min(edges[0][:2]);graph=collections.defaultdict(list);by_id={label:(u,v) for u,v,label in edges}
 for u,v,label in edges:graph[u].append((label,v));graph[v].append((label,u))
 reached={start};queue=[start]
 for u in queue:
  for label,v in graph[u]:
   if v not in reached:reached.add(v);queue.append(v)
 assert set(graph)==reached
 if any(len(row)%2 for row in graph.values()):return None
 remaining=set(by_id);current=start;out=[]
 while remaining:
  chosen=None
  for label,v in sorted(set(graph[current])):
   if label not in remaining:continue
   # Directly ask whether all remaining edges are reachable from the new current
   # endpoint, rather than reusing Hierholzer's postorder construction.
   reached={v};queue=[v]
   for u in queue:
    for other,w in graph[u]:
     if other==label or other not in remaining or w in reached:continue
     reached.add(w);queue.append(w)
   if all(other==label or a in reached and b in reached for other,(a,b) in by_id.items() if other in remaining):chosen=(label,v);break
  assert chosen is not None;label,current=chosen;remaining.remove(label);out.append(label)
 assert current==start;return out
def trips(data):return '\n\n'.join('Round trip does not exist.' if (answer:=euler_tour(edges)) is None else ' '.join(map(str,answer)) for edges in parse_towns(data))+'\n\n'
def format_towns(cases):return ''.join(''.join(f'{u} {v} {label}\n' for u,v,label in edges)+'0 0\n' for edges in cases)+'0 0\n'

def book_partition(pages,groups):
 n=len(pages);reverse=[0]+list(itertools.accumulate(reversed(pages)));infinity=sum(pages)+1;dp=[[infinity]*(n+1) for _ in range(groups+1)];dp[0][0]=0
 for length in range(1,n+1):dp[1][length]=reverse[length]
 for g in range(2,groups+1):
  for length in range(g,n+1):
   lo,hi=g-1,length-1
   while lo<hi:
    middle=(lo+hi)//2
    if dp[g-1][middle]>=reverse[length]-reverse[middle]:hi=middle
    else:lo=middle+1
   dp[g][length]=min(max(dp[g-1][j],reverse[length]-reverse[j]) for j in [lo,lo-1] if j>=g-1)
 limit=dp[groups][n];start=0;parts=[]
 for left in range(groups,0,-1):
  total=0
  for end in range(start,n):
   total+=pages[end]
   if total<=limit and dp[left-1][n-end-1]<=limit:parts.append(pages[start:end+1]);start=end+1;break
  else:raise AssertionError('No optimal suffix partition')
 assert start==n;return parts
def books(data):
 values=list(map(int,data.split()));tests=values[0];assert tests>0;at=1;out=[]
 for _ in range(tests):
  n,k=values[at:at+2];at+=2;row=values[at:at+n];at+=n;assert 1<=k<=n<=500 and len(row)==n and all(0<x<10000000 for x in row)
  out.append(' / '.join(' '.join(map(str,part)) for part in book_partition(row,k)))
 assert at==len(values);return '\n'.join(out)+'\n'
def format_books(cases):return str(len(cases))+'\n'+''.join(f'{len(row)} {k}\n'+' '.join(map(str,row))+'\n' for row,k in cases)
def repair_books(data):
 tokens=list(re.finditer(r'\S+',data));tests=int(tokens[0].group());at=1;changes=[]
 for _ in range(tests):
  n,k=int(tokens[at].group()),int(tokens[at+1].group());at+=2;assert 1<=k<=n<=500
  for token in tokens[at:at+n]:
   value=int(token.group());assert value>0
   if value>=10000000:changes.append((token.start(),token.end(),'9999999'))
  at+=n
 assert at==len(tokens);result=data
 for begin,end,value in reversed(changes):result=result[:begin]+value+result[end:]
 return (result,len(changes)) if changes else None

def maze(data):
 grid=data.splitlines();assert len(grid)==10 and all(len(row)==10 and set(row)<=set('#.SG') for row in grid);flat=''.join(grid);assert flat.count('S')==flat.count('G')==1;start=flat.index('S');goal=flat.index('G');graph={}
 for index,ch in enumerate(flat):
  if ch=='#':continue
  r,c=divmod(index,10);graph[index]=[y*10+x for y,x in [(r-1,c),(r+1,c),(r,c-1),(r,c+1)] if 0<=y<10 and 0<=x<10 and grid[y][x]!='#']
 def reachable(blocked=None,edge=None):
  if start==blocked:return {}
  parent={start:None};queue=[start]
  for u in queue:
   for v in graph[u]:
    if v==blocked or v in parent or edge==frozenset([u,v]):continue
    parent[v]=u;queue.append(v)
  return parent
 parent=reachable()
 if goal not in parent:return 'No solution\n\n'
 at=goal
 while at!=start:
  previous=parent[at];assert goal not in reachable(edge=frozenset([at,previous]));at=previous
 mandatory={v for v in graph if goal not in reachable(blocked=v)};answer=list(flat)
 for v in mandatory:answer[v]='+'
 return '\n'.join(''.join(answer[i:i+10]) for i in range(0,100,10))+'\n\n'

ORACLES={GRASS:grasses,RADAR:radars,TRIP:trips,BOOK:books,MAZE:maze}
def additions():
 rng=random.Random(714302)
 grass=[(16,6,[(4,5),(12,5)]),(10,4,[(5,2)]),(20,0,[(5,5),(15,5)]),(1,2,[]),(0,2,[(0,1)])]
 for _ in range(40):grass.append((rng.randint(1,100),rng.randint(0,20),[(rng.randrange(-10,110),rng.randrange(1,60)) for _ in range(rng.randrange(1,30))]))
 grass.append((40000,6,[(4+8*i,5) for i in range(10000)]))
 radar=[(5,[(0,3),(8,3)]),(5,[(0,5)]),(0,[(0,0),(1,0),(1,0)]),(1,[(0,2)]),(5,[(i,3) for i in range(-1000,1000,2)])]
 for _ in range(30):radar.append((rng.randrange(0,20),[(rng.randrange(-50,50),rng.randrange(0,20)) for _ in range(rng.randrange(1,20))]))
 towns=[[(1,2,1),(2,3,2),(3,1,3),(2,4,4),(4,5,5),(5,2,6)],[(9,9,3),(9,1,1),(1,9,2)],[(2,3,2),(3,2,5),(2,2,8)],[(1,2,1)]]
 large=[]
 for i in range(2,45):large.extend([(1,i,len(large)+1),(1,i,len(large)+2)])
 while len(large)<1994:large.extend([(1,2,len(large)+1),(1,2,len(large)+2)])
 towns.append(large)
 book_cases=[([100]*5,4),([9999999]*500,1),([9999999-i for i in range(500)],500),([rng.randrange(1,10000000) for _ in range(500)],250)]
 for _ in range(25):n=rng.randrange(1,15);book_cases.append(([rng.randrange(1,100) for _ in range(n)],rng.randrange(1,n+1)))
 snake=[list('.'*10 if r%2==0 else '#'*10) for r in range(10)]
 for r in range(1,10,2):snake[r][9 if r%4==1 else 0]='.'
 snake[0][0]='S';snake[9][9]='G';cycle=[list('#'*10) for _ in range(10)]
 for r in range(10):cycle[r][0]='.'
 for r,c in [(4,1),(4,2),(4,3),(3,2),(3,3)]:cycle[r][c]='.'
 cycle[0][0]='S';cycle[9][0]='G';isolated=[list('#'*10) for _ in range(10)];isolated[4][4]='S';isolated[5][5]='G'
 maze_cases=['\n'.join(''.join(row) for row in board)+'\n' for board in [snake,cycle,isolated]]
 maze_cases.append('\n'.join(''.join(row) for row in zip(*reversed(cycle)))+'\n')
 return {GRASS:[''.join(f'{len(row)} {length} {width}\n'+''.join(f'{x} {r}\n' for x,r in row) for length,width,row in grass)],RADAR:[format_radars(radar)],TRIP:[format_towns(towns)],BOOK:[format_books(book_cases)],MAZE:maze_cases}
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
     if p['slug']==BOOK and check['status']=='WRONG_EXPECTED_OUTPUT':
      lines=c['output'].strip().splitlines()
      if all(line.startswith('[') and line.endswith(']') for line in lines) and normalize('\n'.join(line[1:-1] for line in lines))==normalize(answer):
       row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Remove an extra pair of literal square brackets from each hidden answer line. The original statement and unchanged public sample require pages and slash separators without brackets. Independent minimax suffix DP confirms every page value and every split is otherwise identical; input is retained byte-for-byte.'})
    except (AssertionError,ValueError,IndexError,StopIteration):
     check['status']='INPUT_REQUIRES_REVIEW'
     if p['slug']==RADAR:
      repaired=repair_radars(c['input'])
      if repaired:
       data,count=repaired;row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':data,'output':oracle(data),'reason':f'Reflect only {count} negative island y coordinates to abs(y), placing islands on the stated sea side. Preserve every x coordinate, radar radius, island count, positive y token and all whitespace exactly. Reflection leaves each distance to every coastal radar position unchanged; independently recompute the optimum after repair.'})
     if p['slug']==BOOK:
      repaired=repair_books(c['input'])
      if repaired:
       data,count=repaired;row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':data,'output':oracle(data),'reason':f'Replace only {count} book-page values at or above the prohibited10000000 boundary with the nearest legal upper value9999999. Preserve all valid page values, their order, book counts, scribe counts and every whitespace byte. Recompute all partitions via independent minimax suffix DP, including lexicographic tie rules. Also remove spurious square-bracket wrappers from hidden output, matching the original statement and public sample.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'exact touching radical endpoints,10000sprinklers,1000islands;1994-edge lexEuler;500books and allK extremes;unique maze with off-path cycles','input':data,'output':oracle(data)})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
