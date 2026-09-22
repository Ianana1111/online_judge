"""Independent factorizations, inverse searches, finite-state cycles and geometry enumeration."""
import argparse
from collections import Counter
from functools import lru_cache
from itertools import product
import hashlib,json,math,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]

def dpa(data):
 values=list(map(int,data.split()));assert 1<=values[0]<=500 and len(values)==values[0]+1;out=[]
 for n in values[1:]:
  assert 2<=n<=1000
  x=n;sigma=1;d=2
  while d*d<=x:
   power=1;series=1
   while x%d==0:x//=d;power*=d;series+=power
   sigma*=series;d+=1
  if x>1:sigma*=x+1
  proper=sigma-n;out.append('deficient' if proper<n else 'perfect' if proper==n else 'abundant')
 return '\n'.join(out)+'\n'
def cipher(data):
 words=data.split();assert len(words)%2==0;out=[]
 for a,b in zip(words[::2],words[1::2]):
  assert 1<=len(a)==len(b)<=100 and re.fullmatch('[A-Z]+',a+b)
  signature=lambda s:Counter(s.count(c) for c in set(s))
  out.append('YES' if signature(a)==signature(b) else 'NO')
 return '\n'.join(out)+'\n'
def dna(data):
 tokens=iter(data.split());tests=int(next(tokens));assert tests>=1;out=[]
 for _ in range(tests):
  m,n=int(next(tokens)),int(next(tokens));assert 4<=m<=50 and 4<=n<=1000
  rows=[next(tokens) for _ in range(m)];assert all(len(row)==n and set(row)<=set('ACGT') for row in rows)
  best=[min((sum(row[i]!=ch for row in rows),ch) for ch in 'ACGT') for i in range(n)]
  out.extend([''.join(ch for cost,ch in best),str(sum(cost for cost,ch in best))])
 assert next(tokens,None) is None
 return '\n'.join(out)+'\n'
def generators(data):
 values=list(map(int,data.split()));assert values[0]>=1 and len(values)==values[0]+1;out=[]
 for n in values[1:]:
  assert 1<=n<=100000
  candidates=(x for x in range(max(1,n-9*len(str(n))),n+1) if x+sum(map(int,str(x)))==n)
  out.append(str(next(candidates,0)))
 return '\n'.join(out)+'\n'
