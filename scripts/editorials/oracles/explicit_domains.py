"""Independent merge relations, letter scans, undirected connectivity, Stern-Brocot jumps,
minimax partition DP, exact multinomial ranking, and recursive digit-factor optimization."""
import argparse,bisect,collections,hashlib,itertools,json,math,random,string
from functools import lru_cache
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
SETS='uva-496-simply-subsets';LETTERS='uva-499-what-s-the-frequency-kenneth';TREE='uva-615-is-it-a-tree';FRACTION='uva-834-continued-fractions';TRIP='uva-907-winterim-backpacking-trip';PERM='uva-941-permutations';PRODUCT='uva-993-product-of-digits'
def relation(a,b):
 a=sorted(a);b=sorted(b);assert len(a)==len(set(a)) and len(b)==len(set(b));i=j=common=0
 while i<len(a) and j<len(b):
  if a[i]==b[j]:common+=1;i+=1;j+=1
  elif a[i]<b[j]:i+=1
  else:j+=1
 if common==len(a)==len(b):return 'A equals B'
 if common==len(a):return 'A is a proper subset of B'
 if common==len(b):return 'B is a proper subset of A'
 if not common:return 'A and B are disjoint'
 return "I'm confused!"
def sets(data):
 lines=data.splitlines();assert len(lines)%2==0;return ''.join(relation(list(map(int,a.split())),list(map(int,b.split())))+'\n' for a,b in zip(lines[::2],lines[1::2]))
def letter_line(line):
 alphabet=string.ascii_uppercase+string.ascii_lowercase;counts=[line.count(ch) for ch in alphabet];best=max(counts);return ''.join(ch for ch,count in zip(alphabet,counts) if count==best and count>0)+' '+str(best)
def letters(data):return '\n'.join(letter_line(line) for line in data.splitlines())+'\n'
def tree_value(edges):
 if not edges:return True,None
 vertices={v for edge in edges for v in edge};parent={v:v for v in vertices};incoming=collections.Counter(v for u,v in edges)
 def find(v):
  while parent[v]!=v:parent[v]=parent[parent[v]];v=parent[v]
  return v
 good=all(count==1 for count in incoming.values())
 for u,v in edges:
  a,b=find(u),find(v)
  if a==b:good=False
  else:parent[a]=b
 roots=vertices-set(incoming);good=good and len(roots)==1 and len({find(v) for v in vertices})==1
 return good,next(iter(roots)) if good else None
def trees(data):
 values=list(map(int,data.split()));assert len(values)%2==0;edges=[];out=[];done=False
 for at,(u,v) in enumerate(zip(values[::2],values[1::2])):
  if u<0 and v<0:assert at*2+2==len(values) and not edges;done=True;break
  if u==v==0:
   good,root=tree_value(edges);text=f'Case {len(out)+1} is '+('a tree.' if good else 'not a tree.')
   if good and root is not None:text+=f' Root is {root}.'
   out.append(text);edges=[]
  else:assert 1<=u<=100 and 1<=v<=100;edges.append((u,v))
 assert done;return '\n'.join(out)+'\n'
def continued_fraction(a,b):
 rational=Fraction(a,b);first=rational.numerator//rational.denominator;residual=rational-first
 if not residual:return [first]
 n,d=residual.numerator,residual.denominator;ln,ld,un,ud=0,1,1,0;runs=[]
 while True:
  left=n*ld-d*ln;right=d*un-n*ud
  if left==right:break
  if left>right:
   count=(left-1)//right;ln+=count*un;ld+=count*ud;runs.append(('R',count))
  else:
   count=(right-1)//left;un+=count*ln;ud+=count*ld;runs.append(('L',count))
 assert runs and runs[0][0]=='L';result=[first]+[count for direction,count in runs];result[-1]+=1
 # Reconstruct through exact rational arithmetic rather than trusting run conversion.
 value=Fraction(result[-1])
 for coefficient in result[-2::-1]:value=coefficient+1/value
 assert value==rational and result[-1]>1 and all(x>0 for x in result[1:]);return result
def fractions(data):
 values=list(map(int,data.split()));assert len(values)%2==0;out=[]
 for a,b in zip(values[::2],values[1::2]):
  assert b!=0;c=continued_fraction(a,b);out.append('['+str(c[0])+';'+','.join(map(str,c[1:]))+']')
 return '\n'.join(out)+'\n'
def trip_cost(distances,nights):
 n=len(distances);groups=min(n,nights+1);prefix=[0]
 for value in distances:prefix.append(prefix[-1]+value)
 previous=prefix[:]
 for g in range(2,groups+1):
  current=[0]*(n+1)
  for end in range(g,n+1):
   lo,hi=g-1,end-1
   while lo<hi:
    middle=(lo+hi)//2
    if previous[middle]>=prefix[end]-prefix[middle]:hi=middle
    else:lo=middle+1
   current[end]=min(max(previous[j],prefix[end]-prefix[j]) for j in [lo,lo-1] if j>=g-1)
  previous=current
 return previous[n]
def trips(data):
 values=list(map(int,data.split()));at=0;out=[]
 while at<len(values):
  n,k=values[at:at+2];at+=2;row=values[at:at+n+1];at+=n+1;assert 1<=n<=600 and 0<=k<=300 and len(row)==n+1 and all(v>=0 for v in row);out.append(str(trip_cost(row,k)))
 return '\n'.join(out)+'\n'
