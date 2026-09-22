"""Independent interval sweeps, pair enumeration, exact roots and event-time counting."""
import argparse,hashlib,json,math,random
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def expert_answers(makers,queries):
 events=[]
 for i,(_,lo,hi) in enumerate(makers):events.extend([(lo,0,i),(hi+1,1,i)])
 for i,p in enumerate(queries):events.append((p,2,i))
 active=set();answers=['']*len(queries)
 for _,kind,i in sorted(events):
  if kind==0:active.add(i)
  elif kind==1:active.remove(i)
  else:answers[i]=makers[next(iter(active))][0] if len(active)==1 else 'UNDETERMINED'
 return answers

def expert(data):
 words=data.split();t=int(words[0]);assert 1<=t<=10;i=1;out=[]
 for _ in range(t):
  d=int(words[i]);i+=1;assert 1<=d<10000;makers=[]
  for _ in range(d):
   name=words[i];lo,hi=map(int,words[i+1:i+3]);i+=3;assert 1<=len(name)<=20 and 0<lo<hi<1000000;makers.append((name,lo,hi))
  q=int(words[i]);i+=1;assert 1<=q<1000;queries=list(map(int,words[i:i+q]));i+=q;assert len(queries)==q and all(0<p<1000000 for p in queries)
  out.append('\n'.join(expert_answers(makers,queries)))
 assert i==len(words)
 return '\n\n'.join(out)+'\n'
def sales(data):
 values=list(map(int,data.split()));t=values[0];assert t>0;i=1;out=[]
 for _ in range(t):
  n=values[i];i+=1;assert 2<=n<=1000;a=values[i:i+n];i+=n;assert len(a)==n and all(1<=x<=5000 for x in a)
  out.append(str(sum(a[j]<=a[k] for j in range(n) for k in range(j+1,n))))
 assert i==len(values)
 return '\n'.join(out)+'\n'
def book_answer(s):
 n=(math.isqrt(8*s+1)-1)//2+1
 return n*(n+1)//2-s,n

def book(data):
 values=list(map(int,data.split()));assert values[-1]==0;out=[]
 for s in values[:-1]:
  assert 1<=s<=10**8;x,n=book_answer(s);assert 1<=x<=n;out.append(f'{x} {n}')
 return '\n'.join(out)+'\n'
