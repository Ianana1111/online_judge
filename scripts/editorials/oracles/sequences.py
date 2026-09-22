"""Independent line-search, decimal-string, combinatorial, keyboard and median oracles."""
import argparse
import bisect
import hashlib
import json
import math
from pathlib import Path
import random
import re

ROOT=Path(__file__).resolve().parents[3]


def waldorf(data):
    tokens=iter(data.split());tests=int(next(tokens));assert tests>0;blocks=[]
    for _ in range(tests):
        rows,cols=int(next(tokens)),int(next(tokens));assert 1<=rows<=50 and 1<=cols<=50
        grid=[next(tokens).lower() for _ in range(rows)]
        assert all(len(row)==cols and re.fullmatch('[a-z]+',row) for row in grid)
        # Enumerate maximal straight grid lines from boundary starts, then use
        # substring search, instead of matching every word character at every cell.
        lines=[]
        for dr in (-1,0,1):
            for dc in (-1,0,1):
                if dr==dc==0:continue
                for r in range(rows):
                    for c in range(cols):
                        if 0<=r-dr<rows and 0<=c-dc<cols:continue
                        chars=[];positions=[];nr,nc=r,c
                        while 0<=nr<rows and 0<=nc<cols:
                            chars.append(grid[nr][nc]);positions.append((nr+1,nc+1));nr+=dr;nc+=dc
                        lines.append((''.join(chars),positions))
        count=int(next(tokens));assert 1<=count<=20;answer=[]
        for _ in range(count):
            word=next(tokens).lower();assert re.fullmatch('[a-z]+',word)
            starts=[]
            for line,positions in lines:
                offset=line.find(word)
                while offset>=0:
                    starts.append(positions[offset]);offset=line.find(word,offset+1)
            assert starts,'Query has no valid occurrence'
            answer.append(' '.join(map(str,min(starts))))
        blocks.append('\n'.join(answer))
    assert next(tokens,None) is None
    return '\n\n'.join(blocks)+'\n'


def reverse_one(n):
    assert 0<=n<=4294967295
    for count in range(1,1000):
        n+=int(str(n)[::-1])
        assert n<=4294967295,'Palindrome bound cannot be met after a monotone overshoot'
        if str(n)==str(n)[::-1]:return count,n
    raise AssertionError('No answer within the promised bound')


def reverse_add(data):
    values=list(map(int,data.split()));assert values and 1<=values[0]<=100 and len(values)==values[0]+1
    return ''.join(f'{count} {value}\n' for count,value in map(reverse_one,values[1:]))


def pizza(data):
    values=list(map(int,data.split()));assert values and values[-1]<0 and all(0<=n<=210000000 for n in values[:-1])
    return ''.join(str(1+n+math.comb(n,2))+'\n' for n in values[:-1])


ENCODED=['1234567890-=','WERTYUIOP[]\\',"SDFGHJKL;'",'XCVBNM,./']
DECODED=['`1234567890-','QWERTYUIOP[]',"ASDFGHJKL;",'ZXCVBNM,.']
assert all(len(a)==len(b) for a,b in zip(ENCODED,DECODED))
KEYS=dict(zip(''.join(ENCODED),''.join(DECODED)))


def keyboard(data):
    lines=data.splitlines()
    assert all(set(line)<=KEYS.keys()|{' '} for line in lines)
    return '\n'.join(''.join(' ' if ch==' ' else KEYS[ch] for ch in line) for line in lines)+'\n'


def median(data):
    values=list(map(int,data.split()));assert 0<len(values)<10000 and all(0<=x<2**31 for x in values)
    ordered=[];result=[]
    for value in values:
        bisect.insort(ordered,value);n=len(ordered)
        result.append(str(ordered[n//2] if n%2 else (ordered[n//2-1]+ordered[n//2])//2))
    return '\n'.join(result)+'\n'


ORACLES={'uva-10010-where-s-waldorf':waldorf,'uva-10018-reverse-and-add':reverse_add,
         'uva-10079-pizza-cutting':pizza,'uva-10082-wertyu':keyboard,'uva-10107-what-is-the-median':median}


def additions():
    rng=random.Random(10107)
    grid=['aBCde','FGhij','KlmNO','pQRst','UVwXY']
    words=[''.join(grid[2+k*dr][2+k*dc] for k in range(3)).swapcase() for dr in [-1,0,1] for dc in [-1,0,1] if dr or dc]
    cases=[(grid,words),(['zzA','Azz'],['a']),(['b'*50]*50,['B','b'*50])]
    search=str(len(cases))+'\n\n'+'\n\n'.join(f'{len(g)} {len(g[0])}\n'+'\n'.join(g)+f'\n{len(q)}\n'+'\n'.join(q) for g,q in cases)+'\n'
    reverse_values=[1,11,10,1200,195,265,750,1000000002]
    for n in range(2,10000):
        if n in reverse_values:continue
        try:reverse_one(n)
        except AssertionError:continue
        reverse_values.append(n)
        if len(reverse_values)==100:break
    medians=[0,2147483647,2147483647,1,1,0,2147483646]+[rng.randrange(2**31) for _ in range(9992)]
    return {'uva-10010-where-s-waldorf':search,
            'uva-10018-reverse-and-add':str(len(reverse_values))+'\n'+'\n'.join(map(str,reverse_values))+'\n',
            'uva-10079-pizza-cutting':'\n'.join(map(str,[0,1,2,3,5,10,46340,46341,210000000,209999999,-100]))+'\n',
            'uva-10082-wertyu':'  '+''.join(ENCODED)+'  \n\nO  S,   GOMR YPFSU/\n'+' '.join(reversed(ENCODED))+'\n',
            'uva-10107-what-is-the-median':'\n'.join(map(str,medians))+'\n'}


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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal edges, full direction/key coverage and exact arithmetic','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
