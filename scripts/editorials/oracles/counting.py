"""Independent sorted differences, repeated text counts, displacement sums, sieve and path counts."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import random

ROOT=Path(__file__).resolve().parents[3]


def jolly(data):
    values=iter(map(int,data.split()));out=[]
    while True:
        n=next(values,None)
        if n is None:break
        assert 1<=n<=3000
        a=[next(values) for _ in range(n)]
        differences=sorted(abs(a[i]-a[i-1]) for i in range(1,n))
        out.append('Jolly' if differences==list(range(1,n)) else 'Not jolly')
    return '\n'.join(out)+'\n'


def frequencies(data):
    lines=data.split('\n')
    if lines[-1]=='':lines.pop()
    blocks=[]
    for line in lines:
        if line.endswith('\r'):line=line[:-1]
        assert len(line)<=1000 and all(32<=ord(ch)<=127 for ch in line)
        records=sorted([(ord(ch),line.count(ch)) for ch in set(line)],key=lambda row:(row[1],-row[0]))
        blocks.append(''.join(f'{code} {count}\n' for code,count in records))
    return '\n'.join(blocks)


def physics(data):
    values=list(map(int,data.split()));assert values and len(values)%2==0;out=[]
    for velocity,time in zip(values[::2],values[1::2]):
        assert -100<=velocity<=100 and 0<=time<=200
        # A zero-acceleration trajectory has this same midpoint velocity. Sum
        # each unit-time displacement, independently of the reference product.
        out.append(str(sum(velocity for _ in range(2*time))))
    return '\n'.join(out)+'\n'


PRIME=None
def prime_table():
    global PRIME
    if PRIME is None:
        PRIME=bytearray(b'\1')*1000000;PRIME[0:2]=b'\0\0'
        for p in range(2,1000):
            if PRIME[p]:PRIME[p*p::p]=b'\0'*len(PRIME[p*p::p])
    return PRIME


def emirp(data):
    values=list(map(int,data.split()));assert values and all(1<n<1000000 for n in values);table=prime_table();out=[]
    for n in values:
        reverse=int(str(n)[::-1])
        kind='not prime' if not table[n] else 'emirp' if reverse!=n and table[reverse] else 'prime'
        out.append(f'{n} is {kind}.')
    return '\n'.join(out)+'\n'


def conquests(data):
    lines=data.splitlines();n=int(lines[0]);assert 0<=n<=1999 and len(lines)==n+1
    countries=[]
    for line in lines[1:]:
        assert len(line)<=75 and len(line.split())>=2
        countries.append(line.split()[0])
    countries.sort();out=[];index=0
    while index<len(countries):
        end=index+1
        while end<len(countries) and countries[end]==countries[index]:end+=1
        out.append(f'{countries[index]} {end-index}');index=end
    return '\n'.join(out)+('\n' if out else '')


def diagonal_steps(data):
    values=iter(map(int,data.split()));t=next(values);assert 0<t<=500;out=[]
    for i in range(1,t+1):
        x,y,a,b=[next(values) for _ in range(4)];assert all(0<=v<=100000 for v in [x,y,a,b])
        first,second=x+y,a+b
        # Sum actual diagonal lengths between the two positions, avoiding the
        # reference's closed-form triangular-number subtraction.
        assert second>first or (second==first and a>=x)
        distance=a-x+sum(length for length in range(first+1,second+1))
        out.append(f'Case {i}: {distance}')
    assert next(values,None) is None
    return '\n'.join(out)+'\n'


def odd_sum(data):
    values=iter(map(int,data.split()));t=next(values);assert 1<=t<=100;out=[]
    for i in range(1,t+1):
        a,b=next(values),next(values);assert 0<=a<=b<=100
        out.append(f'Case {i}: {sum(x for x in range(a,b+1) if x%2)}')
    assert next(values,None) is None
    return '\n'.join(out)+'\n'


ORACLES={'uva-10038-jolly-jumpers':jolly,'uva-10062-tell-me-the-frequencies':frequencies,
         'uva-10071-back-to-high-school-physics':physics,'uva-10235-simply-emirp':emirp,
         'uva-10420-list-of-conquests':conquests,'uva-10642-can-you-solve-it':diagonal_steps,'uva-10783-odd-sum':odd_sum}


def additions():
    rng=random.Random(10642)
    large=[];left,right=1,3000
    while left<=right:
        large.append(left);left+=1
        if left<=right:large.append(right);right-=1
    arrays=[[1],[1,1],[1,4,2,3],[1,2,3,4],[2147483647,-2147483648],large,large[:-1]+[large[-2]]]
    text=['','Aa!! ','BCA','zzzzz',''.join(chr(c) for c in range(32,128)), 'x'*1000,'','11 22 3']
    prime_values=list(range(2,1000))+[1009,10007,999983,999979,999999,100000,99991]
    names=[f'{country} Person {index} With Several Names' for index,country in enumerate(['Zed','Abc','Alpha','Zed','USA','USA','Taiwan'])]
    names+=['Taiwan Same Name']*1992
    pairs=[(0,0,0,0),(0,0,0,1),(0,3,3,0),(100000,0,0,100000+0),(0,0,100000,100000),(100000,99999,100000,100000)]
    # Remove the deliberately reverse-direction construction; reversed paths are
    # not legal counterexamples for this problem.
    pairs=[p for p in pairs if p[2]+p[3]>p[0]+p[1] or (p[2]+p[3]==p[0]+p[1] and p[2]>=p[0])]
    for _ in range(495):
        start=[rng.randrange(100001),rng.randrange(100001)];end=[rng.randrange(100001),rng.randrange(100001)]
        if (sum(start),start[0])>(sum(end),end[0]):start,end=end,start
        pairs.append(tuple(start+end))
    intervals=[(0,0),(1,1),(2,2),(99,100),(0,100)]
    for _ in range(95):a,b=sorted([rng.randrange(101),rng.randrange(101)]);intervals.append((a,b))
    return {'uva-10038-jolly-jumpers':''.join(str(len(a))+' '+' '.join(map(str,a))+'\n' for a in arrays),
            'uva-10062-tell-me-the-frequencies':'\r\n'.join(text)+'\r\n',
            'uva-10071-back-to-high-school-physics':''.join(f'{v} {t}\n' for v in range(-100,101) for t in range(201)),
            'uva-10235-simply-emirp':'\n'.join(map(str,prime_values))+'\n',
            'uva-10420-list-of-conquests':str(len(names))+'\n'+'\n'.join(names)+'\n',
            'uva-10642-can-you-solve-it':str(len(pairs))+'\n'+''.join(' '.join(map(str,p))+'\n' for p in pairs),
            'uva-10783-odd-sum':str(len(intervals))+'\n'+''.join(f'{a}\n{b}\n' for a,b in intervals)}


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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal empty text, ties, signed boundaries and coordinate extremes','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
