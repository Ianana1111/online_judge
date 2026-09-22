"""Independent Pratt arithmetic, iterative bridge blocks and exhaustive exact
supporting circles; all capacity changes are explicit local statement proposals."""
import argparse,ast,collections,hashlib,itertools,json,random,re
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
BIG='uva-288-arithmetic-operations-with-large-integers';NECK='gpe-10465-necklace';PACK='gpe-10604-packing-polygons'
def arithmetic(expression):
 tokens=re.findall(r'\d+|\*\*|[+*\-]',expression);assert ''.join(tokens)==expression and len(tokens)%2==1 and 1<=len(tokens)//2<=100
 for token in tokens[::2]:assert token.isdigit() and len(token)<=1000 and int(token)>0
 for token in tokens[1::2]:assert token in ['+','-','*','**']
 priority={'+':1,'-':1,'*':2,'**':3};at=0;bound=10**3000
 def parse(minimum):
  nonlocal at
  answer=int(tokens[at]);at+=1
  while at<len(tokens) and priority[tokens[at]]>=minimum:
   operator=tokens[at];at+=1;right=parse(priority[operator]+(operator!='**'))
   if operator=='+':answer+=right
   elif operator=='-':answer-=right
   elif operator=='*':answer*=right
   else:
    assert 1<=answer<=9 and right>0
    assert answer==1 or right<=10000
    answer=pow(answer,right)
   assert abs(answer)<bound
  return answer
 answer=parse(1);assert at==len(tokens);return answer
def arithmetic_file(data):
 lines=data.splitlines();assert 1<=len(lines)<=50 and all(lines);return '\n'.join(str(arithmetic(line)) for line in lines)+'\n'
def necklace(n,edges,source,target):
 graph=[[] for _ in range(n)]
 for index,(a,b) in enumerate(edges):graph[a].append((b,index));graph[b].append((a,index))
 entered=[-1]*n;low=[0]*n;parent=[-1]*n;parent_edge=[-1]*n;clock=0;bridges=set()
 for root in range(n):
  if entered[root]>=0:continue
  entered[root]=low[root]=clock;clock+=1;stack=[(root,0)]
  while stack:
   u,i=stack[-1]
   if i==len(graph[u]):
    stack.pop()
    if parent[u]>=0:
     v=parent[u];low[v]=min(low[v],low[u])
     if low[u]>entered[v]:bridges.add(parent_edge[u])
    continue
   stack[-1]=(u,i+1);v,edge=graph[u][i]
   if edge==parent_edge[u]:continue
   if entered[v]>=0:low[u]=min(low[u],entered[v])
   else:
    parent[v]=u;parent_edge[v]=edge;entered[v]=low[v]=clock;clock+=1;stack.append((v,0))
 reached={source};queue=[source]
 for u in queue:
  for v,edge in graph[u]:
   if edge not in bridges and v not in reached:reached.add(v);queue.append(v)
 return target in reached
def necklace_file(data):
 values=list(map(int,data.split()));at=0;out=[];ended=False
 while at<len(values):
  n,m=values[at:at+2];at+=2
  if n==m==0:assert at==len(values);ended=True;break
  assert 2<=n<=10000 and 1<=m<=100000;edges=[]
  for _ in range(m):a,b=values[at:at+2];at+=2;assert 1<=a<=n and 1<=b<=n and a!=b;edges.append((a-1,b-1))
  source,target=values[at:at+2];at+=2;assert 1<=source<=n and 1<=target<=n and source!=target
  out.append(f'Case {len(out)+1}: '+('YES' if necklace(n,edges,source-1,target-1) else 'NO'))
 assert ended;return '\n'.join(out)+'\n'
def format_graphs(cases):return ''.join(f'{n} {len(edges)}\n'+''.join(f'{a+1} {b+1}\n' for a,b in edges)+f'{source+1} {target+1}\n' for n,edges,source,target in cases)+'0 0\n'
def convex_hull(points):
 points=sorted(set(points))
 def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
 def chain(values):
  out=[]
  for p in values:
   while len(out)>1 and cross(out[-2],out[-1],p)<=0:out.pop()
   out.append(p)
  return out
 return points if len(points)<3 else chain(points)[:-1]+chain(points[::-1])[:-1]
