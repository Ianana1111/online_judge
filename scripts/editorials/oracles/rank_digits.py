"""Independent prime-root counting, timestamp rank, segment minimax edits, digit DP, Manhattan costs and descent inclusion-exclusion."""
import argparse,array,bisect,collections,hashlib,itertools,json,math,random
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];MOD=1000000007
@lru_cache(None)
def prime_prefix():
 bound=1000000;least=array.array('I',[0])*(bound+1);pi=array.array('I',[0])*(bound+1);primes=[]
 for i in range(2,bound+1):
  if least[i]==0:least[i]=i;primes.append(i)
  for p in primes:
   if p>least[i] or p*i>bound:break
   least[p*i]=p
  pi[i]=len(primes)
 return pi
def integer_root(n,e):
 low=0;high=1<<((n.bit_length()+e-1)//e)
 while low<high:
  mid=(low+high+1)//2
  if mid**e<=n:low=mid
  else:high=mid-1
 return low
def almost_count(low,high):
 pi=prime_prefix();return sum(pi[integer_root(high,e)]-pi[integer_root(low-1,e)] for e in range(2,high.bit_length()))
def almost(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=600 and len(a)==1+2*t;out=[]
 for i in range(t):
  low,high=a[1+2*i:3+2*i];assert 0<low<=high<10**12;out.append(str(almost_count(low,high)))
 return '\n'.join(out)+'\n'
def schedule(queries,k):
 low=1;high=min(p for q,p in queries)*k
 while low<high:
  mid=(low+high)//2
  if sum(mid//p for q,p in queries)>=k:high=mid
  else:low=mid+1
 events=sorted((time,q) for q,p in queries for time in range(p,low+1,p));assert len(events)>=k;return [q for time,q in events[:k]]
def argus(data):
 lines=data.splitlines();end=lines.index('#');queries=[]
 for line in lines[:end]:
  word,q,p=line.split();q,p=int(q),int(p);assert word=='Register' and 1<=q<=3000 and 1<=p<=3000;queries.append((q,p))
 assert 1<=len(queries)<=1000 and len({q for q,p in queries})==len(queries);tail=' '.join(lines[end+1:]).split();assert len(tail)==1;k=int(tail[0]);assert 1<=k<=10000;return ''.join(str(q)+'\n' for q in schedule(queries,k))
def approximate_period(y,x):
 m=len(y);n=len(x);best=[m]*(n+1);best[0]=0
 for start in range(n):
  previous=list(range(m+1))
  for end in range(start+1,min(n,start+2*m)+1):
   row=[end-start];char=x[end-1]
   for j in range(1,m+1):row.append(min(previous[j]+1,row[-1]+1,previous[j-1]+(char!=y[j-1])))
   best[end]=min(best[end],max(best[start],row[m]));previous=row
 return best[n]
def period(data):
 a=data.split();t=int(a[0]);assert t>=1 and len(a)==1+2*t;out=[]
 for i in range(t):
  y,x=a[1+2*i:3+2*i];assert 1<=len(y)<=50 and 1<=len(x)<=5000 and set(y+x)<=set('abcdefghijklmnopqrstuvwxyz');out.append(str(approximate_period(y,x)))
 return '\n'.join(out)+'\n'
def digit_counts(n):
 if n<=0:return (0,)*10
 digits=list(map(int,str(n)))
 @lru_cache(None)
 def visit(at,tight,started):
  if at==len(digits):return (int(started),(0,)*10)
  total=0;counts=[0]*10;limit=digits[at] if tight else 9
  for d in range(limit+1):
   active=started or d!=0;ways,sub=visit(at+1,tight and d==limit,active);total+=ways
   for k in range(10):counts[k]+=sub[k]
   if active:counts[d]+=ways
  return total,tuple(counts)
 return visit(0,True,False)[1]
def counting(data):
 a=list(map(int,data.split()));assert len(a)%2==0 and a[-2:]==[0,0] and (len(a)//2)-1<=500;out=[]
 for i in range(0,len(a)-2,2):
  lo,hi=sorted(a[i:i+2]);assert 0<lo<=hi<100000000;before=digit_counts(lo-1);after=digit_counts(hi);out.append(' '.join(str(b-a) for a,b in zip(before,after)))
 return '\n'.join(out)+'\n'
def cheapest_coordinate(values,bound):
 counts=collections.Counter(values);cost=sum(v-1 for v in values);best=(cost,1);left=counts[1]
 for p in range(2,bound+1):
  cost+=left-(len(values)-left);best=min(best,(cost,p));left+=counts[p]
 return best[1]
def lunch(data):
 a=list(map(int,data.split()));t=a[0];assert t>0;i=1;out=[]
 for _ in range(t):
  s,b,f=a[i:i+3];i+=3;assert 1<=s<=1000 and 1<=b<=1000 and 1<=f<=50000;points=list(zip(a[i:i+2*f:2],a[i+1:i+2*f:2]));i+=2*f;assert len(points)==f and all(1<=x<=s and 1<=y<=b for x,y in points);out.append(f'(Street: {cheapest_coordinate([x for x,y in points],s)}, Avenue: {cheapest_coordinate([y for x,y in points],b)})')
 assert i==len(a);return '\n'.join(out)+'\n'
@lru_cache(None)
def factorials():
 f=[1]*1002
 for i in range(1,len(f)):f[i]=f[i-1]*i%MOD
 inverse=[1]*len(f);inverse[-1]=pow(f[-1],MOD-2,MOD)
 for i in range(len(f)-1,0,-1):inverse[i-1]=inverse[i]*i%MOD
 return f,inverse
def signature_count(s):
 # Inclusion-exclusion on required descents; I edges remain joined into ascending blocks.
 f,inv=factorials();answer=f[len(s)+1]
 for segment in s.split('?'):
  n=len(segment)+1;prefix=[0]
  for ch in segment:prefix.append(prefix[-1]+(ch=='D'))
  weighted=[0]*(n+1);weighted[0]=1
  for end in range(1,n+1):
   value=0
   for start in range(end):
    if start and segment[start-1]!='D':continue
    term=weighted[start]*inv[end-start]
    value+=-term if (prefix[end-1]-prefix[start])%2 else term
   weighted[end]=value%MOD
  answer=answer*weighted[n]%MOD
 return answer
def number_string(data):
 lines=data.splitlines();assert lines and all(1<=len(s)<=1000 and set(s)<=set('ID?') for s in lines);return ''.join(str(signature_count(s))+'\n' for s in lines)
ORACLES={'uva-10539-almost-prime-numbers':almost,'uva-1203-argus':argus,'uva-1371-period':period,'uva-1640-the-counting-problem':counting,'uva-855-lunch-in-grid-city':lunch,'uva-1650-number-string':number_string}
def additions():
 rng=random.Random(1371);intervals=[(1,1),(1,10**12-1),(10**12-100,10**12-1)]
 for p in [2,3,5,7,11,97,997,999983]:
  power=p*p
  while power<10**12:
   intervals.extend([(power,power),(power-1,power-1),(power+1,min(power+5,10**12-1))]);power*=p
 intervals=intervals[:600]
 ids=rng.sample(range(1,3001),1000);queries=[([(3000,3000)],10000),([(q,3000) for q in reversed(ids)],10000),([(q,rng.randint(1,3000)) for q in ids],10000),([(2,2),(1,3),(3,6)],1000)]
 periods=[('a','a'*5000),('b','a'*5000),('ab'*25,'ab'*2500),('z'*50,'a'),('abc','abcdabcabb'),('ab','aab'),('a','b'),('abc','acabc')]
 periods.append((''.join(rng.choice('abc') for _ in range(50)),''.join(rng.choice('abc') for _ in range(5000))))
 for _ in range(20):periods.append((''.join(rng.choice('abc') for _ in range(rng.randint(1,12))),''.join(rng.choice('abc') for _ in range(rng.randint(1,70)))))
 ranges=[(1,1),(1,99999999),(99999999,99999999),(1,10),(10,1)]
 for power in [10**i for i in range(1,8)]:ranges.extend([(power-1,power+1),(power,power),(power+7,power-7)])
 for _ in range(200):ranges.append((rng.randint(1,99999999),rng.randint(1,99999999)))
 grids=[(1,1,[(1,1)]),(1000,1000,[(1,1000),(1000,1)]),(1000,1000,[(1,1)]*25000+[(1000,1000)]*25000)]
 for _ in range(35):
  s,b=rng.randint(1,50),rng.randint(1,50);grids.append((s,b,[(rng.randint(1,s),rng.randint(1,b)) for _ in range(rng.randint(1,70))]))
 signatures=[''.join(s) for n in range(1,5) for s in itertools.product('ID?',repeat=n)]+['I'*1000,'D'*1000,'?'*1000,'ID'*500,'I'*499+'D'+'I'*500,''.join(rng.choice('ID?') for _ in range(1000))]
 return {'uva-10539-almost-prime-numbers':[str(len(intervals))+'\n'+''.join(f'{a} {b}\n' for a,b in intervals)],'uva-1203-argus':[''.join(f'Register {q} {p}\n' for q,p in pairs)+f'#\n{k}\n' for pairs,k in queries],'uva-1371-period':[str(len(periods))+'\n'+''.join(y+'\n'+x+'\n' for y,x in periods)],'uva-1640-the-counting-problem':[''.join(f'{a} {b}\n' for a,b in ranges)+'0 0\n'],'uva-855-lunch-in-grid-city':[str(len(grids))+'\n'+''.join(f'{s} {a} {len(points)}\n'+''.join(f'{x} {y}\n' for x,y in points) for s,a,points in grids)],'uva-1650-number-string':['\n'.join(signatures)+'\n']}
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
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'prime power boundaries below10^12,1000periodic queries/10000returns,50x5000approximate period,leading-zero digit boundaries,50000friends and1000signature constraints','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
