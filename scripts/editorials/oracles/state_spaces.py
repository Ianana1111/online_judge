"""Minute occupancy, strict-subsequence duality, permutations, literal elimination and GF(2)."""
import argparse,hashlib,json,random,itertools
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def longest_nap(intervals):
 occupied=[False]*480
 for start,end in intervals:
  for minute in range(start-600,end-600):occupied[minute]=True
 best=-1;begin=0;cursor=0
 while cursor<480:
  if occupied[cursor]:cursor+=1;continue
  end=cursor
  while end<480 and not occupied[end]:end+=1
  if end-cursor>best:best=end-cursor;begin=cursor+600
  cursor=end
 assert best>0;return begin,best

def naps(data):
 lines=data.splitlines();i=0;out=[]
 while i<len(lines):
  n=int(lines[i]);i+=1;assert 1<=n<=100;intervals=[]
  for line in lines[i:i+n]:
   assert len(line)<=255;fields=line.split(maxsplit=2);assert len(fields)>=2
   times=[]
   for field in fields[:2]:h,m=map(int,field.split(':'));assert 10<=h<=18 and 0<=m<60;times.append(60*h+m)
   start,end=times;assert 600<=start<end<=1080;intervals.append((start,end))
  i+=n;assert len(intervals)==n;start,duration=longest_nap(intervals);h,m=divmod(start,60);length=(f'{duration//60} hours and ' if duration>=60 else '')+f'{duration%60} minutes.';out.append(f'Day #{len(out)+1}: the longest nap starts at {h:02}:{m:02} and will last for {length}')
 return '\n'.join(out)+'\n'

def stack_count(text):
 best=[0]*26
 for ch in text:
  value=ord(ch)-65;best[value]=max(best[value],1+max(best[:value],default=0))
 return max(best)

