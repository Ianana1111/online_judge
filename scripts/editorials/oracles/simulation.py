"""Independent specifications for division, polynomials and grid simulations.

Multiplication builds powers; explicit monomials compute the derivative; two-D
rotation checks matrices; complex vectors move robots; fixed glyphs expand LCDs.
None invokes the displayed reference solution or treats stored answers as truth.
"""
import argparse
import hashlib
import json
from pathlib import Path
import random
import re

ROOT=Path(__file__).resolve().parents[3]


def divide(data):
    values=list(map(int,data.split()));assert values and len(values)%2==0
    result=[]
    for n,m in zip(values[::2],values[1::2]):
        assert 0<=n<2_000_000_000 and 0<=m<2_000_000_000
        if n<=1 or m<=1:
            result.append('Boring!');continue
        # Build ascending integer powers instead of repeatedly dividing n.
        powers=[1]
        while powers[-1]<n:powers.append(powers[-1]*m)
        result.append(' '.join(map(str,reversed(powers))) if powers[-1]==n else 'Boring!')
    return '\n'.join(result)+'\n'


def polynomial(data):
    lines=data.splitlines();assert lines and len(lines)%2==0
    result=[]
    for xline,line in zip(lines[::2],lines[1::2]):
        x=int(xline);coeff=list(map(int,line.split()));assert coeff and abs(x)<2**31 and all(abs(a)<2**31 for a in coeff)
        n=len(coeff)-1
        answer=sum(a*(n-i)*x**(n-i-1) for i,a in enumerate(coeff[:-1]))
        assert abs(answer)<2**31
        result.append(str(answer))
    return '\n'.join(result)+'\n'


def matrix(data):
    headers=re.findall(r'\bN\s*=',data)
    tokens=iter(map(int,re.sub(r'\bN\s*=','',data).split()))
    tests=next(tokens);assert 1<=tests<=300 and len(headers)==tests
    result=[]
    for test in range(1,tests+1):
        n=next(tokens);assert 1<=n<=100
        grid=[[next(tokens) for _ in range(n)] for _ in range(n)]
        assert all(-2**32<=a<=2**32 for row in grid for a in row)
        good=all(a>=0 for row in grid for a in row) and grid==[list(reversed(row)) for row in reversed(grid)]
        result.append(f'Test #{test}: '+('Symmetric.' if good else 'Non-symmetric.'))
    assert next(tokens,None) is None
    return '\n'.join(result)+'\n'


def robots(data):
    lines=data.splitlines();assert lines
    maxx,maxy=map(int,lines[0].split());assert 0<=maxx<=50 and 0<=maxy<=50 and (len(lines)-1)%2==0
    vectors={'N':1j,'E':1,'S':-1j,'W':-1};headings={v:k for k,v in vectors.items()};scents=set();result=[]
    for start,commands in zip(lines[1::2],lines[2::2]):
        x,y,h=start.split();x,y=int(x),int(y)
        assert 0<=x<=maxx and 0<=y<=maxy and h in vectors and len(commands)<100 and set(commands)<=set('LRF')
        position=complex(x,y);direction=vectors[h];lost=False
        for command in commands:
            if command=='L':direction*=1j
            elif command=='R':direction*=-1j
            else:
                candidate=position+direction
                if 0<=candidate.real<=maxx and 0<=candidate.imag<=maxy:position=candidate
                elif position not in scents:scents.add(position);lost=True;break
        result.append(f'{int(position.real)} {int(position.imag)} {headings[direction]}'+(' LOST' if lost else ''))
    return '\n'.join(result)+'\n'


# Five-row unscaled shapes, independent of the C++ seven-bit segment masks.
GLYPHS=[
    (' - ','| |','   ','| |',' - '),('   ','  |','   ','  |','   '),
    (' - ','  |',' - ','|  ',' - '),(' - ','  |',' - ','  |',' - '),
    ('   ','| |',' - ','  |','   '),(' - ','|  ',' - ','  |',' - '),
    (' - ','|  ',' - ','| |',' - '),(' - ','  |','   ','  |','   '),
    (' - ','| |',' - ','| |',' - '),(' - ','| |',' - ','  |',' - ')]


