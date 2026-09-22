"""Independent digit DP, max-plus Floyd, subset halves, interval DP and polynomial products."""
import argparse,hashlib,json,math,random,re
from collections import Counter
from decimal import Decimal
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]

def bitmask(n,lower,upper):
 @lru_cache(None)
 def search(bit,tight_low,tight_high):
  if bit<0:return 0,0
  choices=[];lowbit=lower>>bit&1;highbit=upper>>bit&1
  for value in (0,1):
   if tight_low and value<lowbit or tight_high and value>highbit:continue
   tail_or,tail_mask=search(bit-1,tight_low and value==lowbit,tight_high and value==highbit)
   choices.append((tail_or|(((n>>bit&1)|value)<<bit),tail_mask|(value<<bit)))
  return max(choices,key=lambda item:(item[0],-item[1]))
 return search(31,True,True)[1]

def masks(data):
 v=list(map(int,data.split()));assert len(v)%3==0;out=[]
 for n,l,u in zip(v[::3],v[1::3],v[2::3]):
  assert 0<=n<2**32 and 0<=l<=u<2**32;out.append(str(bitmask(n,l,u)))
 return '\n'.join(out)+'\n'

def longest(n,start,edges):
 dist=[[-1000]*n for _ in range(n)]
 for i in range(n):dist[i][i]=0
 for a,b in edges:assert 1<=a<=n and 1<=b<=n and a!=b;dist[a-1][b-1]=1
 for k in range(n):
  for i in range(n):
   if dist[i][k]<0:continue
   for j in range(n):
    if dist[k][j]>=0:dist[i][j]=max(dist[i][j],dist[i][k]+dist[k][j])
 assert all(dist[i][i]==0 for i in range(n));assert all(v>=0 for v in dist[start-1]);answer=max(dist[start-1]);return answer,dist[start-1].index(answer)+1

def paths(data):
 v=list(map(int,data.split()));i=0;out=[]
 while True:
  n=v[i];i+=1
  if n==0:assert i==len(v);break
  assert 2<=n<=100;s=v[i];i+=1;assert 1<=s<=n;edges=[]
  while v[i:i+2]!=[0,0]:edges.append(tuple(v[i:i+2]));i+=2
  i+=2;length,finish=longest(n,s,edges);out.append(f'Case {len(out)+1}: The longest path from {s} has length {length}, finishing at {finish}.')
 return '\n\n'.join(out)+'\n\n'

@lru_cache(None)
def hash_table():
 groups=[]
 for start in (1,14):
  group=Counter()
  for mask in range(1<<13):group[(bin(mask).count('1'),sum(start+i for i in range(13) if mask>>i&1))]+=1
  groups.append(group)
 result=Counter()
 for (la,sa),ca in groups[0].items():
  for (lb,sb),cb in groups[1].items():result[la+lb,sa+sb]+=ca*cb
 return result

def hashing(data):
 v=list(map(int,data.split()));assert len(v)%2==0 and v[-2:]==[0,0];out=[];table=hash_table()
 for l,s in zip(v[:-2:2],v[1:-2:2]):
  assert 0<l<10000 and 0<s<10000;out.append(f'Case {len(out)+1}: {table[l,s]}')
 return '\n'.join(out)+'\n'

def expression_range(values,ops):
 @lru_cache(None)
 def interval(l,r):
  if l==r:return values[l],values[l]
  results=[]
  for mid in range(l,r):
   for a in interval(l,mid):
    for b in interval(mid+1,r):results.append(a+b if ops[mid]=='+' else a*b)
  return min(results),max(results)
 return interval(0,len(values)-1)

def camels(data):
 lines=data.splitlines();t=int(lines[0]);assert len(lines)==t+1 and t>=1;out=[]
 for line in lines[1:]:
  assert re.fullmatch(r'\s*\d+(?:\s*[+*]\s*\d+)*\s*',line);values=list(map(int,re.findall(r'\d+',line)));ops=re.findall(r'[+*]',line);assert 1<=len(values)<=12 and all(1<=v<=20 for v in values)
  small,large=expression_range(values,ops);out.append(f'The maximum and minimum are {large} and {small}.')
 return '\n'.join(out)+'\n'

