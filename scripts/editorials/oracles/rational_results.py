"""Independent primality witnesses, per-player event histories, matrix walks,
and standard-form exact line equations. Rational expected answers allow true ties."""
import argparse,collections,hashlib,itertools,json,random,re
from fractions import Fraction
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PRIME='uva-10200-prime-time';WAR='uva-10903-playing-war';TIGHT='gpe-10637-tight-words';LINES='uva-378-intersecting-lines'
def prime(number):
 if number<2:return False
 for p in [2,3,5,7,11]:
  if number%p==0:return number==p
 d=number-1;s=0
 while d%2==0:d//=2;s+=1
 for a in [2,3,5,7,11]:
  x=pow(a,d,number)
  if x in [1,number-1]:continue
  for _ in range(s-1):
   x=x*x%number
   if x==number-1:break
  else:return False
 return True
@lru_cache(None)
def prime_values():return [prime(n*n+n+41) for n in range(10001)]
def prime_rows(data):
 values=list(map(int,data.split()));assert values and len(values)%2==0;flags=prime_values();prefix=[0]+list(itertools.accumulate(flags));rows=[]
 for a,b in zip(values[::2],values[1::2]):assert 0<=a<=b<=10000;rows.append([(Fraction(100*(prefix[b+1]-prefix[a]),b-a+1),2)])
 return rows
