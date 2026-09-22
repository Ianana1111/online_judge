"""Independent Fenwick LCS, forbidden-fixed-point recurrence, calendar anniversaries, decimal subtraction, matrix Fibonacci and signed wall differences."""
import argparse,datetime,hashlib,itertools,json,math,random
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PRINCE='uva-10635-the-art-gallery';ARRANGE='uva-11481-square-sums';AGE='uva-11219-basic-wall-maze';HASHMAT='uva-10055-hashmat';BEE='uva-11000-the-four-in-one-stadium';MARIO='uva-11764-cricket-field';MOD=1000000007
TITLE_CORRECTIONS={PRINCE:'10635 - Prince and Princess',ARRANGE:'11481 - Arrange the Numbers',AGE:'11219 - How old are you?',BEE:'11000 - Bee',MARIO:'11764 - Jumping Mario'}
def common_route(first,second):
 position={value:i+1 for i,value in enumerate(first)};tree=[0]*(len(first)+1);answer=0
 for value in second:
  if value not in position:continue
  at=position[value];j=at-1;best=0
  while j:best=max(best,tree[j]);j-=j&-j
  best+=1;answer=max(answer,best)
  while at<len(tree):tree[at]=max(tree[at],best);at+=at&-at
 return answer
def read_routes(data,strict=True):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=10;i=1;cases=[]
 for _ in range(t):
  n,p,q=a[i:i+3];i+=3;first=a[i:i+p+1];i+=p+1;second=a[i:i+q+1];i+=q+1;assert 2<=n<=250 and 1<=p<n*n and 1<=q<n*n
  for row in [first,second]:
   assert len(set(row))==len(row) and all(1<=v<=n*n for v in row)
   if strict:assert row[0]==1 and row[-1]==n*n
  assert len(first)==p+1 and len(second)==q+1;cases.append((n,first,second))
 assert i==len(a);return cases
def prince(data):return ''.join(f'Case {i}: {common_route(a,b)}\n' for i,(n,a,b) in enumerate(read_routes(data),1))
@lru_cache(None)
def forbidden_table():
 rows=[[1]];factorial=1
 for n in range(1,1001):
  factorial=factorial*n%MOD;row=[factorial]
  for m in range(1,n+1):row.append((row[-1]-rows[n-1][m-1])%MOD)
  rows.append(row)
 return rows
