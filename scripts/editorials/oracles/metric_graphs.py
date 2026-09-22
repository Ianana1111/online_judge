"""Independent Prim radio clustering, precontracted Kruskal cable sums and
ascending-edge minimax connectivity, with 70-digit Decimal square roots."""
import argparse,hashlib,itertools,json,random
from decimal import Decimal,localcontext
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
ARCTIC='uva-10369-arctic-network';CAMPUS='uva-10397-connect-the-campus';FROG='uva-534-frogger'
class DSU:
 def __init__(self,n):self.p=list(range(n));self.size=[1]*n
 def find(self,a):
  while self.p[a]!=a:self.p[a]=self.p[self.p[a]];a=self.p[a]
  return a
 def join(self,a,b):
  a,b=self.find(a),self.find(b)
  if a==b:return False
  if self.size[a]<self.size[b]:a,b=b,a
  self.p[b]=a;self.size[a]+=self.size[b];return True

def square(a,b):return sum((x-y)**2 for x,y in zip(a,b))
def prim_weights(points):
 used=set();best=[None]*len(points);best[0]=0;weights=[]
 for _ in points:
  value,u=min((value,i) for i,value in enumerate(best) if i not in used and value is not None);used.add(u);weights.append(value)
  for v in range(len(points)):
   if v not in used:
    weight=square(points[u],points[v]);best[v]=weight if best[v] is None else min(best[v],weight)
 return weights[1:]
def arctic_value(s,points):return sorted(prim_weights(points))[len(points)-s-1]
def parse_arctic(data):
 tokens=list(map(int,data.split()));tests=tokens[0];assert tests>0;at=1;cases=[]
 for _ in range(tests):
  s,n=tokens[at:at+2];at+=2;assert 1<=s<=100 and s<n<=500;points=[]
  for _ in range(n):point=tokens[at:at+2];at+=2;assert len(point)==2 and all(0<=x<=10000 for x in point);points.append(tuple(point))
  cases.append((s,points))
 assert at==len(tokens);return cases

def campus_weights(points,cables):
 dsu=DSU(len(points))
 for a,b in cables:dsu.join(a,b)
 edges=sorted((square(a,b),i,j) for i,a in enumerate(points) for j,b in enumerate(points[i+1:],i+1) if dsu.find(i)!=dsu.find(j));weights=[]
 for weight,a,b in edges:
  if dsu.join(a,b):weights.append(weight)
 return weights

def parse_campus(data):
 tokens=list(map(int,data.split()));at=0;cases=[]
 while at<len(tokens):
  n=tokens[at];at+=1;assert 1<=n<=750;points=[]
  for _ in range(n):point=tokens[at:at+2];at+=2;assert len(point)==2 and all(abs(x)<=10000 for x in point);points.append(tuple(point))
  assert len(set(points))==n;m=tokens[at];at+=1;assert 0<=m<=1000;cables=[]
  for _ in range(m):a,b=tokens[at:at+2];at+=2;assert 1<=a<=n and 1<=b<=n and a!=b;cables.append(tuple(sorted((a-1,b-1))))
  assert len(set(cables))==m;cases.append((points,cables))
 return cases

def frog_value(points):
 dsu=DSU(len(points));edges=sorted((square(a,b),i,j) for i,a in enumerate(points) for j,b in enumerate(points[i+1:],i+1))
 for weight,a,b in edges:
  dsu.join(a,b)
  if dsu.find(0)==dsu.find(1):return weight
 raise AssertionError('No frog path')
def parse_frog(data):
 tokens=list(map(int,data.split()));at=0;cases=[];ended=False
 while at<len(tokens):
  n=tokens[at];at+=1
  if n==0:assert at==len(tokens);ended=True;break
  assert 2<=n<=200;points=[]
  for _ in range(n):point=tokens[at:at+2];at+=2;assert len(point)==2 and all(0<=x<=1000 for x in point);points.append(tuple(point))
  cases.append(points)
 assert ended;return cases

def root_text(weight,places):
 with localcontext() as context:context.prec=70;return f'{Decimal(weight).sqrt():.{places}f}'
