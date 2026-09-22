"""Independent inverse triangular bounds, factor sets, sorted merging and signed-power intervals."""
import argparse,hashlib,json,math,random,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]

def funny(data):
 words=data.split();t=int(words[0]);assert 1<=t<=1000 and len(words)==t+1;out=[]
 for word in words[1:]:
  assert word.isdigit() and 1<=int(word)<=9999
  out.append(f"{bin(int(word,10)).count('1')} {bin(int(word,16)).count('1')}")
 return '\n'.join(out)+'\n'
def hotel(data):
 values=list(map(int,data.split()));assert len(values)%2==0;out=[]
 for s,d in zip(values[::2],values[1::2]):
  assert 1<=s<=10000 and 1<=d<10**15
  target=d+s*(s-1)//2;k=(math.isqrt(8*target+1)-1)//2
  if k*(k+1)//2<target:k+=1
  out.append(str(k))
 return '\n'.join(out)+'\n'
def love(data):
 words=data.split();t=int(words[0]);assert 1<=t<10000 and len(words)==1+2*t;out=[]
 for i,(a,b) in enumerate(zip(words[1::2],words[2::2]),1):
  assert re.fullmatch('1[01]{1,29}',a) and re.fullmatch('1[01]{1,29}',b)
  x,y=int(a,2),int(b,2);possible=False;p=2
  while p*p<=x:
   if x%p==0:
    possible|=y%p==0
    while x%p==0:x//=p
   p+=1 if p==2 else 2
  if x>1:possible|=y%x==0
  out.append(f'Pair #{i}: '+('All you need is love!' if possible else 'Love is not all you need!'))
 return '\n'.join(out)+'\n'
def common(data):
 lines=data.splitlines();assert len(lines)%2==0;out=[]
 for a,b in zip(lines[::2],lines[1::2]):
  assert len(a)<=1000 and len(b)<=1000 and re.fullmatch('[a-z]*',a+b)
  a,b=sorted(a),sorted(b);i=j=0;result=[]
  while i<len(a) and j<len(b):
   if a[i]==b[j]:result.append(a[i]);i+=1;j+=1
   elif a[i]<b[j]:i+=1
   else:j+=1
  out.append(''.join(result))
 return '\n'.join(out)+'\n'
def binary_gcd(a,b):
 if a==0:return b
 if b==0:return a
 shift=0
 while a%2==0 and b%2==0:a//=2;b//=2;shift+=1
 while a%2==0:a//=2
 while b:
  while b%2==0:b//=2
  if a>b:a,b=b,a
  b-=a
 return a<<shift

def division(data):
 lines=data.splitlines();assert lines[-1].strip()=='0';out=[]
 for line in lines[:-1]:
  values=list(map(int,line.split()));assert values[-1]==0
  values=values[:-1];assert 2<=len(values)<=1000 and all(values) and len(set(values))>1
  ordered=sorted(values);answer=0
  for a,b in zip(ordered,ordered[1:]):answer=binary_gcd(answer,b-a)
  out.append(str(answer))
 return '\n'.join(out)+'\n'
def guessing(data):
 lines=data.splitlines();assert lines[-1]=='0';lines=lines[:-1];assert len(lines)%2==0;possible=set(range(1,11));out=[];open_game=False
 for a,response in zip(lines[::2],lines[1::2]):
  guess=int(a);assert 1<=guess<=10;open_game=True
  if response=='too high':possible={n for n in possible if n<guess}
  elif response=='too low':possible={n for n in possible if n>guess}
  else:
   assert response=='right on';out.append('Stan may be honest' if guess in possible else 'Stan is dishonest');possible=set(range(1,11));open_game=False
 assert not open_game
 return '\n'.join(out)+'\n'
def spread(data):
 values=list(map(int,data.split()));t=values[0];assert t>=1 and len(values)==1+2*t;out=[]
 for s,d in zip(values[1::2],values[2::2]):
  assert s>=0 and d>=0
  high=(s+d)//2;low=s-high
  out.append(f'{high} {low}' if low>=0 and high>=low and high+low==s and high-low==d else 'impossible')
 return '\n'.join(out)+'\n'
def eleven(data):
 words=data.split();assert words[-1]=='0';out=[]
 for word in words[:-1]:
  assert re.fullmatch('[0-9]{1,1000}',word) and any(ch!='0' for ch in word)
  alternating=sum(int(ch)*(1 if i%2==0 else -1) for i,ch in enumerate(word))
  out.append(word+(' is a multiple of 11.' if alternating%11==0 else ' is not a multiple of 11.'))
 return '\n'.join(out)+'\n'
def negative_binary(n):
 if n==0:return '0'
 low=[0];high=[0];weights=[]
 while not low[-1]<=n<=high[-1]:
  weight=(-2)**len(weights);weights.append(weight);low.append(low[-1]+min(0,weight));high.append(high[-1]+max(0,weight))
 result=[]
 for i in range(len(weights)-1,-1,-1):
  bit=0 if low[i]<=n<=high[i] else 1
  result.append(str(bit));n-=bit*weights[i]
 assert n==0
 return ''.join(result)
