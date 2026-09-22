"""70-digit direct products and bounded Stirling factorial logarithms, independent
of the canonical Kahan prefix logarithms. Full-domain boundary screening selects
cases only; every stored expected value uses Decimal, not screening floats."""
import argparse,functools,hashlib,heapq,json,math,random
from decimal import Decimal,localcontext,ROUND_FLOOR
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];URN='gpe-10675-urn-ball-probabilities'
def pi_decimal():
 with localcontext() as context:
  context.prec=85;m=1;l=13591409;x=1;k=6;series=Decimal(l)
  for i in range(1,8):m=m*(k*k*k-16*k)//(i*i*i);l+=545140134;x*=-262537412640768000;series+=Decimal(m*l)/x;k+=12
  return +(426880*Decimal(10005).sqrt()/series)
PI=pi_decimal()
def factorial_log_bounds(n):
 if n<100:
  value=Decimal(math.factorial(n)).log10();return value-Decimal('1e-65'),value+Decimal('1e-65')
 x=Decimal(n);ln=(x+Decimal('0.5'))*x.ln()-x+(2*PI).ln()/2+1/(12*x)-1/(360*x**3)+1/(1260*x**5)-1/(1680*x**7);error=1/(1188*x**9);ten=Decimal(10).ln();return ln/ten-Decimal('1e-60'),(ln+error)/ten+Decimal('1e-60')
def zero_count(n):
 if n==0:return 0
 with localcontext() as context:
  context.prec=70;a,b=factorial_log_bounds(n);c,d=factorial_log_bounds(n+1);low=int((a+c).to_integral_value(rounding=ROUND_FLOOR));high=int((b+d).to_integral_value(rounding=ROUND_FLOOR));assert low==high;return low

def parse(data):
 values=list(map(int,data.split()));assert 1<=len(values)<=1000 and all(0<=n<1000000 for n in values);return values
@functools.lru_cache(maxsize=8)
def values_at(queries):
 wanted=sorted(set(queries));at=0;answers={};survival=Decimal(1)
 with localcontext() as context:
  context.prec=70
  for n in wanted:
   while at<n:
    at+=1;denominator=Decimal(at*(at+1));survival*=1-1/denominator
   probability=1-survival;rounded=f'{probability:.6f}';assert abs(probability-(Decimal(rounded)+Decimal('0.0000005')))>Decimal('1e-60') and abs(probability-(Decimal(rounded)-Decimal('0.0000005')))>Decimal('1e-60');answers[n]=(rounded,zero_count(n))
 return answers

def urn_output(data):
 queries=parse(data);answers=values_at(tuple(sorted(set(queries))));return ''.join(f'{answers[n][0]} {answers[n][1]}\n' for n in queries)
def valid(data,output):
 import re
 expected=urn_output(data).strip().splitlines();actual=output.strip().splitlines()
 if len(expected)!=len(actual):return False
 for wanted,got in zip(expected,actual):
  match=re.fullmatch(r'([+-]?\d+\.\d{6}) ([0-9]+)',got.rstrip())
  if not match:return False
  probability,count=wanted.split()
  if Decimal(match[1])!=Decimal(probability) or int(match[2])!=int(count):return False
 return True

@functools.lru_cache(None)
def boundary_screen():
 nearest_probability=[];nearest_count=[];log_survival=0.;compensation=0.
 def retain(heap,distance,n,value):
  if len(heap)<30:heapq.heappush(heap,(-distance,n,value))
  elif distance < -heap[0][0]:heapq.heapreplace(heap,(-distance,n,value))
 for n in range(1,1000000):
  corrected=math.log1p(-1/(n*(n+1)))-compensation;total=log_survival+corrected;compensation=(total-log_survival)-corrected;log_survival=total;probability=-math.expm1(log_survival);scaled=probability*1000000;retain(nearest_probability,abs(scaled-math.floor(scaled)-0.5),n,probability)
  logarithm=(math.lgamma(n+1)+math.lgamma(n+2))/math.log(10);retain(nearest_count,abs(logarithm-round(logarithm)),n,logarithm)
 return {'probability':sorted((-distance,n,value) for distance,n,value in nearest_probability),'zeroCount':sorted((-distance,n,value) for distance,n,value in nearest_count)}
def additions():
 selected=set(range(101))|{0,1,2,20,999997,999998,999999,1000,10000,100000}
 for group in boundary_screen().values():
  for distance,n,value in group:
   selected.update(k for k in [n-1,n,n+1] if 0<=k<1000000)
 selected=sorted(selected);rng=random.Random(10169);maximum=selected+[rng.randrange(1000000) for _ in range(1000-len(selected))];rng.shuffle(maximum);assert len(maximum)==1000
 return ['\n'.join(map(str,selected))+'\n','\n'.join(map(str,maximum))+'\n']
ORACLES={URN:(urn_output,valid)}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  if p['slug']!=URN:continue
  spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:check['status']='MATCH' if valid(c['input'],c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'N0..100;999999 maximum;1000 unorderedqueries;all999999N screened for probability half-unit and logarithm integer boundaries;selected neighbors independently verified by70-digit Decimal product and bounded Stirling','input':data,'output':urn_output(data)})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);(output/'boundary-screen.json').write_text(json.dumps(boundary_screen(),indent=2)+'\n')
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
