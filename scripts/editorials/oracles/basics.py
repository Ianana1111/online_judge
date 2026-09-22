"""Independent specifications for five string/state/sorting fundamentals."""
import argparse
import hashlib
import json
from pathlib import Path
import random
import re

ROOT=Path(__file__).resolve().parents[3]


def saxophone(data):
    lines=data.splitlines();count=int(lines[0]);songs=lines[1:]
    assert 1<=count<=1000 and len(songs)==count
    # Literal ten-bit states independently transcribed from the statement.
    masks=dict(zip('cdefgabCDEFGAB',[974,462,206,78,14,6,2,4,463,207,79,15,7,3]))
    result=[]
    for song in songs:
        assert len(song)<=200 and set(song)<=masks.keys()
        answer=[]
        for finger in range(10):
            states=[False]+[bool(masks[note] & (1<<finger)) for note in song]
            answer.append(sum(b and not a for a,b in zip(states,states[1:])))
        result.append(' '.join(map(str,answer)))
    return '\n'.join(result)+'\n'


def parity(data):
    values=list(map(int,data.split()));assert values and values[-1]==0
    assert all(1<=n<=2147483647 for n in values[:-1])
    return ''.join(f'The parity of {n:b} is {bin(n).count("1")} (mod 2).\n' for n in values[:-1])


def deli(data):
    tokens=iter(data.split());l,n=int(next(tokens)),int(next(tokens));assert 0<=l<=20 and 1<=n<=100
    irregular={}
    for _ in range(l):
        a,b=next(tokens),next(tokens);assert re.fullmatch('[a-z]{1,20}',a) and re.fullmatch('[a-z]{1,20}',b)
        assert a not in irregular or irregular[a]==b
        irregular[a]=b
    result=[]
    for _ in range(n):
        word=next(tokens);assert re.fullmatch('[a-z]{1,20}',word)
        if word in irregular:plural=irregular[word]
        elif re.search('[^aeiou]y$',word):plural=word[:-1]+'ies'
        elif re.search('(o|s|ch|sh|x)$',word):plural=word+'es'
        else:plural=word+'s'
        result.append(plural)
    assert next(tokens,None) is None
    return '\n'.join(result)+'\n'


def sorting(data):
    tokens=iter(map(int,data.split()));result=[]
    while True:
        n,m=next(tokens),next(tokens);result.append(f'{n} {m}')
        if n==m==0:break
        assert 1<=n<=10000 and 1<=m<=10000
        values=[next(tokens) for _ in range(n)];assert all(-2**31<=x<2**31 for x in values)
        def key(x):
            remainder=(abs(x)%m)*(-1 if x<0 else 1)
            return remainder,0 if x%2 else 1,-x if x%2 else x
        result.extend(map(str,sorted(values,key=key)))
    assert next(tokens,None) is None
    return '\n'.join(result)+'\n'


def summing(data):
    values=list(map(int,data.split()));assert values and values[-1]==0
    assert all(1<=n<=2_000_000_000 for n in values[:-1])
    return ''.join(str(1+(n-1)%9)+'\n' for n in values[:-1])


ORACLES={'uva-10415-eb-alto-saxophone-player':saxophone,'uva-10931-parity':parity,
         'uva-11233-deli-deli':deli,'uva-11321-sort-sort-and-sort':sorting,'uva-11332-summing-digits':summing}


def additions():
    rng=random.Random(11321)
    notes='cdefgabCDEFGAB'
    songs=['','c','c','ccCcc','B'*200]+[a+b for a in notes for b in notes]+[''.join(rng.choices(notes,k=200))]
    numbers=sorted(set(range(1,101))|{2**i for i in range(31)}|{2**i-1 for i in range(1,32)})
    words=['rice','octopus','y','a','ay','ey','iy','oy','uy','by','cy','yy','city','boy','toy','echo','gas','church','dish','box','book','aaaaaaaaaaaaaaaaaaay','x','s','o','h','ch','sh']
    sort_cases=[(m,list(range(-10,11))+[-2**31,2**31-1,0,0,-3,-3,4,4]) for m in [1,2,3,7,10000]]
    sort_cases.append((9973,[rng.randrange(-2**31,2**31) for _ in range(10000)]))
    sums=list(range(1,1001))+[1_999_999_998,1_999_999_999,2_000_000_000]
    return {'uva-10415-eb-alto-saxophone-player':str(len(songs))+'\n'+'\n'.join(songs)+'\n',
            'uva-10931-parity':'\n'.join(map(str,numbers+[0]))+'\n',
            'uva-11233-deli-deli':f'2 {len(words)}\nrice rice\noctopus octopi\n'+'\n'.join(words)+'\n',
            'uva-11321-sort-sort-and-sort':'\n'.join(f'{len(values)} {m}\n'+'\n'.join(map(str,values)) for m,values in sort_cases)+'\n0 0\n',
            'uva-11332-summing-digits':'\n'.join(map(str,sums+[0]))+'\n'}


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
                if p['slug']=='uva-11233-deli-deli' and kind=='testCases' and c['ord']==4 and check['status']=='INPUT_REQUIRES_REVIEW':
                    lines=c['input'].splitlines(); words='\n'.join(lines[1:])
                    assert re.fullmatch('[a-z0-9\s]+',words) and any(ch.isdigit() for ch in words)
                    converted=words.translate(str.maketrans('0123456789','abcdefghij'))
                    # Preserve repeated-word identity and prevent accidental key collisions.
                    assert len(set(words.split()))==len(set(converted.split()))
                    legal=lines[0]+'\n'+converted+'\n'
                    row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),
                        'input':legal,'output':oracle(legal),'reason':'Replace out-of-spec numeric word suffixes with lowercase letters, retaining lengths, counts and dictionary/query identity.'})
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal minimum/maximum, empty/state reset, signed and formatting boundaries','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
