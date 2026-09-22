"""Independent exponential-generating-function counts, active-only APSP insertion, and bounded digit DP."""
import argparse,hashlib,itertools,json,math,random
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
MARBLES='gpe-10642-marbles';GEONOSIS='uva-13211-geonosis';ADDMUL='uva-1101-addmul';MOD=1000000007
@lru_cache(None)
def factorials(n):
 f=[1]*(n+1);inv=[1]*(n+1)
 for i in range(1,n+1):f[i]=f[i-1]*i%MOD
 inv[n]=pow(f[n],MOD-2,MOD)
 for i in range(n,0,-1):inv[i-1]=inv[i]*i%MOD
 return f,inv
def convolution(a,b,limit):
 c=[0]*min(len(a)+len(b)-1,limit+1)
 for i,x in enumerate(a):
  for j,y in enumerate(b[:len(c)-i]):c[i+j]=(c[i+j]+x*y)%MOD
 return c
def marble_count(n,k,x):
 if n<k*x:return 0
 if k==1:return 1
 f,inv=factorials(n);slack=n-k*x
 if slack<=150:
  polynomial=inv[x:x+slack+1];product=[1]
  for _ in range(k):product=convolution(product,polynomial,slack)
  return f[n]*product[slack]%MOD
 # Inclusion-exclusion of boxes with fewer than x marbles, using their EGF.
 bad=inv[:x];product=[1];answer=0
 for j in range(k+1):
  term=sum(coefficient*pow(k-j,n-d,MOD)*inv[n-d] for d,coefficient in enumerate(product) if d<=n)%MOD
  answer=(answer+(-1)**j*math.comb(k,j)*term*f[n])%MOD
  if j<k:product=convolution(product,bad,n)
 return answer
