"""Independent mine scattering, token frequencies, prefix-wall ritual paths, exact-rational flow, cyclic ranks and Sudoku exact cover."""
import argparse,hashlib,json,random,re,collections,itertools,math
from functools import lru_cache
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def mine_board(mines,touched):
 n=len(mines);counts=[[0]*n for _ in range(n)];lost=any(mines[r][c]=='*' and touched[r][c]=='x' for r in range(n) for c in range(n))
 for r in range(n):
  for c in range(n):
   if mines[r][c]=='*':
    for rr in range(max(0,r-1),min(n,r+2)):
     for cc in range(max(0,c-1),min(n,c+2)):
      if (rr,cc)!=(r,c):counts[rr][cc]+=1
 return [''.join('*' if lost and mines[r][c]=='*' else str(counts[r][c]) if touched[r][c]=='x' else '.' for c in range(n)) for r in range(n)]
def minesweeper(data):
 a=data.split();t=int(a[0]);i=1;assert t>=1;out=[]
 for _ in range(t):
  n=int(a[i]);i+=1;assert 1<=n<=10;mines=a[i:i+n];i+=n;touched=a[i:i+n];i+=n;assert all(len(row)==n and set(row)<=set('.*') for row in mines) and all(len(row)==n and set(row)<=set('.x') for row in touched);out.append('\n'.join(mine_board(mines,touched)))
 assert i==len(a);return '\n\n'.join(out)+'\n'
def zipf(data):
 lines=data.splitlines();i=0;out=[]
 while i<len(lines):
  if not lines[i].strip():i+=1;continue
  n=int(lines[i]);i+=1;assert n>0;text=[]
  while i<len(lines) and lines[i]!='EndOfText':text.append(lines[i]);i+=1
  assert i<len(lines);i+=1;words=re.findall('[A-Za-z]+','\n'.join(text).lower());assert len(words)<=10000;counts=collections.Counter(words);found=sorted(word for word,count in counts.items() if count==n);out.append('\n'.join(found) if found else 'There is no such word.')
 return '\n\n'.join(out)+ ('\n' if out else '')
def ritual_steps(grid):
 rows=len(grid);cols=len(grid[0]);rowprefix=[[0]*(cols+1) for _ in range(rows)];colprefix=[[0]*cols for _ in range(rows+1)];start=end=None
 for r in range(rows):
  for c in range(cols):
   wall=grid[r][c]=='#';rowprefix[r][c+1]=rowprefix[r][c]+wall;colprefix[r+1][c]=colprefix[r][c]+wall
   if grid[r][c]=='S':assert start is None;start=(r,c,0)
   if grid[r][c]=='E':assert end is None;end=(r,c)
 assert start is not None and end is not None;distance={start:0};queue=collections.deque([start])
 while queue:
  r,c,phase=queue.popleft();cost=distance[r,c,phase]
  if (r,c)==end:return cost
  length=phase+1
  for dr,dc in [(-1,0),(1,0),(0,-1),(0,1)]:
   rr,cc=r+dr*length,c+dc*length
   if not(0<=rr<rows and 0<=cc<cols):continue
   blocked=colprefix[max(r,rr)+1][c]-colprefix[min(r,rr)][c] if dr else rowprefix[r][max(c,cc)+1]-rowprefix[r][min(c,cc)]
   if blocked:continue
   nxt=(rr,cc,(phase+1)%3)
   if nxt not in distance:distance[nxt]=cost+1;queue.append(nxt)
 return None
def rituals(data):
 a=data.split();t=int(a[0]);i=1;assert t>=1;out=[]
 for _ in range(t):
  r,c=map(int,a[i:i+2]);i+=2;assert 2<=r<=300 and 2<=c<=300;grid=a[i:i+r];i+=r;assert len(grid)==r and all(len(row)==c and set(row)<=set('.#SE') for row in grid);answer=ritual_steps(grid);out.append(str(answer) if answer is not None else 'NO')
 assert i==len(a);return '\n'.join(out)+'\n'
