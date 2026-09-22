"""Independent oracles for five CPE fundamentals. No database writes.

The C++ programs use a visited set, face-position permutations, neighbour
gathering, concentric borders, and integer vector sums respectively. These
oracles instead use Floyd cycles, 3D normals, mine scattering, nearest
Chebyshev mismatch, and Decimal endpoint vectors.
"""
import argparse
from decimal import Decimal
import hashlib
import itertools
import json
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parents[3]


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()


def normalize(text):
    return '\n'.join(line.rstrip(' \t\r') for line in text.split('\n')).strip('\n')


def happy(data):
    values = list(map(int, data.split()))
    assert values and values[0] > 0 and len(values) == values[0] + 1
    result = []
    step = lambda n: sum(int(c)**2 for c in str(n))
    for case, n in enumerate(values[1:], 1):
        assert 0 < n < 10**9
        slow, fast = step(n), step(step(n))
        while slow != fast:
            slow, fast = step(slow), step(step(fast))
        adjective = 'a Happy' if slow == 1 else 'an Unhappy'
        result.append(f'Case #{case}: {n} is {adjective} number.')
    return '\n'.join(result) + '\n'


def die(data):
    tokens = iter(data.split()); result = []
    while True:
        n = int(next(tokens))
        if n == 0: break
        assert 1 <= n <= 1024
        normals = {1:(0,0,1),6:(0,0,-1),2:(0,1,0),5:(0,-1,0),3:(-1,0,0),4:(1,0,0)}
        rotations = {'north':lambda x,y,z:(x,z,-y),'south':lambda x,y,z:(x,-z,y),
                     'east':lambda x,y,z:(z,y,-x),'west':lambda x,y,z:(-z,y,x)}
        for _ in range(n):
            direction = next(tokens); assert direction in rotations
            normals = {face:rotations[direction](*v) for face,v in normals.items()}
        result.append(str(next(face for face,v in normals.items() if v == (0,0,1))))
    assert result and next(tokens,None) is None
    return '\n'.join(result)+'\n'


def mines(data):
    tokens=iter(data.split()); result=[]
    while True:
        rows,cols=int(next(tokens)),int(next(tokens))
        if rows==cols==0:break
        assert 1<=rows<=100 and 1<=cols<=100
        grid=[next(tokens) for _ in range(rows)]
        assert all(len(row)==cols and set(row)<=set('.*') for row in grid)
        counts=[[0]*cols for _ in range(rows)]
        # Scatter each mine to adjacent cells, rather than gather from safe cells.
        for r,row in enumerate(grid):
            for c,ch in enumerate(row):
                if ch=='*':
                    for nr in range(max(0,r-1),min(rows,r+2)):
                        for nc in range(max(0,c-1),min(cols,c+2)):
                            counts[nr][nc]+=1
        result.append(f'Field #{len(result)+1}:\n'+'\n'.join(''.join('*' if grid[r][c]=='*' else str(counts[r][c]) for c in range(cols)) for r in range(rows)))
    assert result and next(tokens,None) is None
    return '\n\n'.join(result)+'\n'


def squares(data):
    tokens=iter(data.split()); tests=int(next(tokens));assert 1<=tests<=20
    result=[]
    for _ in range(tests):
        rows,cols,q=int(next(tokens)),int(next(tokens)),int(next(tokens))
        assert 1<=rows<=100 and 1<=cols<=100 and 0<=q<=20
        grid=[next(tokens) for _ in range(rows)];assert all(len(row)==cols for row in grid)
        result.append(f'{rows} {cols} {q}')
        for _ in range(q):
            r,c=int(next(tokens)),int(next(tokens));assert 0<=r<rows and 0<=c<cols
            radius=min(r,c,rows-1-r,cols-1-c)
            # A differing cell forbids every radius >= its Chebyshev distance.
            for i,row in enumerate(grid):
                for j,ch in enumerate(row):
                    if ch!=grid[r][c]:radius=min(radius,max(abs(r-i),abs(c-j))-1)
            result.append(str(2*radius+1))
    assert next(tokens,None) is None
    return '\n'.join(result)+'\n'


