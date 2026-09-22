"""Independent immutable nested sets, prefix closure, ray sets, tree unions, terminal propagation and DSUs."""
import argparse,hashlib,json,random,itertools,collections
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def set_stack(data):
 a=data.split();t=int(a[0]);i=1;assert 0<=t<=5;out=[]
 for _ in range(t):
  n=int(a[i]);i+=1;assert 0<=n<=2000;stack=[]
  for command in a[i:i+n]:
   if command=='PUSH':stack.append(frozenset())
   elif command=='DUP':assert stack;stack.append(stack[-1])
   else:
    assert command in ('UNION','INTERSECT','ADD') and len(stack)>=2;first=stack.pop();second=stack.pop();stack.append(first|second if command=='UNION' else first&second if command=='INTERSECT' else second|frozenset([first]))
   out.append(str(len(stack[-1])))
  i+=n;out.append('***')
 assert i==len(a);return '\n'.join(out)+ ('\n' if out else '')

def tree_level(tokens):
 assert 1<=len(tokens)<=256;values={};valid=True
 for token in tokens:
  assert token.startswith('(') and token.endswith(')');number,path=token[1:-1].split(',');assert number.isascii() and number.isdigit() and int(number)>0 and set(path)<=set('LR')
  if path in values:valid=False
  values[path]=str(int(number))
 if '' not in values or any(path[:-1] not in values for path in values if path):valid=False
 return ' '.join(values[path] for path in sorted(values,key=lambda p:(len(p),p))) if valid else 'not complete'
def levels(data):
 pending=[];out=[]
 for token in data.split():
  if token=='()':out.append(tree_level(pending));pending=[]
  else:pending.append(token)
 assert not pending;return '\n'.join(out)+'\n'

@lru_cache(None)
def king_neighbors(k):
 row,col=divmod(k,8);return frozenset(8*r+c for r,c in [(row-1,col),(row+1,col),(row,col-1),(row,col+1)] if 0<=r<8 and 0<=c<8)
@lru_cache(None)
def queen_moves(k,q):
 row,col=divmod(q,8);moves=set()
 for dr,dc in [(-1,0),(1,0),(0,-1),(0,1)]:
  r,c=row+dr,col+dc
  while 0<=r<8 and 0<=c<8:
   at=8*r+c
   if at==k:break
   moves.add(at);r+=dr;c+=dc
 return frozenset(moves)
def chess_verdict(k,q,destination):
 if k==q:return 'Illegal state'
 if destination not in queen_moves(k,q):return 'Illegal move'
 if destination in king_neighbors(k):return 'Move not allowed'
 return 'Continue' if king_neighbors(k)-queen_moves(k,destination)-{destination} else 'Stop'
def chess(data):
 a=list(map(int,data.split()));assert len(a)%3==0 and all(0<=x<64 for x in a);return ''.join(chess_verdict(*a[i:i+3])+'\n' for i in range(0,len(a),3))

def quadtree(text):
 i=0
 def parse(depth):
  nonlocal i
  ch=text[i];i+=1;assert ch in 'pef'
  if ch!='p':return ch
  assert depth<5;return tuple(parse(depth+1) for _ in range(4))
 result=parse(0);assert i==len(text);return result
