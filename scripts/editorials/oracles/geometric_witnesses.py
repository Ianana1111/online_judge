"""Exact connected-segment domains, high-precision projection/half-chords and
max-plus placement closure independent of the canonical DFS. Preserve true ties."""
import argparse,functools,hashlib,itertools,json,math,random,re
from decimal import Decimal,localcontext,ROUND_HALF_UP
from fractions import Fraction
from pathlib import Path
def distance(left,right):
 with localcontext() as context:context.prec=85;return abs(left-right)
ROOT=Path(__file__).resolve().parents[3];SNOW='gpe-10732-snow-clearing';SUPERMAN='uva-10355-superman';BOX='gpe-10606-how-big-is-it'
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def on_segment(p,a,b):return cross(a,b,p)==0 and all(min(x,y)<=z<=max(x,y) for x,y,z in zip(a,b,p))
def intersect(a,b,c,d):
 values=(cross(a,b,c),cross(a,b,d),cross(c,d,a),cross(c,d,b))
 if (values[0]>0 and values[1]<0 or values[0]<0 and values[1]>0) and (values[2]>0 and values[3]<0 or values[2]<0 and values[3]>0):return True
 return on_segment(c,a,b) or on_segment(d,a,b) or on_segment(a,c,d) or on_segment(b,c,d)
def parse_snow(data):
 lines=data.splitlines();tests=int(lines[0]);assert 1<=tests<=100;at=1;cases=[]
 for _ in range(tests):
  while at<len(lines) and not lines[at].strip():at+=1
  hangar=tuple(map(int,lines[at].split()));at+=1;assert len(hangar)==2 and all(abs(x)<=10**9 for x in hangar);roads=[]
  while at<len(lines) and lines[at].strip():
   values=tuple(map(int,lines[at].split()));at+=1;assert len(values)==4 and all(abs(x)<=10**9 for x in values);a,b=values[:2],values[2:];assert a!=b;roads.append((a,b))
  assert len(roads)<=100;reached={i for i,(a,b) in enumerate(roads) if on_segment(hangar,a,b)};queue=list(reached)
  for i in queue:
   for j,(c,d) in enumerate(roads):
    if j not in reached and intersect(*roads[i],c,d):reached.add(j);queue.append(j)
  assert len(reached)==len(roads);cases.append((hangar,roads))
 assert all(not line.strip() for line in lines[at:]);return cases
@functools.lru_cache(None)
def decimal_root(n):
 with localcontext() as context:context.prec=85;return Decimal(n).sqrt()
def snow_values(data):
 with localcontext() as context:
  context.prec=80;return [sum((decimal_root(sum((x-y)**2 for x,y in zip(a,b))) for a,b in roads),Decimal(0))*Decimal('0.006') for hangar,roads in parse_snow(data)]
def snow_output(data):
 values=[int(value.to_integral_value(rounding=ROUND_HALF_UP)) for value in snow_values(data)];return '\n\n'.join(f'{value//60}:{value%60:02}' for value in values)+'\n'
def snow_valid(data,output):
 groups=re.split(r'\n[ \t]*\n',output.strip());wanted=snow_values(data)
 if len(groups)!=len(wanted):return False
 for group,value in zip(groups,wanted):
  match=re.fullmatch(r'(\d+):(\d{2})',group.strip())
  if not match or int(match[2])>=60 or distance(Decimal(int(match[1])*60+int(match[2])),value)>Decimal('0.5')+Decimal('1e-60'):return False
 return True

def parse_superman(data,strict=True):
 tokens=data.split();at=0;cases=[]
 while at<len(tokens):
  name=tokens[at];at+=1;assert re.fullmatch('[A-Za-z0-9]{1,8}',name);start=tuple(map(int,tokens[at:at+3]));at+=3;end=tuple(map(int,tokens[at:at+3]));at+=3;assert len(start)==len(end)==3 and start!=end;n=int(tokens[at]);at+=1;assert 1<=n<=10;spheres=[]
  for _ in range(n):
   center=tuple(map(int,tokens[at:at+3]));at+=3;radius=int(tokens[at]);at+=1;assert len(center)==3 and 1<=radius<=20
   for previous,r in spheres:assert sum((a-b)**2 for a,b in zip(center,previous))>=(radius+r)**2
   spheres.append((center,radius))
  if strict:assert all(abs(x)<=20 for row in [start,end]+[center for center,r in spheres] for x in row)
  cases.append((name,start,end,spheres))
 assert cases;return cases

