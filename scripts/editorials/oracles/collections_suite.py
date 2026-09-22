"""Independent merged ownership, one-bottle exchange, divisor pairs and deque memory."""
import argparse
from collections import deque
import hashlib
from itertools import groupby
import json
import math
from pathlib import Path
import random
import re
ROOT=Path(__file__).resolve().parents[3]


def cards(data):
    tokens=iter(map(int,data.split()));out=[]
    while True:
        n,m=next(tokens),next(tokens)
        if (n,m)==(0,0):break
        assert 1<=n<=10000 and 1<=m<=10000
        a=[next(tokens) for _ in range(n)];b=[next(tokens) for _ in range(m)]
        assert all(1<=x<=100000 for x in a+b) and a==sorted(a) and b==sorted(b)
        a=[value for value,_ in groupby(a)];b=[value for value,_ in groupby(b)];i=j=ca=cb=0
        while i<len(a) and j<len(b):
            if a[i]==b[j]:i+=1;j+=1
            elif a[i]<b[j]:ca+=1;i+=1
            else:cb+=1;j+=1
        ca+=len(a)-i;cb+=len(b)-j;out.append(str(min(ca,cb)))
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def soda(data):
    tokens=iter(map(int,data.split()));tests=next(tokens);assert 1<=tests<15;out=[]
    for _ in range(tests):
        e,f,c=next(tokens),next(tokens),next(tokens);assert 0<=e<1000 and 0<=f<1000 and 1<c<2000
        empty=e+f;drinks=0
        while empty>=c:empty-=c-1;drinks+=1
        out.append(str(drinks))
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


