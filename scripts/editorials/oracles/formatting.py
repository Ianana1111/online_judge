"""Independent bubble sort, cycle calendar, list matching and text-transformation oracles."""
import argparse
from functools import lru_cache
import hashlib,json,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
MONTHS='pop no zip zotz tzec xul yoxkin mol chen yax zac ceh mac kankin muan pax koyab cumhu uayet'.split()
NAMES='imix ik akbal kan chicchan cimi manik lamat muluk ok chuen eb ben ix mem cib caban eznab canac ahau'.split()

def trains(data):
 values=iter(map(int,data.split()));t=next(values);assert t>=1;out=[]
 for _ in range(t):
  n=next(values);assert 0<=n<=50
  a=[next(values) for _ in range(n)];assert sorted(a)==list(range(1,n+1));swaps=0
  for end in range(n-1,0,-1):
   for i in range(end):
    if a[i]>a[i+1]:a[i],a[i+1]=a[i+1],a[i];swaps+=1
  out.append(f'Optimal train swapping takes {swaps} swaps.')
 assert next(values,None) is None
 return '\n'.join(out)+'\n'
CYCLE=[];number=1;name=0
for _ in range(260):
 CYCLE.append((number,NAMES[name]));number=number+1 if number<13 else 1;name=name+1 if name<19 else 0

def maya(data):
 lines=data.splitlines();t=int(lines[0]);assert t>=1 and len(lines)==t+1;out=[str(t)]
 for line in lines[1:]:
  m=re.fullmatch(r'\s*(\d+)\.\s+([a-z]+)\s+(\d+)\s*',line);assert m
  day,month,year=int(m[1]),m[2],int(m[3]);assert month in MONTHS and 0<=year<5000
  assert 0<=day<(5 if month=='uayet' else 20)
  elapsed=sum([365]*year)+sum([20]*MONTHS.index(month))+day
  y,position=divmod(elapsed,260);number,name=CYCLE[position];out.append(f'{number} {name} {y}')
 return '\n'.join(out)+'\n'
def hint(secret,guess):
 strong=sum(a==b for a,b in zip(secret,guess));a=[x for x,y in zip(secret,guess) if x!=y];b=[y for x,y in zip(secret,guess) if x!=y];weak=0
 for x in a:
  if x in b:b.remove(x);weak+=1
 return strong,weak

def mastermind(data):
 values=iter(map(int,data.split()));out=[];game=0
 while True:
  n=next(values)
  if n==0:break
  assert 1<=n<=1000;secret=[next(values) for _ in range(n)];assert all(1<=x<=9 for x in secret);game+=1;out.append(f'Game {game}:')
  while True:
   guess=[next(values) for _ in range(n)]
   if not any(guess):break
   assert all(1<=x<=9 for x in guess)
   a,b=hint(secret,guess);out.append(f'    ({a},{b})')
 assert next(values,None) is None
 return '\n'.join(out)+'\n'
def bases(data):
 out=[]
 for line in data.splitlines():
  tokens=line.split();assert len(tokens)==3;text,fr,to=tokens;fr,to=int(fr),int(to);assert 2<=fr<=16 and 2<=to<=16 and re.fullmatch('[0-9A-F]+',text)
  value=int(text,fr);digits=[]
  while value:value,d=divmod(value,to);digits.append('0123456789ABCDEF'[d])
  out.append((''.join(reversed(digits)) or '0')[-7:].zfill(7))
 return '\n'.join(out)+'\n'
def polynomial(data):
 values=list(map(int,data.split()));assert len(values)%9==0 and all(abs(x)<1000 for x in values);out=[]
 for start in range(0,len(values),9):
  terms=[]
  for power,c in zip(range(8,-1,-1),values[start:start+9]):
   if not c:continue
   variable='' if power==0 else 'x' if power==1 else f'x^{power}'
   magnitude='' if abs(c)==1 and power else str(abs(c))
   terms.append(('-' if c<0 else '+')+magnitude+variable)
  expression=''.join(terms)
  if expression.startswith('+'):expression=expression[1:]
  expression=re.sub(r'(?<!^)([+-])',r' \1 ',expression)
  out.append(expression or '0')
 return '\n'.join(out)+'\n'
