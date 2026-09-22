"""Independent prime-block partitions, numeric permutation sets, prefix masks and divisor-pair intervals."""
import argparse,hashlib,json,random,itertools,collections,math
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def factorizations(n):
 primes=[];rest=n;d=2
 while d*d<=rest:
  while rest%d==0:primes.append(d);rest//=d
  d+=1
 if rest>1:primes.append(rest)
 partitions={()}
 for prime in primes:
  following=set()
  for blocks in partitions:
   following.add(tuple(sorted(blocks+(prime,))))
   for i,value in enumerate(blocks):
    if i and blocks[i-1]==value:continue
    following.add(tuple(sorted(blocks[:i]+(value*prime,)+blocks[i+1:])))
  partitions=following
 return sorted(partition for partition in partitions if len(partition)>=2)
def factors(data):
 a=list(map(int,data.split()));assert a and a[-1]==0 and len(a)-1<=20 and all(1<=n<=2000000 for n in a[:-1]);out=[]
 for n in a[:-1]:
  options=factorizations(n);out.append(str(len(options)));out.extend(' '.join(map(str,row)) for row in options)
 return '\n'.join(out)+ ('\n' if out else '')

@lru_cache(None)
def small_primes():return [n for n in range(2,3163) if all(n%d for d in range(2,math.isqrt(n)+1))]
@lru_cache(maxsize=200000)
def is_prime(n):
 if n<2:return False
 for p in small_primes():
  if p*p>n:return True
  if n%p==0:return False
 return True
@lru_cache(maxsize=256)
def spy_count(digits):
 candidates={int(''.join(letters)) for length in range(1,len(digits)+1) for letters in itertools.permutations(digits,length)};return sum(is_prime(value) for value in candidates)
def spies(data):
 a=data.split();t=int(a[0]);assert 1<=t<=200 and len(a)==t+1 and all(1<=len(s)<=7 and s.isascii() and s.isdigit() for s in a[1:]);return ''.join(str(spy_count(''.join(sorted(s))))+'\n' for s in a[1:])

def plate_count(s):
 singles=0;pairs=0;triples=[0]*26
 for ch in s:
  letter=ord(ch)-65;triples[letter]|=pairs;pairs|=singles<<(26*letter);singles|=1<<letter
 return sum(bin(bits).count('1') for bits in triples)
