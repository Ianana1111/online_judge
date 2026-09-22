"""Independent exact ratio ordering, integer-root bounds, bigint products and grouped knapsack."""
import argparse,hashlib,json,math,random
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def signed_minimum(k):
 k=abs(k);n=max(1,(math.isqrt(8*k+1)-1)//2)
 while n*(n+1)//2<k or (n*(n+1)//2-k)%2:n+=1
 return n

def signed(data):
 values=list(map(int,data.split()));t=values[0];assert t>0 and len(values)==t+1 and all(abs(k)<=10**9 for k in values[1:])
 return '\n\n'.join(str(signed_minimum(k)) for k in values[1:])+'\n'
def job_order(jobs):return sorted(range(len(jobs)),key=lambda i:(Fraction(jobs[i][0],jobs[i][1]),i))
def shoemaker(data):
 values=list(map(int,data.split()));t=values[0];assert t>0;i=1;out=[]
 for _ in range(t):
  n=values[i];i+=1;assert 1<=n<=1000;jobs=[]
  for _ in range(n):
   days,fine=values[i:i+2];i+=2;assert 1<=days<=1000 and 1<=fine<=10000;jobs.append((days,fine))
  out.append(' '.join(str(j+1) for j in job_order(jobs)))
 assert i==len(values)
 return '\n\n'.join(out)+'\n'
def product(data):
 words=data.split();assert len(words)%2==0;out=[]
 for a,b in zip(words[::2],words[1::2]):
  assert a.isdigit() and b.isdigit() and 0<=int(a)<10**250 and 0<=int(b)<10**250;out.append(str(int(a)*int(b)))
 return '\n'.join(out)+'\n'
def grouped_knapsack(items):
 groups={}
 for price,weight in items:groups.setdefault(weight,[]).append(price)
 dp=[0]*31
 for weight,prices in groups.items():
  prefix=[0]
  for price in sorted(prices,reverse=True)[:30//weight]:prefix.append(prefix[-1]+price)
  dp=[max(dp[cap-q*weight]+prefix[q] for q in range(min(cap//weight,len(prefix)-1)+1)) for cap in range(31)]
 return dp

def sale(data):
 values=list(map(int,data.split()));t=values[0];assert 1<=t<=1000;i=1;out=[]
 for _ in range(t):
  n=values[i];i+=1;assert 1<=n<=1000;items=[]
  for _ in range(n):
   price,weight=values[i:i+2];i+=2;assert 1<=price<=100 and 1<=weight<=30;items.append((price,weight))
  g=values[i];i+=1;assert 1<=g<=100;capacities=values[i:i+g];i+=g;assert len(capacities)==g and all(1<=c<=30 for c in capacities);best=grouped_knapsack(items);out.append(str(sum(best[c] for c in capacities)))
 assert i==len(values)
 return '\n'.join(out)+'\n'
ORACLES={'uva-10025-the-1-2-n-k-problem':signed,'uva-10026-shoemaker-s-problem':shoemaker,'uva-10106-product':product,'uva-10130-supersale':sale}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(1002510130)
 targets=list(range(-200,201))+[-10**9,10**9]
 for n in [2,3,100,1000,44720]:
  s=n*(n+1)//2
  for k in [s-1,s,s+1]:
   if k<=10**9:targets.extend([k,-k])
 jobs=[[(3,4),(1,3)],[(1,1),(2,2),(3,3)],[(1000,10000)]*1000,[(1000,1),(1,10000)]]
 jobs += [[(rng.randrange(1,1001),rng.randrange(1,10001)) for _ in range(rng.randrange(1,50))] for _ in range(40)]
 products=[('0','0'),('0','9'*250),('1','9'*250),('9'*250,'9'*250),('1'+'0'*249,'1'+'0'*249),('000123','00456'),('12','34')]
 products += [(str(rng.randrange(10**249,10**250)),str(rng.randrange(10**249,10**250))) for _ in range(30)]
 sales=[([(10,5)],[10]),([(10,5)],[5,5]),([(100,30)],[1]*100),([(100,1)]*1000,[30]*100),([(10,1),(20,1),(30,1)],[1,2,3])]
 sales += [([(rng.randrange(1,101),rng.randrange(1,31)) for _ in range(rng.randrange(1,100))],[rng.randrange(1,31) for _ in range(rng.randrange(1,101))]) for _ in range(60)]
 return {'uva-10025-the-1-2-n-k-problem':str(len(targets))+'\n\n'+'\n\n'.join(map(str,targets))+'\n',
 'uva-10026-shoemaker-s-problem':str(len(jobs))+'\n\n'+'\n\n'.join(str(len(case))+'\n'+'\n'.join(f'{days} {fine}' for days,fine in case) for case in jobs)+'\n',
 'uva-10106-product':''.join(a+'\n'+b+'\n' for a,b in products),
 'uva-10130-supersale':str(len(sales))+'\n'+''.join(str(len(items))+'\n'+''.join(f'{p} {w}\n' for p,w in items)+str(len(caps))+'\n'+'\n'.join(map(str,caps))+'\n' for items,caps in sales)}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'zero target and triangular parity, exact ratio ties, full250digit carry chains and independent per-person zero-one inventories','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
