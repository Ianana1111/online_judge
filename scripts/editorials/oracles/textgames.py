"""Independent call simulation, regex tokenization, arithmetic digits and flow matching."""
import argparse
from collections import deque
import hashlib
import json
from pathlib import Path
import random
import re
ROOT=Path(__file__).resolve().parents[3]


def bingo(data):
    values=iter(map(int,data.split()));tests=next(values);assert tests>0;answers=[]
    lines=[{(r,c) for c in range(5)} for r in range(5)]+[{(r,c) for r in range(5)} for c in range(5)]+[{(r,r) for r in range(5)},{(r,4-r) for r in range(5)}]
    for _ in range(tests):
        cells={};marked={(2,2)}
        for r in range(5):
            for c in range(5):
                if (r,c)==(2,2):continue
                value=next(values);assert c*15+1<=value<=(c+1)*15 and value not in cells
                cells[value]=(r,c)
        calls=[next(values) for _ in range(75)];assert sorted(calls)==list(range(1,76))
        for time,number in enumerate(calls,1):
            if number in cells:marked.add(cells[number])
            if any(line<=marked for line in lines):answers.append(f'BINGO after {time} numbers announced');break
    assert next(values,None) is None
    return '\n'.join(answers)+'\n'


def dictionary(data):
    lines=data.splitlines();assert len(lines)<=5000 and all(len(line)<=200 for line in lines)
    words=sorted(set(word.lower() for word in re.findall('[A-Za-z]+',data)));assert len(words)<=5000
    return ''.join(word+'\n' for word in words)


def telephone(data):
    groups=['ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'];result=[]
    for line in data.splitlines():
        assert 1<=len(line)<=30 and re.fullmatch('[A-Z01-]+',line)
        number=''.join(next((str(i+2) for i,g in enumerate(groups) if ch in g),ch) for ch in line)
        result.append(f'{number} {sum(ch.isalpha() for ch in line)} {line.count(chr(45))}')
    return '\n'.join(result)+'\n'


def sum_digits(value):
    total=0
    while value:value,digit=divmod(value,10);total+=digit
    return total


def nines(data):
    tokens=data.split();assert tokens[-1]=='0';result=[]
    for token in tokens[:-1]:
        assert token.isdigit() and 1<=len(token)<=1000 and int(token)>0
        value=int(token)
        if value%9:result.append(token+' is not a multiple of 9.')
        else:
            degree=1;value=sum_digits(value)
            while value!=9:value=sum_digits(value);degree+=1
            result.append(f'{token} is a multiple of 9 and has 9-degree {degree}.')
    return '\n'.join(result)+'\n'


def wine(data):
    values=iter(map(int,data.split()));answers=[]
    while True:
        n=next(values)
        if n==0:break
        assert 2<=n<=100000
        a=[next(values) for _ in range(n)];assert all(-1000<=x<=1000 for x in a) and sum(a)==0
        buyers=deque([i,x] for i,x in enumerate(a) if x>0);sellers=deque([i,-x] for i,x in enumerate(a) if x<0);work=0
        while buyers:
            b,s=buyers[0],sellers[0];amount=min(b[1],s[1]);work+=amount*abs(b[0]-s[0]);b[1]-=amount;s[1]-=amount
            if b[1]==0:buyers.popleft()
            if s[1]==0:sellers.popleft()
        assert not sellers
        answers.append(str(work))
    assert next(values,None) is None
    return '\n'.join(answers)+'\n'


def b2(data):
    values=iter(map(int,data.split()));answers=[]
    while True:
        n=next(values,None)
        if n is None:break
        assert 2<=n<=100
        a=[next(values) for _ in range(n)];assert max(a)<=10000
        sums=sorted(a[i]+a[j] for i in range(n) for j in range(i,n))
        good=min(a)>=1 and all(a[i-1]<a[i] for i in range(1,n)) and all(sums[i-1]!=sums[i] for i in range(1,len(sums)))
        answers.append(f'Case #{len(answers)+1}: It is '+('' if good else 'not ')+'a B2-Sequence.\n')
    return '\n'.join(answers)+'\n'