MIRROR=dict(zip('AEHIJLMOSTUVWXYZ12358','A3HILJMO2TUVWXY51SEZ8'))
def palindromes(data):
 words=data.split();out=[]
 for s in words:
  assert re.fullmatch('[A-Z1-9]{1,20}',s)
  reverse=s[::-1];pal=s==reverse;mir=''.join(MIRROR.get(ch,'?') for ch in reverse)==s
  text='a mirrored palindrome.' if pal and mir else 'a regular palindrome.' if pal else 'a mirrored string.' if mir else 'not a palindrome.'
  out.append(s+' -- is '+text+'\n\n')
 return ''.join(out)
def periods(data):
 words=data.split();t=int(words[0]);assert t>=1 and len(words)==t+1;out=[]
 for s in words[1:]:
  assert 1<=len(s)<=80
  out.append(str(next(k for k in range(1,len(s)+1) if len(s)%k==0 and s[:k]*(len(s)//k)==s)))
 return '\n\n'.join(out)+'\n'
DECODE={chr(32+(plain-32+7)%95):chr(plain) for plain in range(32,127)}
def decoder(data):
 assert all(ch in DECODE or ch in '\r\n' for ch in data)
 return ''.join(DECODE.get(ch,ch) for ch in data)
def scramble(data):
 assert all(ch.isspace() or 32<=ord(ch)<=126 for ch in data)
 return ''.join(token if token.isspace() else token[::-1] for token in re.split(r'(\s+)',data))
def kindergarten(data):
 out=[]
 for line in data.splitlines():
  words=re.findall('[A-Za-z]+',line);assert words
  out.append(str(len(words)))
 return '\n'.join(out)+'\n'
ORACLES={'uva-299-train-swapping':trains,'uva-300-maya-calendar':maya,'uva-340-master-mind-hints':mastermind,'uva-389-basically-speaking':bases,'uva-392-polynomial-showdown':polynomial,'uva-401-palindromes':palindromes,'uva-455-periodic-strings':periods,'uva-458-the-decoder':decoder,'uva-483-word-scramble':scramble,'uva-494-kindergarten-counting-game':kindergarten}

OUTPUT_FIXES={'uva-340-master-mind-hints': [('153798f5f3325d368c3f4c32d54070abd2b43f18d8e66e75e0e57b2380bf864f', 'f35445b08deaa09eb3433b79bfe28481b830d9f2aad71efa3a249d875faccb7b'), ('7f8ce6ee185e4b8b5c4008499e0e58276946a583c01358de4b57ff5aeb761c14', 'a87d9c441db562a91834a94a8e1671d6d1a10e2882f9c8ab382310326b54c4d3'), ('034faf560ff8a6647330596325779c0793e3282aa5bf603bf83c4ee72377c7f9', '45361accf1dbb8238cac7a5244fcc1c13d9561bcb21ba67c58666869735bf842'), ('7eead593dde768addb82164373fafcd96167ec89ebe09ecb5a5953c3851f0362', '787ec349c23730e9a33039e3358a02d53ea262e82c916f610b1a60f62d0e4e52')], 'uva-389-basically-speaking': [('005ab2fdca83de8ceef3781094b4f0cd7d22567fcd56a3bf5dc624704b2583e3', 'c677256b20929432972c15fcbf44dff6d2c0100bfc537a3c0c7dc43d4f673cd1')], 'uva-483-word-scramble': [('f80ce292561234b929fed50b1c9556ebbf2381511ae2ee4665587c2283446adb', '9d3385d0e323c77ff5b2e76a0ceca91e57fe36e282d75f52ffb5e6785bd10d20')]}
def repair_input(slug,data):
 if slug=='uva-458-the-decoder' and hashlib.sha256(data.encode()).hexdigest()=='efe379e111ab69220a6b4ecd626fa9a3427898a9251fb4ebfdfc1c8d92b37778':return data.replace(chr(127),' ')
 if slug!='uva-494-kindergarten-counting-game' or hashlib.sha256(data.encode()).hexdigest()!='98f6fdcca72dbdc16417737f1b415f9a0dc0eb9e33329b80707f2384bd007016':return None
 return '\n'.join(line if re.search('[A-Za-z]',line) else line+'a' for line in data.splitlines())+'\n'

def additions():
 rng=random.Random(299494);perms=[[],[1],list(range(1,51)),list(range(50,0,-1)),[3,1,2]]
 for n in range(2,51):a=list(range(1,n+1));rng.shuffle(a);perms.append(a)
 dates=[(day,month,year) for year in [0,1,259,260,4999] for month in MONTHS for day in [0,4 if month=='uayet' else 19]]
 games=[([1,1,2,3],[[1,2,1,1],[1,1,2,3],[9,9,9,9]]),([9],[[9],[1]]),([rng.randrange(1,10) for _ in range(1000)],[[rng.randrange(1,10) for _ in range(1000)] for _ in range(8)])]
 conversions=[('0',2,16),('000000000000000000001',2,10),('128',10,2),('127',10,2),('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',16,2),('1A',15,2)]
 for fr in range(2,17):
  for to in range(2,17):conversions.append((''.join(rng.choice('0123456789ABCDEF'[:fr]) for _ in range(30)),fr,to))
 coefficients=[[0]*9]
 for index in range(9):
  for value in [-999,-1,1,999]:row=[0]*9;row[index]=value;coefficients.append(row)
 coefficients += [[rng.choice([-999,-1,0,0,0,1,999]) for _ in range(9)] for _ in range(100)]
 words=list('ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789')+['E3','3E','S2','2S','Z5','5Z','JL','LJ','A'*20,'ABC','ATOYOTA','AE A'.replace(' ','')]
 for _ in range(100):words.append(''.join(rng.choice('AEHIJLMOSTUVWXYZ12358B') for _ in range(rng.randrange(1,21))))
 periodic=['a','aaaa','ababa','abcabcabcabc','a'*80,'ab'*40,'a'*79+'b','abababa']
 periodic += [''.join(rng.choice('abc') for _ in range(rng.randrange(1,81))) for _ in range(100)]
 plain=''.join(chr(i) for i in range(32,127))+'\n'+('A sentence with punctuation! 0123456789.\n'*100)+'No final newline'
 encoded=''.join(chr(32+(ord(ch)-32+7)%95) if ch!='\n' else '\n' for ch in plain)
 return {'uva-299-train-swapping':str(len(perms))+'\n'+''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in perms),
 'uva-300-maya-calendar':str(len(dates))+'\n'+''.join(f'{day}. {month} {year}\n' for day,month,year in dates),
 'uva-340-master-mind-hints':''.join(str(len(secret))+'\n'+' '.join(map(str,secret))+'\n'+''.join(' '.join(map(str,guess))+'\n' for guess in guesses)+' '.join(['0']*len(secret))+'\n' for secret,guesses in games)+'0\n',
 'uva-389-basically-speaking':''.join(f'{value} {fr} {to}\n' for value,fr,to in conversions),
 'uva-392-polynomial-showdown':''.join(' '.join(map(str,row))+'\n' for row in coefficients),
 'uva-401-palindromes':'\n'.join(words)+'\n',
 'uva-455-periodic-strings':str(len(periodic))+'\n\n'+'\n\n'.join(periodic)+'\n',
 'uva-458-the-decoder':encoded,'uva-483-word-scramble':"I love you.\n  ab\tcd  ef\nWe're a happy family.\n\n"+('a'*10000)+' XYZ',
 'uva-494-kindergarten-counting-game':"Hello,world42ABC\ndon't\na---B\n123a456B789\nUPPER lower MiXeD\n"+('a1'*10000)+'END'}

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
                    if check['status']=='WRONG_EXPECTED_OUTPUT' and (check['inputHash'],check['outputHash']) in OUTPUT_FIXES.get(p['slug'],[]):
                        assert answer.split()==c['output'].split()
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Exact input/output reviewed formatting repair: restore4-spaceMasterMind hints, remove stray sample leading space for local7-digit base rule, or preserve original repeated word separators; answer tokens unchanged.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':('Exact-input repair: local decoder uses95printableASCII cycle; replace out-of-alphabet DEL with its equivalent printable encoding of x, expected message unchanged.' if p['slug']=='uva-458-the-decoder' else 'Exact-input repair: kindergarten input promises at leastoneword perline; add one letter only to the prohibited no-word line, retain original separators and recompute.')})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'empty permutations, calendar wraps, matching duplicates, base overflow, zero polynomials, mirror centers and whitespace','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
