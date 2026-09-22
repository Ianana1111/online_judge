"""Independent factorization, Fenwick elimination, integer roots, clock simulation and allocation."""
import argparse,hashlib,json,random,math,bisect
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
@lru_cache(None)
def primes_to(limit):
 sieve=bytearray(b'\x01')*(limit+1);sieve[:2]=b'\x00\x00'
 for p in range(2,math.isqrt(limit)+1):
  if sieve[p]:sieve[p*p::p]=b'\x00'*((limit-p*p)//p+1)
 return [p for p in range(2,limit+1) if sieve[p]]
def digit_sum(n):return sum(map(int,str(n)))
@lru_cache(None)
def is_smith(n):
 remaining=n;total=0;factors=0
 for prime in primes_to(math.isqrt(n)):
  if prime*prime>remaining:break
  while remaining%prime==0:remaining//=prime;total+=digit_sum(prime);factors+=1
 if remaining>1:total+=digit_sum(remaining);factors+=1
 return factors>1 and total==digit_sum(n)
def next_smith(n):
 candidate=n+1
 while not is_smith(candidate):candidate+=1
 return candidate

def smiths(data):
 a=list(map(int,data.split()));t=a[0];assert t>=1 and len(a)==t+1 and all(0<n<10**9 for n in a[1:]);return ''.join(str(next_smith(n))+'\n' for n in a[1:])

@lru_cache(None)
def joseph_survivor(n):
 primes=primes_to(33000);assert len(primes)>=3500
 tree=[0]*(n+1)
 for i in range(1,n+1):tree[i]=i&-i
 def kth(k):
  pos=0;step=1<<(n.bit_length()-1)
  while step:
   next_pos=pos+step
   if next_pos<=n and tree[next_pos]<k:k-=tree[next_pos];pos=next_pos
   step//=2
  return pos+1
 position=0;remaining=n
 for prime in primes[:n-1]:
  position=(position+prime-1)%remaining;removed=kth(position+1);i=removed
  while i<=n:tree[i]-=1;i+=i&-i
  remaining-=1
 return kth(1)

def josephs(data):
 a=list(map(int,data.split()));assert a and a[-1]==0 and all(1<=n<=3501 for n in a[:-1]);return ''.join(str(joseph_survivor(n))+'\n' for n in a[:-1])

def roots(data):
 a=data.split();t=int(a[0]);assert t>=1 and len(a)==t+1;out=[]
 for value in a[1:]:
  assert value.isascii() and value.isdigit() and value[0]!='0';n=int(value);assert 1<=n<=10**1000;root=math.isqrt(n);assert root*root==n;out.append(str(root))
 return '\n\n'.join(out)+'\n'

def next_palindrome_time(time):
 for step in range(1,1441):
  value=(time+step)%1440;h,m=divmod(value,60);digits=(f'{h:02}{m:02}').lstrip('0') or '0'
  if digits==digits[::-1]:return f'{h:02}:{m:02}'
 raise AssertionError('midnight is always a palindrome')
def clocks(data):
 a=data.split();t=int(a[0]);assert t>=1 and len(a)==t+1;out=[]
 for value in a[1:]:
  assert len(value)==5 and value[2]==':' and value[:2].isdigit() and value[3:].isdigit();h,m=map(int,value.split(':'));assert 0<=h<=23 and 0<=m<=59;out.append(next_palindrome_time(60*h+m))
 return '\n'.join(out)+'\n'

def equalization(expenses):
 n=len(expenses);low,remainder=divmod(sum(expenses),n);ordered=sorted(expenses);return sum(max(0,value-(low+(i>=n-remainder))) for i,value in enumerate(ordered))
def trips(data):
 a=data.split();i=0;out=[];ended=False
 while i<len(a):
  n=int(a[i]);i+=1
  if n==0:assert i==len(a);ended=True;break
  assert 1<=n<=1000;expenses=[]
  for value in a[i:i+n]:
   pieces=value.split('.');assert len(pieces)==2 and len(pieces[1])==2 and all(s.isdigit() for s in pieces);cents=int(pieces[0])*100+int(pieces[1]);assert 0<=cents<=1000000;expenses.append(cents)
  i+=n;assert len(expenses)==n;answer=equalization(expenses);out.append(f'${answer//100}.{answer%100:02}')
 assert ended;return '\n'.join(out)+'\n'

def alphabet_order(s,k):
 rank=k-1;digits=[]
 for radix in range(1,len(s)+1):digits.append(rank%radix);rank//=radix
 assert rank==0;order=[]
 for char,index in zip(reversed(s),digits):order.insert(index,char)
 return ''.join(order)
def alphabets(data):
 a=data.split();t=int(a[0]);assert 1<=t<=5000 and len(a)==1+2*t;out=[]
 for s,k in zip(a[1::2],a[2::2]):
  k=int(k);assert 1<=len(s)<=20 and s.isascii() and s.islower() and s.isalpha() and len(set(s))==len(s) and 1<=k<=math.factorial(len(s));out.append(f'Case {len(out)+1}: {alphabet_order(s,k)}')
 return '\n'.join(out)+'\n'
ORACLES={'gpe-23571-smith-numbers':smiths,'gpe-10607-joseph-s-cousin':josephs,'gpe-10609-square-root':roots,'gpe-10471-counting-chaos':clocks,'gpe-10533-the-trip':trips,'gpe-23771-lexicographic-order':alphabets}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(11309);smithqueries=[1,2,3,4,21,22,26,27,57,58,85,94,4937774,4937775,999999999]+[rng.randrange(1,10**9) for _ in range(40)]
 rootvalues=[1,2,3,10,11,99,100,101,2684512,10**500,10**500-1,10**499+1]+[rng.randrange(10**(d-1),10**d) for d in [2,5,20,100,250,499] for _ in range(10)]
 expenses=[[0],[1000000],[0,1],[0,0,1],[0,0,2],[1,2,3],[1000,2000,3000],[1500,1501,300,301],[1000000]*500+[0]*500]
 for _ in range(60):expenses.append([rng.randrange(1000001) for _ in range(rng.randrange(1,1001))])
 alphabetcases=[]
 for n in range(1,7):
  s='zyxwvu'[:n]
  for k in range(1,math.factorial(n)+1):alphabetcases.append((s,k))
 alphabetcases += [('abcdefghijklmnopqrst',1),('abcdefghijklmnopqrst',math.factorial(20))]
 while len(alphabetcases)<5000:
  n=rng.randrange(1,21);s=''.join(rng.sample('abcdefghijklmnopqrstuvwxyz',n));alphabetcases.append((s,rng.randrange(1,math.factorial(n)+1)))
 return {'gpe-23571-smith-numbers':str(len(smithqueries))+'\n'+'\n'.join(map(str,smithqueries))+'\n','gpe-10607-joseph-s-cousin':'\n'.join(map(str,range(1,3502)))+'\n0\n','gpe-10609-square-root':str(len(rootvalues))+'\n\n'+'\n\n'.join(str(n*n) for n in rootvalues)+'\n','gpe-10471-counting-chaos':'1440\n'+''.join(f'{v//60:02}:{v%60:02}\n' for v in range(1440)),'gpe-10533-the-trip':''.join(str(len(row))+'\n'+''.join(f'{v//100}.{v%100:02}\n' for v in row) for row in expenses)+'0\n','gpe-23771-lexicographic-order':'5000\n'+''.join(f'{s} {k}\n' for s,k in alphabetcases)}

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: append missing single-zero final sentinel after the valid sequence. Sequence values and expected numeric result are unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'composite multiplicities and strict Smith successor, all circle sizes and clock minutes, exact1001-digit square, indivisible-cent transfers and inverse factorial ranks up to20!','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
