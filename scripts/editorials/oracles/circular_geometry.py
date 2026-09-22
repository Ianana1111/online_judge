"""Decimal Chudnovsky pi, independent coverage-equation elimination and Taylor
sine. Preserve entire legacy inputs while certifying fixed-decimal outputs."""
import argparse,functools,hashlib,json,random,re
from decimal import Decimal,localcontext
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];INTEGRATION='gpe-10422-is-this-integration';SATELLITE='uva-10221-satellites'
def pi_decimal():
 with localcontext() as context:
  context.prec=85;m=1;l=13591409;x=1;k=6;series=Decimal(l)
  for i in range(1,8):m=m*(k*k*k-16*k)//(i*i*i);l+=545140134;x*=-262537412640768000;series+=Decimal(m*l)/x;k+=12
  return +(426880*Decimal(10005).sqrt()/series)
PI=pi_decimal()
def regions(a):
 with localcontext() as context:
  context.prec=75;area=a*a;lens=(PI/3-Decimal(3).sqrt()/4)*area;matrix=[[Decimal(x) for x in row] for row in [[1,1,1],[4,3,2],[4,2,1]]];rhs=[area,PI*area,4*lens]
  for column in range(3):
   pivot=matrix[column][column];matrix[column]=[x/pivot for x in matrix[column]];rhs[column]/=pivot
   for row in range(3):
    if row==column:continue
    factor=matrix[row][column];matrix[row]=[a-factor*b for a,b in zip(matrix[row],matrix[column])];rhs[row]-=factor*rhs[column]
  assert abs(sum(rhs)-area)<Decimal('1e-60');return rhs

def integration_output(data):
 values=[Decimal(token) for token in data.split()];assert values and all(a.is_finite() and 0<=a<=10000 for a in values)
 return '\n'.join(' '.join(f'{value:.3f}' for value in regions(a)) for a in values)+'\n'
@functools.lru_cache(None)
def half_angle_sine(minutes):
 with localcontext() as context:
  context.prec=80;x=Decimal(minutes)*PI/21600;term=x;total=x;k=1
  while abs(term)>Decimal('1e-78'):
   term*=-x*x/((2*k)*(2*k+1));total+=term;k+=1
  return +total

def satellite_values(height,angle,unit):
 assert height>=0 and angle>=0 and unit in ['min','deg'];minutes=(angle if unit=='min' else 60*angle)%21600;minutes=min(minutes,21600-minutes)
 with localcontext() as context:
  context.prec=75;radius=Decimal(height+6440);return radius*Decimal(minutes)*PI/10800,2*radius*half_angle_sine(minutes)
def satellite_output(data):
 tokens=data.split();assert tokens and len(tokens)%3==0;rows=[]
 for i in range(0,len(tokens),3):values=satellite_values(int(tokens[i]),int(tokens[i+1]),tokens[i+2]);rows.append(' '.join(f'{value:.6f}' for value in values))
 return '\n'.join(rows)+'\n'
def matches(expected,actual):
 left=expected.strip().splitlines();right=actual.strip().splitlines()
 if len(left)!=len(right):return False
 for wanted,got in zip(left,right):
  fields=wanted.split(' ');pattern=' '.join(r'([+-]?\d+\.\d{'+str(len(field.split('.')[1]))+'})' for field in fields);match=re.fullmatch(pattern,got.rstrip())
  if not match or any(Decimal(a)!=Decimal(b) for a,b in zip(fields,match.groups())):return False
 return True

def additions():
 rng=random.Random(10221);sides=['0','0.000001','0.1','0.2','0.3','1','2','10','10000','9999.999999']+[f'{rng.randrange(10000000001)/1000000:.6f}' for _ in range(100)];satellites=[]
 for height in [0,1,500,6440,100000]:
  for angle in [0,1,30,60,90,179,180,181,270,359,360]:satellites.extend([(height,angle,'deg'),(height,60*angle,'min')])
 for angle in [1,2,59,61,5399,5400,5401,10799,10800,10801,21599,21600]:satellites.append((100000,angle,'min'))
 return {INTEGRATION:['\n'.join(sides)+'\n'],SATELLITE:[''.join(f'{height} {angle} {unit}\n' for height,angle,unit in satellites)]}
ORACLES={INTEGRATION:integration_output,SATELLITE:satellite_output}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  oracle=ORACLES.get(p['slug'])
  if not oracle:continue
  spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:answer=oracle(c['input']);check['status']='MATCH' if matches(answer,c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    if p['slug']==SATELLITE and check['status']=='WRONG_EXPECTED_OUTPUT':
     answer=satellite_output(c['input']);row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Preserve every original satellite height, angle, unit and all5000rows. Legacy generator used the long arc for angles above180degrees. Independently normalize to the minor arc and recompute arc/chord with75-digit Decimal pi and Taylor sine; exact angle-unit and complement identities are regression tested.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'side0..10000 withfractionalvalues;unitcirclecoverageequations;Earthradius,shortarcs,degrees/minutes,equivalentangles,zero/diameter;75-digitDecimalpiandsine','input':data,'output':oracle(data)})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
