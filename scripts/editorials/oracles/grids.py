"""Independent histogram rectangles, union-find components, linear sieve and inclusion-exclusion."""
import argparse,hashlib,json,math,random
from bisect import bisect_left,bisect_right
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def rectangle_area(grid):
 heights=[0]*len(grid[0]);best=0
 for row in grid:
  heights=[h+1 if value==0 else 0 for h,value in zip(heights,row)];stack=[]
  for i,h in enumerate(heights+[0]):
   while stack and heights[stack[-1]]>h:
    pos=stack.pop();left=stack[-1]+1 if stack else 0;best=max(best,heights[pos]*(i-left))
   stack.append(i)
 return best

def land(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  r,c=values[i:i+2];i+=2
  if r==c==0:break
  assert 1<=r<=100 and 1<=c<=100;a=values[i:i+r*c];i+=r*c;assert len(a)==r*c and set(a)<=set([0,1]);out.append(str(rectangle_area([a[j:j+c] for j in range(0,r*c,c)])))
 assert i==len(values)
 return '\n'.join(out)+'\n'
def language_counts(grid):
 h=len(grid);w=len(grid[0]);parent=list(range(h*w));size=[1]*(h*w)
 def find(a):
  while parent[a]!=a:parent[a]=parent[parent[a]];a=parent[a]
  return a
 def union(a,b):
  a,b=find(a),find(b)
  if a==b:return
  if size[a]<size[b]:a,b=b,a
  parent[b]=a;size[a]+=size[b]
 for r in range(h):
  for c in range(w):
   if r and grid[r-1][c]==grid[r][c]:union(r*w+c,(r-1)*w+c)
   if c and grid[r][c-1]==grid[r][c]:union(r*w+c,r*w+c-1)
 groups={}
 for r in range(h):
  for c in range(w):groups.setdefault(grid[r][c],set()).add(find(r*w+c))
 return {letter:len(roots) for letter,roots in groups.items()}
def languages(data):
 words=data.split();t=int(words[0]);assert t>0;i=1;out=[]
 for case in range(1,t+1):
  h,w=map(int,words[i:i+2]);i+=2;assert h>0 and w>0;grid=words[i:i+h];i+=h;assert len(grid)==h and all(len(row)==w and all('a'<=ch<='z' for ch in row) for row in grid)
  counts=language_counts(grid);out.append(f'World #{case}');out.extend(f'{ch}: {counts[ch]}' for ch in sorted(counts,key=lambda ch:(-counts[ch],ch)))
 assert i==len(words)
 return '\n'.join(out)+'\n'
@lru_cache(maxsize=1)
def digit_prime_values():
 limit=1000000;spf=[0]*limit;primes=[]
 for value in range(2,limit):
  if spf[value]==0:spf[value]=value;primes.append(value)
  for prime in primes:
   product=prime*value
   if product>=limit or prime>spf[value]:break
   spf[product]=prime
 return [value for value in primes if (lambda s:s>=2 and spf[s]==s)(sum(map(int,str(value))))]
def digits(data):
 values=list(map(int,data.split()));n=values[0];assert 1<=n<=500000 and len(values)==1+2*n;primes=digit_prime_values();out=[]
 for lo,hi in zip(values[1::2],values[2::2]):
  assert 1<=lo<=hi<1000000;out.append(str(bisect_right(primes,hi)-bisect_left(primes,lo)))
 return '\n'.join(out)+'\n'
def barcode_count(n,k,m):
 if n<k or n>k*m:return 0
 return sum((-1)**j*math.comb(k,j)*math.comb(n-j*m-1,k-1) for j in range(min(k,(n-k)//m)+1))
def barcodes(data):
 values=list(map(int,data.split()));assert len(values)%3==0;out=[]
 for i in range(0,len(values),3):
  n,k,m=values[i:i+3];assert all(1<=x<=50 for x in [n,k,m]);answer=barcode_count(n,k,m);assert 0<=answer<2**63;out.append(str(answer))
 return '\n'.join(out)+'\n'
ORACLES={'uva-10074-take-the-land':land,'uva-10336-rank-the-languages':languages,'uva-10533-digit-primes':digits,'uva-10721-bar-codes':barcodes}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(1007410721)
 matrices=[[[0]],[[1]],[[0]*100 for _ in range(100)],[[1]*100 for _ in range(100)],[[0,0,1,0],[0,0,0,0]]]
 matrices += [[[rng.randrange(2) for _ in range(c)] for _ in range(r)] for r,c in [(1,100),(100,1),(20,30),(100,100)]]
 maps=[['a'],['ab','ba'],['aaa','aaa'],['z'*100]*100,[''.join('ab'[(r+c)%2] for c in range(100)) for r in range(100)]]
 maps += [[''.join(rng.choice('abcxyz') for _ in range(c)) for _ in range(r)] for r,c in [(1,100),(100,1),(30,50),(50,50)]]
 queries=[(1,1),(2,2),(17,17),(41,41),(1,999999),(999999,999999)]+[(x,x) for x in range(1,1000)]
 queries.extend([(1,999999)]*(500000-len(queries)))
 codes=[(n,k,m) for n in range(1,13) for k in range(1,13) for m in range(1,8)]+[(50,25,50),(50,50,1),(50,1,49),(50,1,50),(1,50,50)]
 codes += [(rng.randrange(1,51),rng.randrange(1,51),rng.randrange(1,51)) for _ in range(200)]
 return {'uva-10074-take-the-land':''.join(f'{len(g)} {len(g[0])}\n'+''.join(' '.join(map(str,row))+'\n' for row in g) for g in matrices)+'0 0\n',
 'uva-10336-rank-the-languages':str(len(maps))+'\n'+''.join(f'{len(g)} {len(g[0])}\n'+'\n'.join(g)+'\n' for g in maps),
 'uva-10533-digit-primes':str(len(queries))+'\n'+''.join(f'{a} {b}\n' for a,b in queries),
 'uva-10721-bar-codes':''.join(f'{n} {k} {m}\n' for n,k,m in codes)}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all-zero/blocked rectangles, diagonal separation and alphabet ties,500000 inclusive prime queries and64bit bounded compositions','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
