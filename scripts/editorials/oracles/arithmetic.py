"""Independent modular scans, cost sweeps, calendars, decimal grouping and small-domain oracles."""
import argparse
from collections import Counter
from functools import lru_cache
import hashlib
import json
import math
from pathlib import Path
import random
import re

ROOT=Path(__file__).resolve().parents[3]
DIGITS='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'


def easy_base(data):
    out=[]
    for line in data.splitlines():
        number=line.strip();assert re.fullmatch(r'[+-]?[0-9A-Za-z]+',number)
        values=[DIGITS.index(c) for c in number.lstrip('+-')];answer=None
        for base in range(max(2,max(values)+1),63):
            # Evaluate each candidate base modulo base-1 using Horner, rather than
            # using the reference's digit-sum congruence shortcut.
            residue=0
            for value in values:residue=(residue*base+value)%(base-1)
            if residue==0:answer=base;break
        out.append(str(answer) if answer is not None else 'such number is impossible!')
    assert out
    return '\n'.join(out)+'\n'


def vito(data):
    it=iter(map(int,data.split()));t=next(it);assert t>0;out=[]
    for _ in range(t):
        count=next(it);assert 0<count<500
        values=[next(it) for _ in range(count)];assert all(0<x<30000 for x in values)
        frequency=Counter(values);cost=sum(x-1 for x in values);best=cost;left=0
        # Move the house across every legal coordinate, tracking the cost slope.
        for x in range(1,29999):
            left+=frequency[x];cost+=2*left-count;best=min(best,cost)
        out.append(str(best))
    assert next(it,None) is None
    return '\n'.join(out)+'\n'


def hartals(data):
    it=iter(map(int,data.split()));t=next(it);assert t>0;out=[]
    for _ in range(t):
        days,parties=next(it),next(it);assert 7<=days<=3650 and 1<=parties<=100
        periods=[next(it) for _ in range(parties)];assert all(p>0 and p%7 for p in periods)
        # Evaluate each day against all parties, without marking periodic multiples.
        out.append(str(sum(1 for day in range(1,days+1) if (day-1)%7<5 and any(day%p==0 for p in periods))))
    assert next(it,None) is None
    return '\n'.join(out)+'\n'


def bangla_words(n):
    if n==0:return '0'
    digits=str(n);groups=[]
    while digits:groups.insert(0,digits[-7:].zfill(7));digits=digits[:-7]
    result=[]
    for index,group in enumerate(groups):
        pieces=[(group[:2],'lakh'),(group[2:4],'hajar'),(group[4:5],'shata'),(group[5:],'')]
        for text,unit in pieces:
            value=int(text)
            if value:result.append(str(value));result.extend([unit] if unit else [])
        if index+1<len(groups):result.append('kuti')
    return ' '.join(result)


def bangla(data):
    values=list(map(int,data.split()));assert values and all(0<=n<=999999999999999 for n in values)
    return ''.join(f'{i:4}. {bangla_words(n)}\n' for i,n in enumerate(values,1))


def middle_count(start):
    step=lambda n:int(f'{n*n:08d}'[2:6])
    slow,fast=step(start),step(step(start))
    while slow!=fast:slow,fast=step(slow),step(step(fast))
    prefix=0;slow=start
    while slow!=fast:slow,fast=step(slow),step(fast);prefix+=1
    cycle=1;fast=step(slow)
    while slow!=fast:fast=step(fast);cycle+=1
    return prefix+cycle


def middle(data):
    values=list(map(int,data.split()));assert values[-1]==0 and all(0<n<10000 for n in values[:-1])
    return ''.join(str(middle_count(n))+'\n' for n in values[:-1])


def guards(data):
    it=iter(map(int,data.split()));count=next(it);assert 1<=count<=100;out=[]
    for i in range(1,count+1):
        rectangles=[tuple(next(it) for _ in range(4)) for _ in range(2)]
        assert all(0<=a<c<=100 and 0<=b<d<=100 for a,b,c,d in rectangles)
        cells=[0,0,0]
        for x in range(100):
            for y in range(100):cells[sum(a<=x<c and b<=y<d for a,b,c,d in rectangles)]+=1
        out.append(f'Night {i}: {cells[2]} {cells[1]} {cells[0]}')
    assert next(it,None) is None
    return '\n'.join(out)+'\n'


