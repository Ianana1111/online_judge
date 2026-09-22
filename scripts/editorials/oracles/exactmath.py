"""Newton identities, Fibonacci doubling, closed sums, quotient blocks and capacity search."""
import argparse,hashlib,json,math,random
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def polynomial_coefficients(roots):
 n=len(roots);power=[0]+[sum(r**k for r in roots) for k in range(1,n+1)];elementary=[1]
 for k in range(1,n+1):
  numerator=sum((1 if i%2 else -1)*elementary[k-i]*power[i] for i in range(1,k+1));assert numerator%k==0;elementary.append(numerator//k)
 return [(-1)**k*elementary[k] for k in range(n,-1,-1)]

def polynomial_text(coeff):
 n=len(coeff)-1;result='x' if n==1 else f'x^{n}'
 for degree in range(n-1,-1,-1):
  value=coeff[degree]
  if degree and value==0:continue
  result+=' - ' if value<0 else ' + '
  if degree==0:result+=str(abs(value))
  else:
   if abs(value)!=1:result+=str(abs(value))
   result+='x' if degree==1 else f'x^{degree}'
 return result+' = 0'

def polynomials(data):
 values=list(map(int,data.split()));i=0;out=[]
 while i<len(values):
  n=values[i];i+=1;roots=values[i:i+n];i+=n;assert 1<=n<=50 and len(roots)==n;coeff=polynomial_coefficients(roots);assert all(abs(v)<=10**15 for v in coeff);out.append(polynomial_text(coeff))
 return '\n'.join(out)+'\n'

def fib_pair(n):
 if n==0:return 0,1
 a,b=fib_pair(n//2);c=a*(2*b-a);d=a*a+b*b
 return (d,c+d) if n%2 else (c,d)
def bee_numbers(n):return fib_pair(n+2)[0]-1,fib_pair(n+3)[0]-1

def bees(data):
 values=list(map(int,data.split()));assert values and values[-1]==-1 and all(n>=0 for n in values[:-1]);out=[]
 for n in values[:-1]:
  assert n<=44;male,total=bee_numbers(n);assert male<=2**32 and total<=2**32;out.append(f'{male} {total}')
 return '\n'.join(out)+'\n'

def triangle_count(n):
 k=(n-2)//2
 return k*(k+1)*(4*k+(5 if n%2 else -1))//6

def triangles(data):
 values=list(map(int,data.split()));assert values and values[-1]<3 and all(3<=n<=1000000 for n in values[:-1]);return ''.join(str(triangle_count(n))+'\n' for n in values[:-1])

@lru_cache(None)
def harmonic_floor(n):
 left=1;answer=0
 while left<=n:
  quotient=n//left;right=n//quotient;answer+=(right-left+1)*quotient;left=right+1
 return answer

def harmonic(data):
 values=list(map(int,data.split()));assert 0<=values[0]<=1000 and len(values)==values[0]+1 and all(-2**31<=n<2**31 for n in values[1:]);return ''.join(str(harmonic_floor(n))+'\n' for n in values[1:])

def distinct_zeroes(low,high):
 first_change=low+(5-low%5)
 return 1+(max(0,(high-first_change)//5+1))

def zeroes(data):
 values=list(map(int,data.split()));assert len(values)%2==0 and values[-2:]==[0,0] and len(values)//2<=50001;out=[]
 for low,high in zip(values[:-2:2],values[1:-2:2]):
  assert 0<low<=high<=9*10**18;out.append(str(distinct_zeroes(low,high)))
 return '\n'.join(out)+'\n'

def min_steps(distance):
 left,right=0,2*math.isqrt(distance)+2
 while left<right:
  middle=(left+right)//2;capacity=(middle+1)*(middle+1)//4
  if capacity>=distance:right=middle
  else:left=middle+1
 return left

def steps(data):
 values=list(map(int,data.split()));t=values[0];assert t>=0 and len(values)==1+2*t;out=[]
 for x,y in zip(values[1::2],values[2::2]):
  assert 0<=x<=y<2**31;out.append(str(min_steps(y-x)))
 return '\n'.join(out)+'\n'
ORACLES={'uva-10326-the-polynomial-equation':polynomials,'uva-11000-the-four-in-one-stadium':bees,'uva-11401-triangle-counting':triangles,'uva-11526-h-n':harmonic,'uva-12869-zeroes':zeroes,'uva-846-steps':steps}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(10326);rootcases=[[0],[1],[-1],[2,3],[0,1,-1],[1]*50,[-1]*50,[1,-1]*25,[0]*50,[10**15]+[0]*49,[-10**15]]
 rootcases += [[rng.randrange(-3,4) for _ in range(rng.randrange(1,16))] for _ in range(90)]
 triangle_queries=list(range(3,1001))+list(range(999950,1000001))+[rng.randrange(3,1000001) for _ in range(1000)]
 harmonic_queries=[-2**31,-100,-1,0]+list(range(1,51))+[k*k+d for k in [31,100,46340] for d in [-1,0,1]]+[2**31-1]*900
 harmonic_queries += [rng.randrange(2**31) for _ in range(1000-len(harmonic_queries))]
 intervals=[(low,high) for low in range(1,101) for high in range(low,101)]+[(1,9*10**18),(9*10**18,9*10**18),(24,25),(124,125)]
 for _ in range(50000-len(intervals)):
  a,b=sorted([rng.randrange(1,9*10**18+1),rng.randrange(1,9*10**18+1)]);intervals.append((a,b))
 distances=set(range(201))|{2**31-1}
 for k in [1,2,3,20,100,1000,46339,46340]:
  distances|={k*k+d for d in [-1,0,1,k-1,k,k+1,2*k] if 0<=k*k+d<2**31}
 journeys=[]
 for distance in sorted(distances):
  x=rng.randrange(2**31-distance);journeys.append((x,x+distance))
 journeys += [(0,0),(2**31-1,2**31-1),(0,2**31-1)]
 return {'uva-10326-the-polynomial-equation':''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in rootcases),'uva-11000-the-four-in-one-stadium':'\n'.join(map(str,range(45)))+'\n-1\n','uva-11401-triangle-counting':'\n'.join(map(str,triangle_queries))+'\n0\n','uva-11526-h-n':'1000\n'+'\n'.join(map(str,harmonic_queries))+'\n','uva-12869-zeroes':''.join(f'{a} {b}\n' for a,b in intervals)+'0 0\n','uva-846-steps':str(len(journeys))+'\n'+''.join(f'{x} {y}\n' for x,y in journeys)}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'degree50 exact polynomial formatting, all output-bounded bee years, triangle strictness, signed32 floor sums and maximal batch, factorial plateaus and integer step thresholds','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