def vulnerable(gophers,holes,seconds,velocity):
 n=len(gophers);m=len(holes);source=n+m;sink=source+1;size=sink+1;residual=[{} for _ in range(size)]
 def add(u,v):residual[u][v]=1;residual[v][u]=0
 for u in range(n):add(source,u)
 for v in range(m):add(n+v,sink)
 radius=seconds*velocity
 for u,(x,y) in enumerate(gophers):
  for v,(a,b) in enumerate(holes):
   if (x-a)**2+(y-b)**2<=radius**2:add(u,n+v)
 flow=0
 while True:
  parent=[-1]*size;parent[source]=source;queue=collections.deque([source])
  while queue and parent[sink]<0:
   u=queue.popleft()
   for v,cap in residual[u].items():
    if cap and parent[v]<0:parent[v]=u;queue.append(v)
  if parent[sink]<0:break
  v=sink
  while v!=source:u=parent[v];residual[u][v]-=1;residual[v][u]+=1;v=u
  flow+=1
 return n-flow
def gophers(data):
 a=data.split();i=0;out=[]
 while i<len(a):
  n,m,s,v=map(int,a[i:i+4]);i+=4;assert all(1<=x<100 for x in [n,m,s,v]);points=[]
  for _ in range(n+m):points.append((Fraction(a[i]),Fraction(a[i+1])));i+=2
  assert len(set(points[:n]))==n and len(set(points[n:]))==m;out.append(str(vulnerable(points[:n],points[n:],s,v)))
 return '\n'.join(out)+ ('\n' if out else '')
def rotation_index(word):
 n=len(word);ranks=[ord(c) for c in word];length=1
 while length<n:
  keys=[(ranks[i],ranks[(i+length)%n]) for i in range(n)];order=sorted(range(n),key=keys.__getitem__);following=[0]*n;value=0
  for k,index in enumerate(order):
   if k and keys[index]!=keys[order[k-1]]:value+=1
   following[index]=value
  ranks=following;length*=2
 return min(range(n),key=lambda i:(ranks[i],i))+1

def beads(data):
 a=data.split();t=int(a[0]);assert t>=1 and len(a)==t+1 and all(1<=len(word)<=10000 and re.fullmatch('[a-z]+',word) for word in a[1:]);return ''.join(str(rotation_index(word))+'\n' for word in a[1:])
