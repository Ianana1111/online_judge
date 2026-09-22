"""Independent residual-load DP, digit automata, minimum-amount DP, Fenwick chains and candidate sets."""
import argparse,hashlib,json,random,itertools,collections
from decimal import Decimal
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def box_count(boxes):
 capacity=[10**20]+[-1]*len(boxes);answer=0
 for w,load in boxes:
  for count in range(answer,-1,-1):
   if capacity[count]>=w:capacity[count+1]=max(capacity[count+1],min(capacity[count]-w,load));answer=max(answer,count+1)
 return answer

def boxes(data):
 a=list(map(int,data.split()));i=0;out=[]
 while a[i]:
  n=a[i];i+=1;assert 1<=n<=1000;items=[]
  for _ in range(n):w,load=a[i:i+2];i+=2;assert 0<=w<=3000 and 0<=load<=3000;items.append((w,load))
  out.append(str(box_count(items)))
 assert i==len(a)-1;return '\n'.join(out)+'\n'

def partition_value(s):
 states={int(s[0]):0}
 for digit in map(int,s[1:]):
  following={digit:max(completed+current for current,completed in states.items())}
  for current,completed in states.items():
   extended=current*10+digit
   if current>0 and extended<=2147483647:following[extended]=max(following.get(extended,-1),completed)
  states=following
 return max(completed+current for current,completed in states.items())

def partitions(data):
 a=data.split();t=int(a[0]);assert 1<=t<=500 and len(a)==t+1 and all(1<=len(s)<=200 and s.isascii() and s.isdigit() for s in a[1:]);return ''.join(str(partition_value(s))+'\n' for s in a[1:])

def coin_count(coins):
 amounts=[0]+[10**30]*len(coins)
 for index,coin in enumerate(coins):
  boundary=coins[index+1] if index+1<len(coins) else 10**30
  for count in range(index,-1,-1):
   if amounts[count]+coin<boundary:amounts[count+1]=min(amounts[count+1],amounts[count]+coin)
 return max(i for i,amount in enumerate(amounts) if amount<10**30)

