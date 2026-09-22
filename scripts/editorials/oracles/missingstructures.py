"""Independent reachability, oil-cell unions, rational ordering and inclusion-exclusion."""
import argparse,hashlib,json,math,random
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def network_answers(n,commands):
 graph=[set() for _ in range(n)];yes=no=0
 for op,a,b in commands:
  if op=='c':graph[a-1].add(b-1);graph[b-1].add(a-1);continue
  seen={a-1};pending=[a-1]
  for u in pending:
   for v in graph[u]:
    if v not in seen:seen.add(v);pending.append(v)
  if b-1 in seen:yes+=1
  else:no+=1
 return yes,no

def network(data):
 lines=data.splitlines();t=int(lines[0]);assert t>0;i=1;out=[]
 for _ in range(t):
  while i<len(lines) and not lines[i].strip():i+=1
  n=int(lines[i]);i+=1;assert n>0;commands=[]
  while i<len(lines) and lines[i].strip():
   op,a,b=lines[i].split();i+=1;a=int(a);b=int(b);assert op in 'cq' and len(op)==1 and 1<=a<=n and 1<=b<=n;commands.append((op,a,b))
  yes,no=network_answers(n,commands);out.append(f'{yes},{no}')
 assert all(not line.strip() for line in lines[i:])
 return '\n\n'.join(out)+'\n'
def oil_count(grid):
 h=len(grid);w=len(grid[0]);parent={r*w+c:r*w+c for r in range(h) for c in range(w) if grid[r][c]=='@'};size={i:1 for i in parent}
 def find(a):
  while parent[a]!=a:parent[a]=parent[parent[a]];a=parent[a]
  return a
 for r in range(h):
  for c in range(w):
   if grid[r][c]!='@':continue
   for dr,dc in [(-1,-1),(-1,0),(-1,1),(0,-1)]:
    nr,nc=r+dr,c+dc
    if 0<=nr<h and 0<=nc<w and grid[nr][nc]=='@':
     a,b=find(r*w+c),find(nr*w+nc)
     if a!=b:
      if size[a]<size[b]:a,b=b,a
      parent[b]=a;size[a]+=size[b]
 roots={find(a) for a in parent};assert all(size[root]<=100 for root in roots)
 return len(roots)
def oil(data):
 words=data.split();i=0;out=[]
 while True:
  r,c=map(int,words[i:i+2]);i+=2
  if r==0:break
  assert 1<=r<=100 and 1<=c<=100;grid=words[i:i+r];i+=r;assert len(grid)==r and all(len(row)==c and set(row)<=set('@*') for row in grid);out.append(str(oil_count(grid)))
 assert i==len(words)
 return '\n'.join(out)+'\n'
def largest_concatenation(values):return ''.join(sorted(values,key=lambda word:Fraction(int(word),10**len(word)-1),reverse=True))
def children(data):
 words=data.split();i=0;out=[]
 while True:
  n=int(words[i]);i+=1
  if n==0:break
  assert 1<=n<=50;values=words[i:i+n];i+=n;assert len(values)==n and all(word.isdigit() and int(word)>0 for word in values);out.append(largest_concatenation(values))
 assert i==len(words)
 return '\n'.join(out)+'\n'
def coprime_count(n):
 remaining=n;factors=[];p=2
 while p*p<=remaining:
  if remaining%p==0:
   factors.append(p)
   while remaining%p==0:remaining//=p
  p+=1 if p==2 else 2
 if remaining>1:factors.append(remaining)
 count=0
 for mask in range(1<<len(factors)):
  product=1;parity=0
  for i,p in enumerate(factors):
   if mask>>i&1:product*=p;parity^=1
  multiples=(n-1)//product+1;count+=-multiples if parity else multiples
 return count

def fractions(data):
 values=list(map(int,data.split()));assert values[-1]==0 and all(1<=n<10**9 for n in values[:-1])
 return '\n'.join(str(coprime_count(n)) for n in values[:-1])+'\n'
def burger_answer(m,n,t):
 used,count=max((x*m+((t-x*m)//n)*n,x+(t-x*m)//n) for x in range(t//m+1));return count,t-used

def burgers(data):
 values=list(map(int,data.split()));assert len(values)%3==0;out=[]
 for i in range(0,len(values),3):
  m,n,t=values[i:i+3];assert all(0<x<10000 for x in [m,n,t]);count,beer=burger_answer(m,n,t);out.append(str(count)+(f' {beer}' if beer else ''))
 return '\n'.join(out)+'\n'
ORACLES={'gpe-10600-network-connections':network,'gpe-22821-oil-deposits':oil,'gpe-11041-children-s-game':children,'gpe-10679-irreducible-basic-fractions':fractions,'gpe-11174-homer-simpson':burgers}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(793572)
 networks=[(1,[('q',1,1)]),(4,[('q',2,4),('c',1,2),('c',3,4),('c',1,3),('q',2,4)]),(3,[]),(1000,[('c',i,i+1) for i in range(1,1000)]+[('q',1,i) for i in range(1,1001)])]
 for _ in range(20):
  n=rng.randrange(1,50);networks.append((n,[(rng.choice('ccq'),rng.randrange(1,n+1),rng.randrange(1,n+1)) for _ in range(200)]))
 grids=[['*'],['@'],['@*','*@'],['@'*100],['@'*50]*2,[''.join('@' if r%10<8 and c%10<8 else '*' for c in range(100)) for r in range(100)],['*'*100]*100]
 grids += [[''.join(rng.choice('@*') for _ in range(10)) for _ in range(10)] for _ in range(20)]
 groups=[['3','30'],['12','121'],['12','1212','12'],['123','124','56','90'],['1'],['9']*50]
 groups += [[str(rng.randrange(1,10**9)) for _ in range(rng.randrange(1,51))] for _ in range(30)]
 ns=list(range(1,1001))+[2**29,3**18,5**12,999999937,223092870,999999999]+[rng.randrange(1,10**9) for _ in range(100)]
 meals=[(3,10,10),(3,5,7),(8,9,1),(1,9999,9999),(9999,9999,9999),(9998,9999,9999),(1,1,1),(5,5,24)]
 meals += [(m,n,t) for m in range(1,11) for n in range(1,11) for t in [1,7,20,99]]
 return {'gpe-10600-network-connections':str(len(networks))+'\n\n'+'\n\n'.join(str(n)+'\n'+'\n'.join(f'{op} {a} {b}' for op,a,b in commands) for n,commands in networks)+'\n',
 'gpe-22821-oil-deposits':''.join(f'{len(g)} {len(g[0])}\n'+'\n'.join(g)+'\n' for g in grids)+'0 0\n',
 'gpe-11041-children-s-game':''.join(str(len(a))+'\n'+' '.join(a)+'\n' for a in groups)+'0\n',
 'gpe-10679-irreducible-basic-fractions':'\n'.join(map(str,ns+[0]))+'\n',
 'gpe-11174-homer-simpson':''.join(f'{m} {n} {t}\n' for m,n,t in meals)}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'chronological connectivity, eight-direction oil components of at most100cells, concatenation prefixes, unit denominator and primary minimum beer time','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
