"""Independent CPE text, inversion, simultaneous territory, rank and dial oracles."""
import argparse
import hashlib
import json
from pathlib import Path
import random

ROOT=Path(__file__).resolve().parents[3]


def judge_text(data):
    lines=iter(data.splitlines());result=[];number=0
    while True:
        n=int(next(lines));assert 0<=n<100
        if n==0:break
        standard=[next(lines) for _ in range(n)]
        m=int(next(lines));assert 0<m<100
        team=[next(lines) for _ in range(m)]
        assert all(len(line)<=120 and all(32<=ord(c)<=126 for c in line) for line in standard+team)
        # List equality preserves line boundaries. Strip only the CPE-specified
        # spaces for the second comparison, retaining letters and punctuation.
        visible=lambda rows:''.join(rows).replace(' ','')
        verdict='Accepted' if standard==team else 'Presentation Error' if visible(standard)==visible(team) else 'Wrong Answer'
        number+=1;result.append(f'Run #{number}: {verdict} {sum(map(len,standard))}')
    assert next(lines,None) is None
    return '\n'.join(result)+'\n'


def flip_sort(data):
    values=iter(map(int,data.split()));result=[]
    while True:
        n=next(values,None)
        if n is None:break
        assert 1<=n<=1000
        a=[next(values) for _ in range(n)]
        # Literal adjacent exchanges, independent of the reference's pair count.
        count=0
        for end in range(n-1,0,-1):
            for i in range(end):
                if a[i]>a[i+1]:a[i],a[i+1]=a[i+1],a[i];count+=1
        result.append(f'Minimum exchange operations : {count}')
    return '\n'.join(result)+'\n'


def territory(data):
    tokens=iter(data.split());t=int(next(tokens));assert t>0;blocks=[]
    beats={'R':'S','S':'P','P':'R'}
    for _ in range(t):
        r,c,days=int(next(tokens)),int(next(tokens)),int(next(tokens));assert 1<=r<=100 and 1<=c<=100 and 0<=days<=100
        grid=[next(tokens) for _ in range(r)];assert all(len(row)==c and set(row)<=set('RSP') for row in grid)
        # Snapshot territory sets. Attack propagation collects every conquered
        # position first; no newly conquered position may attack that same day.
        occupied={kind:{(i,j) for i in range(r) for j in range(c) if grid[i][j]==kind} for kind in beats}
        for _ in range(days):
            gained={kind:set() for kind in beats}
            for kind,positions in occupied.items():
                for i,j in positions:
                    gained[kind].update({(i-1,j),(i+1,j),(i,j-1),(i,j+1)} & occupied[beats[kind]])
            occupied={kind:(occupied[kind]-gained[next(k for k,v in beats.items() if v==kind)])|gained[kind] for kind in beats}
        final={(i,j):kind for kind,positions in occupied.items() for i,j in positions}
        blocks.append('\n'.join(''.join(final[i,j] for j in range(c)) for i in range(r)))
    assert next(tokens,None) is None
    return '\n\n'.join(blocks)+'\n'


def marbles(data):
    tokens=iter(map(int,data.split()));result=[];number=0
    while True:
        n,q=next(tokens),next(tokens);assert 0<=n<=10000 and 0<=q<=10000
        if n==q==0:break
        values=[next(tokens) for _ in range(n)];queries=[next(tokens) for _ in range(q)]
        assert all(0<=v<=10000 for v in values+queries)
        number+=1;assert number<65;result.append(f'CASE# {number}:')
        counts=[0]*10001
        for v in values:counts[v]+=1
        prefix=[0]
        for count in counts:prefix.append(prefix[-1]+count)
        for query in queries:result.append(f'{query} found at {prefix[query]+1}' if counts[query] else f'{query} not found')
    assert next(tokens,None) is None
    return '\n'.join(result)+'\n'


