"""Independent cube unfoldings, exact square root, Hanoi differences, line cover, coin-count bitsets and grouped scoreboard."""
import argparse, collections, hashlib, itertools, json, math, random
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def canonical(points):
 forms=[]
 for swap in (False,True):
  for sx in (-1,1):
   for sy in (-1,1):
    q=[(sx*(y if swap else x),sy*(x if swap else y)) for x,y in points];a=min(x for x,y in q);b=min(y for x,y in q);forms.append(tuple(sorted((x-a,y-b) for x,y in q)))
 return min(forms)
def neg(a):return tuple(-x for x in a)
def rotate(frame,direction):
 u,v,n=frame
 return [(neg(n),v,u),(n,v,neg(u)),(u,neg(n),v),(u,n,neg(v))][direction]
@lru_cache(None)
def cube_catalog():
 normals=[(1,0,0),(-1,0,0),(0,1,0),(0,-1,0),(0,0,1),(0,0,-1)]
 edges=[(i,j) for i in range(6) for j in range(i+1,6) if sum(a*b for a,b in zip(normals[i],normals[j]))==0];catalog=set();trees=0
 for chosen in itertools.combinations(edges,5):
  adj=[[] for _ in range(6)]
  for a,b in chosen:adj[a].append(b);adj[b].append(a)
  frames={4:((1,0,0),(0,1,0),(0,0,1))};positions={4:(0,0)};queue=[4]
  for face in queue:
   x,y=positions[face]
   for nxt in adj[face]:
    if nxt in frames:continue
    candidates=[rotate(frames[face],d) for d in range(4)];d=next(k for k,f in enumerate(candidates) if f[2]==normals[nxt]);dx,dy=[(1,0),(-1,0),(0,1),(0,-1)][d];frames[nxt]=candidates[d];positions[nxt]=(x+dx,y+dy);queue.append(nxt)
  if len(frames)!=6:continue
  trees+=1;points=set(positions.values())
  if len(points)!=6:continue
  paper_edges=sum((x+1,y) in points for x,y in points)+sum((x,y+1) in points for x,y in points)
  if paper_edges!=5:continue
  catalog.add(canonical(points))
 assert trees==384 and len(catalog)==11
 return frozenset(catalog)
def free_hexominoes():
 shapes={((0,0),)}
 for _ in range(5):
  shapes={canonical(set(shape)|{(x+dx,y+dy)}) for shape in shapes for x,y in shape for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)] if (x+dx,y+dy) not in shape}
 assert len(shapes)==35;return sorted(shapes)
