"""Independent prime-exponent parity and matrix-power Fibonacci oracles."""
import argparse
import hashlib
import json
from pathlib import Path
import random
ROOT=Path(__file__).resolve().parents[3]

def lights(data):
    values=list(map(int,data.split()));assert values and values[-1]==0;out=[]
    for n in values[:-1]:
        assert 1<=n<=2**32-1
        remainder=n;all_even=True;d=2
        while d*d<=remainder:
            exponent=0
            while remainder%d==0:remainder//=d;exponent+=1
            if exponent%2:all_even=False
            d+=1 if d==2 else 2
        if remainder>1:all_even=False
        out.append('yes' if all_even else 'no')
    return '\n'.join(out)+'\n'

def matrix_fibonacci(n,mod):
    def multiply(a,b):
        return [[sum(a[i][k]*b[k][j] for k in range(2))%mod for j in range(2)] for i in range(2)]
    result=[[1,0],[0,1]];base=[[1,1],[1,0]]
    while n:
        if n&1:result=multiply(result,base)
        base=multiply(base,base);n//=2
    return result[0][1]%mod

def modular(data):
    tokens=list(map(int,data.split()));assert len(tokens)%2==0;out=[]
    for n,m in zip(tokens[::2],tokens[1::2]):
        assert 0<=n<=2147483647 and 0<=m<20
        out.append(str(matrix_fibonacci(n,2**m)))
    return '\n'.join(out)+'\n'

ORACLES={'uva-10110-light-more-light':lights,'uva-10229-modular-fibonacci':modular}
def additions():
    rng=random.Random(1011010229)
    values=list(range(1,501))+[2**32-1,2**31-1,2**31,2**31+1]
    for root in [2,3,31,255,256,46340,46341,65534,65535]:values.extend([root*root-1,root*root,root*root+1])
    values+=[rng.randrange(1,2**32) for _ in range(100)]
    queries=[(n,m) for n in [0,1,2,3,10,31,32,46,47,93,2**30,2**31-1] for m in range(20)]
    queries += [(rng.randrange(2**31),rng.randrange(20)) for _ in range(150)]
    return {'uva-10110-light-more-light':'\n'.join(map(str,values+[0]))+'\n','uva-10229-modular-fibonacci':''.join(f'{n} {m}\n' for n,m in queries)}

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
                except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'integer boundaries, square neighbors, modulus1 and large Fibonacci indices','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