def plates(data):
 a=data.split();t=int(a[0]);assert t>=0 and len(a)==t+1 and all(1<=len(s)<=100000 and set(s)<=set('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for s in a[1:]);return ''.join(str(plate_count(s))+'\n' for s in a[1:])

def divisor_counts(lo,hi):
 counts=[0]*(hi-lo+1)
 for divisor in range(1,math.isqrt(hi)+1):
  for multiple in range(max(divisor*divisor,((lo+divisor-1)//divisor)*divisor),hi+1,divisor):counts[multiple-lo]+=1 if multiple==divisor*divisor else 2
 return counts

def divisors(data):
 a=list(map(int,data.split()));t=a[0];assert t>=1 and len(a)==1+2*t;out=[]
 for lo,hi in zip(a[1::2],a[2::2]):
  assert 1<=lo<=hi<=1000000000 and hi-lo<=10000;counts=divisor_counts(lo,hi);maximum=max(counts);best=lo+counts.index(maximum);out.append(f'Between {lo} and {hi}, {best} has a maximum of {maximum} divisors.')
 return '\n'.join(out)+'\n'

def dangerous_counts():
 result=[0];states=[1,0,0,0]
 for _ in range(30):
  following=[0]*4
  for trailing,count in enumerate(states):
   following[3 if trailing==3 else 0]+=count;following[min(3,trailing+1)]+=count
  states=following;result.append(states[3])
 return result

def critical(data):
 a=list(map(int,data.split()));assert a and a[-1]==0 and all(1<=n<=30 for n in a[:-1]);counts=dangerous_counts();return ''.join(str(counts[n])+'\n' for n in a[:-1])

def counterfeit_candidates(n,weighings):
 light=set(range(1,n+1));heavy=light.copy()
 for left,right,result in weighings:
  if result=='=':light-=left|right;heavy-=left|right
  elif result=='<':light&=left;heavy&=right
  else:light&=right;heavy&=left
 return light|heavy

def counterfeit(data):
 a=data.split();t=int(a[0]);i=1;assert t>=1;out=[]
 for _ in range(t):
  n,k=map(int,a[i:i+2]);i+=2;assert 1<=n<=100 and 1<=k<=100;weighings=[]
  for _ in range(k):
   p=int(a[i]);i+=1;assert 1<=p<=n//2;values=list(map(int,a[i:i+2*p]));i+=2*p;assert len(values)==2*p and len(set(values))==2*p and all(1<=v<=n for v in values);result=a[i];i+=1;assert result in '<>=';weighings.append((set(values[:p]),set(values[p:]),result))
  candidates=counterfeit_candidates(n,weighings);out.append(str(next(iter(candidates))) if len(candidates)==1 else '0')
 assert i==len(a);return '\n\n'.join(out)+'\n'
ORACLES={'uva-10858-unique-factorization':factors,'uva-12218-an-industrial-spy':spies,'uva-13257-license-plates':plates,'uva-294-divisors':divisors,'uva-580-critical-mass':critical,'uva-665-false-coin':counterfeit}
def additions():
 rng=random.Random(665);factor_queries=[1,2,4,12,20,999983,2000000,1048576,1594323,720720,1081080,1441440,1801800,360360,1663200,1999999,1999998,1000000,831600,1995840]
 digit_cases=['0','1','2','011','17','1276543','9999999','0000000','2222222','0000002']+[''.join(rng.choice('0123456789') for _ in range(rng.randrange(1,8))) for i in range(190)]
 letter_cases=['A','AB','AAA','ABA','ABC','A'*100000,'AB'*50000,('ABCDEFGHIJKLMNOPQRSTUVWXYZ'*3847)[:100000]]+[''.join(s) for n in range(1,8) for s in itertools.product('ABC',repeat=n)]
 ranges=[(n,n) for n in range(1,1001)]+[(1,10001),(999990000,1000000000),(1000000000,1000000000),(999999937,999999937)]
 for _ in range(40):lo=rng.randrange(1,999990001);ranges.append((lo,lo+rng.randrange(10001)))
 coin_cases=[(3,[(set([1]),set([2]),'=')]),(2,[(set([1]),set([2]),'<')]),(3,[(set([1]),set([2]),'<'),(set([1]),set([3]),'<')])]
 for _ in range(100):
  n=rng.randrange(2,101);fake=rng.randrange(1,n+1);sign=rng.choice([-1,1]);weighings=[]
  for j in range(100):
   p=rng.randrange(1,n//2+1);values=rng.sample(range(1,n+1),2*p);left=set(values[:p]);right=set(values[p:]);difference=sign*((fake in left)-(fake in right));result='<' if difference<0 else '>' if difference>0 else '=';weighings.append((left,right,result))
  coin_cases.append((n,weighings))
 return {'uva-10858-unique-factorization':'\n'.join(map(str,factor_queries))+'\n0\n','uva-12218-an-industrial-spy':str(len(digit_cases))+'\n'+'\n'.join(digit_cases)+'\n','uva-13257-license-plates':str(len(letter_cases))+'\n'+'\n'.join(letter_cases)+'\n','uva-294-divisors':str(len(ranges))+'\n'+''.join(f'{lo} {hi}\n' for lo,hi in ranges),'uva-580-critical-mass':'\n'.join(map(str,range(1,31)))+'\n0\n','uva-665-false-coin':str(len(coin_cases))+'\n\n'+'\n'.join(f'{n} {len(weighings)}\n'+''.join(str(len(left))+' '+' '.join(map(str,sorted(left)+sorted(right)))+'\n'+result+'\n' for left,right,result in weighings) for n,weighings in coin_cases)}
def repair_input(slug,data,expected=None):
 if slug!='uva-580-critical-mass':return None
 a=list(map(int,data.split()));assert a[-1]==0 and all(n>0 for n in a[:-1]);valid=[n for n in a[:-1] if n<=30]
 if len(valid)==len(a)-1:return None
 old_lines=expected.splitlines();assert len(old_lines)==len(a)-1
 result='\n'.join(map(str,valid+[0]))+'\n';preserved=[line for n,line in zip(a[:-1],old_lines) if n<=30];assert critical(result).splitlines()==preserved;return result

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
                    if p['slug']=='uva-665-false-coin' and check['status']=='WRONG_EXPECTED_OUTPUT':
                        assert len(answer.split())==len(c['output'].split()) and all(value=='0' for value in answer.split())
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'No light/heavy hypothesis matches the inconsistent observations; the explicitly clarified local contract returns0. Correct the unsupported positive identifier without changing any weighing.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'],c['output'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Remove only forbidden stack heights above30, preserving every legal query and its independently verified original answer. The retained file already exhausts all30 legal heights.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'unordered multiplicative partitions, distinct digit primes, three-letter subsequences, interval divisor pairs, all30 critical stack sizes and light/heavy coin ambiguity','input':data,'output':oracle(data)})
        if p['slug']=='uva-13257-license-plates' and not any(c['input']=='0\n' for c in p['testCases']):row['proposedAdditions'].append({'label':'zero permitted cases produce empty output','input':'0\n','output':''})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