def negabase(data):
 values=list(map(int,data.split()));t=values[0];assert 1<=t<=10000 and len(values)==t+1;assert all(-10**9<=n<=10**9 for n in values[1:])
 return ''.join(f'Case #{i}: {negative_binary(n)}\n' for i,n in enumerate(values[1:],1))
def cola(data):
 values=list(map(int,data.split()));out=[]
 for n in values:
  assert 1<=n<=200
  empty=n+1;drinks=n
  while empty>=3:empty-=2;drinks+=1
  assert empty>=1
  empty-=1;out.append(str(drinks))
 return '\n'.join(out)+'\n'
ORACLES={'uva-10019-funny-encryption-method':funny,'uva-10170-the-hotel-with-infinite-rooms':hotel,'uva-10193-all-you-need-is-love':love,'uva-10252-common-permutation':common,'uva-10407-simple-division':division,'uva-10530-guessing-game':guessing,'uva-10812-beat-the-spread':spread,'uva-10929-you-can-say-11':eleven,'uva-11121-base-2':negabase,'uva-11150-cola':cola}
def repair_input(slug,data):
 if slug=='uva-10407-simple-division' and hashlib.sha256(data.encode()).hexdigest()=='294cd96fe0d5d33dee0bb287681e5e618e2346c9aa95f450622c4a1bcf16c69b':return data+'0\n'
 return None
def additions():
 rng=random.Random(1001911150);numbers=[1,2,3,7,8,9,10,11,99,100,101,999,1000,9999]+rng.sample(range(1,10000),986)
 stays=[(1,1),(10000,1),(10000,10000),(10000,10001),(1,10**15-1),(10000,10**15-1)]
 for s in [1,2,100,10000]:
  for k in [s,s+1,s+100,40000000]:
   end=(k-s+1)*(k+s)//2
   stays.extend((s,d) for d in [end-1,end,end+1] if d>=1)
 pairs=[(2,3),(3,9),(27,24),(2**30-1,2**30-1),(2**29,2**29+1),(99991,99991*3)]
 pairs += [(rng.randrange(2,2**30),rng.randrange(2,2**30)) for _ in range(100)]
 strings=[('',''),('','abc'),('abc',''),('ba','ab'),('a'*1000,'a'*999+'b'),('z'*1000,'a'*1000)]
 strings += [(''.join(rng.choice('abcxyz') for _ in range(rng.randrange(1001))),''.join(rng.choice('abcxyz') for _ in range(rng.randrange(1001)))) for _ in range(50)]
 sequences=[[-5,1,7],[10,10,22],[1,2],[-719,1,721],[9981,9987]]
 for _ in range(100):
  step=rng.randrange(1,30);offset=rng.randrange(1,100);seq=[offset+step*rng.randrange(-20,300) for _ in range(rng.randrange(2,30))]
  seq=[x or offset for x in seq]
  if len(set(seq))<2:seq[-1]+=step
  sequences.append(seq)
 transcripts=[[(5,'too high'),(5,'right on')],[(3,'too high'),(9,'too high'),(5,'right on')],[(1,'too high'),(1,'right on')],[(10,'too low'),(10,'right on')],[(5,'right on')],[(5,'too low'),(8,'too high'),(7,'right on')]]
 for _ in range(100):transcripts.append([(rng.randrange(1,11),rng.choice(['too high','too low'])) for _ in range(rng.randrange(1,15))]+[(rng.randrange(1,11),'right on')])
 scores=[(s,d) for s in range(31) for d in range(31)]+[(5000,1000),(5000,1),(5000,5000),(0,0)]
 elevens=['1','11','121','123','9'*1000,'1'+'0'*998+'1','1'+'0'*999]+[str(rng.randrange(1,10**100)) for _ in range(50)]
 negatives=list(range(-1000,1001))+[-10**9,10**9]
 for k in range(1,30):negatives.extend([2**k-1,2**k,2**k+1,-2**k-1,-2**k,-2**k+1])
 return {'uva-10019-funny-encryption-method':str(len(numbers))+'\n'+'\n'.join(map(str,numbers))+'\n',
 'uva-10170-the-hotel-with-infinite-rooms':''.join(f'{s} {d}\n' for s,d in stays),
 'uva-10193-all-you-need-is-love':str(len(pairs))+'\n'+''.join(f'{a:b}\n{b:b}\n' for a,b in pairs),
 'uva-10252-common-permutation':''.join(a+'\n'+b+'\n' for a,b in strings),
 'uva-10407-simple-division':''.join(' '.join(map(str,seq))+' 0\n' for seq in sequences)+'0\n',
 'uva-10530-guessing-game':''.join(''.join(f'{g}\n{r}\n' for g,r in game) for game in transcripts)+'0\n',
 'uva-10812-beat-the-spread':str(len(scores))+'\n'+''.join(f'{s} {d}\n' for s,d in scores),
 'uva-10929-you-can-say-11':'\n'.join(elevens+['0'])+'\n',
 'uva-11121-base-2':str(len(negatives))+'\n'+'\n'.join(map(str,negatives))+'\n',
 'uva-11150-cola':'\n'.join(map(str,range(1,201)))+'\n'}

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: append missing single-zero final sentinel after the valid sequence. Sequence values and expected numeric result are unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'radix interpretations, triangular endpoints, common factors, empty line pairs, signed arbitrary precision and negative-base boundaries','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
