"""Independent route enumeration/assignment, totients, integer roots and clock simulation."""
import argparse
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import random
import re
ROOT=Path(__file__).resolve().parents[3]


def parking(data):
    tokens=iter(map(int,data.split()));tests=next(tokens);assert 1<=tests<=100;out=[]
    for _ in range(tests):
        n=next(tokens);assert 1<=n<=20
        a=[next(tokens) for _ in range(n)];assert all(0<=x<=99 for x in a)
        left,right=min(a),max(a)
        # Enumerate actual integer parking positions and two extremal visit orders.
        out.append(str(min(abs(spot-left)+right-left+abs(right-spot) for spot in range(100))))
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def assignment(cost):
    n=len(cost);u=[0]*(n+1);v=[0]*(n+1);matched=[0]*(n+1);previous=[0]*(n+1)
    for row in range(1,n+1):
        matched[0]=row;column=0;best=[10**30]*(n+1);used=[False]*(n+1)
        while True:
            used[column]=True;active=matched[column];delta=10**30;next_column=0
            for j in range(1,n+1):
                if not used[j]:
                    reduced=cost[active-1][j-1]-u[active]-v[j]
                    if reduced<best[j]:best[j]=reduced;previous[j]=column
                    if best[j]<delta:delta=best[j];next_column=j
            for j in range(n+1):
                if used[j]:u[matched[j]]+=delta;v[j]-=delta
                else:best[j]-=delta
            column=next_column
            if matched[column]==0:break
        while column:
            parent=previous[column];matched[column]=matched[parent];column=parent
    return sum(cost[matched[j]-1][j-1] for j in range(1,n+1))


def buses(data):
    tokens=iter(map(int,data.split()));out=[]
    while True:
        n,d,r=[next(tokens) for _ in range(3)]
        if (n,d,r)==(0,0,0):break
        assert 1<=n<=100 and 1<=d<=10000 and 1<=r<=5
        a=[next(tokens) for _ in range(n)];b=[next(tokens) for _ in range(n)];assert all(1<=x<=10000 for x in a+b)
        costs=[[max(0,x+y-d)*r for y in b] for x in a]
        out.append(str(assignment(costs)))
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


PHI=list(range(501))
for prime in range(2,501):
    if PHI[prime]==prime:
        for multiple in range(prime,501,prime):PHI[multiple]-=PHI[multiple]//prime