def strategy(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  j,r=values[i:i+2];i+=2
  if j==r==0:break
  assert 1<=j<=500 and 1<=r<=500;a=values[i:i+j*r];i+=j*r;assert len(a)==j*r and all(0<=x<=100 for x in a)
  out.append(str(max((sum(a[player::j]),player+1) for player in range(j))[1]))
 assert i==len(values)
 return '\n'.join(out)+'\n'
def pixel(data):
 words=data.split();t=int(words[0]);assert t>=1 and len(words)==1+4*t;out=[]
 for i in range(t):
  stock=list(map(int,words[1+4*i:4+4*i]));picture=words[4+4*i];assert min(stock)>=0 and 1<=len(picture)<=100000 and set(picture)<=set('MYCRBGVW')
  counts=Counter(picture);need=[sum(counts[ch] for ch in colors) for colors in ['MRBV','YRGB','CBGV']];left=[s-w for s,w in zip(stock,need)]
  out.append('YES '+' '.join(map(str,left)) if min(left)>=0 else 'NO')
 return '\n'.join(out)+'\n'
def medication_events(names,periods,k):
 low=1;high=min(periods)*k
 while low<high:
  mid=(low+high)//2
  if sum(mid//p for p in periods)>=k:high=mid
  else:low=mid+1
 events=sorted((time,i) for i,p in enumerate(periods) for time in range(p,low+1,p))[:k]
 return [(time,names[i]) for time,i in events]

def medication(data):
 words=data.split();t=int(words[0]);assert 1<=t<=5;i=1;out=[]
 for _ in range(t):
  n,k=map(int,words[i:i+2]);i+=2;assert 1<=n<=3000 and 1<=k<=10000;names=[];periods=[]
  for _ in range(n):
   name,p=words[i],int(words[i+1]);i+=2;assert 1<=len(name)<=15 and 1<=p<=3000;names.append(name);periods.append(p)
  out.extend(f'{time} {name}' for time,name in medication_events(names,periods,k))
 assert i==len(words)
 return '\n'.join(out)+'\n'
def chain_steps(n):
 seen=set();steps=[]
 while n not in seen:
  seen.add(n);digits=[0]*10;rest=n
  if rest==0:digits[0]=1
  while rest:digits[rest%10]+=1;rest//=10
  lo=hi=0
  for digit in range(10):
   for _ in range(digits[digit]):lo=lo*10+digit
  for digit in range(9,-1,-1):
   for _ in range(digits[digit]):hi=hi*10+digit
  n=hi-lo;steps.append((hi,lo,n))
  assert len(steps)<=1000
 return steps

def chains(data):
 values=list(map(int,data.split()));assert values[-1]==0 and len(values)<=5001;out=[]
 for n in values[:-1]:
  assert 0<n<10**9;steps=chain_steps(n);out.append(f'Original number was {n}\n'+''.join(f'{hi} - {lo} = {value}\n' for hi,lo,value in steps)+f'Chain length {len(steps)}\n\n')
 return ''.join(out)
def parity_result(matrix):
 rows=[sum(bit<<j for j,bit in enumerate(row)) for row in matrix];odd=[i for i,row in enumerate(rows) if bin(row).count('1')%2];columns=0
 for row in rows:columns^=row
 if not odd and columns==0:return 'OK'
 if len(odd)==1 and columns and columns&(columns-1)==0:return f'Change bit ({odd[0]+1},{columns.bit_length()})'
 return 'Corrupt'
def parity(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n=values[i];i+=1
  if n==0:break
  assert 1<=n<100;a=values[i:i+n*n];i+=n*n;assert len(a)==n*n and set(a)<=set([0,1]);out.append(parity_result([a[j:j+n] for j in range(0,n*n,n)]))
 assert i==len(values)
 return '\n'.join(out)+'\n'
ORACLES={'uva-1237-expert-enough':expert,'uva-1260-sales':sales,'uva-12908-the-book-thief':book,'uva-12959-strategy-game':strategy,'uva-13171-pixel-art':pixel,'uva-13190-rockabye-tobby':medication,'uva-263-number-chains':chains,'uva-541-error-correction':parity}
def split_medication_input(data):
 words=data.split();total=int(words[0]);i=1;cases=[]
 for _ in range(total):
  start=i;n=int(words[i]);i+=2+2*n;cases.append(words[start:i])
 assert i==len(words)
 return [str(len(cases[j:j+5]))+'\n'+'\n'.join(' '.join(case) for case in cases[j:j+5])+'\n' for j in range(0,total,5)]
def repair_input(slug,data):
 if slug=='uva-13190-rockabye-tobby' and hashlib.sha256(data.encode()).hexdigest()=='8eabbb317dcf9c7fa2affbf54bf75caf8e93f06e6be7ec1b41987c851a2ce722':return split_medication_input(data)[0]
 return None

def additions():
 rng=random.Random(1237541)
 databases=[([('A',10,20),('B',20,30)],[1,9,10,19,20,21,30,31]),([(f'M{i}',2*i+1,2*i+2) for i in range(9999)],list(range(1,1000)))]
 for _ in range(5):
  makers=[]
  for i in range(100):
   lo=rng.randrange(1,999999);hi=rng.randrange(lo+1,1000000);makers.append((f'M{i}',lo,hi))
  queries=[p for _,lo,hi in makers for p in [lo,hi]]+[rng.randrange(1,1000000) for _ in range(100)];databases.append((makers,queries))
 amounts=[[1,1],[2,1],[1,2],[5000]*1000,list(range(1,1001)),list(range(1000,0,-1))]+[[rng.randrange(1,5001) for _ in range(rng.randrange(2,100))] for _ in range(50)]
 sums=set(range(1,300));sums.add(10**8)
 for n in range(2,14142,137):sums.update(s for s in [n*(n+1)//2-1,n*(n+1)//2,n*(n+1)//2+1] if 1<=s<=10**8)
 games=[(3,2,[1,2,3,4,3,2]),(1,1,[0]),(500,500,[0]*250000),(2,2,[100,0,0,99])]
 games += [(j,r,[rng.randrange(101) for _ in range(j*r)]) for j,r in [(3,5),(20,10),(50,50)]]
 paints=[(1,1,1,'MCY'),(1,1,1,'RV'),(0,0,0,'W'*100000),(100000,100000,100000,'B'*100000),(0,0,0,'G'),(0,0,0,'B')]
 for ch in 'MYCRBGVW':
  for stock in [(0,0,0),(1,1,1),(1,1,0),(0,1,1),(1,0,1)]:paints.append((*stock,ch))
 drugs=[(['Z','A'],[2,3],10),(['solo'],[3000],10000),([f'M{i}' for i in range(3000)],[3000]*3000,10000),([f'X{i}' for i in range(200)],[rng.randrange(1,3001) for _ in range(200)],10000)]
 numbers=[6174,495,1000,10,1,9,999999999,100000000,1234,123456789]+rng.sample(range(1,10**9),100)
 matrices=[[[0]],[[1]],[[1,1],[0,0]],[[1,0],[0,1]],[[0]*99 for _ in range(99)]]
 for n in range(2,20):
  m=[[rng.randrange(2) for _ in range(n-1)]+[0] for _ in range(n-1)]+[[0]*n]
  for row in m[:-1]:row[-1]=sum(row)%2
  for j in range(n):m[-1][j]=sum(m[i][j] for i in range(n-1))%2
  matrices.append([row[:] for row in m]);m[n//2][n//3]^=1;matrices.append(m)
 return {'uva-1237-expert-enough':str(len(databases))+'\n'+''.join(str(len(m))+'\n'+''.join(f'{name} {lo} {hi}\n' for name,lo,hi in m)+str(len(q))+'\n'+'\n'.join(map(str,q))+'\n' for m,q in databases),
 'uva-1260-sales':str(len(amounts))+'\n'+''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in amounts),
 'uva-12908-the-book-thief':'\n'.join(map(str,sorted(sums)+[0]))+'\n',
 'uva-12959-strategy-game':''.join(f'{j} {r}\n'+' '.join(map(str,a))+'\n' for j,r,a in games)+'0 0\n',
 'uva-13171-pixel-art':str(len(paints))+'\n'+''.join(f'{m} {y} {c}\n{s}\n' for m,y,c,s in paints),
 'uva-13190-rockabye-tobby':str(len(drugs))+'\n'+''.join(f'{len(names)} {k}\n'+''.join(f'{name} {p}\n' for name,p in zip(names,periods)) for names,periods,k in drugs),
 'uva-263-number-chains':'\n'.join(map(str,numbers+[0]))+'\n',
 'uva-541-error-correction':''.join(str(len(m))+'\n'+''.join(' '.join(map(str,row))+'\n' for row in m) for m in matrices)+'0\n'}

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
                    if corrected is not None:
                        chunks=split_medication_input(c['input'])
                        assert normalize(''.join(oracle(chunk) for chunk in chunks))==normalize(c['output'])
                        for chunk in chunks[1:]:
                            if not any(old['input']==chunk for old in p['testCases']):row['proposedAdditions'].append({'label':'Preserve original medication scenarios in a separate input obeying T<=5','input':chunk,'output':oracle(chunk)})
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: split the original fifteen medication cases into three input files of five, preserving every medication, requested event and original output line. Each file now obeys T<=5.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'closed interval overlap, equal values, exact triangular sums, latest-player ties, mixed paint budgets, simultaneous scheduling, initial cycles and parity syndromes','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
