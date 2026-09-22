"""Transfers, grammar reductions, independent odd positions, Fibonacci subset join, digit permutations."""
import argparse,hashlib,json,math,random,itertools
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def moving(heights):
 target=sum(heights)//len(heights);assert sum(heights)%len(heights)==0
 surplus=[v-target for v in heights if v>target];deficit=[target-v for v in heights if v<target];i=j=moves=0
 while i<len(surplus):
  amount=min(surplus[i],deficit[j]);surplus[i]-=amount;deficit[j]-=amount;moves+=amount
  if surplus[i]==0:i+=1
  if deficit[j]==0:j+=1
 return moves

def bricks(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n=values[i];i+=1
  if n==0:assert i==len(values);break
  assert 1<=n<=50;h=values[i:i+n];i+=n;assert len(h)==n and all(1<=v<=100 for v in h);out.append(f'Set #{len(out)+1}\nThe minimum number of moves is {moving(h)}.')
 return '\n\n'.join(out)+'\n\n'

def balanced(word):
 while True:
  after=word.replace('()','').replace('[]','')
  if after==word:return not word
  word=after

def parentheses(data):
 lines=data.splitlines();n=int(lines[0]);assert n>=1 and len(lines)==n+1;out=[]
 for word in lines[1:]:assert len(word)<=128 and set(word)<=set('()[]');out.append('Yes' if balanced(word) else 'No')
 return '\n'.join(out)+'\n'

def odd_sum(n):
 before=((n-1)//2)**2
 return sum(2*(before+n-offset)-1 for offset in range(3))

def odds(data):
 values=list(map(int,data.split()));assert all(1<n<10**9 and n%2 for n in values);return ''.join(str(odd_sum(n))+'\n' for n in values)

@lru_cache(None)
def fib_halves():
 fib=[1,2]
 while fib[-1]+fib[-2]<10**8:fib.append(fib[-1]+fib[-2])
 split=len(fib)//2;groups=[]
 for values in (fib[:split],fib[split:]):
  states=[]
  def enumerate_states(i,last,total,mask):
   if i==len(values):states.append((total,mask));return
   enumerate_states(i+1,False,total,mask)
   if not last:enumerate_states(i+1,True,total+values[i],mask|(1<<i))
  enumerate_states(0,False,0,0);groups.append(states)
 return split,groups[0],dict(groups[1])

def fib_representation(value):
 split,left,right=fib_halves();found=[]
 for total,mask in left:
  other=right.get(value-total)
  if other is not None and not ((mask>>(split-1)&1) and (other&1)):found.append(bin(mask|(other<<split))[2:])
 assert len(found)==1;return found[0]

def fibonacci(data):
 values=list(map(int,data.split()));assert 1<=values[0]<=500 and len(values)==values[0]+1;assert all(1<=v<10**8 for v in values[1:]);return ''.join(f'{v} = {fib_representation(v)} (fib)\n' for v in values[1:])

@lru_cache(None)
def digit_divisions():
 result={n:[] for n in range(2,80)}
 for perm in itertools.permutations(range(10)):
  numerator=0;denominator=0
  for v in perm[:5]:numerator=numerator*10+v
  for v in perm[5:]:denominator=denominator*10+v
  n,rem=divmod(numerator,denominator)
  if rem==0 and n in result:result[n].append((numerator,denominator))
 return {n:sorted(pairs) for n,pairs in result.items()}

def division(data):
 values=list(map(int,data.split()));assert values[-1]==0 and all(2<=n<=79 for n in values[:-1]);table=digit_divisions();out=[]
 for n in values[:-1]:out.append('\n'.join(f'{a:05d} / {b:05d} = {n}' for a,b in table[n]) if table[n] else f'There are no solutions for {n}.')
 return '\n\n'.join(out)+'\n'
ORACLES={'uva-591-box-of-bricks':bricks,'uva-673-parentheses-balance':parentheses,'uva-913-joana-and-the-odd-numbers':odds,'uva-948-fibonaccimal-base':fibonacci,'uva-725-division':division}
def repair_input(slug,data):
 if slug=='uva-673-parentheses-balance':return data.replace('{','(').replace('}',')')
 if slug=='uva-591-box-of-bricks':
  v=list(map(int,data.split()));i=0;out=[]
  while True:
   n=v[i];i+=1
   if n==0:assert i==len(v);break
   h=v[i:i+n];i+=n;assert len(h)==n and 1<=n<=50 and min(h)>=1 and sum(h)%n==0
   total=sum(h);target=total//n;assert target<=100;expected=moving(h)
   extra=sum(max(0,x-100) for x in h);h=[min(100,x) for x in h]
   for j in sorted(range(n),key=lambda j:(h[j]<target,-h[j])):
    add=min(extra,100-h[j]);h[j]+=add;extra-=add
    if not extra:break
   assert extra==0 and sum(h)==total and moving(h)==expected
   out.append(str(n)+'\n'+' '.join(map(str,h)))
  return '\n'.join(out)+'\n0\n'
 return None

def additions():
 rng=random.Random(591);heights=[[1],[100],[1,1,4],[1,2,3],[50]*50,[1]*25+[99]*25]
 for _ in range(100):
  n=rng.randrange(2,51)
  while True:
   h=[rng.randrange(1,101) for _ in range(n)]
   if sum(h)%n==0:break
  heights.append(h)
 words=['','([)]','(()','()[]','['*64+']'*64,'('*64+')'*63+']']+[''.join(p) for n in range(1,7) for p in itertools.product('()[]',repeat=n)]
 values=list(range(3,1001,2))+[999999999,999999997,100000001,55]
 f=[1,2]
 while f[-1]+f[-2]<10**8:f.append(f[-1]+f[-2])
 queries=sorted({1,2,3,17,99999999}|{x+d for x in f for d in (-1,0,1) if 0<x+d<10**8});queries += [rng.randrange(1,10**8) for _ in range(500-len(queries))]
 return {'uva-591-box-of-bricks':''.join(str(len(h))+'\n'+' '.join(map(str,h))+'\n' for h in heights)+'0\n','uva-673-parentheses-balance':str(len(words))+'\n'+'\n'.join(words)+'\n','uva-913-joana-and-the-odd-numbers':'\n'.join(map(str,values))+'\n','uva-948-fibonaccimal-base':str(len(queries))+'\n'+'\n'.join(map(str,queries))+'\n','uva-725-division':'\n'.join(map(str,range(2,80)))+'\n0\n'}

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Repair only invalid heights by transferring overflow to legal above-average stacks, preserving every group, total and move count; or replace forbidden curly brackets with legal parentheses, retaining line count and length. All answers independently recomputed.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'legal average transfers, empty and exhaustive short bracket words, largest odd row, Fibonacci boundaries and every division quotient2..79','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