def reverse_groups(data):
    tokens=iter(data.split());out=[]
    while True:
        groups=int(next(tokens))
        if groups==0:break
        word=next(tokens);length=len(word);assert 1<=groups<10 and 1<=length<=100 and length%groups==0 and re.fullmatch('[A-Za-z0-9]+',word)
        block=length//groups
        out.append(''.join(word[index//block*block+block-1-index%block] for index in range(length)))
    assert next(tokens,None) is None and len(out)<=100
    return '\n'.join(out)+'\n'


def decode(data):
    raw=data.replace('\r\n','\n').split('\n');tests=int(raw[0]);assert 1<=tests<=30
    groups=[];current=[]
    for line in raw[1:]:
        if not line.strip():
            if current:groups.append(current);current=[]
        else:current.append(line)
    if current:groups.append(current)
    assert len(groups)==tests;result=[]
    for index,lines in enumerate(groups,1):
        assert 1<=len(lines)<=100;out=[f'Case #{index}:']
        for line in lines:
            words=deque(line.split());assert 1<=len(words)<=30 and all(re.fullmatch('[A-Za-z]{1,30}',w) for w in words)
            decoded=[]
            for wanted in range(1,31):
                while words and len(words[0])<wanted:words.popleft()
                if not words:break
                decoded.append(words.popleft()[wanted-1])
            out.append(''.join(decoded))
        result.append('\n'.join(out))
    return '\n\n'.join(result)+'\n'


ORACLES={'uva-10813-traditional-bingo':bingo,'uva-10815-andy-s-first-dictionary':dictionary,'uva-10921-find-the-telephone':telephone,'uva-10922-2-the-9s':nines,'uva-11054-wine-trading-in-gergovig':wine,'uva-11063-b2-sequence':b2,'uva-11192-group-reverse':reverse_groups,'uva-11220-decoding-the-message':decode}


def repair_input(slug,data):
    digest=hashlib.sha256(data.encode()).hexdigest()
    if slug=='uva-10815-andy-s-first-dictionary' and digest=='6b2a87c459591e6ee15df2cec754d8a8eea40f95c28945b44c7b3b81fc84f3a8':
        # The original has 17169 distinct words, violating the explicit5000 bound.
        # Preserve mixed case, punctuation and line layout, replacing surplus
        # vocabulary with one legal existing short word; no line grows longer.
        keep={'a'}
        for word in re.findall('[A-Za-z]+',data):
            if len(keep)<5000:keep.add(word.lower())
        return re.sub('[A-Za-z]+',lambda m:m.group() if m.group().lower() in keep else 'a',data)
    if slug=='uva-11192-group-reverse' and digest=='9c4f0b5c65d81ee319cba10246be7ec80e2532fd33bcd4aba1708b946d242dff':
        tokens=data.split();assert tokens[0]=='9' and len(tokens[1])==100 and tokens[2:] == ['0']
        return '9 '+tokens[1][:99]+'\n0\n'
    if slug=='uva-11220-decoding-the-message' and digest=='8aa4d85d62aac623b8494eba7dca749a0467bf3cb892275230ce5ab8e65959ee':
        # Three hyphens are outside the alphabetic-word contract. Replace with
        # legal whitespace separators and independently recompute the message.
        return data.replace('-', ' ')
    return None


def additions():
    rng=random.Random(10813);card=[[1+r+15*c if (r,c)!=(2,2) else 0 for c in range(5)] for r in range(5)]
    lines=[[card[r][c] for c in range(5)] for r in range(5)]+[[card[r][c] for r in range(5)] for c in range(5)]+[[card[r][r] for r in range(5)],[card[r][4-r] for r in range(5)]]
    games=[]
    for winning in lines:
        first=[n for n in winning if n];remaining=[n for n in range(1,76) if n not in first];rng.shuffle(remaining)
        games.append('\n'.join(' '.join(str(n) for n in row if n) for row in card)+'\n'+' '.join(map(str,first+remaining)))
    for _ in range(25):
        columns=[rng.sample(range(15*c+1,15*c+16),5) for c in range(5)];calls=list(range(1,76));rng.shuffle(calls)
        games.append('\n'.join(' '.join(str(columns[c][r]) for c in range(5) if (r,c)!=(2,2)) for r in range(5))+'\n'+' '.join(map(str,calls)))
    sentences=['Apple APPLE apple, red-blue 123x','a B c D!','---123...','Z'*200]+['Hello?WORLD; don\'t JOIN-this.']*4995+['LastWord']
    phones=['ABCDEFGHIJKLMNOPQRSTUVWXYZ','PQRS-WXYZ','0','1','-','0-1','A'*30,'-'*30]+[''.join(rng.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ01-') for _ in range(rng.randrange(1,31))) for _ in range(100)]
    numbers=['9','18','99','999999','10','3','1','1000000008','9'*1000,'9'*999+'8','1'+'0'*998+'8']
    arrays=[[0,0],[1,-1],[-1,1],[5,-4,1,-3,1],[-1000]*50000+[1000]*50000]
    for _ in range(40):
        half=[rng.randrange(-1000,1001) for _ in range(rng.randrange(1,80))];a=half+[-x for x in half];rng.shuffle(a);arrays.append(a)
    seqs=[[1,2],[4,1],[0,1],[1,1],[1,2,3],[1,2,4,8],[3,7,10,14],list(range(1,101)),[9999,10000]]
    for _ in range(60):
        a=sorted(rng.sample(range(1,10001),rng.randrange(2,21)))
        if rng.random()<.2:rng.shuffle(a)
        seqs.append(a)
    reversed_cases=[(1,'A'),(1,'ABCDEF'),(2,'ABCDEF'),(3,'ABCDEF'),(9,'123456789'),(4,'aB01'*25)]
    for groups in range(1,10):
        for size in [1,2,100//groups]:reversed_cases.append((groups,''.join(rng.choice('aZ09bcDE') for _ in range(groups*size))))
    messages=[['Hey good lawyer','as I previously previewed','a b c d e f','Z'],['ab   I abc\tX abcd',' '.join('ABCDEFGHIJKLMNOPQRSTUVWXYZabcd' for _ in range(30))]*50,['First I give money to Teresa','after I inform dad of','your horrible soup']]
    return {'uva-10813-traditional-bingo':str(len(games))+'\n'+'\n'.join(games)+'\n','uva-10815-andy-s-first-dictionary':'\n'.join(sentences),
            'uva-10921-find-the-telephone':'\n'.join(phones)+'\n','uva-10922-2-the-9s':'\n'.join(numbers+['0'])+'\n',
            'uva-11054-wine-trading-in-gergovig':''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in arrays)+'0\n',
            'uva-11063-b2-sequence':''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n\n' for a in seqs),
            'uva-11192-group-reverse':''.join(f'{g} {s}\n' for g,s in reversed_cases)+'0\n',
            'uva-11220-decoding-the-message':str(len(messages))+'\n\n'+'\n\n'.join('\n'.join(m) for m in messages)+'\n\n'}


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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Reviewed exact-input repair: cap distinct vocabulary at5000, make length divisible by9, or replace prohibited hyphens with whitespace; independently recompute.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal bingo line directions, text boundaries, prefix-flow overflow and group constraints','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)


if __name__=='__main__':main()