@lru_cache(None)
def money_table():
 limit=6000;coeff=[1]*(limit+1)
 for coin in (2,4,10,20,40,100,200,400,1000,2000):
  previous=coeff;coeff=[0]*(limit+1)
  for copies in range(limit//coin+1):
   shift=copies*coin
   for remaining in range(limit-shift+1):coeff[remaining+shift]+=previous[remaining]
 return coeff

def dollars(data):
 amounts=[Decimal(token) for token in data.split()];assert amounts and amounts[-1]==0 and all(Decimal(0)<a<=Decimal(300) and a*20==(a*20).to_integral_value() for a in amounts[:-1]);table=money_table()
 return ''.join(f'{a:6.2f}{table[int(a*20)]:17d}\n' for a in amounts[:-1])
ORACLES={'gpe-23661-bit-mask':masks,'gpe-10602-longest-paths':paths,'gpe-11192-simple-minded-hashing':hashing,'gpe-23671-camel-trading':camels,'gpe-22181-dollars':dollars}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(10718);queries=[(n,l,u) for n in range(16) for l in range(16) for u in range(l,16)]+[(0,0,2**32-1),(2**32-1,0,2**32-1),(0,2**32-1,2**32-1),(2**31,2**31-1,2**31+1)]
 for _ in range(400):
  l,u=sorted([rng.randrange(2**32),rng.randrange(2**32)]);queries.append((rng.randrange(2**32),l,u))
 graphcases=[(3,1,[(1,3),(1,2)]),(2,2,[(2,1)])]
 for n in [4,8,12,20,30,100]:
  order=list(range(1,n+1));rng.shuffle(order);edges={(order[0],node) for node in order[1:]}
  for i in range(n):
   for j in range(i+1,n):
    if rng.random()<.22:edges.add((order[i],order[j]))
  graphcases.append((n,order[0],sorted(edges)))
 graphcases.append((100,100,[(i,i-1) for i in range(100,1,-1)]))
 expr=['1','20','1+2*3*4+5','*'.join(['20']*12),'+'.join(['20']*12),'1*1+1']
 for _ in range(600):
  length=rng.randrange(1,13);parts=[str(rng.randrange(1,21))]
  for _ in range(length-1):parts.extend([rng.choice('+*'),str(rng.randrange(1,21))])
  expr.append(''.join(parts))
 return {
 'gpe-23661-bit-mask':''.join(f'{n} {l} {u}\n' for n,l,u in queries),
 'gpe-10602-longest-paths':''.join(f'{n}\n{s}\n'+''.join(f'{a} {b}\n' for a,b in e)+'0 0\n' for n,s,e in graphcases)+'0\n',
 'gpe-11192-simple-minded-hashing':''.join(f'{l} {s}\n' for l in range(1,28) for s in range(1,353))+'9999 9999\n1 9999\n9999 1\n0 0\n',
 'gpe-23671-camel-trading':str(len(expr))+'\n'+'\n'.join(expr)+'\n',
 'gpe-22181-dollars':''.join(f'{c//100}.{c%100:02d}\n' for c in range(5,30001,5))+'0.00\n'}

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
                    if p['slug']=='gpe-22181-dollars' and kind=='samples' and c['ord']==1 and check['status']=='WRONG_EXPECTED_OUTPUT':
                        assert answer.split()==c['output'].split()
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Restore the documented money width 6 and combination count width 17. Numeric tokens are unchanged; imported sample used too many spaces.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: append missing single-zero final sentinel after the valid sequence. Sequence values and expected numeric result are unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'complete legal currency domain, exhaustive feasible hash bounds, signed/unsigned bit endpoints, positive expression extrema and reachable DAG ties','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
