"""Independent dominance, Gregorian calendar, rational notes, and parent-pointer oracles."""
import argparse
from datetime import date,timedelta
from fractions import Fraction
from itertools import groupby
import hashlib,json,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]

def google(data):
 tokens=iter(data.split());tests=int(next(tokens));assert tests>0;out=[]
 for tc in range(1,tests+1):
  sites=[(next(tokens),int(next(tokens))) for _ in range(10)]
  assert all(1<=len(u)<=100 and 1<=v<=100 for u,v in sites)
  out.append(f'Case #{tc}:')
  out.extend(u for u,v in sites if not any(score>v for _,score in sites))
 assert next(tokens,None) is None
 return '\n'.join(out)+'\n'
def calendar(data):
 values=list(map(int,data.split()));t=values[0];assert t>=1 and len(values)==1+2*t
 return ''.join(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][date(2011,m,d).weekday()]+'\n' for m,d in zip(values[1::2],values[2::2]))
def jingle(data):
 lines=data.splitlines();assert lines[-1]=='*';out=[]
 durations={ch:Fraction(1,2**i) for i,ch in enumerate('WHQESTX')}
 for line in lines[:-1]:
  assert 3<=len(line)<=200 and line[0]==line[-1]=='/'
  bars=line[1:-1].split('/');assert all(bar and all(c in durations for c in bar) for bar in bars)
  out.append(str(sum(sum((durations[c] for c in bar),Fraction(0))==1 for bar in bars)))
 return '\n'.join(out)+'\n'
def language(data):
 words=data.split();assert words[-1]=='#';out=[]
 for tc,word in enumerate(words[:-1],1):
  assert re.fullmatch('[A-Z]{1,14}',word)
  if word=='HELLO':answer='ENGLISH'
  elif word=='HOLA':answer='SPANISH'
  elif word=='HALLO':answer='GERMAN'
  elif word=='BONJOUR':answer='FRENCH'
  elif word=='CIAO':answer='ITALIAN'
  elif word=='ZDRAVSTVUJTE':answer='RUSSIAN'
  else:answer='UNKNOWN'
  out.append(f'Case {tc}: {answer}')
 return '\n'.join(out)+'\n'
def digits(data):
 values=list(map(int,data.split()));assert 1<=values[0]<=20 and len(values)==values[0]+1;out=[]
 for n in values[1:]:
  assert 1<n<10000
  text=''.join(map(str,range(1,n+1)));out.append(' '.join(str(text.count(str(d))) for d in range(10)))
 return '\n'.join(out)+'\n'
def slogans(data):
 lines=data.splitlines();n=int(lines[0]);assert 1<=n<=20;records=list(zip(lines[1:2*n+1:2],lines[2:2*n+1:2]));q=int(lines[2*n+1]);queries=lines[2*n+2:];assert 1<=q<=100 and len(queries)==q
 assert len(set(a for a,b in records))==n
 assert all(1<=len(s)<=100 and re.fullmatch('[a-z ]+',s) and re.search('[a-z]',s) for pair in records for s in pair)
 out=[]
 for key in queries:
  found=[b for a,b in records if a==key];assert len(found)==1;out.append(found[0])
 return '\n'.join(out)+'\n'
def plates(data):
 lines=data.split();t=int(lines[0]);assert 1<=t<=100 and len(lines)==t+1;out=[]
 for plate in lines[1:]:
  assert re.fullmatch('[A-Z]{3}-[0-9]{4}',plate)
  a,b,c=[ord(ch)-65 for ch in plate[:3]];letters=676*a+26*b+c
  value=sum(int(ch)*10**i for i,ch in enumerate(reversed(plate[4:])))
  out.append('nice' if -100<=letters-value<=100 else 'not nice')
 return '\n'.join(out)+'\n'
def dive(data):
 values=iter(map(int,data.split()));out=[]
 while True:
  n=next(values,None)
  if n is None:break
  r=next(values);assert 1<=r<=n<=10000
  ids=sorted(next(values) for _ in range(r));assert len(set(ids))==r and all(1<=x<=n for x in ids)
  pointer=0;missing=[]
  for value in range(1,n+1):
   if pointer<r and ids[pointer]==value:pointer+=1
   else:missing.append(value)
  out.append(''.join(f'{v} ' for v in missing) if missing else '*')
 return '\n'.join(out)+'\n'