PHI_PREFIX=[0]*501
for k in range(2,501):PHI_PREFIX[k]=PHI_PREFIX[k-1]+PHI[k]
def gcd_sum(data):
    values=list(map(int,data.split()));assert values[-1]==0 and len(values)<=100;out=[]
    for n in values[:-1]:
        assert 2<=n<=500
        out.append(str(sum(d*PHI_PREFIX[n//d] for d in range(1,n+1))))
    return '\n'.join(out)+'\n'


def quadrangle(data):
    tokens=iter(map(int,data.split()));tests=next(tokens);assert tests>=1;out=[]
    for _ in range(tests):
        a=[next(tokens) for _ in range(4)];assert all(0<x<=2**30 for x in a)
        counts=Counter(a)
        if len(counts)==1:answer='square'
        elif len(counts)==2 and set(counts.values())=={2}:answer='rectangle'
        elif all(x<sum(a)-x for x in a):answer='quadrangle'
        else:answer='banana'
        out.append(answer)
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def squares(data):
    tokens=iter(map(int,data.split()));out=[]
    while True:
        a,b=next(tokens),next(tokens)
        if (a,b)==(0,0):break
        assert 1<=a<=b<=100000
        out.append(str(math.isqrt(b)-math.isqrt(a-1)))
    assert next(tokens,None) is None and len(out)<=200
    return '\n'.join(out)+'\n'


def nlogonia(data):
    tokens=iter(map(int,data.split()));out=[]
    names={(1,1):'NE',(-1,1):'NO',(-1,-1):'SO',(1,-1):'SE'}
    while True:
        count=next(tokens)
        if count==0:break
        assert 1<=count<=1000
        n,m=next(tokens),next(tokens);assert -10000<n<10000 and -10000<m<10000
        for _ in range(count):
            x,y=next(tokens),next(tokens);assert -10000<=x<=10000 and -10000<=y<=10000
            dx,dy=x-n,y-m
            out.append('divisa' if 0 in (dx,dy) else names[(1 if dx>0 else -1,1 if dy>0 else -1)])
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def rle(data):
    lines=data.split();tests=int(lines[0]);assert 1<=tests<50 and len(lines)==tests+1;out=[]
    for tc,encoded in enumerate(lines[1:],1):
        groups=re.findall(r'([A-Z])([0-9]+)',encoded);assert ''.join(a+b for a,b in groups)==encoded
        assert sum(int(count) for _,count in groups)<=200
        decoded=''.join(letter*int(count) for letter,count in groups)
        out.append(f'Case {tc}: {decoded}')
    return '\n'.join(out)+'\n'


def overlap(left,right):
    text=right+'#'+left;pi=[0]*len(text)
    for i in range(1,len(text)):
        length=pi[i-1]
        while length and text[i]!=text[length]:length=pi[length-1]
        if text[i]==text[length]:length+=1
        pi[i]=length
    return pi[-1]


def scrolling(data):
    tokens=iter(data.split());tests=int(next(tokens));assert tests>=1;out=[]
    for _ in range(tests):
        k,w=int(next(tokens)),int(next(tokens));assert 1<=k<=100 and 1<=w<=100
        words=[next(tokens) for _ in range(w)];assert all(re.fullmatch('[A-Z]{'+str(k)+'}',word) for word in words)
        total=k
        for previous,current in zip(words,words[1:]):total+=k-overlap(previous,current)
        out.append(str(total))
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def hello(data):
    values=list(map(int,data.split()));assert values[-1]<0 and len(values)<=2000
    assert all(1<=n<=10000 for n in values[:-1])
    return ''.join(f'Case {i}: {(n-1).bit_length()}\n' for i,n in enumerate(values[:-1],1))


def alarm(data):
    tokens=iter(map(int,data.split()));out=[]
    while True:
        h,m,a,b=[next(tokens) for _ in range(4)]
        if (h,m,a,b)==(0,0,0,0):break
        assert 0<=h<=23 and 0<=a<=23 and 0<=m<=59 and 0<=b<=59
        elapsed=0
        while True:
            m+=1
            if m==60:m=0;h+=1
            if h==24:h=0
            elapsed+=1
            if (h,m)==(a,b):break
        out.append(str(elapsed))
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


ORACLES={'uva-11364-parking':parking,'uva-11389-the-bus-driver-problem':buses,'uva-11417-gcd':gcd_sum,'uva-11455-behold-my-quadrangle':quadrangle,'uva-11461-square-numbers':squares,'uva-11498-division-of-nlogonia':nlogonia,'uva-11541-decoding':rle,'uva-11576-scrolling-sign':scrolling,'uva-11636-hello-world':hello,'uva-11677-alarm-clock':alarm}


def repair_input(slug,data):
    digest=hashlib.sha256(data.encode()).hexdigest()
    reviewed={'uva-11417-gcd':'d93a52cc46ed896706cea38a441284dc3d241e604fb351725c50bb9fd38c6400','uva-11636-hello-world':'98a7573375511af05d101378a9c83bba0770d4bf719879bf7a3f2899a8b0aef7'}
    if reviewed.get(slug)==digest:
        values=data.split();return '\n'.join(values[:-2]+[values[-1]])+'\n'
    if slug=='uva-11677-alarm-clock' and digest=='91845aed9d92792ecc7412e0cc1d8e55e4538734f76010975519048f4f1d8232':
        values=list(map(int,data.split()));rows=list(zip(values[::4],values[1::4],values[2::4],values[3::4]));assert rows[-1]==(0,0,0,0)
        return ''.join(' '.join(map(str,row))+'\n' for row in rows[:-1] if row!=(0,0,0,0))+'0 0 0 0\n'
    return None


def additions():
    rng=random.Random(11389)
    positions=[[0],[99],[42]*20,[0,99],list(range(20))]+[[rng.randrange(100) for _ in range(rng.randrange(1,21))] for _ in range(95)]
    shifts=[(11,5,[1,10],[1,10]),(20,5,[10,15],[10,15]),(10000,1,[1],[1]),(1,5,[10000]*100,[10000]*100)]
    for _ in range(20):
        n=rng.randrange(1,9);shifts.append((rng.randrange(1,10001),rng.randrange(1,6),[rng.randrange(1,10001) for _ in range(n)],[rng.randrange(1,10001) for _ in range(n)]))
    sides=[(1,1,1,1),(9,1,9,1),(1,2,3,6),(1,2,3,5),(1,2,3,7),(2**30,2**30,2**30,2**30),(2**30,2**30-1,2**30-2,2**30-3)]
    sides += [tuple(rng.randrange(1,2**30+1) for _ in range(4)) for _ in range(100)]
    intervals=[(1,1),(2,3),(4,4),(9,9),(1,100000),(99856,100000),(99857,100000)]
    while len(intervals)<200:
        root=rng.randrange(1,317);value=root*root;a=max(1,value+rng.randrange(-1,2));b=min(100000,value+rng.randrange(-1,2));intervals.append(tuple(sorted((a,b))))
    homes=[]
    for n,m in [(0,0),(-9999,9999),(9999,-9999),(123,-456)]:
        points=[(n,m),(n,0),(0,m),(-10000,-10000),(-10000,10000),(10000,-10000),(10000,10000)]
        points += [(rng.randrange(-10000,10001),rng.randrange(-10000,10001)) for _ in range(993)]
        homes.append(f'{len(points)}\n{n} {m}\n'+''.join(f'{x} {y}\n' for x,y in points))
    encoded=['A12','Z200','A2B1A3','A1B1C1D1','X99Y101','A1B1C1']
    for _ in range(43):
        remaining=rng.randrange(1,201);parts=[]
        while remaining:
            count=rng.randrange(1,remaining+1);parts.append(rng.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')+str(count));remaining-=count
        encoded.append(''.join(parts))
    signs=[(1,['A']*100),(3,['CAT','ATE','TEA']),(3,['CAT','CAT']),(4,['ABCD','EFGH']),(5,['ABABA','BABAB','ABABA']),(100,['A'*100]*100)]
    for _ in range(40):
        k=rng.randrange(1,101);signs.append((k,[''.join(rng.choice('ABC') for _ in range(k)) for _ in range(rng.randrange(1,101))]))
    ns=sorted(set([1,10000]+[x for exponent in range(14) for x in [2**exponent-1,2**exponent,2**exponent+1] if 1<=x<=10000]))
    clocks=[(0,1,h,m) for h in range(24) for m in range(60)]+[(23,59,0,0),(0,0,23,59),(12,0,12,0),(21,33,21,10)]
    return {'uva-11364-parking':str(len(positions))+'\n'+''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in positions),
            'uva-11389-the-bus-driver-problem':''.join(f'{len(a)} {d} {r}\n'+' '.join(map(str,a))+'\n'+' '.join(map(str,b))+'\n' for d,r,a,b in shifts)+'0 0 0\n',
            'uva-11417-gcd':'\n'.join(map(str,[2,3,500,499]+[rng.randrange(2,501) for _ in range(95)]+[0]))+'\n',
            'uva-11455-behold-my-quadrangle':str(len(sides))+'\n'+''.join(' '.join(map(str,s))+'\n' for s in sides),
            'uva-11461-square-numbers':''.join(f'{a} {b}\n' for a,b in intervals)+'0 0\n',
            'uva-11498-division-of-nlogonia':''.join(homes)+'0\n',
            'uva-11541-decoding':str(len(encoded))+'\n'+'\n'.join(encoded)+'\n',
            'uva-11576-scrolling-sign':str(len(signs))+'\n'+''.join(f'{k} {len(words)}\n'+'\n'.join(words)+'\n' for k,words in signs),
            'uva-11636-hello-world':'\n'.join(map(str,ns+[-17]))+'\n',
            'uva-11677-alarm-clock':''.join(' '.join(map(str,c))+'\n' for c in clocks)+'0 0 0 0\n'}


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
                    if corrected is not None:
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Respect literal total input-line cap by moving final query to separate case, or remove premature all-zero terminator that hid remaining clock queries; retain existing equal-clock1440 convention.'})
                        if p['slug'] in ['uva-11417-gcd','uva-11636-hello-world']:
                            last=c['input'].split();single=last[-2]+'\n'+last[-1]+'\n'
                            if not any(old['input']==single for old in p['testCases']):row['proposedAdditions'].append({'label':'Preserve final original query in its own legal input file','input':single,'output':oracle(single)})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal inclusive endpoints, matching optima, equality, full overlap and integer boundaries','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