def pollution(start,end,spheres):
 direction=tuple(b-a for a,b in zip(start,end));a=sum(x*x for x in direction)
 with localcontext() as context:
  context.prec=80;fraction=Decimal(0)
  for center,radius in spheres:
   toward=tuple(c-s for c,s in zip(center,start));dot=sum(x*y for x,y in zip(toward,direction));projection=Fraction(dot,a);perpendicular=Fraction(sum(x*x for x in toward))-Fraction(dot*dot,a);height_squared=(radius*radius-perpendicular)/a
   if height_squared<=0:continue
   half=(Decimal(height_squared.numerator)/Decimal(height_squared.denominator)).sqrt();middle=Decimal(projection.numerator)/Decimal(projection.denominator);low=max(Decimal(0),middle-half);high=min(Decimal(1),middle+half);fraction+=max(Decimal(0),high-low)
  assert 0<=fraction<=1+Decimal('1e-65');return 100*fraction

def superman_output(data):return ''.join(name+'\n'+f'{pollution(start,end,spheres):.2f}'+'\n' for name,start,end,spheres in parse_superman(data))
def superman_valid(data,output):
 rows=output.strip().splitlines();cases=parse_superman(data)
 if len(rows)!=len(cases)*2:return False
 for index,(name,start,end,spheres) in enumerate(cases):
  if rows[2*index].rstrip()!=name or not re.fullmatch(r'[+-]?\d+\.\d{2}',rows[2*index+1].strip()):return False
  if distance(Decimal(rows[2*index+1]),pollution(start,end,spheres))>Decimal('0.005')+Decimal('1e-60'):return False
 return True

def parse_boxes(data):
 tokens=data.split();tests=int(tokens[0]);assert 1<=tests<=50;at=1;cases=[]
 for _ in range(tests):
  n=int(tokens[at]);at+=1;assert 1<=n<=8;radii=tuple(Decimal(token) for token in tokens[at:at+n]);at+=n;assert len(radii)==n and all(r.is_finite() and Decimal('0.000001')<=r<=10000 and (Fraction(r)*1000000).denominator==1 for r in radii);cases.append(radii)
 assert at==len(tokens);return cases
@functools.lru_cache(maxsize=256)
def box_width(radii):
 radii=tuple(sorted(radii));n=len(radii)
 with localcontext() as context:
  context.prec=75;gaps=[[2*(a*b).sqrt() for b in radii] for a in radii];best=2*sum(radii);seen=set()
  for order in itertools.permutations(range(n)):
   signature=tuple(radii[i] for i in order)
   if signature in seen:continue
   seen.add(signature);size=n+2;graph=[[None]*size for _ in range(size)];graph[0][-1]=Decimal(0)
   for i in range(n):
    graph[0][i+1]=radii[order[i]];graph[i+1][-1]=radii[order[i]]
    for j in range(i+1,n):graph[i+1][j+1]=gaps[order[i]][order[j]]
   for k in range(1,n+1):
    for left in range(k):
     for right in range(k+1,size):
      candidate=graph[left][k]+graph[k][right];graph[left][right]=max(graph[left][right],candidate)
   best=min(best,graph[0][-1])
  return best

def box_output(data):return ''.join(f'{box_width(tuple(sorted(radii))):.3f}\n' for radii in parse_boxes(data))
def box_valid(data,output):
 cases=parse_boxes(data);lines=output.strip().splitlines()
 if len(lines)!=len(cases):return False
 for radii,line in zip(cases,lines):
  if not re.fullmatch(r'[+-]?\d+\.\d{3}',line.strip()):return False
  # IEEE interval around the checker's computed center and the independent true
  # center can differ by one bounded evaluation error each.
  tolerance=Decimal('0.0005')+Decimal(256)*(Decimal(2)**-52)*max(1,2*sum(radii))
  if distance(Decimal(line),box_width(tuple(sorted(radii))))>tolerance:return False
 return True