@lru_cache(maxsize=256)
def exact_cover(grid):
 rows={};columns={i:set() for i in range(324)}
 for r in range(9):
  for c in range(9):
   choices=[grid[9*r+c]-1] if grid[9*r+c] else range(9)
   for d in choices:
    key=(r,c,d);constraint=(9*r+c,81+9*r+d,162+9*c+d,243+9*(3*(r//3)+c//3)+d);rows[key]=constraint
    for col in constraint:columns[col].add(key)
 solution=[]
 def search():
  if not columns:return True
  col=min(columns,key=lambda c:(len(columns[c]),c))
  for chosen in sorted(columns[col]):
   removed=[];solution.append(chosen)
   for c in rows[chosen]:
    for conflicting in columns[c]:
     for other in rows[conflicting]:
      if other!=c:columns[other].remove(conflicting)
    removed.append(columns.pop(c))
   if search():return True
   for c in reversed(rows[chosen]):
    columns[c]=removed.pop()
    for conflicting in columns[c]:
     for other in rows[conflicting]:
      if other!=c:columns[other].add(conflicting)
   solution.pop()
  return False
 if not search():return None
 answer=[0]*81
 for r,c,d in solution:answer[r*9+c]=d+1
 return tuple(answer)
def sudoku_input(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=10 and len(a)==1+81*t and all(0<=v<=9 for v in a[1:]);return [tuple(a[1+81*i:82+81*i]) for i in range(t)]
def valid_completion(clues,answer):
 if len(answer)!=81 or any(not 1<=v<=9 for v in answer):return False
 if any(clue and clue!=value for clue,value in zip(clues,answer)):return False
 groups=[answer[9*r:9*r+9] for r in range(9)]+[answer[c::9] for c in range(9)]+[[answer[(r+i)*9+c+j] for i in range(3) for j in range(3)] for r in range(0,9,3) for c in range(0,9,3)]
 return all(set(group)==set(range(1,10)) for group in groups)
def sudoku_expected_valid(puzzles,expected):
 tokens=expected.split();i=0
 for puzzle in puzzles:
  if i>=len(tokens):return False
  if tokens[i]=='NO':
   i+=1
   if exact_cover(puzzle) is not None:return False
  else:
   chunk=tokens[i:i+81];i+=81
   if len(chunk)!=81 or any(not re.fullmatch('[1-9]',s) for s in chunk) or not valid_completion(puzzle,list(map(int,chunk))):return False
 return i==len(tokens)
def sudoku(data,expected=None):
 puzzles=sudoku_input(data)
 if expected is not None and sudoku_expected_valid(puzzles,expected):return expected
 out=[]
 for puzzle in puzzles:
  answer=exact_cover(puzzle)
  if answer is None:out.append('NO')
  else:assert valid_completion(puzzle,answer);out.extend(' '.join(map(str,answer[i:i+9])) for i in range(0,81,9))
 return '\n'.join(out)+'\n'
ORACLES={'gpe-10432-mine-sweeper':minesweeper,'gpe-10531-zipf-s-law':zipf,'gpe-10601-eternal-truths':rituals,'gpe-10636-gopher-ii':gophers,'gpe-23581-glass-beads':beads,'gpe-2015-03-sudoku-as-good-as-lee-hsien-loong':sudoku}
def sudoku_files():
 rng=random.Random(201503);base=[(r*3+r//3+c)%9+1 for r in range(9) for c in range(9)];contradict=base.copy();contradict[1]=contradict[0];subtle=base.copy();subtle[0]=2;subtle[1]=0;subtle[27]=0;puzzles=[[0]*81,base,contradict,subtle]
 for _ in range(26):
  digits=list(range(1,10));rng.shuffle(digits);rowbands=[0,1,2];colbands=[0,1,2];rng.shuffle(rowbands);rng.shuffle(colbands);rows=[];cols=[]
  for band in rowbands:inside=[0,1,2];rng.shuffle(inside);rows.extend(3*band+i for i in inside)
  for band in colbands:inside=[0,1,2];rng.shuffle(inside);cols.extend(3*band+i for i in inside)
  puzzle=[digits[base[9*r+c]-1] for r in rows for c in cols]
  for cell in rng.sample(range(81),rng.randint(20,65)):puzzle[cell]=0
  puzzles.append(puzzle)
 return [str(len(puzzles[i:i+10]))+'\n'+''.join(' '.join(map(str,puzzle[row:row+9]))+'\n' for puzzle in puzzles[i:i+10] for row in range(0,81,9)) for i in range(0,len(puzzles),10)]
def additions():
 rng=random.Random(10279);minecases=[(['*'],['.']),(['*'],['x']),(['.'],['x']),(['.'],['.'])]
 for mine in range(16):
  for touch in range(16):minecases.append(([''.join('*' if mine>>(r*2+c)&1 else '.' for c in range(2)) for r in range(2)],[''.join('x' if touch>>(r*2+c)&1 else '.' for c in range(2)) for r in range(2)]))
 minecases.append((['***','*.*','***'],['...','.x.','...']))
 for _ in range(60):
  n=10;minecases.append(([''.join('*' if rng.random()<.3 else '.' for c in range(n)) for r in range(n)],[''.join('x' if rng.random()<.4 else '.' for c in range(n)) for r in range(n)]))
 texts=[(1,''),(2,"Alpha, ALPHA! beta123BETA Can't re-enter."),(5000,'Alpha beta '*5000),(10000,'word '*10000),(10001,'word '*10000),(1,'pneumonoultramicroscopicsilicovolcanoconiosis\nZebra Apple apple zebra!')]
 def position_only(grid):
  rows=len(grid);cols=len(grid[0]);start=next((r,c) for r in range(rows) for c in range(cols) if grid[r][c]=='S');seen={start};queue=collections.deque([(*start,0,0)])
  while queue:
   r,c,phase,cost=queue.popleft()
   if grid[r][c]=='E':return cost
   for dr,dc in [(-1,0),(1,0),(0,-1),(0,1)]:
    path=[(r+dr*j,c+dc*j) for j in range(1,phase+2)]
    if any(not(0<=rr<rows and 0<=cc<cols) or grid[rr][cc]=='#' for rr,cc in path):continue
    rr,cc=path[-1]
    if (rr,cc) not in seen:seen.add((rr,cc));queue.append((rr,cc,(phase+1)%3,cost+1))
  return None
 ritualcases=[['S.#E','####']];large=[['.']*300 for _ in range(300)];large[0][0]='S';large[-1][-1]='E';ritualcases.append([''.join(row) for row in large]);counterexamples=0
 for _ in range(200):
  rows,cols=rng.randint(2,12),rng.randint(2,12);board=[['#' if rng.random()<.25 else '.' for c in range(cols)] for r in range(rows)];start,end=rng.sample(range(rows*cols),2);board[start//cols][start%cols]='S';board[end//cols][end%cols]='E';grid=[''.join(row) for row in board];counterexamples+=ritual_steps(grid)!=position_only(grid);ritualcases.append(grid)
 assert counterexamples>0
 cases=[(2,2,1,1,[('0','0'),('2','0')],[('1','0'),('-1','0')]),(1,1,1,5,[('0.1','0.2')],[('3.1','4.2')]),(1,1,1,5,[('0.1','0.2')],[('3.1001','4.2')]),(1,1,1,1,[('1000000000','0')],[('1000000001','0')]),(99,99,99,99,[(str(i),'0') for i in range(99)],[(str(i),'0.5') for i in range(99)])]
 for _ in range(35):
  n,m=rng.randint(1,20),rng.randint(1,20);points=rng.sample([(x,y) for x in range(-30,31) for y in range(-30,31)],n+m);formatted=[(str(Fraction(x,10)) if x%10==0 else f'{x/10:.1f}',str(Fraction(y,10)) if y%10==0 else f'{y/10:.1f}') for x,y in points];cases.append((n,m,rng.randint(1,3),rng.randint(1,3),formatted[:n],formatted[n:]))
 words=[''.join(bits) for n in range(1,10) for bits in itertools.product('ab',repeat=n)]+['a'*10000,'ab'*5000,'abc'*3333,'b'+'a'*9999,''.join(rng.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(10000))]
 return {'gpe-10432-mine-sweeper':str(len(minecases))+'\n\n'+'\n'.join(str(len(mines))+'\n'+'\n'.join(mines+touched)+'\n' for mines,touched in minecases),'gpe-10531-zipf-s-law':''.join(str(n)+'\n'+text+'\nEndOfText\n' for n,text in texts),'gpe-10601-eternal-truths':str(len(ritualcases))+'\n'+''.join(f'{len(grid)} {len(grid[0])}\n'+'\n'.join(grid)+'\n' for grid in ritualcases),'gpe-10636-gopher-ii':''.join(f'{n} {m} {s} {v}\n'+''.join(f'{x} {y}\n' for x,y in g+holes) for n,m,s,v,g,holes in cases),'gpe-23581-glass-beads':str(len(words))+'\n'+'\n'.join(words)+'\n','gpe-2015-03-sudoku-as-good-as-lee-hsien-loong':sudoku_files()[0]}

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
                    answer=sudoku(c['input'],c['output']) if p['slug']=='gpe-2015-03-sudoku-as-good-as-lee-hsien-loong' else oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW'
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all2x2mine/touch combinations,10000word limits,ritual phases and intermediate walls,exact distance boundaries and matching,periodic10000-bead ties and Sudoku multi-solution/NO certification','input':data,'output':oracle(data)})
        if p['slug']=='gpe-2015-03-sudoku-as-good-as-lee-hsien-loong':
            for data in sudoku_files()[1:]:
                if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'Exact-cover certified Sudoku completions and unsatisfiability, at most10 puzzles per file','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
