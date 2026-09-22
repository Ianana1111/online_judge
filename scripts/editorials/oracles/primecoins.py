"""Count normalized support shapes by explicit pair-distance checks, then exact allocations."""
import argparse,hashlib,json,math,random
from functools import lru_cache
from itertools import combinations
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
@lru_cache(maxsize=1)
def support_spans():
 limit=100000;prime=bytearray(b'\x01')*(limit+1);prime[0:2]=b'\x00\x00'
 for p in range(2,math.isqrt(limit)+1):
  if prime[p]:prime[p*p:limit+1:p]=b'\x00'*(((limit-p*p)//p)+1)
 shapes={1:{(0,)},2:{(0,p) for p in range(2,limit) if prime[p]},3:set(),4:set()}
 def legal(shape):return all(prime[b-a] for a,b in combinations(shape,2))
 for p in range(3,limit):
  for triple in [(0,2,p),(0,p,p+2)]:
   if triple[-1]<limit and legal(triple):shapes[3].add(triple)
  for q in [p-2,p+2]:
   shape=tuple(sorted(set([0,2,p,q])))
   if len(shape)==4 and shape[-1]<limit and legal(shape):shapes[4].add(shape)
 return {k:tuple(shape[-1] for shape in group) for k,group in shapes.items()}
def arrangements(n,m):
 spans=support_spans()
 return sum(sum(max(0,n-width) for width in spans[k])*math.comb(m-1,k-1) for k in range(1,min(m,4)+1))%1000000007

def coins(data):
 values=list(map(int,data.split()));t=values[0];assert 1<=t<=2000 and len(values)==1+2*t;out=[]
 for case,(n,m) in enumerate(zip(values[1::2],values[2::2]),1):
  assert 1<=n<=100000 and 1<=m<=100000;out.append(f'Case {case}: {arrangements(n,m)}')
 return '\n'.join(out)+'\n'
ORACLES={'gpe-10535-prime-distance':coins}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(13157);cases=[(n,m) for n in range(1,21) for m in range(1,10)]+[(100000,100000),(100000,1),(1,100000),(3,100000),(8,4),(7,4)]
 cases += [(rng.randrange(1,100001),rng.randrange(1,100001)) for _ in range(2000-len(cases))]
 return {'gpe-10535-prime-distance':str(len(cases))+'\n'+''.join(f'{n} {m}\n' for n,m in cases)}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all small occupancy patterns, reflected prime triples, first four-cell support, identical-coin allocation and modular maximum bounds','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