def arrangements(n,m,k):return math.comb(m,k)*forbidden_table()[n-k][m-k]%MOD
def arrange(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=1000 and len(a)==3*t+1;out=[]
 for i in range(t):
  n,m,k=a[1+3*i:4+3*i];assert 1<=n<=1000 and 0<=k<=m<=n;out.append(f'Case {i+1}: {arrangements(n,m,k)}')
 return '\n'.join(out)+'\n'
def age_value(current,birth):
 if birth>current:return 'Invalid birth date'
 years=0
 for age in range(1,132):
  year=birth.year+age
  if year>9999:break
  try:anniversary=birth.replace(year=year)
  except ValueError:anniversary=datetime.date(year,3,1)
  if anniversary>current:break
  years=age
 return 'Check birth date' if years>130 else str(years)
def ages(data):
 words=data.split();t=int(words[0]);assert 1<=t<=200 and len(words)==2*t+1;out=[]
 for i in range(t):
  dates=[]
  for text in words[1+2*i:3+2*i]:
   d,m,y=map(int,text.split('/'));dates.append(datetime.date(y,m,d))
  out.append(f'Case #{i+1}: {age_value(*dates)}')
 return '\n'.join(out)+'\n'
def decimal_difference(a,b):
 if (len(a),a)<(len(b),b):a,b=b,a
 b=b.zfill(len(a));out=[];borrow=0
 for x,y in zip(a[::-1],b[::-1]):
  difference=int(x)-int(y)-borrow;borrow=int(difference<0);out.append(str(difference%10))
 assert not borrow;return ''.join(out[::-1]).lstrip('0') or '0'
def hashmat(data):
 a=data.split();assert len(a)%2==0;out=[]
 for left,right in zip(a[::2],a[1::2]):
  assert 0<=int(left)<=2**32 and 0<=int(right)<=2**32;out.append(decimal_difference(str(int(left)),str(int(right))))
 return '\n'.join(out)+'\n'
def fibonacci(n):
 def mul(a,b):return tuple(sum(a[2*r+k]*b[2*k+c] for k in range(2)) for r in range(2) for c in range(2))
 answer=(1,0,0,1);base=(1,1,1,0)
 while n:
  if n%2:answer=mul(answer,base)
  base=mul(base,base);n//=2
 return answer[1]
def bee(data):
 values=list(map(int,data.split()));assert values[-1]==-1;out=[]
 for n in values[:-1]:
  assert 0<=n<=44;male=fibonacci(n+2)-1;total=fibonacci(n+3)-1;assert male<=2**32 and total<=2**32;out.append(f'{male} {total}')
 return '\n'.join(out)+'\n'
def mario(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<30;i=1;out=[]
 for case in range(1,t+1):
  n=a[i];i+=1;row=a[i:i+n];i+=n;assert 1<=n<50 and len(row)==n and all(1<=v<=10 for v in row);differences=[b-a for a,b in zip(row,row[1:])];out.append(f'Case {case}: {sum(d>0 for d in differences)} {sum(d<0 for d in differences)}')
 assert i==len(a);return '\n'.join(out)+'\n'
ORACLES={PRINCE:prince,ARRANGE:arrange,AGE:ages,HASHMAT:hashmat,BEE:bee,MARIO:mario}
def additions():
 rng=random.Random(11481);routes=[]
 for n in [2,3,10,250]:
  first=list(range(2,n*n));second=first[:];rng.shuffle(first);rng.shuffle(second);routes.append((n,[1]+first+[n*n],[1]+second+[n*n]))
 routes.extend([(250,list(range(1,62501)),[1]+list(range(62499,1,-1))+[62500]),(250,[1,62500],list(range(1,62501)))])
 triples=[(n,m,k) for n in range(1,9) for m in range(n+1) for k in range(m+1)]
 triples.extend((1000,m,k) for m in [0,1,2,499,999,1000] for k in sorted({0,m,m//2}));assert len(triples)<=1000
 dates=[('28/02/2005','29/02/2004'),('01/03/2005','29/02/2004'),('29/02/2004','29/02/2004'),('31/12/2020','01/01/2021'),('01/01/2020','01/01/1890'),('31/12/2020','01/01/1889'),('01/01/2020','31/12/1889'),('31/12/9999','01/01/9999'),('01/01/0001','01/01/0001')]
 for _ in range(100):
  first=datetime.date.fromordinal(rng.randint(1,3652059));second=datetime.date.fromordinal(rng.randint(1,3652059));fmt=lambda d:f'{d.day:02d}/{d.month:02d}/{d.year:04d}';dates.append((fmt(first),fmt(second)))
 pairs=[(0,0),(0,2**32),(2**32,0),(2**32,2**32),(2**31,2**31-1),(2**32-1,1),(1,2**32-1)];pairs.extend((rng.randrange(2**32+1),rng.randrange(2**32+1)) for _ in range(150))
 walls=[[1],[10]*49,[1,10]*24+[1],list(range(1,11)),list(range(10,0,-1))];walls.extend([rng.randint(1,10) for _ in range(49)] for _ in range(24));assert len(walls)==29
 return {PRINCE:[str(len(routes))+'\n'+''.join(f'{n} {len(a)-1} {len(b)-1}\n'+' '.join(map(str,a))+'\n'+' '.join(map(str,b))+'\n' for n,a,b in routes)],ARRANGE:[str(len(triples))+'\n'+''.join(f'{n} {m} {k}\n' for n,m,k in triples)],AGE:[str(len(dates))+'\n\n'+'\n\n'.join(a+'\n'+b for a,b in dates)+'\n'],HASHMAT:[''.join(f'{a} {b}\n' for a,b in pairs)],BEE:['\n'.join(map(str,list(range(45))+[44,0,1]))+'\n-1\n'],MARIO:[str(len(walls))+'\n'+''.join(str(len(row))+'\n'+' '.join(map(str,row))+'\n' for row in walls)]}
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
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'full62500-square routes,allsmallfixedpointcounts,n1000,leapbirthdays/130years,unsigned32bitinclusivebound,allbee44years andlevelwalljumps','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