def arctic_output(data):return '\n'.join(root_text(arctic_value(s,points),2) for s,points in parse_arctic(data))+'\n'
def campus_output(data):
 lines=[]
 with localcontext() as context:
  context.prec=70
  for points,cables in parse_campus(data):lines.append(f'{sum((Decimal(weight).sqrt() for weight in campus_weights(points,cables)),Decimal(0)):.2f}')
 return '\n'.join(lines)+'\n'
def frog_output(data):return '\n\n'.join(f'Scenario #{i}\nFrog Distance = '+root_text(frog_value(points),3) for i,points in enumerate(parse_frog(data),1))+'\n'
def matches(expected,actual):
 import re
 left=expected.strip().splitlines();right=actual.strip().splitlines()
 if len(left)!=len(right):return False
 for wanted,got in zip(left,right):
  matches=list(re.finditer(r'[+-]?\d+\.\d+',wanted));at=0;parts=[]
  for match in matches:parts.extend([re.escape(wanted[at:match.start()]),r'([+-]?\d+\.\d{'+str(len(match[0].split('.')[1]))+'})']);at=match.end()
  parts.append(re.escape(wanted[at:]));match=re.fullmatch(''.join(parts),got.rstrip())
  if not match or any(Decimal(a[0])!=Decimal(b) for a,b in zip(matches,match.groups())):return False
 return True

def format_arctic(cases):return str(len(cases))+'\n'+''.join(f'{s} {len(points)}\n'+''.join(f'{a} {b}\n' for a,b in points) for s,points in cases)
def format_campus(cases):return ''.join(str(len(points))+'\n'+''.join(f'{a} {b}\n' for a,b in points)+str(len(cables))+'\n'+''.join(f'{a+1} {b+1}\n' for a,b in cables) for points,cables in cases)
def format_frog(cases):return ''.join(str(len(points))+'\n'+''.join(f'{a} {b}\n' for a,b in points)+'\n' for points in cases)+'0\n'
def additions():
 rng=random.Random(10397);arctic=[(1,[(0,0),(10000,10000)]),(2,[(0,0),(1,1),(2,2),(9999,9999)]),(1,[(1,1),(1,1),(1,1)]),(100,[(i%25*400,i//25*400) for i in range(500)])];campus=[([(0,0)],[]),([(0,0),(1,1),(3,0)],[(0,1)]),([(-10000,-10000),(10000,10000),(10000,-10000)],[(0,1),(1,2)])];frogs=[[(0,0),(10,0),(5,0)],[(0,0),(0,0)],[(0,0),(1000,1000)],[(0,0),(1000,0)]+[(i*5,0) for i in range(1,199)]]
 for _ in range(35):
  n=rng.randrange(2,31);points=rng.sample([(x,y) for x in range(30) for y in range(30)],n);arctic.append((rng.randrange(1,min(100,n-1)+1),points));frogs.append(points);pairs=list(itertools.combinations(range(n),2));campus.append((points,rng.sample(pairs,rng.randrange(min(len(pairs),20)+1))))
 large=[(-10000+i%30*650,-10000+i//30*700) for i in range(750)];pairs=list(itertools.combinations(range(750),2));rng.shuffle(pairs);campus.append((large,[]));campus.append((large,pairs[:1000]));return {ARCTIC:[format_arctic(arctic)],CAMPUS:[format_campus(campus)],FROG:[format_frog(frogs)]}
ORACLES={ARCTIC:arctic_output,CAMPUS:campus_output,FROG:frog_output}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  oracle=ORACLES.get(p['slug'])
  if not oracle:continue
  spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:answer=oracle(c['input']);check['status']='MATCH' if matches(answer,c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    if p['slug']==ARCTIC and check['status']=='INPUT_REQUIRES_REVIEW' and c['input']=='1\n3 3\n0 0\n100 100\n200 200\n':
     repaired=c['input'].replace('3 3','2 3',1);row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':repaired,'output':arctic_output(repaired),'reason':'The original specifies S<P, but this legacy boundary used S=P=3. Keep all three original outposts and coordinates, reduce only S to the legal upper boundary P-1, and independently recompute the exact squared MST threshold and 70-digit rounded square root.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'500outposts/100channels;750distinctbuildings/1000uniqueexistingcables;200stones,intermediate bottleneck,coincidentpointswhereallowed,coordinateextremes;70-digitDecimalroundedanswers','input':data,'output':oracle(data)})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