def lock(data):
    tokens=iter(map(int,data.split()));result=[]
    while True:
        start,a,b,c=[next(tokens) for _ in range(4)]
        if start==a==b==c==0:break
        assert all(0<=v<40 for v in (start,a,b,c)) and a!=b and b!=c
        # Walk one tick at a time; no modular-distance formula from the reference.
        steps=120;position=start
        for target,direction in [(a,-1),(b,1),(c,-1)]:
            while position!=target:
                position+=direction
                if position<0:position=39
                if position==40:position=0
                steps+=1
        result.append(str(steps*9))
    assert next(tokens,None) is None
    return '\n'.join(result)+'\n'


def legal_lock_input(data):
    """Repair only prohibited equal consecutive code values; preserve all other tuples."""
    numbers=list(map(int,data.split()));assert len(numbers)%4==0
    rows=[numbers[i:i+4] for i in range(0,len(numbers),4)]
    assert rows[-1]==[0,0,0,0] and all(any(row) for row in rows[:-1])
    result=[]
    for start,a,b,c in rows[:-1]:
        assert all(0<=v<40 for v in (start,a,b,c))
        if a==b:b=(a+1)%40
        if b==c:c=(b+1)%40
        result.append((start,a,b,c))
    return '\n'.join(' '.join(map(str,row)) for row in result)+'\n0 0 0 0\n'


ORACLES={'uva-10188-automated-judge-script':judge_text,'uva-10327-flip-sort':flip_sort,
         'uva-10443-rock-scissors-paper':territory,'uva-10474-where-is-the-marble':marbles,
         'uva-10550-combination-lock':lock}


def additions():
    rng=random.Random(10443)
    text_pairs=[(['hello 10'],['world 10']),(['a b'],['ab']),(['ab','c'],['a','bc']),([''],['']),([' ',''],['']),(['a '],['a ']),(['!'*120]*99,['!'*120]*99),(['12'],['21'])]
    text=''.join(str(len(a))+'\n'+'\n'.join(a)+'\n'+str(len(b))+'\n'+'\n'.join(b)+'\n' for a,b in text_pairs)+'0\n'
    arrays=[[1],[2,2,2],[3,1,2,1],list(range(1000,0,-1)),list(range(1000)),[rng.randrange(-20,21) for _ in range(1000)]]
    flip=''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in arrays)
    grids=[(['R'],0),(['R'],100),(['RSP'],1),(['R','S','P'],2),(['RP','SR'],1),(['RSP']*3,0),([''.join(rng.choice('RSP') for _ in range(100)) for _ in range(100)],100)]
    territory_input=str(len(grids))+'\n'+''.join(f'{len(g)} {len(g[0])} {d}\n'+'\n'.join(g)+'\n' for g,d in grids)
    marble_sets=[([0,10000,5,5,1],[0,5,10000,2]),([], [0,10000]),([4], []),([rng.randrange(10001) for _ in range(10000)],list(range(10000)))]
    marble_input=''.join(f'{len(a)} {len(q)}\n'+'\n'.join(map(str,a+q))+'\n' for a,q in marble_sets)+'0 0\n'
    combinations=[(0,0,1,2),(39,0,39,0),(10,10,20,10),(0,39,1,39)]
    for start in range(40):
        for a in range(40):
            b=(a+1+start%39)%40;c=(b+1+a%39)%40
            combinations.append((start,a,b,c))
    return {'uva-10188-automated-judge-script':text,'uva-10327-flip-sort':flip,
            'uva-10443-rock-scissors-paper':territory_input,'uva-10474-where-is-the-marble':marble_input,
            'uva-10550-combination-lock':'\n'.join(' '.join(map(str,c)) for c in combinations)+'\n0 0 0 0\n'}


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
                    check['status']='INPUT_REQUIRES_REVIEW'
                    if p['slug']=='uva-10550-combination-lock':
                        corrected=legal_lock_input(c['input'])
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':lock(corrected),'reason':'Official input requires consecutive code values to differ; only equal adjacent codes are advanced one dial mark.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal text, simultaneous updates, duplicate ranks and directional boundaries','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
