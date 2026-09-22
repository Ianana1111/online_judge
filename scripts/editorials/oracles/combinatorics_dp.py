"""Independent absolute-cost sweep, Lucas recurrence, big integers and occupancy/state models."""
import argparse,hashlib,json,random,math,itertools
from collections import deque
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def median_answers(values):
 count=[0]*65536
 for x in values:count[x]+=1
 cost=sum(values);best=cost;first=0;choices=1;present=count[0];at_or_below=count[0]
 for candidate in range(1,65536):
  cost+=2*at_or_below-len(values);at_or_below+=count[candidate]
  if cost<best:best=cost;first=candidate;choices=1;present=count[candidate]
  elif cost==best:choices+=1;present+=count[candidate]
 return first,present,choices

def medians(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n=a[i];i+=1;assert 1<=n<=1000000;v=a[i:i+n];i+=n;assert len(v)==n and all(0<=x<65536 for x in v);out.append(' '.join(map(str,median_answers(v))))
 return '\n'.join(out)+'\n'

def lucas_two(n,k):
 if k==0:return 1
 if n==0 or k>n:return 0
 if k%2>n%2:return 0
 return lucas_two(n//2,k//2)

def stirling_parity(n,m):return lucas_two(n-m//2-1,(m-1)//2)
# Both branches equal binomial(n-floor(m/2)-1, floor((m-1)/2)).
def stirlings(data):
 a=list(map(int,data.split()));t=a[0];assert t>=1 and len(a)==1+2*t;out=[]
 for n,m in zip(a[1::2],a[2::2]):assert 1<=m<=n<=10**9;out.append(str(stirling_parity(n,m)))
 return '\n\n'.join(out)+'\n'

def huge(data):
 a=data.split();t=int(a[0]);assert 1<=t<=2000;i=1;out=[]
 for _ in range(t):
  number=a[i];i+=1;size=int(a[i]);i+=1;divisors=list(map(int,a[i:i+size]));i+=size
  assert number.isascii() and number.isdigit() and 0<=int(number)<=10**1000 and 0<=size<=12 and len(divisors)==size and len(set(divisors))==size and all(1<=x<=12 for x in divisors)
  divisor=1
  for value in divisors:divisor=math.lcm(divisor,value)
  out.append(number+' - '+('Wonderful.' if int(number)%divisor==0 else 'Simple.'))
 assert i==len(a);return '\n'.join(out)+'\n'

def queen_attacks(m,n):
 small=min(m,n)-1
 diagonals=4*(small*m*n-(m+n)*small*(small+1)//2+small*(small+1)*(2*small+1)//6)
 return m*n*(m+n-2)+diagonals

def queens(data):
 a=list(map(int,data.split()));assert len(a)%2==0 and a[-2:]==[0,0] and len(a)//2<=5000;out=[]
 for m,n in zip(a[:-2:2],a[1:-2:2]):assert 1<=m<=1000000 and 1<=n<=1000000;answer=queen_attacks(m,n);assert answer<2**63;out.append(str(answer))
 return '\n'.join(out)+'\n'

def palindrome_groups(s):
 n=len(s);edges=[[] for _ in range(n+1)]
 for center in range(n):
  for left,right in [(center,center),(center,center+1)]:
   while left>=0 and right<n and s[left]==s[right]:edges[left].append(right+1);left-=1;right+=1
 distance=[-1]*(n+1);distance[0]=0;queue=deque([0])
 while queue:
  start=queue.popleft()
  if start==n:return distance[start]
  for end in edges[start]:
   if distance[end]<0:distance[end]=distance[start]+1;queue.append(end)
 raise AssertionError('single characters always provide a partition')

def palindromes(data):
 a=data.split();t=int(a[0]);assert t>=0 and len(a)==t+1 and all(1<=len(s)<=1000 and set(s)<=set('abcdefghijklmnopqrstuvwxyz') for s in a[1:]);return ''.join(str(palindrome_groups(s))+'\n' for s in a[1:])

@lru_cache(None)
def placements(m,n,k):
 if k>m*n:return 0
 dp=[[0]*16 for _ in range(k+1)];dp[0][0]=1;done=0
 for y in range(m):
  for x in range(n):
   boundary=(1 if y==0 else 0)|(2 if y==m-1 else 0)|(4 if x==0 else 0)|(8 if x==n-1 else 0);done+=1
   for used in range(min(k,done),0,-1):
    old,new=dp[used-1],dp[used]
    for mask in range(16):new[mask|boundary]=(new[mask|boundary]+old[mask])%1000007
 return dp[k][15]

def cheerleaders(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=50 and len(a)==1+3*t;out=[]
 for m,n,k in zip(a[1::3],a[2::3],a[3::3]):assert 2<=m<=20 and 2<=n<=20 and 0<=k<=500;out.append(f'Case {len(out)+1}: {placements(m,n,k)}')
 return '\n'.join(out)+'\n'

@lru_cache(None)
def balanced_binary(n,k):
 if n%2 or k==0:return 0
 # Choose the positions of the remaining one bits, adding fixed modular weights.
 dp=[[0]*k for _ in range(n//2)];dp[0][0]=1
 for position in range(n-1):
  weight=pow(2,position,k)
  for ones in range(min(n//2-1,position+1),0,-1):
   for residue,value in enumerate(dp[ones-1]):dp[ones][(residue+weight)%k]+=value
 return dp[n//2-1][(-pow(2,n-1,k))%k]

def binarynumbers(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=100 and len(a)==1+2*t;out=[]
 for n,k in zip(a[1::2],a[2::2]):assert 1<=n<=64 and 0<=k<=100;out.append(f'Case {len(out)+1}: {balanced_binary(n,k)}')
 return '\n'.join(out)+'\n'

def tower_height(blocks):
 orientations=set(tuple(v) for block in blocks for v in itertools.permutations(block))
 @lru_cache(None)
 def above(width,depth):return max([0]+[height+above(x,y) for x,y,height in orientations if x<width and y<depth])
 bound=max(max(b) for b in blocks)+1;return above(bound,bound)

def towers(data):
 a=list(map(int,data.split()));i=0;out=[];ended=False
 while i<len(a):
  n=a[i];i+=1
  if n==0:assert i==len(a);ended=True;break
  assert 1<=n<=30;v=a[i:i+3*n];i+=3*n;assert len(v)==3*n and all(x>0 for x in v);blocks=list(zip(v[::3],v[1::3],v[2::3]));out.append(f'Case {len(out)+1}: maximum height = {tower_height(blocks)}')
 assert ended;return '\n'.join(out)+'\n'
ORACLES={'uva-10057-a-mid-summer-night-s-dream':medians,'uva-1118-binary-stirling-numbers':stirlings,'uva-11344-the-huge-one':huge,'uva-11538-chess-queen':queens,'uva-11584-partitioning-by-palindromes':palindromes,'uva-11806-cheerleaders':cheerleaders,'uva-12063-zeros-and-ones':binarynumbers,'uva-437-the-tower-of-babylon':towers}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(12063);dreams=[[0],[65535],[0,65535],[1,1,9,9],[0]*500000+[65535]*500000]
 dreams += [[rng.randrange(65536) for _ in range(rng.randrange(1,100))] for _ in range(30)]
 stir=[(n,m) for n in range(1,100) for m in range(1,n+1)]+[(10**9,1),(10**9,10**9),(10**9,500000000),(10**9,999999999)]
 for _ in range(1000):n=rng.randrange(1,10**9+1);stir.append((n,rng.randrange(1,n+1)))
 hugecases=[('0',list(range(1,13))),('1'+('0'*1000),list(range(1,13))),('9'*1000,[3,9,11]),('27720',list(range(1,13))),('27721',[1,2])]
 for _ in range(1995):hugecases.append((str(rng.randrange(10**rng.randrange(1,120))),rng.sample(range(1,13),rng.randrange(1,13))))
 boards=[(1,1),(1,1000000),(1000000,1),(1000000,1000000)]+[(m,n) for m in range(1,15) for n in range(1,15)]
 boards += [(rng.randrange(1,1000001),rng.randrange(1,1000001)) for _ in range(4999-len(boards))]
 words=['a','a'*1000,'ab'*500,'abcdefghijklmnopqrstuvwxyz'*38+'abcdefghijkl','aaadbccb','abacdc','abba','aab','abaa']
 words += [''.join(rng.choice('abcd') for _ in range(rng.randrange(1,1001))) for _ in range(50)]
 cheers=[(2,2,k) for k in range(6)]+[(2,3,k) for k in range(8)]+[(20,20,0),(20,20,1),(20,20,200),(20,20,400),(20,20,500),(2,20,2),(20,2,2)]
 while len(cheers)<50:m,n=rng.randrange(2,11),rng.randrange(2,11);cheers.append((m,n,rng.randrange(m*n+2)))
 binaries=[(n,k) for n in range(1,11) for k in range(6)]+[(64,0),(64,1),(64,2),(64,3),(64,100),(63,100),(2,0),(2,1),(2,2),(2,3)]
 binaries += [(rng.randrange(1,65),rng.randrange(101)) for _ in range(100-len(binaries))]
 blocks=[[(1,1,1)],[(10,20,30)],[(5,5,5)]*30,[(1,2,3),(2,3,4)],[(1000000,999999,999998)]]
 blocks += [[tuple(rng.randrange(1,1001) for _ in range(3)) for _ in range(rng.randrange(1,31))] for _ in range(40)]
 return {'uva-10057-a-mid-summer-night-s-dream':''.join(str(len(v))+'\n'+' '.join(map(str,v))+'\n' for v in dreams),'uva-1118-binary-stirling-numbers':str(len(stir))+'\n\n'+'\n\n'.join(f'{n} {m}' for n,m in stir)+'\n','uva-11344-the-huge-one':str(len(hugecases))+'\n'+''.join(number+'\n'+str(len(d))+' '+' '.join(map(str,d))+'\n' for number,d in hugecases),'uva-11538-chess-queen':''.join(f'{m} {n}\n' for m,n in boards)+'0 0\n','uva-11584-partitioning-by-palindromes':str(len(words))+'\n'+'\n'.join(words)+'\n','uva-11806-cheerleaders':'50\n'+''.join(f'{m} {n} {k}\n' for m,n,k in cheers),'uva-12063-zeros-and-ones':'100\n'+''.join(f'{n} {k}\n' for n,k in binaries),'uva-437-the-tower-of-babylon':''.join(str(len(row))+'\n'+''.join(' '.join(map(str,b))+'\n' for b in row) for row in blocks)+'0\n'}

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
                    if p['slug']=='uva-10057-a-mid-summer-night-s-dream' and check['status']=='WRONG_EXPECTED_OUTPUT':
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Count all input occurrences whose value minimizes absolute deviation, including both endpoints of an even-length median interval. Original answers counted only the lower endpoint. Input and the first/third output columns are unchanged.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: append missing single-zero final sentinel after the valid sequence. Sequence values and expected numeric result are unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all median optimum values, Stirling parity boundaries, 1001-digit bound, ordered queen pairs, palindrome cuts, boundary coverage, fixed-leading balanced binary numbers and unlimited block rotations','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