def circle_squared(points):
 hull=convex_hull(points)
 if len(hull)==1:return Fraction(0)
 best=None
 def consider(cx,cy,denominator,squared):
  nonlocal best
  if denominator<0:cx=-cx;cy=-cy;denominator=-denominator
  if best is not None and squared*best.denominator>=best.numerator*denominator**2:return
  if all((x*denominator-cx)**2+(y*denominator-cy)**2<=squared for x,y in hull):best=Fraction(squared,denominator**2)
 for a,b in itertools.combinations(hull,2):
  cx=a[0]+b[0];cy=a[1]+b[1];consider(cx,cy,2,(2*a[0]-cx)**2+(2*a[1]-cy)**2)
 for a,b,c in itertools.combinations(hull,3):
  det=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]))
  if not det:continue
  aa=a[0]**2+a[1]**2;bb=b[0]**2+b[1]**2;cc=c[0]**2+c[1]**2
  cx=aa*(b[1]-c[1])+bb*(c[1]-a[1])+cc*(a[1]-b[1]);cy=aa*(c[0]-b[0])+bb*(a[0]-c[0])+cc*(b[0]-a[0])
  consider(cx,cy,det,(a[0]*det-cx)**2+(a[1]*det-cy)**2)
 assert best is not None;return best
def packing(data):
 tokens=data.split();at=0;answers=[];ended=False
 while at<len(tokens):
  n=int(tokens[at]);at+=1
  if n==0:assert at==len(tokens);ended=True;break
  assert 1<=n<100;points=[]
  for _ in range(n):points.append((int(tokens[at]),int(tokens[at+1])));at+=2
  assert len(set(points))==n;radius=Fraction(tokens[at]);at+=1;assert radius>=0
  answer=circle_squared(points)<=radius*radius
  answers.append('The polygon can be packed in the circle.' if answer else 'There is no way of packing that polygon.')
 assert ended;return '\n'.join(answers)+'\n'
def format_polygons(cases):return ''.join(str(len(points))+'\n'+''.join(f'{x} {y}\n' for x,y in points)+str(radius)+'\n' for points,radius in cases)+'0\n'
ORACLES={BIG:arithmetic_file,NECK:necklace_file,PACK:packing}
def additions():
 rng=random.Random(288)
 expressions=['2**3**2','2+3*4**2-5','10-3-2','3-12','1**'+'9'*1000,'9**3143',('9'*1000+'*')*2+'9'*1000,'1-'+'9'*1000]
 for _ in range(30):expressions.append(''.join(str(rng.randrange(1,20))+rng.choice(['+','-','*']) for _ in range(10))+str(rng.randrange(1,20)))
 width='+' .join(['9'*1000]*101)
 reroute=[(0,1),(1,2),(2,3),(1,4),(4,3),(0,5),(5,2)]
 graphs=[(6,reroute,0,3),(2,[(0,1),(0,1)],0,1),(2,[(0,1)],0,1),(6,[(0,1),(1,2),(2,0),(2,3),(3,4),(4,2)],0,4),(6,[(0,1),(1,2),(2,0),(2,3),(3,4),(4,5),(5,3)],0,5),(4,[(0,1),(0,1),(2,3),(2,3)],0,3)]
 for _ in range(50):
  n=rng.randrange(2,13);edges=[]
  for _ in range(rng.randrange(1,40)):a,b=rng.sample(range(n),2);edges.append((a,b))
  s,t=rng.sample(range(n),2);graphs.append((n,edges,s,t))
 graphs.append((10000,[(i,i+1) for i in range(9999)],0,9999));graphs.append((10000,[(i,(i+1)%10000) for i in range(10000)],0,5000))
 dense=[(i,(i+1)%10000) for i in range(10000)]
 while len(dense)<100000:a,b=rng.sample(range(10000),2);dense.append((a,b))
 graphs.append((10000,dense,0,9999))
 polygons=[([(0,0),(4,0),(1,1)],'2'),([(0,0),(4,0),(1,1)],'1.999999'),([(0,0),(2,0),(0,2)],'1.4'),([(0,0),(2,0),(0,2)],'1.5'),([(0,0),(4,0),(4,4),(2,1),(0,4)],'3'),([(x,x*x) for x in range(-49,50)],'1201'),([(x,x*x) for x in range(-49,50)],'1200')]
 for _ in range(20):
  points=convex_hull(rng.sample([(x,y) for x in range(-20,21) for y in range(-20,21)],30));polygons.append((points,str(rng.randrange(5,31))))
 return {BIG:['\n'.join(expressions)+'\n',(width+'\n')*50,('9**3143\n')*50],NECK:[format_graphs(graphs)],PACK:[format_polygons(polygons)]}
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
     if p['slug']==BIG and check['status']=='WRONG_EXPECTED_OUTPUT' and kind=='samples':
      assert re.sub(r'[\\\s]','',c['output'])==answer.strip()
      row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'The official PDF explicitly says its sample answer is visually split but actual output must be one integer line. Remove only backslash continuation markers and visual newlines; all decimal digits and the input are unchanged. Independent Pratt exact-integer evaluation confirms the entire resulting integer.'})
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'reviewed3000digit and50expression limits,100operations/1000digit operands;parallel cycles,rerouting and10000vertices100000edges;exact circle boundary,concave polygon and99vertices','input':data,'output':oracle(data)})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