def score(data):
 words=data.split();t=int(words[0]);assert t>=1 and len(words)==t+1;out=[]
 for word in words[1:]:
  assert re.fullmatch('[OX]{1,79}',word)
  out.append(str(sum(len(run)*(len(run)+1)//2 for run in word.split('X'))))
 return '\n'.join(out)+'\n'
def can_box(faces):
 target=Counter(tuple(sorted(pair)) for pair in faces);edges=set(x for pair in faces for x in pair)
 for x,y,z in product(edges,repeat=3):
  if Counter([tuple(sorted((x,y)))]*2+[tuple(sorted((x,z)))]*2+[tuple(sorted((y,z)))]*2)==target:return True
 return False

def box(data):
 values=list(map(int,data.split()));assert len(values)%12==0 and all(1<=x<=10000 for x in values)
 return ''.join(('POSSIBLE' if can_box(list(zip(values[i:i+12:2],values[i+1:i+12:2]))) else 'IMPOSSIBLE')+'\n' for i in range(0,len(values),12))
def ducci_kind(start):
 def step(a):return tuple(abs(x-y) for x,y in zip(a,a[1:]+a[:1]))
 slow=step(start);fast=step(step(start));iterations=1
 while slow!=fast:
  slow=step(slow);fast=step(step(fast));iterations+=1
  assert iterations<=1000
 # Recover the entry distance and period to verify the problem's exact bound,
 # rather than assuming a fast-pointer meeting proves its input promise.
 entry=start;mu=0
 while entry!=slow:entry=step(entry);slow=step(slow);mu+=1
 period=1;probe=step(entry)
 while probe!=entry:probe=step(probe);period+=1
 assert mu+(0 if not any(entry) else period)<=1000
 return 'LOOP' if any(entry) else 'ZERO'
def ducci(data):
 values=iter(map(int,data.split()));t=next(values);assert t>=1;out=[]
 for _ in range(t):
  n=next(values);assert 3<=n<=15
  a=tuple(next(values) for _ in range(n));assert all(0<=x<=1000 for x in a);out.append(ducci_kind(a))
 assert next(values,None) is None
 return '\n'.join(out)+'\n'
@lru_cache(maxsize=None)
def is_prime(n):
 if n<2:return False
 if n%2==0:return n==2
 return all(n%d for d in range(3,math.isqrt(n)+1,2))
def gaps(data):
 values=list(map(int,data.split()));assert values and values[-1]==0;out=[]
 for n in values[:-1]:
  assert 2<=n<=1299709
  if is_prime(n):out.append('0');continue
  left=n-1;right=n+1
  while not is_prime(left):left-=1
  while not is_prime(right):right+=1
  out.append(str(right-left))
 return '\n'.join(out)+'\n'
def cantor(data):
 values=list(map(int,data.split()));out=[]
 for n in values:
  assert 1<=n<=10**7
  d=(math.isqrt(8*n+1)-1)//2
  if d*(d+1)//2<n:d+=1
  end=d*(d+1)//2;position_from_end=end-n
  a=1+position_from_end if d%2 else d-position_from_end;b=d+1-a
  out.append(f'TERM {n} IS {a}/{b}')
 return '\n'.join(out)+'\n'
def quotes(data):
 parts=data.split('"');assert (len(parts)-1)%2==0
 out=[parts[0]]
 for i,part in enumerate(parts[1:],1):out.extend(['``' if i%2 else "''",part])
 return ''.join(out)
ORACLES={'uva-13185-dpa-numbers-i':dpa,'uva-1339-ancient-cipher':cipher,'uva-1368-dna-consensus-string':dna,'uva-1583-digit-generator':generators,'uva-1585-score':score,'uva-1587-box':box,'uva-1594-ducci-sequence':ducci,'uva-1644-prime-gap':gaps,'uva-264-count-on-cantor':cantor,'uva-272-tex-quotes':quotes}
def repair_input(slug,data):
 if slug!='uva-1368-dna-consensus-string' or hashlib.sha256(data.encode()).hexdigest() not in {'69e2c8ff35511587fbb8832654b4c8cfcae59a3508954f834649c5600c3ace53','6a229b84fe93d98741f2855fd2d1264a44a9be39a8ae415ef8c3c88399eb37f6'}:return None
 tokens=iter(data.split());tests=int(next(tokens));out=[str(tests)]
 for _ in range(tests):
  m,n=int(next(tokens)),int(next(tokens));rows=[next(tokens) for _ in range(m)]
  # Reviewed old cases are one column; repeat that column, preserving all
  # letters and tie structure. Duplicate the sole row to the legal minimum.
  if n<4:assert n==1;rows=[row*4 for row in rows];n=4
  if m<4:assert m==1;rows*=4;m=4
  out.extend([f'{m} {n}']+rows)
 assert next(tokens,None) is None
 return '\n'.join(out)+'\n'
def additions():
 rng=random.Random(13185272)
 ns=[2,3,4,6,8,12,28,36,496,997,1000]+rng.sample(range(2,1001),489)
 pairs=[('AAB','CCD'),('AAAB','AABB'),('AAABBC','AAABCD'),('A'*100,'Z'*100),('ABCDE','ZZZZZ')]
 for _ in range(100):
  a=''.join(rng.choice('ABCDE') for _ in range(rng.randrange(1,101)));b=list(a.translate(str.maketrans('ABCDE','UVXYZ')));rng.shuffle(b);pairs.append((a,''.join(b)))
  pairs.append((a,''.join(rng.choice('FGHIJ') for _ in a)))
 dnas=[['AAAA','CCCC','GGGG','TTTT'],['ACGT']*4,['A'*1000]*50,['ACGT'*250,'CGTA'*250,'GTAC'*250,'TACG'*250]*12]
 dnas += [[''.join(rng.choice('ACGT') for _ in range(n)) for _ in range(m)] for m,n in [(4,4),(5,17),(50,1000),(7,99)]]
 targets=list(range(1,1001))+[10000,99999,100000,216,256]+[rng.randrange(1,100001) for _ in range(100)]
 results=['O','X','O'*79,'X'*79,'OX'*39+'O','OOXXOXXOOO']+[''.join(rng.choice('OX') for _ in range(rng.randrange(1,80))) for _ in range(100)]
 facesets=[[(1,2)]*2+[(3,4)]*2+[(5,6)]*2]
 for x,y,z in [(1,1,1),(2,3,5),(4,4,9),(1,10000,10000)]+[(rng.randrange(1,10001),rng.randrange(1,10001),rng.randrange(1,10001)) for _ in range(40)]:
  faces=[(x,y)]*2+[(x,z)]*2+[(y,z)]*2;faces=[p[::-1] if rng.randrange(2) else p for p in faces];rng.shuffle(faces);facesets.append(faces)
  wrong=faces.copy();a,b=wrong[0];wrong[0]=(a%10000+1,b);facesets.append(wrong)
 tuples=[(0,)*n for n in range(3,16)]+[(1,0,0),(8,11,2,7),(4,2,0,2,0),(1000,)*15]
 for n in range(3,16):
  for _ in range(8):
   a=tuple(rng.randrange(1001) for _ in range(n));ducci_kind(a);tuples.append(a)
 primequeries=list(range(2,501))+[1299709,1299708,1299689,492170]+[rng.randrange(2,1299710) for _ in range(500)]
 terms=list(range(1,201))+[10**7]
 for d in [2,3,20,100,999,4471]:terms.extend([d*(d+1)//2-1,d*(d+1)//2,d*(d+1)//2+1])
 return {'uva-13185-dpa-numbers-i':str(len(ns))+'\n'+'\n'.join(map(str,ns))+'\n',
 'uva-1339-ancient-cipher':''.join(a+'\n'+b+'\n' for a,b in pairs),
 'uva-1368-dna-consensus-string':str(len(dnas))+'\n'+''.join(f'{len(rows)} {len(rows[0])}\n'+'\n'.join(rows)+'\n' for rows in dnas),
 'uva-1583-digit-generator':str(len(targets))+'\n'+'\n'.join(map(str,targets))+'\n',
 'uva-1585-score':str(len(results))+'\n'+'\n'.join(results)+'\n',
 'uva-1587-box':''.join(''.join(f'{a} {b}\n' for a,b in faces) for faces in facesets),
 'uva-1594-ducci-sequence':str(len(tuples))+'\n'+''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in tuples),
 'uva-1644-prime-gap':'\n'.join(map(str,primequeries+[0]))+'\n',
 'uva-264-count-on-cantor':'\n'.join(map(str,terms))+'\n',
 'uva-272-tex-quotes':'No quotes here.\n"opens\n\tstill inside  \ncloses" and "".\nExisting ` and \' stay.\n"last pair"'}

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: DNA requires at least4rows and4columns; duplicate sole row and repeat single column while preserving letters and tie structure, then independently recompute consensus/error.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'frequency multiplicities, tie order, inverse generators, rotated faces, cycles and exact boundaries','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