def marbles(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=50 and len(a)==1+3*t;out=[]
 for i in range(t):
  n,k,x=a[1+3*i:4+3*i];assert 1<=x<=n<=100000 and 1<=k<=50;out.append(f'Case {i+1}: {marble_count(n,k,x)}')
 return '\n'.join(out)+'\n'
def geonosis_cost(direct,order):
 n=len(direct)
 # Certified directed potential metric: direct paths are already shortest;
 # each unordered pair has total 2*base regardless of its endpoint potentials.
 if n>1:
  pair=direct[0][1]+direct[1][0]
  if pair%2==0:
   base=pair//2;pot=[0]+[direct[0][v]-base for v in range(1,n)]
   if all(direct[u][v]==base+pot[v]-pot[u] for u in range(n) for v in range(n) if u!=v):return base*n*(n+1)*(n-1)//3
 distances=[[0]*n for _ in range(n)];active=[];answer=0
 for k in reversed(order):
  incoming={v:min([direct[v][k]]+[distances[v][u]+direct[u][k] for u in active]) for v in active}
  outgoing={v:min([direct[k][v]]+[direct[k][u]+distances[u][v] for u in active]) for v in active}
  for u in active:
   for v in active:distances[u][v]=min(distances[u][v],incoming[u]+outgoing[v])
  for v in active:distances[v][k]=incoming[v];distances[k][v]=outgoing[v]
  active.append(k);answer+=sum(distances[u][v] for u in active for v in active)
 return answer
def geonosis(data):
 values=list(map(int,data.split()));t=values[0];assert t>0;at=1;out=[]
 for _ in range(t):
  n=values[at];at+=1;assert 1<=n<=500;matrix=[]
  for u in range(n):
   row=values[at:at+n];at+=n;assert len(row)==n and all(v==0 if u==i else 1<=v<=10000 for i,v in enumerate(row));matrix.append(row)
  order=values[at:at+n];at+=n;assert sorted(order)==list(range(n));out.append(str(geonosis_cost(matrix,order)))
 assert at==len(values);return '\n'.join(out)+'\n'
def make_runs(digits):
 runs=[]
 def add(ch,count):
  if not count:return
  if runs and runs[-1][0]==ch:runs[-1]=(ch,runs[-1][1]+count)
  else:runs.append((ch,count))
 for i,d in enumerate(digits):
  if i:add('M',1)
  add('A',d)
 return tuple(runs)
def lex_less(a,b):
 i=j=0;ar=br=0
 while i<len(a) and j<len(b):
  ac,an=a[i];bc,bn=b[j]
  if ac!=bc:return ac<bc
  count=min(an-ar,bn-br);ar+=count;br+=count
  if ar==an:i+=1;ar=0
  if br==bn:j+=1;br=0
 return i==len(a) and j<len(b)
def bounded_digits(lower,upper,base,k):
 powers=[base**i for i in range(k,-1,-1)]
 def digits(v):
  result=[]
  for power in powers:result.append(v//power);v%=power
  return result
 lo,hi=digits(lower),digits(upper)
 @lru_cache(None)
 def solve(pos,low_tight,high_tight):
  if pos==k+1:return (0,())
  a=lo[pos] if low_tight else 0;b=hi[pos] if high_tight else (hi[0] if pos==0 else base-1)
  best=None
  for d in sorted({a,b,a+1}):
   if not a<=d<=b:continue
   tail=solve(pos+1,low_tight and d==lo[pos],high_tight and d==hi[pos]);candidate=(d+tail[0],(d,)+tail[1])
   if best is None or candidate[0]<best[0] or candidate[0]==best[0] and candidate[1]>best[1]:best=candidate
  return best
 return solve(0,True,True)
def best_program(a,m,p,q,r,s):
 power=1;k=0;best=None
 while q*power<=s:
  lower=max(0,(r-p*power+a-1)//a);upper=(s-q*power)//a
  if lower<=upper:
   count,digits=bounded_digits(lower,upper,m,k);runs=make_runs(digits);candidate=(count+k,runs)
   if best is None or candidate[0]<best[0] or candidate[0]==best[0] and lex_less(runs,best[1]):best=candidate
  if m==1:break
  power*=m;k+=1
 return None if best is None else best[1]
def addmul(data):
 values=list(map(int,data.split()));assert len(values)%6==0 and values[-6:]==[0]*6;out=[]
 for case,at in enumerate(range(0,len(values)-6,6),1):
  a,m,p,q,r,s=values[at:at+6];assert all(1<=v<=10**9 for v in [a,m,p,q,r,s]) and p<=q and r<=s
  runs=best_program(a,m,p,q,r,s);answer='impossible' if runs is None else 'empty' if not runs else ' '.join(str(n)+ch for ch,n in runs);out.append(f'Case {case}: {answer}')
 return '\n'.join(out)+'\n'
ORACLES={MARBLES:marbles,GEONOSIS:geonosis,ADDMUL:addmul}
def additions():
 rng=random.Random(13043)
 balls=[(4,2,2),(1,1,1),(2,3,1),(50,50,1),(100000,50,1),(100000,50,2),(100000,50,3),(100000,50,2000),(99999,50,2000),(99999,49,2040),(100000,1,100000),(100000,2,49999),(100000,2,1),(900,5,20)]
 balls.extend((n,k,x) for n,k,x in [(rng.randint(1,30),rng.randint(1,8),rng.randint(1,8)) for _ in range(30)] if x<=n)
 graphs=[]
 for n in [1,2,3,4,8,17,55]:
  matrix=[[0 if u==v else rng.randint(1,10000) for v in range(n)] for u in range(n)];order=list(range(n));rng.shuffle(order);graphs.append((matrix,order))
 n=500;pot=[(v*37)%999 for v in range(n)];matrix=[[0 if u==v else 5000+pot[v]-pot[u] for v in range(n)] for u in range(n)];order=list(range(n));rng.shuffle(order);graphs.append((matrix,order))
 programs=[(1,2,2,3,10,20),(1,3,2,3,22,33),(3,2,2,3,4,5),(5,3,2,3,2,3),(1,1,1,1,10**9,10**9),(1,2,1,1,10**9,10**9),(10**9,10**9,1,1,10**9,10**9),(17,1,2,3,100,101),(1,2,9,10,1,8),(2,3,1,2,5,18)]
 for _ in range(400):
  p=rng.randint(1,40);q=rng.randint(p,50);r=rng.randint(1,90);s=rng.randint(r,100);programs.append((rng.randint(1,20),rng.randint(1,10),p,q,r,s))
 return {MARBLES:[str(len(balls))+'\n'+''.join(f'{n} {k} {x}\n' for n,k,x in balls), '50\n'+''.join(f'{100000-i} 50 {2+i%2}\n' for i in range(50))],GEONOSIS:[str(len(graphs))+'\n'+''.join(str(len(matrix))+'\n'+''.join(' '.join(map(str,row))+'\n' for row in matrix)+' '.join(map(str,order))+'\n' for matrix,order in graphs)],ADDMUL:[''.join(' '.join(map(str,row))+'\n' for row in programs)+'0 0 0 0 0 0\n', '1 1 1 1 1000000000 1000000000\n0 0 0 0 0 0\n']}
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
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'distinguishable labelled-ball allocations;directed500-tower ordered deletion;bounded affine programs and billion-length RLE','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