def multinomial(counts):
 result=1;used=0
 for count in counts:result*=math.comb(used+count,count);used+=count
 return result
def permutation(word,rank):
 counts=collections.Counter(word);remaining=len(word);total=multinomial(counts.values());assert 0<=rank<total;out=[]
 while remaining:
  alphabet=sorted(ch for ch,count in counts.items() if count);blocks=[total*counts[ch]//remaining for ch in alphabet];prefix=list(itertools.accumulate(blocks));at=bisect.bisect_right(prefix,rank);before=prefix[at-1] if at else 0;rank-=before;chosen=alphabet[at];out.append(chosen);total=blocks[at];counts[chosen]-=1;remaining-=1
 return ''.join(out)
def permutations(data):
 words=data.split();t=int(words[0]);assert t>0 and len(words)==1+2*t;out=[]
 for word,rank in zip(words[1::2],words[2::2]):assert 1<=len(word)<=20 and all('a'<=ch<='z' for ch in word);out.append(permutation(word,int(rank)))
 return '\n'.join(out)+'\n'
@lru_cache(None)
def factor_suffix(n):
 if n==1:return ''
 candidates=[]
 for digit in range(2,10):
  if n%digit==0:
   tail=factor_suffix(n//digit)
   if tail is not None:candidates.append(str(digit)+tail)
 return min(candidates,key=lambda s:(len(s),s)) if candidates else None
def product_number(n):
 if n<2:return str(n)
 answer=factor_suffix(n);return answer if answer is not None else '-1'
def products(data):
 values=list(map(int,data.split()));t=values[0];assert t>0 and len(values)==t+1 and all(0<=v<=10**9 for v in values[1:]);return '\n'.join(product_number(n) for n in values[1:])+'\n'
ORACLES={SETS:sets,LETTERS:letters,TREE:trees,FRACTION:fractions,TRIP:trips,PERM:permutations,PRODUCT:products}
def additions():
 rng=random.Random(941);setpairs=[([],[]),([],[1]),([1],[]),([-2147483648,0,2147483647],[2147483647,0,-2147483648]),([1,2],[2,3]),([1],[2])]
 setpairs.extend((rng.sample(range(-100,101),rng.randrange(30)),rng.sample(range(-100,101),rng.randrange(30))) for _ in range(100))
 lines=['','12345 !?','Aa','AAaaBBbb','ZzAayY','a'*1000+'Z'*1000,string.ascii_uppercase+string.ascii_lowercase];lines.extend(''.join(rng.choice(string.ascii_letters+string.digits+' !?') for _ in range(300)) for _ in range(80))
 graphs=[[],[(1,1)],[(1,2),(1,2)],[(1,2),(3,4)],[(1,2),(3,4),(4,3)],[(100,i) for i in range(1,100)],[(i,i+1) for i in range(1,100)],[(1,2),(2,3),(3,1)],[(2,1),(2,3)],[(1,3),(2,3)]]
 for _ in range(100):graphs.append([(rng.randint(1,10),rng.randint(1,10)) for _ in range(rng.randrange(20))])
 ratios=[(0,1),(1,1),(-1,1),(5,1),(43,19),(-43,19),(43,-19),(-43,-19),(1,1000000),(999999,1000000),(1000000,999999)];ratios.extend((rng.randint(-1000000,1000000),rng.choice([-1,1])*rng.randint(1,1000000)) for _ in range(150))
 hikes=[([0,0],0),([7,11],300),([7,11],0),([1]*601,300),([10000]*601,300),([0]*601,300),([100,0,0,0,1],4)]
 hikes.extend(([rng.randrange(100) for _ in range(rng.randint(2,15))],rng.randrange(15)) for _ in range(80))
 rankings=[('a',0),('a'*20,0),('abcdefghijklmnopqrst',math.factorial(20)-1),('tsrqponmlkjihgfedcba',0),('a'*10+'b'*10,math.comb(20,10)-1)]
 for word in ['aabb','aaab','abcc','aabcde','abcde','abcdefghij']:
  total=multinomial(collections.Counter(word).values());rankings.extend((word,rank) for rank in sorted({0,total-1,total//2}))
 numbers=list(range(301))+[10**9,536870912,387420489,823543,9765625,999999937,999999999];numbers.extend(rng.randrange(10**9+1) for _ in range(100))
 return {SETS:[''.join(' '.join(map(str,a))+'\n'+' '.join(map(str,b))+'\n' for a,b in setpairs)],LETTERS:['\n'.join(lines)+'\n'],TREE:[''.join(''.join(f'{u} {v}\n' for u,v in edges)+'0 0\n' for edges in graphs)+'-1 -1\n'],FRACTION:[''.join(f'{a} {b}\n' for a,b in ratios)],TRIP:[''.join(f'{len(row)-1} {k}\n'+'\n'.join(map(str,row))+'\n' for row,k in hikes)],PERM:[str(len(rankings))+'\n'+''.join(f'{word}\n{rank}\n' for word,rank in rankings)],PRODUCT:[str(len(numbers))+'\n'+'\n'.join(map(str,numbers))+'\n']}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();normalize=lambda s:'\n'.join(line.rstrip(' \t\r') for line in s.split('\n')).strip('\n');snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  oracle=ORACLES.get(p['slug'])
  if not oracle:continue
  spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:
     answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'empty sets/letter lists/trees,negative and integral rationals,extra overnight stays,distinct multiset permutations,zero and prime-power digit products','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
