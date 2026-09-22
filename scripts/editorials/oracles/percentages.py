"""Independent exact rational probabilities and sorted/grouped species percentages."""
import argparse
from decimal import Decimal, localcontext, ROUND_HALF_UP
from fractions import Fraction
import hashlib
from itertools import groupby
import json
from pathlib import Path
import random
import re
ROOT=Path(__file__).resolve().parents[3]


def probability_values(data):
    tokens=iter(data.split());t=int(next(tokens));assert 1<=t<=1000;values=[]
    for _ in range(t):
        n=int(next(tokens));p=Fraction(next(tokens));i=int(next(tokens));assert 1<=n<=1000 and 1<=i<=n and 0<=p<=1
        q=1-p
        values.append(p*q**(i-1)/(1-q**n) if p else Fraction(0))
    assert next(tokens,None) is None
    return values


def hardwood_groups(data):
    lines=data.replace('\r\n','\n').split('\n');t=int(lines[0]);assert t>=1;groups=[];current=[]
    for line in lines[1:]:
        if not line:
            if current:groups.append(current);current=[]
        else:
            assert 1<=len(line)<=30
            current.append(line)
    if current:groups.append(current)
    assert len(groups)==t
    result=[]
    for group in groups:
        assert 1<=len(group)<=1000000
        counts=[(name,len(list(rows))) for name,rows in groupby(sorted(group))];assert len(counts)<=10000
        result.append([(name,Fraction(count*100,len(group))) for name,count in counts])
    return result


def rounded(value):
    with localcontext() as ctx:
        ctx.prec=80
        return format((Decimal(value.numerator)/Decimal(value.denominator)).quantize(Decimal('0.0001'),rounding=ROUND_HALF_UP),'.4f')


def probability(data):return '\n'.join(map(rounded,probability_values(data)))+'\n'
def hardwood(data):return '\n\n'.join('\n'.join(name+' '+rounded(value) for name,value in group) for group in hardwood_groups(data))+'\n'


def nearest(text,value):
    return bool(re.fullmatch(r'\d{1,3}\.\d{4}',text)) and abs(Fraction(text)-value)<=Fraction(1,20000)


def valid_answer(slug,data,answer):
    if slug.startswith('uva-10056'):
        lines=answer.strip().splitlines();wanted=probability_values(data)
        return len(lines)==len(wanted) and all(nearest(a.strip(),v) for a,v in zip(lines,wanted))
    groups=answer.strip('\r\n').replace('\r\n','\n').split('\n\n');wanted=hardwood_groups(data)
    if len(groups)!=len(wanted):return False
    for block,expected in zip(groups,wanted):
        lines=block.splitlines()
        if len(lines)!=len(expected):return False
        for line,(name,value) in zip(lines,expected):
            match=re.fullmatch(r'(.*) (\d{1,3}\.\d{4})[ \t]*',line)
            if not match or match[1]!=name or not nearest(match[2],value):return False
    return True


ORACLES={'uva-10056-what-is-the-probability':probability,'uva-10226-hardwood-species':hardwood}
def additions():
    cases=[(1,'0',1),(1,'1',1),(1,'0.00000000000000000001',1),(2,'0',1),(2,'1',2),(2,'0.4',2),(1000,'0.00000000000000000001',1000),(32,'0.00000000000000000001',1),(32,'0.00000000000000000001',32)]
    cases += [(n,p,i) for n in [2,3,7,32,99,1000] for p in ['0.000001','0.01','0.5','0.99','0.999999'] for i in sorted({1,n//2 or 1,n})]
    rng=random.Random(10056)
    while len(cases)<1000:
        n=rng.randrange(1,1001);cases.append((n,f'{rng.randrange(1000001)/1000000:.6f}',rng.randrange(1,n+1)))
    groups=['Red Oak\nAsh\nRed Oak\n','X'*30+'\n','A\n'+'B\n'*399999,'A\n'+'B\n'*999999,'A\n'+'B\n'*127,''.join(f'Tree {i:05d}\n' for i in range(9999,-1,-1))]
    return {'uva-10056-what-is-the-probability':str(len(cases))+'\n'+''.join(f'{n} {p} {i}\n' for n,p,i in cases),'uva-10226-hardwood-species':str(len(groups))+'\n\n'+'\n'.join(groups)}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args()
    output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/')
    output.mkdir(parents=True,exist_ok=True,mode=0o700);digest=lambda text:hashlib.sha256(text.encode()).hexdigest()
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
                try:check['status']='MATCH' if valid_answer(p['slug'],c['input'],c['output']) else 'WRONG_EXPECTED_OUTPUT'
                except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal zero/certainty/tiny probability, precision midpoint, maximum population and species','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