def cool(data):
 words=iter(data.split());out=[];tc=0
 while True:
  token=next(words,None)
  if token is None:break
  n=int(token);assert 1<=n<=10000;tc+=1;assert tc<=30;answer=0
  for _ in range(n):
   word=next(words);assert re.fullmatch('[a-z]{1,30}',word)
   frequencies=[len(list(g)) for _,g in groupby(sorted(word))]
   answer+=len(frequencies)>=2 and all(frequencies[i]!=frequencies[j] for i in range(len(frequencies)) for j in range(i))
  out.append(f'Case {tc}: {answer}')
 return '\n'.join(out)+'\n'
def inception(data):
 lines=data.splitlines();q=int(lines[0]);assert 1<=q<=10000 and len(lines)==q+1;current=None;out=[]
 for line in lines[1:]:
  if line.startswith('Sleep '):
   name=line[6:];assert re.fullmatch('[A-Za-z]{1,15}',name);current=(name,current)
  elif line=='Kick':
   if current is not None:current=current[1]
  else:
   assert line=='Test';out.append(current[0] if current is not None else 'Not in a dream')
 return '\n'.join(out)+'\n' if out else ''
ORACLES={'uva-12015-google-is-feeling-lucky':google,'uva-12019-doom-s-day-algorithm':calendar,'uva-12195-jingle-composing':jingle,'uva-12250-language-detection':language,'uva-1225-digit-counting':digits,'uva-12592-slogan-learning-of-princess':slogans,'uva-12602-nice-licence-plates':plates,'uva-12650-dangerous-dive':dive,'uva-12820-cool-word':cool,'uva-13055-inception':inception}
REPAIRS={
 'uva-12195-jingle-composing':{'2863b0beb21bf66f5109f15142a0c70a9621a3fdd1d3d4189c41d496b3ec73bc','dd75c93b0793c871e508d0882f0611f77dd0ee323d7147bda747dd170f3afbbc'},
 'uva-12250-language-detection':{'6f470e188c6014cd0c62546be70d880ed579fc2232940f6549ca1d5b23b339be'},
 'uva-1225-digit-counting':{'d0c52a02825b7ea461932bd5bf3e2ce50acd183069f0fe419b9e71a303d75d3a'},
 'uva-12592-slogan-learning-of-princess':{'1e8088475c006390c5f90db96d04aedb11d7fd54fe3c3faca12c8eb4410c0f31'}
}
def legalize(slug,data):
 lines=data.splitlines()
 if slug=='uva-12195-jingle-composing':
  result=[]
  for line in lines[:-1]:
   # Keep every original nonempty measure intact; replace the one prohibited
   # empty measure with X. Split compositions only at measure boundaries.
   bars=[bar or 'X' for bar in line[1:-1].split('/')];current='/'
   for bar in bars:
    assert len(bar)<=198
    if len(current)+len(bar)+1>200:result.append(current);current='/'
    current+=bar+'/'
   result.append(current)
  return '\n'.join(result+['*'])+'\n'
 if slug=='uva-12250-language-detection':return '\n'.join(re.sub('[^A-Z]','X',line) for line in lines[:-1])+'\n#\n'
 if slug=='uva-1225-digit-counting':return lines[0]+'\n'+'\n'.join(str(max(2,int(line))) for line in lines[1:])+'\n'
 if slug=='uva-12592-slogan-learning-of-princess':
  n=int(lines[0]);mapping={lines[i]:lines[i][:100] for i in range(1,2*n+1,2)}
  assert len(set(mapping.values()))==n
  records=[line[:100] for line in lines[1:2*n+1]]
  return '\n'.join([lines[0]]+records+[lines[2*n+1]]+[mapping[q] for q in lines[2*n+2:]])+'\n'
 raise AssertionError('Unknown repair')

def repair_input(slug,data):
 if hashlib.sha256(data.encode()).hexdigest() not in REPAIRS.get(slug,set()):return None
 return legalize(slug,data)
