"""Independent inverse-permutation LCS, rotated point sets, bitset postage, physical sheet, decimal multiplication, trial-prime rotations."""
import argparse,bisect,collections,hashlib,itertools,json,math,random,re
from functools import lru_cache
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
HISTORY='uva-111-history-grading';SPOT='uva-141-the-spot-game';STAMPS='uva-242-stamps-and-envelope-size';SHEET='uva-512-spreadsheet-tracking';POWER='uva-748-exponentiation';CIRCULAR='uva-967-circular'
def grade(correct,response):
 a=sorted(range(len(correct)),key=correct.__getitem__);b=sorted(range(len(response)),key=response.__getitem__);dp=[0]*(len(a)+1)
 for x in a:
  previous=dp[:]
  for j,y in enumerate(b,1):dp[j]=previous[j-1]+1 if x==y else max(previous[j],dp[j-1])
 return dp[-1]
def history(data):
 lines=[list(map(int,line.split())) for line in data.splitlines() if line.strip()];n=0;correct=None;out=[]
 for values in lines:
  if len(values)==1:n=values[0];assert 2<=n<=20;correct=None;continue
  assert len(values)==n and sorted(values)==list(range(1,n+1))
  if correct is None:correct=values
  else:out.append(str(grade(correct,values)))
 assert correct is not None;return '\n'.join(out)+'\n'
def play_spot(n,moves):
 board=set();history=set();answer='Draw'
 for step,(r,c,op) in enumerate(moves,1):
  assert 0<=r<n and 0<=c<n and op in ['+','-'];point=complex(2*r-(n-1),2*c-(n-1))
  if op=='+':assert point not in board;board.add(point)
  else:assert point in board;board.remove(point)
  if answer!='Draw':continue
  variants=[frozenset(p*(1j**k) for p in board) for k in range(4)]
  if any(v in history for v in variants):answer=f'Player {2 if step%2 else 1} wins on move {step}'
  history.add(frozenset(board))
 return answer
def spot(data):
 a=data.split();i=0;out=[]
 while i<len(a):
  n=int(a[i]);i+=1
  if n==0:assert i==len(a);break
  assert 2<=n<=50;moves=[]
  for _ in range(2*n):r,c=int(a[i]),int(a[i+1]);op=a[i+2];i+=3;moves.append((r-1,c-1,op))
  out.append(play_spot(n,moves))
 else:raise AssertionError('missing0')
 return '\n'.join(out)+'\n'
def coverage(s,denoms):
 possible=1
 for _ in range(s):
  prior=possible
  for d in denoms:possible|=prior<<d
 missing=~possible;first=(missing&-missing).bit_length()-1
 return first-1