def fourth(data):
    values=list(map(Decimal,data.split())); assert values and len(values)%8==0
    result=[]
    for offset in range(0,len(values),8):
        row=values[offset:offset+8]
        assert all(abs(x)<=10000 and x*1000==(x*1000).to_integral_value() for x in row)
        points=list(zip(row[::2],row[1::2]))
        common=set(points[:2]) & set(points[2:]);assert len(common)==1 and len(set(points))==3
        p=common.pop();a,b=[x for x in points if x!=p]
        answer=[a[i]+(b[i]-p[i]) for i in range(2)]
        result.append(' '.join(f'{x if x else Decimal(0):.3f}' for x in answer))
    return '\n'.join(result)+'\n'


ORACLES={'uva-10591-happy-number':happy,'uva-10409-die-game':die,
         'uva-10189-minesweeper':mines,'uva-10908-largest-squares':squares,
         'uva-10242-fourth-point':fourth}


def additions():
    rng=random.Random(10908)
    numbers=list(range(1,1001))+[999999999,999999998,100000000,986543210]
    commands=[list(p) for size in range(1,5) for p in itertools.product(['north','east','south','west'],repeat=size)]
    commands.append([rng.choice(['north','east','south','west']) for _ in range(1024)])
    grids=[['.'],['*'],['*.*.*'],['*','.','*','.'],['.*.','*.*','.*.'],['***','*.*','***'],['.'*100]*100,['*'*100]*100]
    square_cases=[(['a'],[(0,0)]),(['a'*100]*100,[(49,49),(50,50),(0,0),(99,99)]),
                  (['aaaaa','abaaa','aaaaa','aaaaa','aaaaa'],[(2,2),(1,1),(3,3)]),
                  (['aaaaaaa','aaaaaaa','aaaaaaa'],[(1,3),(1,0)]),
                  (['aaaaa','aaaaa','abaaa','aaaaa','aaaaa'],[(2,2)])]
    points=[]
    for p,a,b in [((0,0),(1000,0),(0,1000)),((-10000,500),(1,-10000),(10000,2)),((1234,5678),(-1234,-5678),(0,0))]:
        for edge1 in [(p,a),(a,p)]:
            for edge2 in [(p,b),(b,p)]:
                points.append(' '.join(f'{Decimal(v)/1000:.3f}' for point in edge1+edge2 for v in point))
    return {'uva-10591-happy-number':str(len(numbers))+'\n'+'\n'.join(map(str,numbers))+'\n',
            'uva-10409-die-game':'\n'.join(str(len(c))+'\n'+'\n'.join(c) for c in commands)+'\n0\n',
            'uva-10189-minesweeper':'\n'.join(f'{len(g)} {len(g[0])}\n'+'\n'.join(g) for g in grids)+'\n0 0\n',
            'uva-10908-largest-squares':str(len(square_cases))+'\n'+'\n'.join(f'{len(g)} {len(g[0])} {len(q)}\n'+'\n'.join(g)+'\n'+'\n'.join(f'{r} {c}' for r,c in q) for g,q in square_cases)+'\n',
            'uva-10242-fourth-point':'\n'.join(points)+'\n'}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args()
    output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/')
    output.mkdir(parents=True,exist_ok=True,mode=0o700)
    snapshot=json.loads(Path(args.snapshot).read_text());extra=additions()
    report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
    for p in snapshot['problems']:
        oracle=ORACLES.get(p['slug'])
        if not oracle:continue
        spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}}
        row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[]}
        if p['slug']=='uva-10908-largest-squares':
            corrected=(ROOT/'content/editorials'/p['slug']/'statement.md').read_text()
            if p['statementMd']!=corrected:row['specIssue']='STATEMENT_DOES_NOT_DESCRIBE_OFFICIAL_PROBLEM'
        for kind in ('samples','testCases'):
            for c in p[kind]:
                check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
                try:
                    answer=oracle(c['input'])
                    check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
                except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'deterministic legal boundary and mutation coverage','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH'],'specIssue':p.get('specIssue')} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
