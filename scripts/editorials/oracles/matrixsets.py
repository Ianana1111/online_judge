"""Rectangle enumeration, bottom-wall reconstruction, suffix minima and independent state models."""
import argparse,hashlib,json,math,random
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def rectangle(a):
 n=len(a);prefix=[[0]*(n+1) for _ in range(n+1)]
 for r in range(n):
  for c in range(n):prefix[r+1][c+1]=a[r][c]+prefix[r][c+1]+prefix[r+1][c]-prefix[r][c]
 answer=-10**9
 for top in range(n):
  for bottom in range(top+1,n+1):
   strip=[prefix[bottom][c]-prefix[top][c] for c in range(n+1)]
   for left in range(n):
    base=strip[left]
    for right in range(left+1,n+1):answer=max(answer,strip[right]-base)
 return answer

def maximum(data,require_end=True):
 values=list(map(int,data.split()));i=0;out=[];ended=False
 while i<len(values):
  n=values[i];i+=1
  if n==0:assert i==len(values);ended=True;break
  assert 1<=n<=100;flat=values[i:i+n*n];i+=n*n;assert len(flat)==n*n and all(-127<=v<=127 for v in flat);out.append(str(rectangle([flat[r*n:(r+1)*n] for r in range(n)])))
 if require_end:assert ended
 return '\n'.join(out)+'\n'

def wall_from_clues(clues):
 assert len(clues)==15;bottom=[0]*9
 for j,v in enumerate(clues[10:15]):bottom[2*j]=v
 for j in range(4):
  numerator=clues[6+j]-bottom[2*j]-bottom[2*j+2];assert numerator%2==0;bottom[2*j+1]=numerator//2
 rows=[bottom]
 for _ in range(8):rows.append([a+b for a,b in zip(rows[-1],rows[-1][1:])])
 rows.reverse();assert [v for row in rows[::2] for v in row[::2]]==clues;return rows

def wall(data):
 v=list(map(int,data.split()));t=v[0];assert t>=0 and len(v)==1+15*t;out=[]
 for i in range(t):out.extend(' '.join(map(str,row)) for row in wall_from_clues(v[1+15*i:1+15*(i+1)]))
 return '\n'.join(out)+'\n'

def credit_value(values):
 suffix=[0]*len(values);suffix[-1]=values[-1]
 for i in range(len(values)-2,-1,-1):suffix[i]=min(values[i],suffix[i+1])
 return max(v-suffix[i+1] for i,v in enumerate(values[:-1]))

def credit(data):
 v=list(map(int,data.split()));t=v[0];assert 1<=t<20;i=1;out=[]
 for _ in range(t):
  n=v[i];i+=1;assert 2<=n<=100000;values=v[i:i+n];i+=n;assert len(values)==n and all(abs(x)<150000 for x in values);out.append(str(credit_value(values)))
 assert i==len(v);return '\n'.join(out)+'\n'

def highest(values):
 assert all(0<abs(x)<=999999 for x in values) and len({abs(x) for x in values})==len(values)
 color=bytearray(max(map(abs,values),default=0)+1)
 for value in values:color[abs(value)]=1 if value>0 else 2
 red=blue=0
 for sign in color:
  if sign==1:blue=max(blue,red+1)
  elif sign==2:red=max(red,blue+1)
 return max(red,blue)

def buildings(data):
 v=list(map(int,data.split()));t=v[0];assert t>=1;i=1;out=[]
 for _ in range(t):
  n=v[i];i+=1;assert 0<=n<=500000;values=v[i:i+n];i+=n;assert len(values)==n;out.append(str(highest(values)))
 assert i==len(v);return '\n'.join(out)+'\n'