def choose_stamps(s,sets):return min(sets,key=lambda row:(-coverage(s,row),len(row),tuple(reversed(row))))
def stamps(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  s=a[i];i+=1
  if s==0:assert i==len(a);break
  n=a[i];i+=1;assert 1<=s<=10 and 1<=n<=10;sets=[]
  for _ in range(n):
   k=a[i];i+=1;row=a[i:i+k];i+=k;assert 1<=k<=s and len(row)==k and row==sorted(set(row)) and all(1<=d<=100 for d in row);sets.append(row)
  best=choose_stamps(s,sets);out.append(f'max coverage ={coverage(s,best):4d} :'+''.join(f'{d:3d}' for d in best))
 else:raise AssertionError('missing0')
 return '\n'.join(out)+'\n'
def read_sheets(data):
 a=data.split();i=0;cases=[]
 while i<len(a):
  rows,cols=int(a[i]),int(a[i+1]);i+=2
  if rows==cols==0:assert i==len(a);return cases
  assert 1<=rows<=50 and 1<=cols<=50;n=int(a[i]);i+=1;assert n>=0;ops=[];r,c=rows,cols
  for _ in range(n):
   command=a[i];i+=1
   if command=='EX':
    values=list(map(int,a[i:i+4]));i+=4;assert all(1<=rr<=r and 1<=cc<=c for rr,cc in zip(values[::2],values[1::2]))
   else:
    assert command in ['DR','DC','IR','IC'];k=int(a[i]);i+=1;values=list(map(int,a[i:i+k]));i+=k;dim=r if command[1]=='R' else c
    assert 1<=k<=9 and len(values)==k and len(set(values))==k and all(1<=v<=dim for v in values)
    if command[1]=='R':r+=k if command[0]=='I' else -k
    else:c+=k if command[0]=='I' else -k
    assert 0<=r<=50 and 0<=c<=50
   ops.append((command,values))
  q=int(a[i]);i+=1;assert q>=0;queries=[]
  for _ in range(q):
   rr,cc=int(a[i]),int(a[i+1]);i+=2;assert 1<=rr<=rows and 1<=cc<=cols;queries.append((rr,cc))
  cases.append((rows,cols,ops,queries))
 raise AssertionError('missing00')
def sheet_locations(rows,cols,ops):
 grid=[[(r+1,c+1) for c in range(cols)] for r in range(rows)]
 for command,values in ops:
  if command=='EX':
   r1,c1,r2,c2=[v-1 for v in values];grid[r1][c1],grid[r2][c2]=grid[r2][c2],grid[r1][c1];continue
  marked={v-1 for v in values};insert=command[0]=='I'
  if command[1]=='R':
   new=[]
   for r,row in enumerate(grid):
    if insert and r in marked:new.append([None]*cols)
    if insert or r not in marked:new.append(row)
   grid=new;rows+=len(values) if insert else -len(values)
  else:
   new=[]
   for row in grid:
    target=[]
    for c,cell in enumerate(row):
     if insert and c in marked:target.append(None)
     if insert or c not in marked:target.append(cell)
    new.append(target)
   grid=new;cols+=len(values) if insert else -len(values)
 return {cell:(r+1,c+1) for r,row in enumerate(grid) for c,cell in enumerate(row) if cell is not None}
def sheets(data):
 out=[]
 for index,(r,c,ops,queries) in enumerate(read_sheets(data),1):
  locations=sheet_locations(r,c,ops);lines=[f'Spreadsheet #{index}']
  for origin in queries:
   line='Cell data in (%d,%d)'%origin;lines.append(line+(' moved to (%d,%d)'%locations[origin] if origin in locations else ' GONE'))
  out.append('\n'.join(lines))
 return '\n\n'.join(out)+'\n'
def decimal_multiply(a,b):
 out=[0]*(len(a)+len(b))
 for i,x in enumerate(a):
  for j,y in enumerate(b):out[i+j]+=x*y
 for i in range(len(out)-1):out[i+1]+=out[i]//10;out[i]%=10
 while len(out)>1 and out[-1]==0:out.pop()
 return out
def exact_power(token,n):
 digits=[int(c) for c in token if c!='.'][::-1];places=len(token.rsplit('.',1)[1]) if '.' in token else 0;result=[1]
 for _ in range(n):result=decimal_multiply(result,digits)
 text=''.join(map(str,result[::-1]));scale=places*n
 if scale:text=text.zfill(scale+1);text=text[:-scale]+'.'+text[-scale:];text=text.rstrip('0').rstrip('.')
 return text.lstrip('0') or '0'
def powers(data):
 a=data.split();assert len(a)%2==0;out=[]
 for token,exponent in zip(a[::2],a[1::2]):
  n=int(exponent);assert 1<=n<=25 and len(token)<=6 and re.fullmatch('[0-9]+(?:\.[0-9]+)?',token) and 0<Fraction(token)<Fraction(99999,1000);out.append(exact_power(token,n))
 return '\n'.join(out)+'\n'
@lru_cache(None)
def trial_prime(n):return n>=2 and all(n%d for d in range(2,math.isqrt(n)+1))
@lru_cache(None)
def circular_values():
 result=[]
 for length in range(3,7):
  for digits in itertools.product('1379',repeat=length):
   word=''.join(digits)
   if all(trial_prime(int(word[i:]+word[:i])) for i in range(length)):result.append(int(word))
 return sorted(result)
def circular(data):
 a=list(map(int,data.split()));assert a and a[-1]==-1 and len(a)%2==1;values=circular_values();out=[]
 for left,right in zip(a[:-1:2],a[1:-1:2]):
  assert 100<=left<=right<1000000;count=bisect.bisect_right(values,right)-bisect.bisect_left(values,left);out.append('No Circular Primes.' if not count else '1 Circular Prime.' if count==1 else f'{count} Circular Primes.')
 return '\n'.join(out)+'\n'
ORACLES={HISTORY:history,SPOT:spot,STAMPS:stamps,SHEET:sheets,POWER:powers,CIRCULAR:circular}
def additions():
 rng=random.Random(512);rankcases=[]
 for n in [2,3,4,7,20]:
  correct=list(range(1,n+1));rng.shuffle(correct);responses=[correct[:],list(range(n,0,-1))]
  for _ in range(20):v=list(range(1,n+1));rng.shuffle(v);responses.append(v)
  rankcases.append(str(n)+'\n'+' '.join(map(str,correct))+'\n'+''.join(' '.join(map(str,row))+'\n' for row in responses))
 games=[(2,[(0,0,'+'),(0,0,'-'),(1,1,'+'),(1,1,'-')]),(3,[(0,0,'+'),(1,1,'+'),(0,0,'-'),(2,2,'+'),(1,1,'-'),(0,1,'+')])]
 for n in [2,3,5,10,50]:
  for _ in range(20):
   board=set();moves=[];points=list(itertools.product(range(n),repeat=2))
   for step in range(2*n):
    if board and rng.random()<.35:point=rng.choice(sorted(board));board.remove(point);op='-'
    else:point=rng.choice([p for p in points if p not in board]);board.add(point);op='+'
    moves.append((*point,op))
   games.append((n,moves))
 sets=[(4,[[1,2,3,7],[1,2,5,6]]),(5,[[1,3,100],[1,3]]),(1,[[1],[2]]),(5,[[1,3],[1,2,3]]),(3,[[2,3],[1,8],[1,4]]),(10,[[1,3,7,15,31,63,70,80,90,100],[1,2,4,8,16,32,64,75,85,99]])]
 # Find actual ties for reverse-lexicographic comparison, including same largest value.
 buckets=collections.defaultdict(list)
 for row in itertools.combinations(range(1,16),4):
  if row[0]==1:buckets[(coverage(5,row),row[-1])].append(list(row))
 ties=[rows for rows in buckets.values() if len(rows)>1]
 for rows in ties[:12]:sets.append((5,list(reversed(rows[:10]))))
 for _ in range(50):
  s=rng.randint(1,10);group=[]
  for j in range(rng.randint(1,10)):
   k=rng.randint(1,s);row=sorted(rng.sample(range(2,101),k-1)+[1]);group.append(row)
  sets.append((s,group))
 cases=[(3,3,[('IR',[3,1]),('IC',[3,1]),('EX',[1,1,5,5]),('DR',[2,4]),('DC',[2,4])],list(itertools.product(range(1,4),repeat=2))),(2,2,[('DR',[1,2]),('DC',[1,2])],[(1,1),(2,2)])]
 for _ in range(35):
  original=rng.randint(2,15);r=c=original;ops=[]
  for j in range(45):
   command=rng.choice(['EX','IR','IC','DR','DC'])
   if command=='EX':ops.append((command,[rng.randint(1,r),rng.randint(1,c),rng.randint(1,r),rng.randint(1,c)]));continue
   dim=r if command[1]=='R' else c;limit=min(9,dim,50-dim if command[0]=='I' else dim-1)
   if limit<1:continue
   k=rng.randint(1,limit);values=rng.sample(range(1,dim+1),k);ops.append((command,values))
   if command[1]=='R':r+=k if command[0]=='I' else -k
   else:c+=k if command[0]=='I' else -k
  cases.append((original,original,ops,list(itertools.product(range(1,original+1),repeat=2))))
 powerset=[(s,n) for s in ['0.0001','0.1000','1.0000','10.000','99.998','1.0100','25.000','0.5000','0.9999','9.9999'] for n in [1,2,3,24,25]]
 ranges=[(100,999999),(100,100),(113,113),(119,119),(999999,999999)]+[(max(100,v-1),min(999999,v+1)) for v in circular_values()]
 return {HISTORY:[''.join(rankcases)],SPOT:[''.join(str(n)+'\n'+''.join(f'{r+1} {c+1} {op}\n' for r,c,op in moves) for n,moves in games)+'0\n'],STAMPS:[''.join(str(s)+'\n'+str(len(group))+'\n'+''.join(str(len(row))+' '+' '.join(map(str,row))+'\n' for row in group) for s,group in sets)+'0\n'],SHEET:[''.join(f'{r} {c}\n{len(ops)}\n'+''.join(command+' '+('' if command=='EX' else str(len(values))+' ')+' '.join(map(str,values))+'\n' for command,values in ops)+str(len(queries))+'\n'+''.join(f'{rr} {cc}\n' for rr,cc in queries) for r,c,ops,queries in cases)+'0 0\n'],POWER:[''.join(f'{s:>6} {n:2d}\n' for s,n in powerset)],CIRCULAR:[''.join(f'{a} {b}\n' for a,b in ranges)+'-1\n']}

def repair_stamps(data):
 a=list(map(int,data.split()));i=0;out=[];changed=0
 while i<len(a):
  s=a[i];i+=1
  if s==0:assert i==len(a);break
  n=a[i];i+=1;sets=[]
  for _ in range(n):k=a[i];i+=1;row=a[i:i+k];i+=k;sets.append(row)
  needed=max(map(len,sets));new_s=max(s,needed);assert new_s<=10;changed+=int(new_s!=s)
  out.extend([str(new_s),str(n)]);out.extend(str(len(row))+' '+' '.join(map(str,row)) for row in sets)
 if not changed:return None
 return '\n'.join(out)+'\n0\n',changed
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
     if p['slug']==STAMPS and check['status']=='WRONG_EXPECTED_OUTPUT' and answer.split()==c['output'].split():
      row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Restore fixed output columns for postage totals(width4) and denominations(width3), preserving every input and every output token. Existing hidden answers already use this formatting; the public PDF sample uses different spacing. The LOCAL statement makes the platform widths explicit. Numerical answer and selected denomination sets independently verified. The PDF also has this spacing, so this is an explicit LOCAL formatting normalization rather than a claimed import defect.'})
    except (AssertionError,ValueError,IndexError,StopIteration):
     check['status']='INPUT_REQUIRES_REVIEW';repair=None;reason=None
     if p['slug']==STAMPS:
      result=repair_stamps(c['input'])
      if result:
       repair,changed=result;reason=f'Raise envelope capacity only in {changed} groups from five to the minimum capacity admitting every existing denomination set (six/eight); retain all sets, all denomination values and their order. Original groups violated the explicit at-most-S-denominations rule. Recompute every answer independently for the changed capacities.'
     if p['slug']==POWER and re.search(r'(?<![0-9.])99\.999(?![0-9.])',c['input']):
      repair=re.sub(r'(?<![0-9.])99\.999(?![0-9.])','99.998',c['input']);reason='Replace the forbidden exact upper endpoint99.999 with nearest six-column lower value99.998, preserving exponent25 and every other input token; enforce the original strict R<99.999 bound and independently recompute the output.'
     if repair is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':repair,'output':oracle(repair),'reason':reason})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'rank/order distinction,empty board/rotations,maxstampcounts and tie priorities,simultaneous spreadsheet indices,exact125decimalplaces,complete circular-prime range','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
