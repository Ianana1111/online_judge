"""Independent parity DSU, cyclic bitsets, matching-position LIS and subset bitsets."""
import argparse,hashlib,json,random
from bisect import bisect_left
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]

def bipartite(n,edges):
 parent=list(range(2*n));size=[1]*(2*n)
 def find(a):
  while parent[a]!=a:parent[a]=parent[parent[a]];a=parent[a]
  return a
 def union(a,b):
  a,b=find(a),find(b)
  if a==b:return
  if size[a]<size[b]:a,b=b,a
  parent[b]=a;size[a]+=size[b]
 for a,b in edges:union(a,b+n);union(a+n,b)
 return all(find(a)!=find(a+n) for a in range(n))
def coloring(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n=values[i];i+=1
  if n==0:break
  assert 2<=n<=199;m=values[i];i+=1;assert m>=0;edges=[];adj=[[] for _ in range(n)]
  for _ in range(m):
   a,b=values[i:i+2];i+=2;assert 0<=a<n and 0<=b<n and a!=b;edges.append((a,b));adj[a].append(b);adj[b].append(a)
  seen={0};todo=[0]
  for a in todo:
   for b in adj[a]:
    if b not in seen:seen.add(b);todo.append(b)
  assert len(seen)==n
  out.append('BICOLORABLE.' if bipartite(n,edges) else 'NOT BICOLORABLE.')
 assert i==len(values)
 return '\n'.join(out)+'\n'
def divisible(a,k):
 mask=(1<<k)-1;bits=1<<(a[0]%k)
 for x in a[1:]:
  r=x%k;s=(-x)%k
  bits=(((bits<<r)|(bits>>(k-r)))|((bits<<s)|(bits>>(k-s))))&mask
 return bool(bits&1)
def divisibility(data):
 values=list(map(int,data.split()));t=values[0];assert t>0;i=1;out=[]
 for _ in range(t):
  n,k=values[i:i+2];i+=2;assert 1<=n<=10000 and 2<=k<=100;a=values[i:i+n];i+=n;assert len(a)==n and all(abs(x)<=10000 for x in a)
  out.append('Divisible' if divisible(a,k) else 'Not divisible')
 assert i==len(values)
 return '\n'.join(out)+'\n'
def lcs(a,b):
 positions={}
 for i,ch in enumerate(b):positions.setdefault(ch,[]).append(i)
 tails=[]
 for ch in a:
  for pos in reversed(positions.get(ch,[])):
   j=bisect_left(tails,pos)
   if j==len(tails):tails.append(pos)
   else:tails[j]=pos
 return len(tails)
def towers(data):
 values=list(map(int,data.split()));i=0;out=[];case=0
 while True:
  n,m=values[i:i+2];i+=2
  if n==m==0:break
  assert 1<=n<=100 and 1<=m<=100;a=values[i:i+n];i+=n;b=values[i:i+m];i+=m
  assert len(a)==n and len(b)==m and min(a+b)>0;case+=1
  out.append(f'Twin Towers #{case}\nNumber of Tiles : {lcs(a,b)}\n\n')
 assert i==len(values)
 return ''.join(out)
def common(data):
 lines=data.splitlines();assert len(lines)%2==0;out=[]
 for a,b in zip(lines[::2],lines[1::2]):
  assert len(a)<=1000 and len(b)<=1000;out.append(str(lcs(a,b)))
 return '\n'.join(out)+'\n'
def partition(weights):
 total=sum(weights)
 if total%2:return False
 bits=1
 for w in weights:bits|=bits<<w
 return bool(bits&(1<<(total//2)))
def luggage(data):
 lines=data.splitlines();t=int(lines[0]);assert t>=1 and len(lines)==t+1;out=[]
 for line in lines[1:]:
  weights=list(map(int,line.split()));assert 1<=len(weights)<=20 and all(w>0 for w in weights) and sum(weights)<=200
  out.append('YES' if partition(weights) else 'NO')
 return '\n'.join(out)+'\n'
ORACLES={'uva-10004-bicoloring':coloring,'uva-10036-divisibility':divisibility,'uva-10066-the-twin-towers':towers,'uva-10405-longest-common-subsequence':common,'uva-10664-luggage':luggage}
def repair_input(slug,data):
 if slug=='uva-10664-luggage' and hashlib.sha256(data.encode()).hexdigest()=='a72ce5f12df77213bc5199763f6ebd83f386e06795b697eaaa4822f4319da1f1':
  lines=data.splitlines()
  for row,divisor in [(11,2),(13,3),(36,4),(37,6),(39,10)]:
   old=list(map(int,lines[row+1].split()));new=[max(1,w//divisor) for w in old]
   assert sum(old)>200 and sum(new)<=200 and partition(old)==partition(new)
   lines[row+1]=' '.join(map(str,new))
  return '\n'.join(lines)+'\n'
 return None

def additions():
 rng=random.Random(1000410664)
 graphs=[(2,[(0,1)]),(3,[(0,1),(1,2),(2,0)]),(4,[(0,1),(1,2),(2,3),(3,0)]),(199,[(i,i+1) for i in range(198)]),(199,[(i,i+1) for i in range(198)]+[(198,0)])]
 for n in range(3,31):
  tree=[(i,rng.randrange(i)) for i in range(1,n)];graphs.append((n,tree));graphs.append((n,tree+[(a,b) for a in range(n) for b in range(a+1,n) if rng.randrange(8)==0]))
 divs=[([0],2),([1],2),([-10000],100),([1,2],2),([1,2,3],4),([10000]*10000,99),([-9999]*9999+[10000],100)]
 for _ in range(100):divs.append(([rng.randrange(-10000,10001) for _ in range(rng.randrange(1,80))],rng.randrange(2,101)))
 pairs=[([1,2,3],[1,3]),([1,1,1],[1]),([1],[2]),([1]*100,[1]*100),(list(range(1,101)),list(range(100,0,-1)))]
 pairs += [([rng.randrange(1,20) for _ in range(rng.randrange(1,101))],[rng.randrange(1,20) for _ in range(rng.randrange(1,101))]) for _ in range(50)]
 strings=[('',''),('','abc'),('abc',''),('a b','a b'),('abc','ac'),('aaa','a'),('a'*1000,'a'*1000),('ab'*500,'ba'*500),('a'*1000,'b'*1000),('Aa !','aA !')]
 strings += [(''.join(rng.choice('abc xyz!') for _ in range(rng.randrange(100))),''.join(rng.choice('abc xyz!') for _ in range(rng.randrange(100)))) for _ in range(50)]
 bags=[[1],[200],[100,100],[1,2,5],[1,2],[1,5,11,5],[10]*20,[1]*19+[181],[99,98,3]]
 for _ in range(100):
  weights=[rng.randrange(1,11) for _ in range(rng.randrange(1,21))];assert sum(weights)<=200;bags.append(weights)
 return {'uva-10004-bicoloring':''.join(f'{n}\n{len(edges)}\n'+''.join(f'{a} {b}\n' for a,b in edges) for n,edges in graphs)+'0\n',
 'uva-10036-divisibility':str(len(divs))+'\n'+''.join(f'{len(a)} {k}\n'+ ' '.join(map(str,a))+'\n' for a,k in divs),
 'uva-10066-the-twin-towers':''.join(f'{len(a)} {len(b)}\n'+' '.join(map(str,a))+'\n'+' '.join(map(str,b))+'\n' for a,b in pairs)+'0 0\n',
 'uva-10405-longest-common-subsequence':''.join(a+'\n'+b+'\n' for a,b in strings),
 'uva-10664-luggage':str(len(bags))+'\n'+'\n'.join(' '.join(map(str,a)) for a in bags)+'\n'}

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
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: five overweight luggage sets violate the total <= 200 kg bound. Scale only those rows down with positive integer weights, preserving item counts and independently checked YES/NO results. New legal cases separately cover parity, 0/1 reuse and the exact total bound.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'connected even and odd cycles, exact-use signed residues, noncontiguous matches, repeated symbols, empty lines and bounded partition extremes','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