def lazy_matrix(matrix,commands):
 n=len(matrix);rows=list(range(n));cols=list(range(n));flip=False;offset=0
 for command in commands:
  op=command[0]
  if op in ('row','col'):
   a,b=map(int,command[1:]);assert 1<=a<=n and 1<=b<=n and a!=b;axis=rows if op=='row' else cols;axis[a-1],axis[b-1]=axis[b-1],axis[a-1]
  elif op=='transpose':rows,cols=cols,rows;flip=not flip
  elif op=='inc':offset+=1
  else:assert op=='dec';offset-=1
 return [[((matrix[cols[c]][rows[r]] if flip else matrix[rows[r]][cols[c]])+offset)%10 for c in range(n)] for r in range(n)]

def matrices(data):
 lines=data.splitlines();t=int(lines[0]);assert 1<=t<50;i=1;out=[]
 for case in range(1,t+1):
  n=int(lines[i]);i+=1;assert 1<=n<10;matrix=[]
  for _ in range(n):
   line=''.join(lines[i].split());i+=1;assert len(line)==n and set(line)<=set('0123456789');matrix.append(list(map(int,line)))
  m=int(lines[i]);i+=1;assert 0<=m<50;commands=[line.split() for line in lines[i:i+m]];i+=m;assert len(commands)==m
  for command in commands:assert len(command)==(3 if command[0] in ('row','col') else 1)
  out.append(f'Case #{case}\n'+'\n'.join(''.join(map(str,row)) for row in lazy_matrix(matrix,commands)))
 assert not any(line.strip() for line in lines[i:]);return '\n\n'.join(out)+'\n\n'

def inversion_count(values):
 if len(values)<2:return list(values),0
 middle=len(values)//2;left,a=inversion_count(values[:middle]);right,b=inversion_count(values[middle:]);i=j=0;out=[];total=a+b
 while i<len(left) and j<len(right):
  if left[i]<=right[j]:out.append(left[i]);i+=1
  else:out.append(right[j]);j+=1;total+=len(left)-i
 out.extend(left[i:]);out.extend(right[j:]);return out,total

def bubbles(data):
 v=list(map(int,data.split()));i=0;out=[]
 while True:
  n=v[i];i+=1
  if n==0:assert i==len(v);break
  a=v[i:i+n];i+=n;assert 2<=n<=100000 and len(a)==n and len(set(a))==n and min(a)==1 and max(a)==n;_,count=inversion_count(a);out.append(('Marcelo' if count%2 else 'Carlos')+f' {count}')
 return '\n'.join(out)+'\n'

def bars_possible(target,values):
 def subsets(a):
  sums={0}
  for v in a:sums|={s+v for s in sums}
  return sums
 mid=len(values)//2;left=subsets(values[:mid]);right=subsets(values[mid:]);return any(target-s in right for s in left)

def bars(data):
 v=list(map(int,data.split()));t=v[0];assert 0<=t<=50;i=1;out=[]
 for _ in range(t):
  target,p=v[i:i+2];i+=2;values=v[i:i+p];i+=p;assert 0<=target<=1000 and 1<=p<=20 and len(values)==p and min(values)>=0;out.append('YES' if bars_possible(target,values) else 'NO')
 assert i==len(v);return '\n'.join(out)+'\n' if out else ''
ORACLES={'uva-108-maximum-sum':maximum,'uva-11040-add-bricks-in-the-wall':wall,'uva-11078-open-credit-system':credit,'uva-11039-building-designing':buildings,'uva-11360-having-fun-with-matrices':matrices,'uva-11495-bubbles-and-buckets':bubbles,'uva-12455-bars':bars}
def repair_input(slug,data):
 if slug=='uva-108-maximum-sum':maximum(data,False);return data.rstrip()+'\n0\n'
 if slug=='uva-11360-having-fun-with-matrices':
  lines=data.splitlines();assert len(lines)==9 and lines[0]=='1' and lines[1]=='2' and lines[6]=='2' and lines[4:6]==lines[7:9]
  corrected='\n'.join(lines[:4]+lines[6:])+'\n';matrices(corrected);return corrected
 return None