def union_area(a,b,area=1024):
 if a=='f' or b=='f':return area
 if a==b=='e':return 0
 left=a if isinstance(a,tuple) else ('e',)*4;right=b if isinstance(b,tuple) else ('e',)*4
 return sum(union_area(x,y,area//4) for x,y in zip(left,right))
def quadrants(data):
 a=data.split();t=int(a[0]);assert t>=1 and len(a)==1+2*t;return ''.join(f'There are {union_area(quadtree(a[i]),quadtree(a[i+1]))} black pixels.\n' for i in range(1,len(a),2))

def forwarding_targets(requests,time,targets):
 forward={source:target for source,start,duration,target in requests if start<=time<=start+duration};nodes=set(targets)|set(forward)|set(forward.values());back=collections.defaultdict(list)
 for source,target in forward.items():back[target].append(source)
 result={v:v for v in nodes if v not in forward};queue=collections.deque(result)
 while queue:
  node=queue.popleft()
  for previous in back[node]:
   assert previous not in result;result[previous]=result[node];queue.append(previous)
 return {v:result.get(v,9999) for v in targets}
def forwarding(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert 1<=t<=10;out=['CALL FORWARDING OUTPUT']
 for system in range(1,t+1):
  requests=[];by_source=collections.defaultdict(list)
  while a[i]:
   source,start,duration,target=a[i:i+4];i+=4;assert 1<=source<=9998 and 1<=target<=9998 and 0<=start<=start+duration<=8784;requests.append((source,start,duration,target));by_source[source].append((start,start+duration))
  i+=1;assert len(requests)<=100
  for intervals in by_source.values():
   intervals.sort();assert all(b[0]>a[1] for a,b in zip(intervals,intervals[1:]))
  out.append(f'SYSTEM {system}');calls=[]
  while a[i]!=9000:
   time,target=a[i:i+2];i+=2;assert 0<=time<=8784 and 0<=target<=9999;calls.append((time,target))
  i+=1;assert calls and all(a[0]<=b[0] for a,b in zip(calls,calls[1:]));grouped=collections.defaultdict(list)
  for time,target in calls:grouped[time].append(target)
  resolutions={time:forwarding_targets(requests,time,targets) for time,targets in grouped.items()}
  for time,target in calls:out.append(f'AT {time:04} CALL TO {target:04} RINGS {resolutions[time][target]:04}')
 assert i==len(a);return '\n'.join(out+['END OF OUTPUT'])+'\n'

def dice_components(grid):
 height=len(grid);width=len(grid[0]);parent=list(range(height*width));pip=list(range(height*width))
 def root(tree,v):
  while tree[v]!=v:tree[v]=tree[tree[v]];v=tree[v]
  return v
 def join(tree,a,b):tree[root(tree,a)]=root(tree,b)
 for r in range(height):
  for c in range(width):
   if grid[r][c]=='.':continue
   for rr,cc in [(r-1,c),(r,c-1)]:
    if rr<0 or cc<0 or grid[rr][cc]=='.':continue
    join(parent,r*width+c,rr*width+cc)
    if grid[r][c]==grid[rr][cc]=='X':join(pip,r*width+c,rr*width+cc)
 groups={}
 for r in range(height):
  for c in range(width):
   if grid[r][c]=='.':continue
   at=r*width+c;group=groups.setdefault(root(parent,at),set())
   if grid[r][c]=='X':group.add(root(pip,at))
 return sorted(map(len,groups.values()))
def dice(data):
 a=data.split();i=0;out=[];tc=0
 while True:
  w,h=map(int,a[i:i+2]);i+=2
  if (w,h)==(0,0):break
  assert 5<=w<=50 and 5<=h<=50;grid=a[i:i+h];i+=h;assert len(grid)==h and all(len(row)==w and set(row)<=set('.*X') for row in grid);counts=dice_components(grid);assert counts and all(1<=v<=6 for v in counts);tc+=1;out.append(f'Throw {tc}\n'+ ' '.join(map(str,counts)))
 assert i==len(a);return '\n\n'.join(out)+'\n\n'
ORACLES={'uva-12096-the-setstack-computer':set_stack,'uva-122-trees-on-the-level':levels,'uva-255-correct-move':chess,'uva-297-quadtrees':quadrants,'uva-380-call-forwarding':forwarding,'uva-657-the-die-is-cast':dice}
def additions():
 rng=random.Random(12096);stack_cases=[[],['PUSH']*1000+['ADD']*999+['DUP'],['PUSH','DUP','ADD','DUP','ADD','PUSH','ADD','DUP','UNION','DUP','INTERSECT']]
 for _ in range(1):
  commands=[];depth=0
  for i in range(2000):
   command=rng.choice(['PUSH']+(['DUP'] if depth else [])+(['ADD','UNION','INTERSECT'] if depth>=2 else []));commands.append(command);depth+=1 if command in ('PUSH','DUP') else -1
  stack_cases.append(commands)
 stack_cases.append(['PUSH']+['DUP','ADD']*999+['DUP'])
 tree_cases=[['(1,)'],['(1,)','(1,)'],['(2,L)'],['(1,)','(3,LL)'],[f'({i+1},'+('L'*i)+')' for i in range(256)]]
 for _ in range(150):
  paths=[''];available=['L','R']
  for i in range(rng.randrange(1,255)):
   index=rng.randrange(len(available));path=available.pop(index);paths.append(path);available.extend([path+'L',path+'R'])
  if rng.randrange(3)==0:paths.pop(rng.randrange(len(paths)))
  elif rng.randrange(3)==0 and len(paths)<256:paths.append(rng.choice(paths))
  rng.shuffle(paths);tree_cases.append([f'({rng.randrange(1,1000000000)},{path})' for path in paths])
 def encode(pixels):
  if len(set(pixels))==1:return 'f' if pixels[0] else 'e'
  quarter=len(pixels)//4;return 'p'+''.join(encode(pixels[i:i+quarter]) for i in range(0,len(pixels),quarter))
 quad_cases=[('e','e'),('f','f'),('f','e')]
 for a in range(16):
  for b in range(16):quad_cases.append((encode([bool(a>>i&1) for i in range(4)]),encode([bool(b>>i&1) for i in range(4)])))
 for _ in range(120):quad_cases.append((encode([rng.randrange(2) for i in range(1024)]),encode([rng.randrange(2) for i in range(1024)])))
 systems=[([],[(0,1),(8784,9998)]),([(1,100,20,2),(2,100,20,3),(3,100,20,2)],[(99,1),(100,1),(120,1),(121,1)]),([(7,0,0,8),(7,1,8783,9)],[(0,7),(1,7),(8784,7)]),([(v,0,8784,v+1) for v in range(1,101)],[(0,1),(8784,1)])]
 for _ in range(6):
  requests=[]
  for source in range(1,26):
   end=-1
   for block in range(4):
    start=max(end+1,block*2000+rng.randrange(100));duration=rng.randrange(1001);requests.append((source,start,duration,rng.randrange(1,30)));end=start+duration
  rng.shuffle(requests);calls=sorted((rng.randrange(8785),rng.randrange(1,30)) for i in range(100));systems.append((requests,calls))
 images=[['XXXXX']*5,['X....','.*X..','.....','.....','.....'],['X*X*X','*****','X*X*X','*****','*****'],['X'*50]*50]
 # Every non-background component has1..6 dot components; rectangles separated by a blank border.
 for h,w in [(5,5),(20,30),(50,50)]:
  grid=[['.']*w for _ in range(h)]
  for top in range(0,h-2,4):
   for left in range(0,w-4,6):
    for r in range(top,top+3):
     for c in range(left,left+5):grid[r][c]='*'
    positions=[(r,c) for r in (top,top+2) for c in (left,left+2,left+4)];rng.shuffle(positions)
    for r,c in positions[:rng.randrange(1,7)]:grid[r][c]='X'
  images.append([''.join(row) for row in grid])
 return {'uva-12096-the-setstack-computer':str(len(stack_cases))+'\n'+''.join(str(len(commands))+'\n'+'\n'.join(commands)+ ('\n' if commands else '') for commands in stack_cases),'uva-122-trees-on-the-level':''.join(' '.join(tokens)+' ()\n' for tokens in tree_cases),'uva-255-correct-move':''.join(f'{k} {q} {d}\n' for k in range(64) for q in range(64) for d in range(64)),'uva-297-quadtrees':str(len(quad_cases))+'\n'+''.join(a+'\n'+b+'\n' for a,b in quad_cases),'uva-380-call-forwarding':str(len(systems))+'\n'+''.join(''.join(f'{s:04} {t:04} {d:04} {v:04}\n' for s,t,d,v in requests)+'0000\n'+''.join(f'{t:04} {v:04}\n' for t,v in calls)+'9000\n' for requests,calls in systems),'uva-657-the-die-is-cast':''.join(f'{len(grid[0])} {len(grid)}\n'+'\n'.join(grid)+'\n' for grid in images)+'0 0\n'}
def repair_input(slug,data,expected=None):
 if slug=='uva-657-the-die-is-cast':
  a=data.split();i=0;out=[];changed=False
  while True:
   w,h=map(int,a[i:i+2]);i+=2;out.append(f'{w} {h}')
   if (w,h)==(0,0):break
   for row in a[i:i+h]:
    if len(row)>w:assert set(row[w:])<=set('.');row=row[:w];changed=True
    if len(row)<w:row=row.ljust(w,'.');changed=True
    out.append(row)
   i+=h
  assert i==len(a);result='\n'.join(out)+'\n';assert dice(result).split()==expected.split();return result if changed else None
 if slug=='uva-380-call-forwarding':
  a=list(map(int,data.split()));t=a[0];i=1;out=[str(t)];old_output=['CALL FORWARDING OUTPUT'];changed=False
  for system in range(1,t+1):
   requests=[]
   while a[i]:
    row=a[i:i+4];i+=4;requests.append(tuple(row));out.append(' '.join(f'{v:04}' for v in row))
   i+=1;out.append('0000');calls=[]
   while a[i]!=9000:calls.append(tuple(a[i:i+2]));i+=2
   i+=1;old_output.append(f'SYSTEM {system}')
   for time,target in calls:old_output.append(f'AT {time:04} CALL TO {target:04} RINGS {forwarding_targets(requests,time,[target])[target]:04}')
   ordered=sorted(calls,key=lambda row:row[0]);changed |= calls!=ordered;out.extend(f'{time:04} {target:04}' for time,target in ordered);out.append('9000')
  assert i==len(a);assert '\n'.join(old_output+['END OF OUTPUT']).split()==expected.split();return '\n'.join(out)+'\n' if changed else None
 return None

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
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'],c['output'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Dice restores only trailing background width; every original coordinate containing die or pip pixels and all original answers remain unchanged. Call Forwarding stably sorts calls by time, preserving all requests and calls and verifying every original per-call answer before reordering.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'nested set identity, tree prefix completeness, all262144 legal-domain move queries, deep quadtree unions, inclusive forwarding intervals and four-neighbor dice/pip components','input':data,'output':oracle(data)})
        if p['slug']=='uva-12096-the-setstack-computer' and not any(c['input']=='0\n' for c in p['testCases']):row['proposedAdditions'].append({'label':'zero permitted test cases produce empty output','input':'0\n','output':''})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