def cubes(data):
 a=list(map(int,data.split()));t=a[0];assert t>0 and len(a)==1+36*t;out=[]
 for i in range(t):
  board=a[1+36*i:37+36*i];assert set(board)<={0,1} and sum(board)==6;points={(j%6,j//6) for j,v in enumerate(board) if v};assert all(any((x+dx,y+dy) in points for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]) for x,y in points);out.append('correct' if canonical(points) in cube_catalog() else 'incorrect')
 return '\n\n'.join(out)+'\n'
def doors(data):
 a=list(map(int,data.split()));assert a[-1]==0 and all(1<=n<=10**100 for n in a[:-1]);return ''.join(str(math.isqrt(n)**2)+'\n' for n in a[:-1])
@lru_cache(None)
def priest_table():
 values=[0];power=1;repeat=1
 while len(values)<=10000:
  for _ in range(repeat):
   if len(values)>10000:break
   values.append(values[-1]+power)
  power*=2;repeat+=1
 return values
def priest(data):
 a=list(map(int,data.split()));assert all(0<=n<=10000 for n in a);v=priest_table();return ''.join(str(v[n])+'\n' for n in a)
def line_masks(points):
 groups=collections.defaultdict(int)
 for i,p in enumerate(points):groups[p]|=1<<i
 lines=set(groups.values())
 for (x,y),(u,v) in itertools.combinations(groups,2):
  a,b=y-v,u-x;c=-(a*x+b*y);d=math.gcd(math.gcd(abs(a),abs(b)),abs(c));a,b,c=a//d,b//d,c//d
  if a<0 or (a==0 and b<0):a,b,c=-a,-b,-c
  mask=sum(1<<i for i,(px,py) in enumerate(points) if a*px+b*py+c==0);lines.add(mask)
 return sorted(lines)
def rays(points,target):
 lines=line_masks(points);bybit=[[line for line in lines if line>>i&1] for i in range(len(points))]
 @lru_cache(None)
 def visit(available,needed):
  if needed<=0:return 0
  count=bin(available).count('1')
  if count<needed:return 100
  first=(available&-available).bit_length()-1;best=visit(available^(1<<first),needed) if count>needed else 100
  for line in bybit[first]:
   hit=available&line;best=min(best,1+visit(available^hit,needed-bin(hit).count('1')))
  return best
 return visit((1<<len(points))-1,target)
def antimatter(data):
 a=list(map(int,data.split()));t=a[0];i=1;out=[];assert 1<=t<=20
 for case in range(1,t+1):
  n,m=a[i:i+2];i+=2;assert 1<=n<=16 and 0<=m<=n;points=list(zip(a[i:i+2*n:2],a[i+1:i+2*n:2]));i+=2*n;assert len(points)==n and all(-1000<=x<=1000 and -1000<=y<=1000 for x,y in points);out.append(f'Case #{case}:\n{rays(points,m)}')
 assert i==len(a);return '\n\n'.join(out)+'\n'
COINS=(1,2,4,10,20,40)
def coin_count(stocks,target):
 if target==0:return 0
 # Pay until crossing target; at most target payer coins and 39 unit change coins.
 budget=target+39;limit=40*budget;truncate=(1<<(limit+1))-1;wallet=[0]*(budget+1);wallet[0]=1;used=0
 for stock,value in zip(stocks,COINS):
  for _ in range(min(stock,budget)):
   used=min(budget,used+1)
   for k in range(used,0,-1):wallet[k]|=(wallet[k-1]<<value)&truncate
 change=[1]
 for total in range(budget+1):
  if total:
   bits=0
   for value in COINS:bits|=change[-1]<<value
   change.append(bits&truncate)
  if any(wallet[k]&(change[total-k]<<target) for k in range(total+1)):return total
 raise AssertionError('sufficient wallet must admit bounded transaction')
def change(data):
 tokens=data.split();i=0;out=[]
 while i<len(tokens):
  stocks=list(map(int,tokens[i:i+6]));i+=6;assert len(stocks)==6 and all(n>=0 for n in stocks)
  if not any(stocks):assert i==len(tokens);return ''.join(out)
  amount=Fraction(tokens[i])*20;i+=1;assert amount.denominator==1 and 0<=amount<100;target=int(amount);assert sum(c*v for c,v in zip(stocks,COINS))>=target;out.append(f'{coin_count(stocks,target):3d}\n')
 raise AssertionError('missing sentinel')
def score_cases(data):
 lines=data.splitlines();t=int(lines[0]);assert t>0;cases=[];current=[]
 for line in lines[1:]:
  if line.strip():
   team,problem,time,letter=line.split();team,problem,time=int(team),int(problem),int(time);assert 1<=team<=100 and 1<=problem<=9 and time>=0 and letter in 'CIRUE';current.append((team,problem,time,letter))
  elif current:cases.append(current);current=[]
 if current:cases.append(current)
 assert len(cases)==t;return cases
def scoreboard(data):
 out=[]
 for records in score_cases(data):
  teams=sorted({r[0] for r in records});scores=[]
  for team in teams:
   solved=penalty=0
   for problem in range(1,10):
    events=[(time,letter) for who,p,time,letter in records if who==team and p==problem];first=next((i for i,e in enumerate(events) if e[1]=='C'),None)
    if first is not None:solved+=1;penalty+=events[first][0]+20*sum(letter=='I' for time,letter in events[:first])
   scores.append((-solved,penalty,team))
  out.append('\n'.join(f'{team} {-solved} {penalty}' for solved,penalty,team in sorted(scores)))
 return '\n\n'.join(out)+'\n'
ORACLES={'gpe-10610-curling-up-the-cube':cubes,'gpe-11184-opening-doors':doors,'gpe-11130-the-priest-mathematician':priest,'gpe-10766-antimatter-ray-clearcutting':antimatter,'gpe-23781-making-change':change,'gpe-10429-contest-scoreboard':scoreboard}
def additions():
 rng=random.Random(10024);boards=[]
 for shape in free_hexominoes():
  for swap,sx,sy in itertools.product([False,True],[-1,1],[-1,1]):
   points=[(sx*(y if swap else x),sy*(x if swap else y)) for x,y in shape];lo=min(x for x,y in points);bot=min(y for x,y in points);points={(x-lo,y-bot) for x,y in points};w=max(x for x,y in points)+1;h=max(y for x,y in points)+1
   for dx,dy in [(0,0),(6-w,6-h)]:boards.append('\n'.join(' '.join('1' if (x-dx,y-dy) in points else '0' for x in range(6)) for y in range(6)))
 doorvalues=set(range(1,301))|{10**100}
 for k in [10**p for p in range(1,51)]+[rng.randrange(1,10**50) for _ in range(70)]:
  doorvalues.update(n for n in (k*k-1,k*k,k*k+1) if 1<=n<=10**100)
 forests=[([(0,1),(1,0),(2,0),(3,0),(4,0)],4),([(i,i*i) for i in range(16)],16),([(i,2*i-8) for i in range(16)],16),([(-1000,-1000),(1000,1000),(0,0),(1000,-1000)],3),([(0,0)],1)]
 for _ in range(35):
  n=rng.randint(2,16);points=rng.sample([(x,y) for x in range(-10,11) for y in range(-10,11)],n);forests.append((points,rng.randint(1,n)))
 forest_files=[]
 for i in range(0,len(forests),20):
  batch=forests[i:i+20];forest_files.append(str(len(batch))+'\n'+''.join(f'{len(p)}\n{m}\n'+''.join(f'{x} {y}\n' for x,y in p) for p,m in batch))
 wallets=[([1,0,0,0,1,0],11),([99,0,0,0,0,0],99),([0,0,0,0,0,1],1),([0,0,0,0,0,3],99),([0,0,0,0,1,0],0),([1000]*6,99)]
 for _ in range(90):
  stocks=[rng.randrange(5) for _ in range(6)];total=sum(v*c for v,c in zip(COINS,stocks))
  if total:wallets.append((stocks,rng.randint(1,min(99,total))))
 events=[[(2,1,10,'C'),(1,1,20,'C'),(3,1,20,'C'),(4,1,25,'R'),(5,2,30,'I'),(6,1,31,'U'),(7,9,32,'E')],[(1,1,1,'I'),(1,1,2,'R'),(1,1,3,'U'),(1,1,4,'E'),(1,1,5,'C'),(1,1,6,'I'),(1,1,7,'C'),(2,2,8,'I'),(3,2,9,'C'),(3,3,10,'I')]]
 events.append([(i,p,(p-1)*100+i,'C') for p in range(1,10) for i in range(1,101)])
 for _ in range(25):events.append([(rng.randint(1,100),rng.randint(1,9),time,rng.choice('CIRUE')) for time in range(300)])
 return {'gpe-10610-curling-up-the-cube':[str(len(boards))+'\n\n'+'\n\n'.join(boards)+'\n'],'gpe-11184-opening-doors':['\n'.join(map(str,sorted(doorvalues)))+'\n0\n'],'gpe-11130-the-priest-mathematician':['\n'.join(map(str,range(10001)))+'\n'],'gpe-10766-antimatter-ray-clearcutting':forest_files,'gpe-23781-making-change':[''.join(' '.join(map(str,s))+f' {n//20}.{(n%20)*5:02d}\n' for s,n in wallets)+'0 0 0 0 0 0\n'],'gpe-10429-contest-scoreboard':[str(len(events))+'\n\n'+'\n\n'.join('\n'.join(f'{a} {b} {c} {d}' for a,b,c,d in rows) for rows in events)+'\n']}
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
    try:answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all35freehexominoes and transformations,100-digit square boundaries,all10001Hanoi inputs,partial line cover,finite-wallet change and scoreboard ties','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
