"""Independent spiral path segments, two-pointer sums, raster skyline, inverse search and trial division."""
import argparse
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import random

ROOT=Path(__file__).resolve().parents[3]


def ant(data):
    values=list(map(int,data.split()));assert values[-1]==0 and all(1<=n<=2_000_000_000 for n in values[:-1]);out=[]
    for n in values[:-1]:
        side=math.isqrt(n-1)+1;offset=n-(side-1)**2-1
        # Walk the two segments of this layer from its first coordinate.
        if side%2:
            x,y=side,1
            y+=min(offset,side-1);x-=max(0,offset-side+1)
        else:
            x,y=1,side
            x+=min(offset,side-1);y-=max(0,offset-side+1)
        out.append(f'{x} {y}')
    return '\n'.join(out)+'\n'


def closest(data):
    it=iter(map(int,data.split()));out=[];tc=0
    while True:
        n=next(it)
        if n==0:break
        assert 1<n<=1000
        a=sorted(next(it) for _ in range(n));assert len(set(a))==n
        count=next(it);assert 0<count<25;tc+=1;out.append(f'Case {tc}:')
        for _ in range(count):
            target=next(it);left,right=0,n-1;best=None;choices=set()
            while left<right:
                value=a[left]+a[right];distance=abs(value-target)
                if best is None or distance<best:best=distance;choices={value}
                elif distance==best:choices.add(value)
                if value<target:left+=1
                else:right-=1
            assert len(choices)==1,'Distinct closest sums tied; source promises no ties'
            out.append(f'Closest sum to {target} is {choices.pop()}.')
    assert next(it,None) is None
    return '\n'.join(out)+'\n'


def skyline(data):
    values=list(map(int,data.split()));assert len(values)%3==0 and 1<=len(values)//3<=5000
    buildings=[values[i:i+3] for i in range(0,len(values),3)];assert buildings==sorted(buildings,key=lambda b:b[0])
    heights=[0]*10000
    for left,height,right in buildings:
        assert 0<left<right<10000 and 0<height<10000
        # Literal top height of each unit interval, independent of event ordering.
        for x in range(left,right):heights[x]=max(heights[x],height)
    out=[];previous=0
    for x,height in enumerate(heights):
        if height!=previous:out.extend((x,height));previous=height
    return ' '.join(map(str,out))+'\n'


def rare(data):
    values=list(map(int,data.split()));assert values[-1]==0 and all(10<=d<=10**18 for d in values[:-1]);out=[]
    for d in values[:-1]:
        # Monotone binary search of the original operation, not the algebraic formula.
        low,high=d,2*d
        while low<high:
            mid=(low+high)//2
            if mid-mid//10>=d:high=mid
            else:low=mid+1
        answers=[]
        while low-low//10==d:answers.append(low);low+=1
        assert 1<=len(answers)<=2
        out.append(' '.join(map(str,answers)))
    return '\n'.join(out)+'\n'


def prime_frequency(data):
    lines=data.splitlines();tests=int(lines[0]);assert 0<tests<201 and len(lines)==tests+1;out=[]
    alphabet=set('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz')
    for i,line in enumerate(lines[1:],1):
        assert 0<len(line)<2001 and set(line)<=alphabet
        counts=Counter(line)
        is_prime=lambda n:n>=2 and all(n%d for d in range(2,math.isqrt(n)+1))
        answer=''.join(c for c in sorted(counts) if is_prime(counts[c]))
        out.append(f'Case {i}: {answer or "empty"}')
    return '\n'.join(out)+'\n'


ORACLES={'uva-10161-ant-on-a-chessboard':ant,'uva-10487-closest-sums':closest,
         'uva-105-the-skyline-problem':skyline,'uva-10633-rare-easy-problem':rare,
         'uva-10789-prime-frequency':prime_frequency}


def additions():
    rng=random.Random(10633)
    positions=list(range(1,300))
    for root in [2,3,100,101,44720,44721]:
        positions.extend([root*root-1,root*root,root*root+1,root*(root-1),root*(root-1)+1,root*(root-1)+2])
    positions.extend([1999999999,2000000000])
    sets=[([-10,3],[0,-100,100]),([-100,-5,0,10,100],[5,6,95,110,-105,0])]
    large=sorted(rng.sample(range(-1000000,1000001),1000));queries=[large[i]+large[-i-1] for i in range(24)];sets.append((large,queries))
    sums=''.join(str(len(a))+'\n'+'\n'.join(map(str,a))+'\n'+str(len(q))+'\n'+'\n'.join(map(str,q))+'\n' for a,q in sets)+'0\n'
    buildings=[(1,10,5),(1,10,3),(2,7,4),(3,10,7),(5,20,6),(7,10,9),(10,15,11),(11,15,12),(9998,9999,9999)]
    buildings += [(20+i,1+i%200,25+i) for i in range(4991)]
    buildings.sort(key=lambda b:b[0])
    rare_values=list(range(10,110))+[10**18-1,10**18,999999999999999999,9007199254740993]
    alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    texts=[alphabet,alphabet*2,'a'*1999+'Z','z'*2000,'a'*121+'b'*169+'c'*127,'0'*2+'A'*3+'Z'*5+'a'*7+'z'*11]
    texts += [rng.choice(alphabet)*rng.randrange(1,2001) for _ in range(194)]
    return {'uva-10161-ant-on-a-chessboard':'\n'.join(map(str,positions))+'\n0\n',
            'uva-10487-closest-sums':sums,
            'uva-105-the-skyline-problem':'\n'.join(' '.join(map(str,b)) for b in buildings)+'\n',
            'uva-10633-rare-easy-problem':'\n'.join(map(str,rare_values))+'\n0\n',
            'uva-10789-prime-frequency':str(len(texts))+'\n'+'\n'.join(texts)+'\n'}


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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal ring corners, unique closest sums, simultaneous endpoints and numeric bounds','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