@lru_cache(None)
def divisor_sums():
    sums=[0]*60001
    for divisor in range(1,30001):
        for multiple in range(2*divisor,60001,divisor):sums[multiple]+=divisor
    return sums


def perfection(data):
    values=list(map(int,data.split()));assert values[-1]==0 and 1<len(values)-1<100 and all(0<n<=60000 for n in values[:-1]);out=['PERFECTION OUTPUT']
    sums=divisor_sums()
    for n in values[:-1]:out.append(f'{n:5}  '+('PERFECT' if sums[n]==n else 'ABUNDANT' if sums[n]>n else 'DEFICIENT'))
    return '\n'.join(out+['END OF OUTPUT'])+'\n'


def prime_cuts(data):
    values=list(map(int,data.split()));assert values and len(values)%2==0;out=[]
    for n,c in zip(values[::2],values[1::2]):
        assert 1<=c<=n<=1000
        numbers=[1]+[p for p in range(2,n+1) if all(p%d for d in range(2,math.isqrt(p)+1))]
        target=2*c if len(numbers)%2==0 else 2*c-1
        while len(numbers)>target:numbers=numbers[1:-1]
        out.append(f'{n} {c}:'+''.join(f' {p}' for p in numbers))
    return '\n\n'.join(out)+'\n\n'