def additions():
 rng=random.Random(1201513055)
 scores=[[100]*10,list(range(1,11)),list(range(10,0,-1)),[1,100,1,100,1,100,1,1,1,100]]+[[rng.randrange(1,101) for _ in range(10)] for _ in range(30)]
 dates=[date(2011,1,1)+timedelta(days=i) for i in range(365)];rng.shuffle(dates)
 songs=['/HH/QQQQ/XXXTXTEQH/W/HW/']
 songs+=['/'+'X'*n+'/' for n in [1,63,64,65,198]]+['/W/W/W/','/H/H/','/W/','/WH/']
 songs+=['/'+ '/'.join(''.join(rng.choice('WHQESTX') for _ in range(rng.randrange(1,16))) for _ in range(rng.randrange(1,9)))+'/' for _ in range(80)]
 greetings=['HELLO','HOLA','HALLO','BONJOUR','CIAO','ZDRAVSTVUJTE','HELLOO','HELL','H','A'*14]
 for w in greetings[:6]:greetings.extend(w[:i]+w[i+1:] for i in range(len(w)))
 greetings += [''.join(rng.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(rng.randrange(1,15))) for _ in range(100)]
 ns=[2,9,10,11,13,99,100,101,110,111,999,1000,1001,9999]
 pairs=[('red','silver'),('red blue','green gold'),('red  blue','two spaces'),(' red','leading key'),('red ','trailing key'),('a'*100,'b'*100)]
 queries=[a for a,b in pairs]*4
 licence=['AAA-0000','AAA-0100','AAA-0101','AAA-9999','ZZZ-9999','ABC-0123','BAA-0576','BAA-0776','BAA-0777','BAA-0575']
 licence+=[''.join(rng.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(3))+f'-{rng.randrange(10000):04}' for _ in range(90)]
 returned=[(1,[1]),(2,[1]),(2,[2]),(10000,list(range(10000,0,-1))),(10000,[5000]),(5,[3,1,5])]
 wordgroups=[['a','aaaa','ab','aba','banana','abbcc','a'*29+'b'],['a'*i+'b'*j for i in range(1,15) for j in range(1,15)],[''.join(rng.choice('abcd') for _ in range(rng.randrange(1,31))) for _ in range(10000)]]
 commands=['Test','Kick','Test','Sleep Alice','Sleep Bob','Test','Kick','Test','Sleep Alice','Test','Kick','Test','Kick','Kick','Test']
 commands+=['Sleep Name']*3000+['Test','Kick']*3000
 commands+=['Sleep MiXeDCaSe','Test','Kick','Test']
 return {'uva-12015-google-is-feeling-lucky':str(len(scores))+'\n'+''.join(''.join(f'http://example.test/{tc}/{i} {s}\n' for i,s in enumerate(row)) for tc,row in enumerate(scores)),
 'uva-12019-doom-s-day-algorithm':str(len(dates))+'\n'+''.join(f'{d.month} {d.day}\n' for d in dates),
 'uva-12195-jingle-composing':'\n'.join(songs+['*'])+'\n','uva-12250-language-detection':'\n'.join(greetings+['#'])+'\n',
 'uva-1225-digit-counting':str(len(ns))+'\n'+'\n'.join(map(str,ns))+'\n',
 'uva-12592-slogan-learning-of-princess':str(len(pairs))+'\n'+''.join(a+'\n'+b+'\n' for a,b in pairs)+str(len(queries))+'\n'+'\n'.join(queries)+'\n',
 'uva-12602-nice-licence-plates':str(len(licence))+'\n'+'\n'.join(licence)+'\n',
 'uva-12650-dangerous-dive':''.join(f'{n} {len(ids)}\n'+' '.join(map(str,ids))+'\n' for n,ids in returned),
 'uva-12820-cool-word':''.join(str(len(words))+'\n'+'\n'.join(words)+'\n' for words in wordgroups),
 'uva-13055-inception':str(len(commands))+'\n'+'\n'.join(commands)+'\n'}

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Reviewed exact-input repair: preserve all musical measures while splitting overlong compositions; replace prohibited empty bar/nonletters; enforce minimumN2 and maximum100-character slogan lines with query mapping preserved.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'ties, all365calendar dates, exact durations, whitespace-sensitive keys, boundaries and dream nesting','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