def coins(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert t>=1;out=[]
 for _ in range(t):
  n=a[i];i+=1;values=a[i:i+n];i+=n;assert 1<=n<=1000 and len(values)==n and values[0]==1 and values[-1]<1000000000 and all(p<q for p,q in zip(values,values[1:]));out.append(str(coin_count(values)))
 assert i==len(a);return '\n'.join(out)+'\n'

def train_count(values):
 n=len(values);ranks={v:i+1 for i,v in enumerate(sorted(values))};small=[0]*(n+1);large=[0]*(n+1);answer=0
 def prefix(tree,at):
  best=0
  while at:best=max(best,tree[at]);at-=at&-at
  return best
 def update(tree,at,value):
  while at<=n:tree[at]=max(tree[at],value);at+=at&-at
 for value in reversed(values):
  rank=ranks[value];fall=prefix(small,rank-1)+1;rise=prefix(large,n-rank)+1;answer=max(answer,fall+rise-1);update(small,rank,fall);update(large,n-rank+1,rise)
 return answer

def trains(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert t>=1;out=[]
 for _ in range(t):
  n=a[i];i+=1;values=a[i:i+n];i+=n;assert 0<=n<=2000 and len(values)==n and len(set(values))==n and all(v>=0 for v in values);out.append(str(train_count(values)))
 assert i==len(a);return '\n'.join(out)+'\n'

def edit_distance(a,b):
 # Myers bit-vector frontier: arithmetic implements many edit-grid transitions at once.
 if not a:return len(b)
 width=len(a);mask=(1<<width)-1;high=1<<(width-1);positive=mask;negative=0;score=width;matches={}
 for i,ch in enumerate(a):matches[ch]=matches.get(ch,0)|(1<<i)
 for ch in b:
  equal=matches.get(ch,0);vertical=equal|negative;horizontal=(((equal&positive)+positive)^positive)|equal;plus=negative|~(horizontal|positive);minus=positive&horizontal
  if plus&high:score+=1
  if minus&high:score-=1
  plus=(plus<<1)|1;minus<<=1;positive=(minus|~(vertical|plus))&mask;negative=(plus&vertical)&mask
 return score

def edits(data):
 lines=[line.strip() for line in data.splitlines() if line.strip()];assert len(lines)%2==0;out=[]
 for first,second in zip(lines[::2],lines[1::2]):
  aa=first.split(maxsplit=1);bb=second.split(maxsplit=1);m=int(aa[0]);n=int(bb[0]);a=aa[1] if len(aa)>1 else '';b=bb[1] if len(bb)>1 else '';assert 0<=m<=n and len(a)==m and len(b)==n;out.append(str(edit_distance(a,b)))
 return '\n'.join(out)+'\n'

@lru_cache(maxsize=16)
def password_candidates(first,second):
 columns=[set(row[j] for row in first) for j in range(5)];other=[set(row[j] for row in second) for j in range(5)];return sorted(''.join(word) for word in itertools.product(*columns) if all(word[j] in other[j] for j in range(5)))
def passwords(data):
 a=data.split();t=int(a[0]);i=1;assert t>=1;out=[]
 for _ in range(t):
  k=int(a[i]);i+=1;first=tuple(a[i:i+6]);second=tuple(a[i+6:i+12]);i+=12;assert 1<=k<=7777 and len(first)==len(second)==6 and all(len(row)==5 and row.isascii() and row.isupper() and row.isalpha() for row in first+second);options=password_candidates(first,second);out.append(options[k-1] if k<=len(options) else 'NO')
 assert i==len(a);return '\n'.join(out)+'\n'
ORACLES={'uva-11003-boxes':boxes,'uva-11258-string-partition':partitions,'uva-11264-coin-collector':coins,'uva-11456-trainsorting':trains,'uva-1207-agtc':edits,'uva-1262-password':passwords}
def additions():
 rng=random.Random(11258);box_cases=[[(1,0)],[(1,0),(1,1)],[(1,1),(1,0)],[(0,0)]*1000,[(3,3000)]*1000,[(3000,3000)]*1000]
 for _ in range(80):box_cases.append([(rng.randrange(1,3001),rng.randrange(3001)) for _ in range(rng.randrange(1,70))])
 strings=['0','0'*200,'2147483647','2147483648','2147483647'*20,'9'*200,'1000000000'*20,'0002147483647000','1010101010'*20]
 strings+=[''.join(rng.choice('0123456789') for _ in range(rng.randrange(1,201))) for _ in range(500-len(strings))]
 coin_cases=[[1],[1,2],[1,2,3],[1,3,6,8,15,20],[1<<i for i in range(30)],[1]+list(range(999999001,1000000000))]
 for maxcoin in range(2,13):
  coin_cases.extend([1]+list(subset)+( [maxcoin]) for count in range(maxcoin-1) for subset in itertools.combinations(range(2,maxcoin),count))
 train_cases=[[],[0],list(range(2000)),list(range(1999,-1,-1)),list(range(0,2000,2))+list(range(1,2000,2))]
 for n in range(1,8):train_cases.extend(list(order) for order in itertools.permutations(range(n)))
 train_cases.extend(rng.sample(range(1000000000),2000) for _ in range(5))
 edit_cases=[('',''),('','A'),('A','T'),('AGTC','AGTC'),('A'*500,'T'*500),('AGTC'*125,'GTCA'*125)]
 small=[''.join(s) for n in range(5) for s in itertools.product('AC',repeat=n)]
 edit_cases.extend((a,b) for a in small for b in small if len(a)<=len(b))
 for _ in range(100):
  m=rng.randrange(1,251);n=rng.randrange(m,501);edit_cases.append((''.join(rng.choice('AGTC') for _ in range(m)),''.join(rng.choice('AGTC') for _ in range(n))))
 first=tuple(ch*5 for ch in 'ABCDEF');password_cases=[(k,first,first) for k in range(1,7778)];password_cases.extend([(1,('AAAAA',)*6,('BBBBB',)*6),(2,('AAAAA',)*6,('AAAAA',)*6),(1,('AAAAA',)*6,('AAAAA',)*6)])
 for _ in range(100):
  first=tuple(''.join(rng.choice('ABCDEFG') for _ in range(5)) for _ in range(6));second=tuple(''.join(rng.choice('ABCDEFG') for _ in range(5)) for _ in range(6));password_cases.append((rng.randrange(1,7778),first,second))
 return {'uva-11003-boxes':''.join(str(len(items))+'\n'+''.join(f'{w} {load}\n' for w,load in items) for items in box_cases)+'0\n','uva-11258-string-partition':str(len(strings))+'\n'+'\n'.join(strings)+'\n','uva-11264-coin-collector':str(len(coin_cases))+'\n'+''.join(str(len(values))+'\n'+' '.join(map(str,values))+'\n' for values in coin_cases),'uva-11456-trainsorting':str(len(train_cases))+'\n'+''.join(str(len(values))+'\n'+'\n'.join(map(str,values))+ ('\n' if values else '') for values in train_cases),'uva-1207-agtc':''.join(f'{len(a)} {a}\n{len(b)} {b}\n' for a,b in edit_cases),'uva-1262-password':str(len(password_cases))+'\n'+''.join(str(k)+'\n'+'\n'.join(first+second)+'\n' for k,first,second in password_cases)}
def repair_input(slug,data,expected=None):
 if slug=='uva-11264-coin-collector':
  a=data.split();t=int(a[0]);i=1;out=[str(t)];changed=False
  for _ in range(t):
   n=int(a[i]);i+=1;raw=a[i:i+n];i+=n;original=[Decimal(x) for x in raw];assert original[0]==1 and all(x<y for x,y in zip(original,original[1:]));fixed=[]
   for value in original:
    if value>=1000000000:value=fixed[-1]+1;changed=True
    else:assert value==int(value);value=int(value)
    assert value<1000000000 and (not fixed or fixed[-1]<value);fixed.append(value)
   out.extend([str(n),' '.join(map(str,fixed))])
  assert i==len(a);return '\n'.join(out)+'\n' if changed else None
 if slug=='uva-1207-agtc':
  lines=[line.strip() for line in data.splitlines() if line.strip()];out=[];changed=False
  for first,second in zip(lines[::2],lines[1::2]):
   a=first.split(maxsplit=1);b=second.split(maxsplit=1);x=a[1] if len(a)>1 else '';y=b[1] if len(b)>1 else ''
   if len(x)!=int(a[0]) or len(y)!=int(b[0]):changed=True
   if len(x)>len(y):x,y=y,x;changed=True
   out.extend([f'{len(x)} {x}',f'{len(y)} {y}'])
  return '\n'.join(out)+'\n' if changed else None
 if slug=='uva-1262-password':
  a=data.split();i=1;out=[a[0]];changed=False
  for _ in range(int(a[0])):
   out.append(a[i]);i+=1
   for row in a[i:i+12]:
    assert row.isascii() and row.isalpha() and row.isupper() and len(row) in (5,6)
    if len(row)==6:row=row[:5];changed=True
    out.append(row)
   i+=12
  assert i==len(a);return '\n'.join(out)+'\n' if changed else None
 return None

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
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'],c['output'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Coin Collector preserves all legal prefix denominations and the1000-type count, replacing only out-of-range tail values by the smallest increasing legal values. AGTC preserves both entire strings, corrects declared lengths and swaps pair order to meet n>=m. Password removes only a forbidden sixth column while preserving every cell in the required first five. Independently recompute affected answers.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'ordered box support, signed32-bit segment limits, strict greedy coin thresholds, both-ended train choices, bit-vector edit distance and all7777 password ranks','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