def cryptanalysis(data):
    lines=data.splitlines();n=int(lines[0]);assert n>0 and len(lines)==n+1
    text=''.join(lines[1:]);counts={c:sum(ch==c or ch==c.lower() for ch in text) for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'}
    ranked=sorted((c for c in counts if counts[c]),key=lambda c:(-counts[c],c))
    return ''.join(f'{c} {counts[c]}\n' for c in ranked)


def carry(data):
    values=list(map(int,data.split()));assert len(values)%2==0 and values[-2:]==[0,0];out=[]
    for a,b in zip(values[:-2:2],values[1:-2:2]):
        assert 0<=a<10**9 and 0<=b<10**9 and a+b>0
        # Carry at position k iff the sum of the k-digit suffixes reaches 10^k.
        count=sum(a%(10**k)+b%(10**k)>=10**k for k in range(1,10))
        out.append('No carry operation.' if count==0 else f'{count} carry operation'+('s.' if count>1 else '.'))
    return '\n'.join(out)+'\n'


ORACLES={'uva-10093-an-easy-problem':easy_base,'uva-10041-vito-s-family':vito,'uva-10050-hartals':hartals,
         'uva-10101-bangla-numbers':bangla,'uva-11634-generate-random-numbers':middle,'uva-11639-guard-the-land':guards,
         'uva-382-perfection':perfection,'uva-406-prime-cuts':prime_cuts,'uva-10008-what-s-cryptanalysis':cryptanalysis,'uva-10035-primary-arithmetic':carry}


def repair_input(slug,data):
    if slug=='uva-10008-what-s-cryptanalysis':
        lines=data.splitlines();count=int(lines[0])
        assert count>0 and len(lines)-1==count-1
        return '\n'.join(lines+[''])+'\n'
    if slug=='uva-10050-hartals':
        # Reviewed original header overcounts one party in the penultimate case,
        # consuming the next case's day count. Bind this one-field correction to
        # the exact original input; do not infer arbitrary malformed boundaries.
        reviewed=hashlib.sha256(data.encode()).hexdigest()=='96482b8b66173052253e877eb239938360d7860a5652de72be713d26b16b00fa'
        it=iter(map(int,data.split()));count=next(it);out=[str(count)]
        for index in range(count):
            days,parties=next(it),next(it)
            if reviewed and index==13:
                assert parties==6;parties=5
            assert 7<=days<=3650 and 1<=parties<=100
            periods=[next(it) for _ in range(parties)];assert all(p>0 for p in periods)
            out.extend([str(days),str(parties)]+[str(p+1 if p%7==0 else p) for p in periods])
        assert next(it,None) is None
        return '\n'.join(out)+'\n'
    if slug=='uva-11639-guard-the-land':
        it=iter(map(int,data.split()));count=next(it);out=[str(count)]
        for _ in range(2*count):
            a,b,c,d=[next(it) for _ in range(4)];assert 0<=a<c<=100 and 0<=b<=d<=100
            if b==d:
                if d<100:d+=1
                else:b-=1
            out.append(f'{a} {b} {c} {d}')
        assert next(it,None) is None
        return '\n'.join(out)+'\n'
    if slug=='uva-406-prime-cuts':
        values=list(map(int,data.split()));assert len(values)%2==0
        assert all(1<=n<=1000 and c>=1 for n,c in zip(values[::2],values[1::2]))
        return ''.join(f'{n} {min(n,c)}\n' for n,c in zip(values[::2],values[1::2]))
    return None


def additions():
    rng=random.Random(10093)
    addresses=[[1],[1,1,29999],[1,29999],[17]*499,[rng.randrange(1,30000) for _ in range(499)]]
    strikes=[(7,[1]),(14,[3,4,8]),(3650,[1]*100),(3650,[3651]),(3650,[p for p in range(1,118) if p%7][:100])]
    rectangles=[((0,0,100,100),(0,0,100,100)),((0,0,1,1),(99,99,100,100)),((0,0,50,100),(50,0,100,100)),((1,1,99,99),(2,2,3,3)),((0,0,1,100),(0,0,100,1))]
    for _ in range(95):
        pair=[]
        for _ in range(2):
            a,c=sorted(rng.sample(range(101),2));b,d=sorted(rng.sample(range(101),2));pair.append((a,b,c,d))
        rectangles.append(pair)
    text=['','aA bB!','Zz z 0123','abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ','\t@#$%^&*()','a'*200+'b'*199]
    numbers=[1,2,6,28,496,8128,60000,59999,49]+list(range(1,91))
    pairs=[(0,1),(1,0),(9,1),(99,1),(999999999,1),(555555555,444444445),(123,456),(123,594),(100000000,900000000-1)]+[(rng.randrange(10**9),rng.randrange(10**9)) for _ in range(100)]
    return {'uva-10093-an-easy-problem':'\n'.join(['0','+0','-0']+list(DIGITS)+['Az','z1','-A','+a','1'*10000])+'\n',
            'uva-10041-vito-s-family':str(len(addresses))+'\n'+''.join(str(len(a))+' '+' '.join(map(str,a))+'\n' for a in addresses),
            'uva-10050-hartals':str(len(strikes))+'\n'+''.join(f'{n}\n{len(p)}\n'+'\n'.join(map(str,p))+'\n' for n,p in strikes),
            'uva-10101-bangla-numbers':'\n'.join(map(str,[0,1,99,100,101,999,1000,100000,10000000,100000000000000,100000000000001,999999999999999]))+'\n',
            'uva-11634-generate-random-numbers':'\n'.join(f'{n:04}' for n in range(1,10000))+'\n0\n',
            'uva-11639-guard-the-land':str(len(rectangles))+'\n'+''.join(' '.join(map(str,r))+'\n' for pair in rectangles for r in pair),
            'uva-382-perfection':' '.join(map(str,numbers))+' 0\n',
            'uva-406-prime-cuts':'1 1\n2 1\n3 1\n4 4\n1000 1\n1000 1000\n997 10\n',
            'uva-10008-what-s-cryptanalysis':str(len(text))+'\n'+'\n'.join(text)+'\n',
            'uva-10035-primary-arithmetic':'\n'.join(f'{a} {b}' for a,b in pairs)+'\n0 0\n'}


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
                    if check['status']=='WRONG_EXPECTED_OUTPUT' and p['slug']=='uva-382-perfection':
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Restore specified two spaces after the five-column integer; retain exact formatting checker.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Minimal reviewed input correction: missing empty line, prohibited multiple-of-seven period and reviewed party-count mismatch, zero-height rectangle, or C>N; recompute independently.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal numeric, formatting, overlap and counting boundaries','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