DIVISOR_SUM=[]
for n in range(1,1001):
    result=0
    for d in range(1,math.isqrt(n)+1):
        if n%d==0:result+=d+(n//d if d*d!=n else 0)
    DIVISOR_SUM.append(result)
def alternate(data):
    values=list(map(int,data.split()));assert values[-1]==0 and all(1<=s<=1000 for s in values[:-1])
    return ''.join(f'Case {i}: {max([n for n,total in enumerate(DIVISOR_SUM,1) if total==s] or [-1])}\n' for i,s in enumerate(values[:-1],1))


def credit(data):
    lines=data.splitlines();tests=int(lines[0]);assert tests>=1 and len(lines)==tests+1;table=[0,2,4,6,8,1,3,5,7,9];out=[]
    for line in lines[1:]:
        line=line.rstrip(' \t')
        assert re.fullmatch(r'[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}',line)
        digits=line.replace(' ','');total=sum(table[int(ch)] if i%2 else int(ch) for i,ch in enumerate(reversed(digits)))
        out.append('Valid' if total%10==0 else 'Invalid')
    return '\n'.join(out)+'\n'


def mario(data):
    tokens=iter(map(int,data.split()));tests=next(tokens);assert 1<=tests<30;out=[]
    for tc in range(1,tests+1):
        n=next(tokens);assert 1<=n<50
        a=[next(tokens) for _ in range(n)];assert all(1<=h<=10 for h in a)
        differences=[b-a for a,b in zip(a,a[1:])];out.append(f'Case {tc}: {sum(d>0 for d in differences)} {sum(d<0 for d in differences)}')
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


# Minimum-weight assignment, independent of the reference's exchange argument
# and descending-price order. Integer potentials preserve exact comparisons.
def assignment(cost):
    n=len(cost);u=[0]*(n+1);v=[0]*(n+1);matched=[0]*(n+1);previous=[0]*(n+1)
    infinity=max([max(row) for row in cost] or [0])*(n+1)+1
    for row in range(1,n+1):
        matched[0]=row;column=0;best=[infinity]*(n+1);used=[False]*(n+1)
        while True:
            used[column]=True;active=matched[column];delta=infinity;next_column=0
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


def land(data):
    tokens=iter(map(int,data.split()));tests=next(tokens);assert 1<=tests<=10;out=[]
    for _ in range(tests):
        prices=[]
        while True:
            value=next(tokens)
            if value==0:break
            assert value>0;prices.append(value)
        assert len(prices)<40 and len(prices)==len(set(prices))
        if any(p>2500000 for p in prices):out.append('Too expensive');continue
        cost=assignment([[2*p**year for year in range(1,len(prices)+1)] for p in prices])
        out.append(str(cost) if cost<=5000000 else 'Too expensive')
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def homework(data):
    tokens=iter(data.split());tests=int(next(tokens));assert 1<=tests<=100;out=[]
    for tc in range(1,tests+1):
        n=int(next(tokens));assert 1<=n<=100
        records=[(next(tokens),int(next(tokens))) for _ in range(n)];deadline=int(next(tokens));wanted=next(tokens)
        assert 1<=deadline<=100 and all(1<=d<=100 and re.fullmatch('[a-z]{1,20}',s) for s,d in records) and re.fullmatch('[a-z]{1,20}',wanted)
        assert len({s for s,_ in records})==n
        match=[d for s,d in records if s==wanted]
        late=match[0]-deadline if match else 10**9
        result='Yesss' if late<=0 else 'Late' if late<=5 else 'Do your own homework!'
        out.append(f'Case {tc}: {result}')
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def formula(data):
    tokens=iter(map(int,data.split()));out=[]
    while True:
        a,b,c,d,limit=[next(tokens) for _ in range(5)]
        if (a,b,c,d,limit)==(0,0,0,0,0):break
        assert all(-1000<=v<=1000 for v in [a,b,c]) and 1<d<1000000 and 0<=limit<1000
        value=c;delta=a+b;count=0
        for _ in range(limit+1):
            count+=value%d==0;value+=delta;delta+=2*a
        out.append(str(count))
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def lumberjack(data):
    tokens=iter(map(int,data.split()));tests=next(tokens);assert 1<=tests<20;out=['Lumberjacks:']
    for _ in range(tests):
        a=[next(tokens) for _ in range(10)];assert len(set(a))==10 and all(0<x<100 for x in a)
        out.append('Ordered' if a==sorted(a) or a==sorted(a,reverse=True) else 'Unordered')
    assert next(tokens,None) is None
    return '\n'.join(out)+'\n'


def brainfuck(data):
    lines=data.replace('\r\n','\n').split('\n')
    if lines[-1]=='':lines.pop()
    tests=int(lines[0]);assert 1<=tests<=100 and len(lines)==tests+1;out=[]
    for tc,program in enumerate(lines[1:],1):
        assert len(program)<100000 and all(ch in '><+-.' for ch in program)
        tape=deque([0]*100);offset=0
        for ch in program:
            if ch=='>':tape.rotate(-1);offset+=1
            elif ch=='<':tape.rotate(1);offset-=1
            elif ch=='+':tape[0]=(tape[0]+1)%256
            elif ch=='-':tape[0]=(tape[0]-1)%256
        tape.rotate(offset%100)
        out.append(f'Case {tc}: '+' '.join(f'{value:02X}' for value in tape))
    return '\n'.join(out)+'\n'


ORACLES={'uva-11678-cards-exchange':cards,'uva-11689-soda-surpler':soda,'uva-11728-alternate-task':alternate,'uva-11743-credit-check':credit,'uva-11764-cricket-field':mario,'uva-11824-a-minimum-land-price':land,'uva-11917-do-your-own-homework':homework,'uva-11934-magic-formula':formula,'uva-11942-lumberjack-sequencing':lumberjack,'uva-11956-brainfuck':brainfuck}


def repair_input(slug,data):
    digest=hashlib.sha256(data.encode()).hexdigest()
    if slug=='uva-11956-brainfuck':
        if digest=='229014728a8d9fdbd62ea11d5248a93369165df4f820ce6875163a1eb2f2c53b':
            lines=data.splitlines();assert lines[0]=='1' and len(lines)==5
            return '1\n'+''.join(lines[1:])+'\n'
        if digest=='74315af7669b99b9c1c5cc731367366fc57298ab08a16cd1a6b63278b7c32947':return data+'\n'
    if slug=='uva-11824-a-minimum-land-price' and digest=='b40a4bfebff537a200d52126e55d481d0d8dc34340c9c71a4c814e054017dbb8':
        values=iter(map(int,data.split()));count=next(values);out=[str(count)]
        for _ in range(count):
            prices=[]
            while True:
                value=next(values)
                if value==0:break
                prices.append(value)
            reserved=set(prices);seen=set();fixed=[]
            for price in prices:
                value=price
                if value in seen:
                    while value in reserved:value+=1
                    reserved.add(value)
                seen.add(price);fixed.append(value)
            out.append(' '.join(map(str,fixed))+' 0')
        assert next(values,None) is None
        return '\n'.join(out)+'\n'
    if slug=='uva-11934-magic-formula' and digest in ['64a4be2863f9a583648985f82a3f605fa8e0d5ec4cf3f51f9445a90480907487','c1a7d9dd4e2c11b2a59f0b2f87cc52510ac26f667258a916a3ee97d2c174b244']:
        values=list(map(int,data.split()));out=[]
        for i in range(0,len(values),5):
            a,b,c,d,limit=values[i:i+5]
            if (a,b,c,d,limit)==(0,0,0,0,0):out.append('0 0 0 0 0');continue
            out.append(f'{a} {b} {max(-1000,min(1000,c))} {d} {min(limit,999)}')
        return '\n'.join(out)+'\n'
    if slug=='uva-11942-lumberjack-sequencing' and digest=='39e4e9efe24711c4bc8ebf4e1a3b110f67887ff746cbfb2a5517357d603dc98f':
        values=list(map(int,data.split()));out=[str(values[0])]
        for i in range(1,len(values),10):
            row=values[i:i+10];reserved=set(row);seen=set();fixed=[]
            for value in row:
                replacement=value
                if value in seen:
                    for step in range(1,100):
                        candidate=(value-1+step)%99+1
                        if candidate not in reserved:replacement=candidate;reserved.add(candidate);break
                seen.add(value);fixed.append(replacement)
            out.append(' '.join(map(str,fixed)))
        return '\n'.join(out)+'\n'
    return None


def additions():
    rng=random.Random(11956)
    pairs=[([1],[1,2,3]),([1,1,2,5],[2,3,3,4]),([1]*10000,[100000]*10000),(list(range(1,10001)),list(range(5001,15001)))]
    for _ in range(20):pairs.append((sorted(rng.choices(range(1,101),k=rng.randrange(1,101))),sorted(rng.choices(range(1,101),k=rng.randrange(1,101)))))
    bottles=[(0,0,2),(1,0,2),(2,0,2),(2,0,3),(9,0,3),(999,999,2),(999,999,1999),(999,999,1998),(998,999,1000),(5,5,2),(1,1,2),(0,999,7),(333,333,3),(999,0,1000)]
    card_numbers=['0'*16]
    for _ in range(100):
        prefix=''.join(str(rng.randrange(10)) for _ in range(15))
        for digit in range(10):card_numbers.append(prefix+str(digit))
    walls=[[9],[1,1,1],[1,10,1,10],[1,2,3,4,5],[10,9,8,7,6]]+[[rng.randrange(1,11) for _ in range(rng.randrange(1,50))] for _ in range(24)]
    lands=[[7,2,10],[2500000],[2500001],[1],list(range(1,40)),[10**30],[99,100,101],[2,3,4,5],[11,10]]
    subjects=[('a'+chr(97+i//26)+chr(97+i%26),i+1) for i in range(100)]
    tasks=[([('math',d)],10,'math') for d in [1,10,11,15,16,100]]+[([('math',1)],100,'missing'),(subjects,95,subjects[-1][0]),([('x'*20,1)],1,'x'*20)]
    formulae=[(0,0,0,2,0),(0,0,10,5,100),(0,0,10,6,100),(-1,0,0,2,999),(1000,1000,1000,999999,999),(1,0,0,2,0),(0,0,-8,2,0)]
    formulae += [(rng.randrange(-1000,1001),rng.randrange(-1000,1001),rng.randrange(-1000,1001),rng.randrange(2,1000000),rng.randrange(1000)) for _ in range(100)]
    beards=[list(range(1,11)),list(range(10,0,-1)),[1,2,3,4,6,5,7,8,9,10]]+[rng.sample(range(1,100),10) for _ in range(16)]
    programs=['','.', '<-', '>'*100+'+', '<'*101+'-', '+'*256,'-'*256, '+>++>+++', '>+<'*33333]
    programs += [''.join(rng.choice('><+-.') for _ in range(99999)), '>'*99+'+'+'>'+'+', '+'*255+'.+', '<+'*100]
    return {'uva-11678-cards-exchange':''.join(f'{len(a)} {len(b)}\n'+' '.join(map(str,a))+'\n'+' '.join(map(str,b))+'\n' for a,b in pairs)+'0 0\n',
            'uva-11689-soda-surpler':str(len(bottles))+'\n'+''.join(' '.join(map(str,row))+'\n' for row in bottles),
            'uva-11728-alternate-task':'\n'.join(map(str,list(range(1,1001))+[0]))+'\n',
            'uva-11743-credit-check':str(len(card_numbers))+'\n'+''.join(' '.join(number[i:i+4] for i in range(0,16,4))+'\n' for number in card_numbers),
            'uva-11764-cricket-field':str(len(walls))+'\n'+''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in walls),
            'uva-11824-a-minimum-land-price':str(len(lands))+'\n'+''.join(' '.join(map(str,prices))+' 0\n' for prices in lands),
            'uva-11917-do-your-own-homework':str(len(tasks))+'\n'+''.join(str(len(records))+'\n'+''.join(f'{s} {d}\n' for s,d in records)+f'{deadline}\n{wanted}\n' for records,deadline,wanted in tasks),
            'uva-11934-magic-formula':''.join(' '.join(map(str,row))+'\n' for row in formulae)+'0 0 0 0 0\n',
            'uva-11942-lumberjack-sequencing':str(len(beards))+'\n'+''.join(' '.join(map(str,a))+'\n' for a in beards),
            'uva-11956-brainfuck':str(len(programs))+'\n'+'\n'.join(programs)+'\n'}


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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input reviewed repair: undo PDF line wraps, provide missing final empty program, replace prohibited duplicate values, or constrain coefficients/limit to stated bounds; independently recompute.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal distinct types, exact budget, recycling, day boundaries and circular memory','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