def lcd(data):
    tokens=data.split();assert len(tokens)%2==0 and tokens[-2:]==['0','0']
    blocks=[]
    for scale,number in zip(tokens[:-2:2],tokens[1:-2:2]):
        s=int(scale);assert 1<=s<=10 and re.fullmatch('[0-9]+',number) and 0<=int(number)<=99_999_999
        digits=[]
        for char in number:
            expanded=[]
            for index,row in enumerate(GLYPHS[int(char)]):
                text=row[0]+row[1]*s+row[2]
                expanded.extend([text]*(s if index in (1,3) else 1))
            digits.append(expanded)
        blocks.append('\n'.join(' '.join(row) for row in zip(*digits)))
    return '\n\n'.join(blocks)+'\n\n'


ORACLES={'uva-10190-divide-but-not-quite-conquer':divide,'uva-10268-498-bis':polynomial,
         'uva-11349-symmetric-matrix':matrix,'uva-118-mutant-flatworld-explorers':robots,'uva-706-lc-display':lcd}


def additions():
    rng=random.Random(118)
    pairs=[(n,m) for n in range(0,51) for m in range(0,11)]+[(1_073_741_824,2),(1_162_261_467,3),(1_999_999_999,1_999_999_999),(1_999_999_999,2)]
    polys=[(0,[7]),(2,[1,1,1]),(7,[1,-1]),(0,[1,2,3,4]),(-2,[3,-4,5,6]),
           (999_999_999,[1,-1_333_333_332,1,-1_999_999_998,7]),(2_147_483_647,[1,3]),(-2_147_483_647,[1,-3])]
    for _ in range(100):
        x=rng.randint(-5,5);coeff=[rng.randint(-20,20) for _ in range(rng.randint(1,8))];polys.append((x,coeff))
    matrices=[[[0]],[[-1]],[[2**32]],[[-2**32]],[[1,2],[2,3]],[[1,2],[2,1]],[[1,2,3],[4,5,4],[3,2,1]],[[0,0,0],[0,-1,0],[0,0,0]]]
    flat=[rng.randrange(2**32+1) for _ in range(5000)];flat+=flat[::-1]
    matrices.append([flat[i:i+100] for i in range(0,10000,100)])
    robots_input='1 1\n1 1 N\nF\n1 1 E\nFLLF\n0 0 S\nF\n0 0 W\nFRF\n0 0 E\nFRFLFLF\n1 0 W\n'+('LR'*49+'F')+'\n'
    return {'uva-10190-divide-but-not-quite-conquer':''.join(f'{n} {m}\n' for n,m in pairs),
            'uva-10268-498-bis':''.join(str(x)+'\n'+' '.join(map(str,coeff))+'\n' for x,coeff in polys),
            'uva-11349-symmetric-matrix':str(len(matrices))+'\n'+''.join(f'N = {len(g)}\n'+'\n'.join(' '.join(map(str,row)) for row in g)+'\n' for g in matrices),
            'uva-118-mutant-flatworld-explorers':robots_input,
            'uva-706-lc-display':''.join(f'{s} {d}\n' for s in [1,2,10] for d in range(10))+'10 12345678\n1 909\n0 0\n'}


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
                answer=None
                try:
                    answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
                except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
                row['checks'].append(check)
                if p['slug']=='uva-706-lc-display' and kind=='samples' and c['ord']==1 and check['status']=='WRONG_EXPECTED_OUTPUT':
                    assert c['input'].split()==['2','12345','3','67890','0','0']
                    row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),
                        'input':c['input'],'output':answer,'reason':'Restore exact segment positions and internal whitespace required by the official LCD dimensions; existing sample whitespace was collapsed.'})
                if p['slug']=='uva-706-lc-display' and kind=='testCases' and c['ord']==3 and check['status']=='INPUT_REQUIRES_REVIEW':
                    tokens=c['input'].split()
                    assert len(tokens)==4 and tokens[-2:]==['0','0'] and 1<=int(tokens[0])<=10 and re.fullmatch('[0-9]{10}',tokens[1]) and int(tokens[1])>99_999_999
                    # The old all-digit display exceeded the eight-digit value limit.
                    # Split it into legal displays instead of raising the problem limit.
                    chunks=[str(int(tokens[1][i:i+8])) for i in range(0,len(tokens[1]),8)]
                    legal=''.join(f'{tokens[0]} {part}\n' for part in chunks)+'0 0\n'
                    row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),
                        'input':legal,'output':oracle(legal),'reason':'Split an out-of-range ten-digit input into two legal displays, keeping the scale and digit coverage.'})
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal boundaries and independently computed mutation witnesses','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