def containers(data):
 a=data.split();assert a and a[-1]=='end' and all(1<=len(s)<=1000 and set(s)<=set('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for s in a[:-1]);return ''.join(f'Case {i}: {stack_count(s)}\n' for i,s in enumerate(a[:-1],1))

@lru_cache(None)
def queen_boards():
 answers=[]
 for board in itertools.permutations(range(1,9)):
  if len({row-col for col,row in enumerate(board)})==8 and len({row+col for col,row in enumerate(board)})==8:answers.append(board)
 assert len(answers)==92;return answers

def queen_moves(board):return min(sum(a!=b for a,b in zip(board,target)) for target in queen_boards())
def queens(data):
 a=list(map(int,data.split()));assert len(a)%8==0 and len(a)//8<1000 and all(1<=v<=8 for v in a);return ''.join(f'Case {i//8+1}: {queen_moves(a[i:i+8])}\n' for i in range(0,len(a),8))

def remains_thirteen(n,step):
 circle=list(range(2,n+1));index=0
 while len(circle)>1:
  index=(index+step-1)%len(circle)
  if circle.pop(index)==13:return False
 return circle[0]==13
@lru_cache(None)
def power_step(n):
 step=1
 while not remains_thirteen(n,step):step+=1
 return step

def powers(data):
 a=list(map(int,data.split()));assert a and a[-1]==0 and all(13<=v<100 for v in a[:-1]);return ''.join(str(power_step(v))+'\n' for v in a[:-1])

@lru_cache(None)
def reduced_lights(size):
 total=size*size;rows=[]
 for y in range(size):
  for x in range(size):
   row=1<<(total+y*size+x)
   for yy,xx in [(y,x),(y-1,x),(y+1,x),(y,x-1),(y,x+1)]:
    if 0<=yy<size and 0<=xx<size:row|=1<<(yy*size+xx)
   rows.append(row)
 rank=0;pivots=[]
 for col in range(total):
  pivot=next((i for i in range(rank,total) if rows[i]>>col&1),None)
  if pivot is None:continue
  rows[rank],rows[pivot]=rows[pivot],rows[rank]
  for i in range(total):
   if i!=rank and rows[i]>>col&1:rows[i]^=rows[rank]
  pivots.append(col);rank+=1
 free=[col for col in range(total) if col not in pivots];basis=[]
 for col in free:
  vector=1<<col
  for i,pivot in enumerate(pivots):
   if rows[i]>>col&1:vector|=1<<pivot
  basis.append(vector)
 return rows,pivots,basis

def minimum_presses(board,size=10):
 total=size*size;rows,pivots,basis=reduced_lights(size);rhs=[bin((row>>total)&board).count('1')%2 for row in rows]
 if any(rhs[len(pivots):]):return -1
 particular=sum(1<<col for col,value in zip(pivots,rhs) if value);best=total+1
 for mask in range(1<<len(basis)):
  solution=particular
  for i,vector in enumerate(basis):
   if mask>>i&1:solution^=vector
  best=min(best,bin(solution).count('1'))
 return best

def lights(data):
 tokens=data.split();i=0;out=[];ended=False
 while i<len(tokens):
  name=tokens[i];i+=1
  if name=='end':assert i==len(tokens);ended=True;break
  rows=tokens[i:i+10];i+=10;assert len(rows)==10 and all(len(row)==10 and set(row)<=set('#O') for row in rows);board=sum(1<<j for j,ch in enumerate(''.join(rows)) if ch=='O');out.append(f'{name} {minimum_presses(board)}')
 assert ended;return '\n'.join(out)+'\n'

def fill_component(grid,x,y,color):
 height,width=len(grid),len(grid[0]);original=grid[y][x];parent=list(range(width*height))
 def find(v):
  while parent[v]!=v:parent[v]=parent[parent[v]];v=parent[v]
  return v
 for yy in range(height):
  for xx in range(width):
   for ny,nx in [(yy+1,xx),(yy,xx+1)]:
    if ny<height and nx<width and grid[yy][xx]==grid[ny][nx]:parent[find(yy*width+xx)]=find(ny*width+nx)
 component=find(y*width+x)
 return [[color if find(yy*width+xx)==component else grid[yy][xx] for xx in range(width)] for yy in range(height)]

def editor(data):
 grid=None;out=[];ended=False
 for line in data.splitlines():
  fields=line.split();assert fields;op=fields[0]
  if op=='X':ended=True;break
  if op not in ('I','C','L','V','H','K','F','S'):continue
  if op=='I':
   assert len(fields)==3;width,height=map(int,fields[1:]);assert 1<=width<=100 and 1<=height<=100;grid=[['O']*width for _ in range(height)];continue
  assert grid is not None;height,width=len(grid),len(grid[0])
  if op=='C':assert len(fields)==1;grid=[['O']*width for _ in range(height)]
  elif op=='S':assert len(fields)==2;out.append(fields[1]);out.extend(''.join(row) for row in grid)
  else:
   color=fields[-1];assert len(color)==1 and 'A'<=color<='Z';v=list(map(int,fields[1:-1]));count={'L':2,'V':3,'H':3,'K':4,'F':2}[op];assert len(v)==count
   if op in ('L','F'):x,y=v;assert 1<=x<=width and 1<=y<=height
   elif op=='V':x,y1,y2=v;assert 1<=x<=width and 1<=y1<=height and 1<=y2<=height
   elif op=='H':x1,x2,y=v;assert 1<=y<=height and 1<=x1<=width and 1<=x2<=width
   else:x1,y1,x2,y2=v;assert 1<=x1<=x2<=width and 1<=y1<=y2<=height
   if op=='L':grid[y-1][x-1]=color
   elif op=='F':grid=fill_component(grid,x-1,y-1,color)
   elif op=='V':
    for yy in range(min(y1,y2)-1,max(y1,y2)):grid[yy][x-1]=color
   elif op=='H':grid[y-1][min(x1,x2)-1:max(x1,x2)]=[color]*(abs(x1-x2)+1)
   else:
    for yy in range(y1-1,y2):grid[yy][x1-1:x2]=[color]*(x2-x1+1)
 assert ended;return '\n'.join(out)+'\n'
ORACLES={'uva-10191-longest-nap':naps,'uva-1062-containers':containers,'uva-11085-back-to-the-8-queens':queens,'uva-151-power-crisis':powers,'uva-10309-turn-the-lights-off':lights,'uva-10267-graphical-editor':editor}
def repair_input(slug,data):
 if slug!='uva-10267-graphical-editor':return None
 lines=data.splitlines();width=height=0;changed=False
 for i,line in enumerate(lines):
  fields=line.split()
  if fields[0]=='I':width,height=map(int,fields[1:])
  if fields[0]=='L':
   x,y=map(int,fields[1:3])
   if not(1<=x<=width and 1<=y<=height):lines[i]='Q'+line[1:];changed=True
 return '\n'.join(lines)+'\n' if changed else None

def additions():
 rng=random.Random(10309);appointments=[[(600,1079)],[(601,1080)],[(660,720),(780,840),(900,1080)],[(600,900),(700,800),(960,1080)]]
 for _ in range(40):
  intervals=[]
  for _ in range(rng.randrange(1,101)):
   if rng.randrange(2):start=rng.randrange(600,779);end=rng.randrange(start+1,781)
   else:start=rng.randrange(841,1080);end=rng.randrange(start+1,1081)
   intervals.append((start,end))
  rng.shuffle(intervals);appointments.append(intervals)
 napdata=''.join(str(len(row))+'\n'+''.join(f'{a//60:02}:{a%60:02} {b//60:02}:{b%60:02} '+('meeting !@#$ '*20)[:243]+'\n' for a,b in row) for row in appointments)
 # two time fields and separators occupy 12 characters, so 243 description characters fit255.
 stacks=['A'*1000,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','ZYXWVUTSRQPONMLKJIHGFEDCBA','ABAC','CBACBACBA']+[''.join(rng.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(rng.randrange(1,1001))) for _ in range(100)]
 boards=list(queen_boards())+[(v,)*8 for v in range(1,9)]
 boards += [tuple(rng.randrange(1,9) for _ in range(8)) for _ in range(999-len(boards))]
 lightboards=[0,(1<<100)-1]
 def toggled(presses):
  result=0
  for p in presses:
   y,x=divmod(p,10)
   for yy,xx in [(y,x),(y-1,x),(y+1,x),(y,x-1),(y,x+1)]:
    if 0<=yy<10 and 0<=xx<10:result^=1<<(yy*10+xx)
  return result
 lightboards += [toggled([v]) for v in range(100)]+[1<<v for v in range(100)]+[toggled(range(100))]+[rng.getrandbits(100) for _ in range(40)]
 commands=['I 3 3','L 1 1 A','L 2 2 A','F 1 1 B','S DIAGONAL.BMP','F 2 2 A','S SAME.BMP','V 3 3 1 C','H 3 1 2 D','K 1 1 2 2 E','S DRAW.BMP','C','S CLEAR.BMP','I 100 100','F 1 1 A','V 50 100 1 B','H 100 1 50 B','F 1 1 C','S BIG.BMP','Z I 1 1 ignored','L 100 100 Z','F 100 100 Z','S CORNER.BMP']
 for _ in range(200):
  op=rng.choice('LVHKF');color=rng.choice('ABCOZ');x1,x2=sorted(rng.sample(range(1,101),2));y1,y2=sorted(rng.sample(range(1,101),2))
  if op in ('L','F'):commands.append(f'{op} {x1} {y1} {color}')
  elif op=='V':commands.append(f'V {x1} {y2} {y1} {color}')
  elif op=='H':commands.append(f'H {x2} {x1} {y1} {color}')
  else:commands.append(f'K {x1} {y1} {x2} {y2} {color}')
 commands += ['S FINAL.BMP','I 1 1','F 1 1 O','S ONE.BMP','X']
 return {'uva-10191-longest-nap':napdata,'uva-1062-containers':'\n'.join(stacks)+'\nend\n','uva-11085-back-to-the-8-queens':'\n'.join(' '.join(map(str,b)) for b in boards)+'\n','uva-151-power-crisis':'\n'.join(map(str,range(13,100)))+'\n0\n','uva-10309-turn-the-lights-off':''.join(f'board{i}\n'+'\n'.join(''.join('O' if board>>(y*10+x)&1 else '#' for x in range(10)) for y in range(10))+'\n' for i,board in enumerate(lightboards))+'end\n','uva-10267-graphical-editor':'\n'.join(commands)+'\n'}

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
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Three out-of-bounds L commands invoke behavior the statement explicitly leaves undefined. Relabel only those command letters as unknown Q, which the statement explicitly requires ignoring. Preserve every valid drawing command, arguments, image save and expected output; legal border pixels are covered separately.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'overlap and earliest equal gaps, strict subsequence stack duality, all legal queen arrangements, full power-crisis domain, GF2 lights including100 presses, same-color fill and reversed line endpoints','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
