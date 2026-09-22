"""Independent block sums, extremal products, combinatorics and ordered segment merging."""
import argparse,hashlib,json,math,random
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def last_digit(data):
 words=data.split();assert int(words[-1])==0;out=[]
 for word in words[:-1]:
  n=int(word);assert word.isdigit() and 1<=n<=2*10**100;q,r=divmod(n,20)
  out.append(str((4*q+sum(pow(i,i,10) for i in range(1,r+1)))%10))
 return '\n'.join(out)+'\n'
def product_value(a):
 low=high=a[0];best=max(0,high)
 for x in a[1:]:
  choices=(x,x*low,x*high);low=min(choices);high=max(choices);best=max(best,high)
 return best

def products(data):
 values=list(map(int,data.split()));i=0;out=[];case=0
 while i<len(values):
  n=values[i];i+=1;assert 1<=n<=18;a=values[i:i+n];i+=n;assert len(a)==n and all(-10<=x<=10 for x in a);case+=1
  out.append(f'Case #{case}: The maximum product is {product_value(a)}.\n\n')
 return ''.join(out)
def bricks(data):
 values=list(map(int,data.split()));assert values[-1]==0;out=[]
 for n in values[:-1]:
  assert 1<=n<=50;out.append(str(sum(math.comb(n-k,k) for k in range(n//2+1))))
 return '\n'.join(out)+'\n'
def salutations(data):
 values=list(map(int,data.split()));assert values and all(1<=n<=10 for n in values)
 return '\n\n'.join(str(math.comb(2*n,n)//(n+1)) for n in values)+'\n'
def conformity(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n=values[i];i+=1
  if n==0:break
  assert 1<=n<=10000;records=[]
  for _ in range(n):
   a=values[i:i+5];i+=5;assert len(a)==5 and len(set(a))==5 and all(100<=x<=499 for x in a);records.append(frozenset(a))
  counts=Counter(records);best=max(counts.values());out.append(str(sum(counts[a]==best for a in records)))
 assert i==len(values)
 return '\n'.join(out)+'\n'
def cutting_cost(length,cuts):
 boundaries=[0]+list(cuts)+[length];weights=[b-a for a,b in zip(boundaries,boundaries[1:])];n=len(weights);prefix=[0]
 for w in weights:prefix.append(prefix[-1]+w)
 dp=[[0]*n for _ in range(n)];opt=[[0]*n for _ in range(n)]
 for i in range(n):opt[i][i]=i
 for span in range(2,n+1):
  for i in range(n-span+1):
   j=i+span-1;choices=[(dp[i][k]+dp[k+1][j]+prefix[j+1]-prefix[i],k) for k in range(opt[i][j-1],min(j-1,opt[i+1][j])+1)]
   dp[i][j],opt[i][j]=min(choices)
 return dp[0][-1]
def cutting(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  length=values[i];i+=1
  if length==0:break
  assert 1<=length<1000;n=values[i];i+=1;assert 0<=n<50;cuts=values[i:i+n];i+=n
  assert len(cuts)==n and all(0<x<length for x in cuts) and all(a<b for a,b in zip(cuts,cuts[1:]))
  out.append(f'The minimum cutting is {cutting_cost(length,cuts)}.')
 assert i==len(values)
 return '\n'.join(out)+'\n'
ORACLES={'gpe-10416-last-digit':last_digit,'gpe-10468-maximum-product':products,'gpe-10500-brick-wall-patterns':bricks,'gpe-10501-safe-salutations':salutations,'gpe-10520-conformity':conformity,'gpe-10603-cutting-sticks':cutting}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(1041610603)
 ns=list(range(1,301))+[10**100,2*10**100,2*10**100-1]+[rng.randrange(1,2*10**100+1) for _ in range(100)]
 arrays=[[-1],[0],[1],[-10,-10],[10]*18,[-10]*18,[-10]*17,[0,-1,0],[2,0,3],[-2,3,-4]]
 arrays += [[rng.randrange(-10,11) for _ in range(rng.randrange(1,19))] for _ in range(200)]
 groups=[[[100,101,102,103,104],[104,103,102,101,100],[110,111,112,113,114],[114,113,112,111,110],[200,201,202,203,204]],[[100,101,102,103,104]]*10000]
 for _ in range(20):
  choices=[rng.sample(range(100,500),5) for _ in range(10)];group=[rng.sample(rng.choice(choices),5) for _ in range(rng.randrange(1,101))];groups.append(group)
 sticks=[(1,[]),(2,[1]),(10,[2,4,7]),(999,list(range(1,50))),(999,list(range(950,999))),(999,sorted(rng.sample(range(1,999),49)))]
 for _ in range(50):
  length=rng.randrange(2,1000);sticks.append((length,sorted(rng.sample(range(1,length),rng.randrange(min(50,length))))))
 return {'gpe-10416-last-digit':'\n'.join(map(str,ns+[0]))+'\n',
 'gpe-10468-maximum-product':''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n\n' for a in arrays),
 'gpe-10500-brick-wall-patterns':'\n'.join(map(str,list(range(1,51))+[0]))+'\n',
 'gpe-10501-safe-salutations':'\n\n'.join(map(str,range(1,11)))+'\n',
 'gpe-10520-conformity':''.join(str(len(group))+'\n'+''.join(' '.join(map(str,a))+'\n' for a in group) for group in groups)+'0\n',
 'gpe-10603-cutting-sticks':''.join(f'{length}\n{len(cuts)}\n'+' '.join(map(str,cuts))+'\n' for length,cuts in sticks)+'0\n'}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'hundred-digit exponents, signed and zero products, full tiling/handshake domain, tied course frequencies and asymmetric cutting intervals','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