def additions():
 rng=random.Random(108);grids=[[[-127]],[[127]],[[0]],[[-5,-4],[-3,-2]],[[127]*100 for _ in range(100)],[[-127]*100 for _ in range(100)]]
 grids += [[[rng.randrange(-127,128) for _ in range(n)] for _ in range(n)] for n in [2,3,4,5,8,16,30]]
 walls=[]
 for bottom in [[0]*9,[1]*9,[-1]*9,list(range(-4,5))]+[[rng.randrange(-1000,1001) for _ in range(9)] for _ in range(96)]:
  rows=[bottom]
  for _ in range(8):rows.append([a+b for a,b in zip(rows[-1],rows[-1][1:])])
  rows.reverse();walls.append(rows)
 scores=[[1,5,9],[149999,-149999],[-149999,149999],[0,0],list(range(-149999,-49999)),list(range(149999,49999,-1))]
 scores += [[rng.randrange(-149999,150000) for _ in range(rng.randrange(2,200))] for _ in range(19-len(scores))]
 floors=[[1],[-1],[1,2,3],[-1,-2,-3],[1,-2,3,-4,5],[-999999,999998]]
 for _ in range(20):
  sizes=rng.sample(range(1,300),rng.randrange(1,40));floors.append([v*rng.choice([-1,1]) for v in sizes])
 large=[v if v%2 else -v for v in range(1,500001)];rng.shuffle(large);floors.append(large)
 matrices_in=[]
 for case in range(49):
  n=1 if case==0 else rng.randrange(2,10);matrix=[[rng.randrange(10) for _ in range(n)] for _ in range(n)];commands=['dec','inc','transpose','transpose']
  for _ in range(45):
   op=rng.choice(['inc','dec','transpose']+(['row','col'] if n>1 else []))
   if op in ('row','col'):a,b=rng.sample(range(1,n+1),2);op+=f' {a} {b}'
   commands.append(op)
  matrices_in.append(str(n)+'\n'+'\n'.join(''.join(map(str,row)) for row in matrix)+'\n49\n'+'\n'.join(commands))
 permutations=[[1,2],[2,1],[3,1,2],list(range(1,100001)),list(range(100000,0,-1))]
 for n in [3,5,20,100,1000]:a=list(range(1,n+1));rng.shuffle(a);permutations.append(a)
 barcases=[(0,[1]),(4,[2]),(7,[2,3,5]),(1000,[50]*20),(999,[50]*20),(10,[20])]
 for _ in range(50-len(barcases)):barcases.append((rng.randrange(1001),[rng.randrange(1,1001) for _ in range(rng.randrange(1,21))]))
 return {'uva-108-maximum-sum':''.join(str(len(a))+'\n'+'\n'.join(' '.join(map(str,row)) for row in a)+'\n' for a in grids)+'0\n','uva-11040-add-bricks-in-the-wall':str(len(walls))+'\n'+''.join('\n'.join(' '.join(map(str,row[::2])) for row in a[::2])+'\n' for a in walls),'uva-11078-open-credit-system':str(len(scores))+'\n'+''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in scores),'uva-11039-building-designing':str(len(floors))+'\n'+''.join(str(len(a))+'\n'+'\n'.join(map(str,a))+'\n' for a in floors),'uva-11360-having-fun-with-matrices':'49\n'+'\n'.join(matrices_in)+'\n','uva-11495-bubbles-and-buckets':''.join(str(len(a))+' '+' '.join(map(str,a))+'\n' for a in permutations)+'0\n','uva-12455-bars':'50\n'+''.join(str(n)+'\n'+str(len(a))+'\n'+' '.join(map(str,a))+'\n' for n,a in barcases)}

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Restore input syntax only: append required maximum-sum sentinel if absent, or remove the exact duplicate matrix operations misplaced before the operation-count line. All actual matrices and declared operations are preserved.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all-negative rectangles, exact wall reconstruction, negative strict ordered differences, maximum distinct floors and inversion totals, operation composition and zero target subset','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