def format_snow(cases):return str(len(cases))+'\n\n'+'\n'.join(f'{hangar[0]} {hangar[1]}\n'+''.join(f'{a[0]} {a[1]} {b[0]} {b[1]}\n' for a,b in roads) for hangar,roads in cases)
def format_superman(cases):return ''.join(name+'\n'+' '.join(map(str,start+end))+'\n'+str(len(spheres))+'\n'+''.join(' '.join(map(str,center+(radius,)))+'\n' for center,radius in spheres) for name,start,end,spheres in cases)
def format_boxes(cases):return str(len(cases))+'\n'+''.join(str(len(radii))+' '+' '.join(map(str,radii))+'\n' for radii in cases)
def additions():
 rng=random.Random(10012);snow=[((0,0),[]),*((((0,0),[((0,0),(length,0))])) for length in [250,251,249,1000,10000,1000000000]),((0,0),[((0,0),(500,500)),((500,0),(500,1000)),((0,1000),(1000,1000))])]
 large_roads=[((0,0),(1000000000-i*500003,500009*i+1)) for i in range(100)];snow_max=[((0,0),large_roads)]*100
 pollution_cases=[('Tie',(-16,0,0),(16,0,0),[((16,0,0),1)]),('Tangent',(0,0,0),(10,0,0),[((5,1,0),1)]),('Outside',(0,0,0),(4,0,0),[((10,0,0),2)]),('Inside',(-1,0,0),(1,0,0),[((0,0,0),20)]),('Half',(0,0,0),(10,0,0),[((0,0,0),5)]),('Ten',(-20,0,0),(20,0,0),[((x,0,0),1) for x in range(-18,19,4)]),('Irr',(-10,0,0),(10,0,0),[((0,1,0),2)])]
 for index in range(80):
  start=tuple(rng.randrange(-20,21) for _ in range(3));end=tuple(rng.randrange(-20,21) for _ in range(3))
  if start==end:continue
  spheres=[]
  for _ in range(100):
   center=tuple(rng.randrange(-18,19) for _ in range(3));radius=rng.randrange(1,5)
   if all(sum((a-b)**2 for a,b in zip(center,c))>=(radius+r)**2 for c,r in spheres):spheres.append((center,radius))
   if len(spheres)==10:break
  pollution_cases.append((f'City{index}',start,end,spheres))
 boxes=[['0.000250'],[100,1],[4,'0.01',4],[1,2,4],[2,2,2,2],[1]*8,['0.000001']*8,[10000]*8,[10000,'0.000001',10000,'0.000001']]
 for _ in range(20):boxes.append([f'{rng.randrange(1,10000001)/1000000:.6f}' for _ in range(rng.randrange(1,6))])
 box_max=[[f'1.{i:03}' for i in range(1,9)]]*50
 return {SNOW:[format_snow(snow),format_snow(snow_max)],SUPERMAN:[format_superman(pollution_cases)],BOX:[format_boxes(boxes),format_boxes(box_max)]}
ORACLES={SNOW:(snow_output,snow_valid),SUPERMAN:(superman_output,superman_valid),BOX:(box_output,box_valid)}
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
    except (AssertionError,ValueError,IndexError,StopIteration,KeyError):check['status']='INPUT_REQUIRES_REVIEW'
    if p['slug']==SUPERMAN and check['status']=='INPUT_REQUIRES_REVIEW':
     cases=parse_superman(c['input'],False);changed=[(name,tuple(x-10 for x in start),tuple(x-10 for x in end),[(tuple(x-10 for x in center),radius) for center,radius in spheres]) for name,start,end,spheres in cases];repaired=format_superman(changed);answer=superman_output(repaired);assert superman_valid(repaired,c['output']);row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':repaired,'output':c['output'],'reason':'The source sample itself has coordinates30/25 despite the explicit abs<21 input bound. Translate ALL path endpoints and sphere centers by(-10,-10,-10), retaining every city/radius/relative position and the identical independently verified output. No clipping, scaling or deletion of geometry.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):
    answer=oracle(data);assert valid(data,answer);row['proposedAdditions'].append({'label':'100cases100roads,maxintegercoordinates,connectedcrossings/halfminutes;10disjoint/tangent/clippedregions,exactpercentage midpoint;50cases8circles,allprevious-circleconstraints,unequalradii,sixdecimalminimum/maximumandwidthmidpoints','input':data,'output':answer})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