def parse_tournaments(data,strict=True):
 tokens=data.split();at=0;cases=[];ended=False
 while at<len(tokens):
  n=int(tokens[at]);at+=1
  if n==0:assert at==len(tokens);ended=True;break
  k=int(tokens[at]);at+=1;assert 1<=n<=100 and 1<=k<=100;games=[];pairs=collections.Counter()
  for _ in range(k*n*(n-1)//2):
   a,x,b,y=tokens[at:at+4];at+=4;a=int(a)-1;b=int(b)-1;assert 0<=a<n and 0<=b<n and a!=b and x in ['rock','paper','scissors'] and y in ['rock','paper','scissors'];games.append((a,x,b,y));pairs[tuple(sorted((a,b)))]+=1
  if strict:assert all(pairs[(a,b)]==k for a in range(n) for b in range(a+1,n))
  cases.append((n,k,games))
 assert ended;return cases
def tournament_rows(data):
 rows=[];code={'rock':0,'paper':1,'scissors':2}
 for case,(n,k,games) in enumerate(parse_tournaments(data)):
  events=[[] for _ in range(n)]
  for a,x,b,y in games:
   difference=(code[x]-code[y])%3
   if difference:events[a].append(difference==1);events[b].append(difference==2)
  if case:rows.append([''])
  for row in events:rows.append([(Fraction(sum(row),len(row)),3)] if row else ['-'])
 return rows
def format_tournaments(cases):return ''.join(f'{n} {k}\n'+''.join(f'{a+1} {x} {b+1} {y}\n' for a,x,b,y in games) for n,k,games in cases)+'0\n'
def matrix_product(a,b):return [[sum(x*y for x,y in zip(row,column)) for column in zip(*b)] for row in a]
@lru_cache(None)
def tight_count(k,n):
 size=k+1;power=[[int(abs(i-j)<=1) for j in range(size)] for i in range(size)];result=[[int(i==j) for j in range(size)] for i in range(size)];exponent=n-1
 while exponent:
  if exponent&1:result=matrix_product(result,power)
  exponent//=2
  if exponent:power=matrix_product(power,power)
 return sum(map(sum,result))
def tight_rows(data):
 values=list(map(int,data.split()));assert values and len(values)%2==0;rows=[]
 for k,n in zip(values[::2],values[1::2]):assert 0<=k<=9 and 1<=n<=100;rows.append([(Fraction(100*tight_count(k,n),(k+1)**n),5)])
 return rows
def parse_lines(data,strict=True):
 values=list(map(int,data.split()));n=values[0];assert n>=1 and len(values)==1+8*n
 if strict:assert n<=10
 cases=[values[1+8*i:9+8*i] for i in range(n)]
 for x1,y1,x2,y2,x3,y3,x4,y4 in cases:assert all(-1000<=x<=1000 for x in [x1,y1,x2,y2,x3,y3,x4,y4]) and (x1,y1)!=(x2,y2) and (x3,y3)!=(x4,y4)
 return cases
def line_rows(data):
 rows=[['INTERSECTING LINES OUTPUT']]
 for x1,y1,x2,y2,x3,y3,x4,y4 in parse_lines(data):
  a=y2-y1;b=x1-x2;c=a*x1+b*y1;d=y4-y3;e=x3-x4;f=d*x3+e*y3;det=a*e-b*d
  if det:rows.append(['POINT ',(Fraction(c*e-b*f,det),2),' ',(Fraction(a*f-c*d,det),2)])
  else:rows.append(['LINE' if a*x3+b*y3==c else 'NONE'])
 rows.append(['END OF OUTPUT']);return rows
def format_lines(cases):return str(len(cases))+'\n'+'\n'.join(' '.join(map(str,row)) for row in cases)+'\n'
def rounded(value,places):
 sign='-' if value<0 else '';value=abs(value);scale=10**places;result=(value.numerator*scale*2+value.denominator)//(2*value.denominator)
 return (sign if result else '')+str(result//scale)+'.'+str(result%scale).zfill(places)
def render(rows):return '\n'.join(''.join(field if isinstance(field,str) else rounded(*field) for field in row) for row in rows)+'\n'
def matches(rows,text):
 lines=[line.rstrip(' \t\r') for line in text.split('\n')]
 while lines and lines[0]=='':lines.pop(0)
 while lines and lines[-1]=='':lines.pop()
 if len(rows)!=len(lines):return False
 for row,line in zip(rows,lines):
  fields=[field for field in row if not isinstance(field,str)];pattern=''.join(re.escape(field) if isinstance(field,str) else r'([+-]?\d+\.\d{'+str(field[1])+'})' for field in row);match=re.fullmatch(pattern,line)
  if not match:return False
  for supplied,(wanted,places) in zip(match.groups(),fields):
   if abs(Fraction(supplied)-wanted)>Fraction(1,2*10**places):return False
 return True
ORACLES={PRIME:prime_rows,WAR:tournament_rows,TIGHT:tight_rows,LINES:line_rows}
def additions():
 rng=random.Random(10903)
 games=[]
 for i in range(16):games.append((0,'rock',1,'scissors' if i==0 else 'paper'))
 games.extend([(0,'rock',1,'rock')]*4)
 tournaments=[(1,1,[]),(2,20,games),(2,1,[(0,'rock',1,'rock')])]
 for n,k in [(3,2),(10,10),(100,1)]:
  games=[]
  for a in range(n):
   for b in range(a+1,n):
    for _ in range(k):
     x,y=rng.choices(['rock','paper','scissors'],k=2)
     if rng.randrange(2):games.append((a,x,b,y))
     else:games.append((b,y,a,x))
  rng.shuffle(games);tournaments.append((n,k,games))
 maximum=[(a,'rock',b,'scissors' if (a+b+i)%3 else 'rock') for a in range(100) for b in range(a+1,100) for i in range(100)]
 cases=[[0,0,1,0,0,1,1,-7],[0,0,1,0,0,1,-1,-7],[0,0,1,0,0,1,-1,-999],[0,0,1,1,2,2,3,3],[0,0,0,1,1,0,1,1],[0,0,1,0,2,-1,2,1]]
 for _ in range(24):
  row=[rng.randrange(-1000,1001) for _ in range(8)]
  if row[:2]==row[2:4] or row[4:6]==row[6:]:continue
  cases.append(row)
 return {PRIME:[''.join(f'{n} {n}\n' for n in range(10001))+'0 10000\n0 39\n0 40\n'],WAR:[format_tournaments(tournaments),format_tournaments([(100,100,maximum)])],TIGHT:[''.join(f'{k} {n}\n' for k in range(10) for n in range(1,101))],LINES:[format_lines(cases[i:i+10]) for i in range(0,len(cases),10)]}
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
    except (AssertionError,ValueError,IndexError,StopIteration):
     check['status']='INPUT_REQUIRES_REVIEW'
     if p['slug']==LINES:
      cases=parse_lines(c['input'],False)
      if len(cases)>10:
       chunks=[format_lines(cases[i:i+10]) for i in range(0,len(cases),10)];data=chunks[0];extra[LINES].extend(chunks[1:]);row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':data,'output':render(oracle(data)),'reason':f'The original input permits at most10 line pairs, but this file contains{len(cases)}. Split only at complete8-coordinate record boundaries, preserving every line pair, coordinate and original order across successive cases; independently recompute required per-file headers and rational intersection answers.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all10001prime polynomial values;all1000tight-word parameter pairs;495000game tournament;true rounding midpoints,undefined rates,negative intersections andlegal10-pair files','input':data,'output':render(oracle(data))})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
