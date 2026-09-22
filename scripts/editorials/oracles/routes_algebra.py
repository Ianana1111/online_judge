"""Independent compressed railway paths, BFS distance matrices, weighted digit DP, circular coverage shortest paths, Gray-code joins and affine evaluation."""
import argparse,hashlib,json,random,re,collections,itertools,heapq,bisect
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def railway_best(n,lines):
 graph=[set() for _ in range(n)];count=[0]*n
 for line in lines:
  for u in set(line):count[u]+=1
  for u,v in zip(line,line[1:]):
   if u!=v:graph[u].add(v);graph[v].add(u)
 important=[u for u,c in enumerate(count) if c>1];assert 1<=len(important)<=100
 seen={0};stack=[0]
 while stack:
  for v in graph[stack.pop()]:
   if v not in seen:seen.add(v);stack.append(v)
 assert len(seen)==n
 junctions=set(important)|{u for u in range(n) if len(graph[u])!=2};compressed={u:{} for u in junctions}
 for u in junctions:
  for neighbor in graph[u]:
   previous,current=u,neighbor;length=1
   while current not in junctions:
    following=next(v for v in graph[current] if v!=previous);previous,current=current,following;length+=1
   if current!=u:compressed[u][current]=min(compressed[u].get(current,10**30),length)
 scores=[]
 for start in important:
  distance={start:0};heap=[(0,start)]
  while heap:
   cost,u=heapq.heappop(heap)
   if cost!=distance[u]:continue
   for v,weight in compressed[u].items():
    candidate=cost+weight
    if candidate<distance.get(v,10**30):distance[v]=candidate;heapq.heappush(heap,(candidate,v))
  assert all(u in distance for u in important);scores.append((sum(distance[u] for u in important),start+1))
 return min(scores)[1]
def railways(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert t>=1;out=[]
 for _ in range(t):
  n,s=a[i:i+2];i+=2;assert 1<=n<=10000 and 1<=s<=100;lines=[]
  for _ in range(s):
   line=[]
   while a[i]!=0:assert 1<=a[i]<=n;line.append(a[i]-1);i+=1
   i+=1;assert len(line)>=2 and line[0]!=line[-1];lines.append(line)
  out.append(f'Krochanska is in: {railway_best(n,lines)}')
 assert i==len(a);return '\n'.join(out)+'\n'
def bfs_matrix(graph):
 result=[]
 for start in range(len(graph)):
  distance=[None]*len(graph);distance[start]=0;queue=collections.deque([start])
  while queue:
   u=queue.popleft()
   for v in graph[u]:
    if distance[v] is None:distance[v]=distance[u]+1;queue.append(v)
  result.append(distance)
 return result
def traffic(data):
 lines=[line.strip() for line in data.splitlines() if line.strip()];i=0;out=[]
 while True:
  n=int(lines[i]);i+=1
  if n==0:break
  assert 3<=n<=100;graphs=[]
  for _ in range(2):
   graph=[]
   for u in range(n):
    row=list(map(int,lines[i].split()));i+=1;assert row[0]==u+1 and all(1<=v<=n and v!=u+1 for v in row[1:]) and len(set(row[1:]))==len(row)-1;graph.append([v-1 for v in row[1:]])
   graphs.append(graph)
  factor,extra=map(int,lines[i].split());i+=1;assert 0<=factor<=10 and 0<=extra<=10;old,new=map(bfs_matrix,graphs);assert all(v is not None for row in old for v in row);maximum=max(map(max,old));allowed=all(new[u][v] is not None and new[u][v]<=factor*old[u][v]+extra for u in range(n) for v in range(n));out.append(('Yes' if allowed else 'No')+' '+str(maximum))
 assert i==len(lines);return '\n'.join(out)+ ('\n' if out else '')
def red_prefix(k,rows):
 if rows<=0:return 0
 bound=rows-1;states={True:1}
 for bit in range(k-1,-1,-1):
  current=bound>>bit&1;following={}
  for tight,count in states.items():
   for digit in range((current if tight else 1)+1):
    key=tight and digit==current;following[key]=following.get(key,0)+count*(2 if digit==0 else 1)
  states=following
 return sum(states.values())
def balloons(data):
 a=list(map(int,data.split()));t=a[0];assert 0<=t<1000 and len(a)==1+3*t;out=[]
 for i in range(t):
  k,left,right=a[1+3*i:4+3*i];assert 0<=k<=30 and 1<=left<=right<=1<<k;out.append(f'Case {i+1}: {red_prefix(k,right)-red_prefix(k,left-1)}')
 return '\n'.join(out)+ ('\n' if out else '')
def patch_best(c,t1,t2,holes):
 holes=sorted(set(holes));n=len(holes);positions=holes+[v+c for v in holes];best=n*min(t1,t2)
 for start in range(n):
  end=start+n;cost={start:0};heap=[(0,start)]
  while heap:
   price,index=heapq.heappop(heap)
   if price!=cost[index]:continue
   if index==end:best=min(best,price);break
   if price>=best:continue
   for length in (t1,t2):
    nxt=min(end,bisect.bisect_right(positions,positions[index]+length));value=price+length
    if value<cost.get(nxt,10**30):cost[nxt]=value;heapq.heappush(heap,(value,nxt))
 return best
def patches(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n,c,t1,t2=a[i:i+4];i+=4;holes=a[i:i+n];i+=n;assert 1<=n<=1000 and 1<=c<=1000000 and 1<=t1<=c and 1<=t2<=c and len(holes)==n and all(0<=v<c for v in holes);out.append(str(patch_best(c,t1,t2,holes)))
 return '\n'.join(out)+ ('\n' if out else '')
def gray_sums(values):
 total=0;previous=0;yield 0
 for index in range(1,1<<len(values)):
  gray=index^(index>>1);flip=gray^previous;bit=flip.bit_length()-1;total+=values[bit] if gray&flip else -values[bit];yield total;previous=gray
def subset_count(values,target):
 middle=len(values)//2;left=collections.Counter(gray_sums(values[:middle]));return sum(left.get(target-total,0) for total in gray_sums(values[middle:]))-(target==0)
def subsets(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n,target=a[i:i+2];i+=2;values=a[i:i+n];i+=n;assert 1<=n<=40 and -10**9<=target<=10**9 and len(values)==n and all(-10**9<=v<=10**9 for v in values);out.append(str(subset_count(values,target)))
 return '\n'.join(out)+ ('\n' if out else '')
def evaluate(expression,x):
 assert re.fullmatch(r'(?:\d+x?|x)(?:[+-](?:\d+x?|x))*',expression);total=0
 for token in re.findall(r'[+-]?(?:\d+x?|x)',expression):
  sign=-1 if token[0]=='-' else 1;term=token.lstrip('+-');variable=term.endswith('x');number=term[:-1] if variable else term;coefficient=int(number) if number else 1;assert 0<=coefficient<=1000;total+=sign*coefficient*(x if variable else 1)
 return total
def equation_answer(equation):
 assert len(equation)<=255 and equation.count('=')==1;left,right=equation.split('=');f0=evaluate(left,0)-evaluate(right,0);f1=evaluate(left,1)-evaluate(right,1);slope=f1-f0
 if slope==0:return 'IDENTITY' if f0==0 else 'IMPOSSIBLE'
 return str((-f0)//slope)
def equations(data):
 a=data.splitlines();t=int(a[0]);assert 1<=t<=10 and len(a)==t+1 and all(not any(ch.isspace() for ch in row) for row in a[1:]);return ''.join(equation_answer(row)+'\n' for row in a[1:])
ORACLES={'uva-11792-krochanska-is-here':railways,'uva-12319-edgetown-s-traffic-jams':traffic,'uva-12627-erratic-expansion':balloons,'uva-12654-patches':patches,'uva-12911-subset-sum':subsets,'uva-1200-a-dp-problem':equations}
def equation_files():
 rng=random.Random(1200);cases=['2x+1=0','0=2x+1','0x=1','0x=0','x=x','7x+6=2','1000x=0','x+1000=0','0=1000x+1',('x+'*63+'x')+'='+('x+'*63+'x')]
 for _ in range(90):
  sides=[]
  for _ in range(2):
   terms=[str(rng.randrange(1001))+rng.choice(['','x']) for j in range(rng.randint(1,8))];sides.append(terms[0]+''.join(rng.choice('+-')+term for term in terms[1:]))
  cases.append('='.join(sides))
 return [str(len(cases[i:i+10]))+'\n'+'\n'.join(cases[i:i+10])+'\n' for i in range(0,len(cases),10)]
def additions():
 rng=random.Random(12654);railcases=[(5,[[0,1,2],[3,1,4]]),(10000,[list(range(10000))]+[[i,i+1] for i in range(99)])]
 for _ in range(50):
  n=rng.randint(2,100);base=list(range(n));rng.shuffle(base);lines=[base]
  for j in range(rng.randint(1,10)):lines.append(rng.sample(range(n),rng.randint(2,n)))
  railcases.append((n,lines))
 trafficcases=[]
 for _ in range(100):
  n=100 if _<3 else rng.randint(3,20);old=[set() for i in range(n)]
  for i in range(1,n):j=rng.randrange(i);old[i].add(j);old[j].add(i)
  for u in range(n):
   for v in range(u):
    if rng.random()<.2:old[u].add(v);old[v].add(u)
  new=[row.copy() for row in old]
  for u in range(n):
   for v in old[u]:
    if u<v and rng.random()<.7:
     if rng.randrange(2):new[u].remove(v)
     else:new[v].remove(u)
  trafficcases.append((n,old,new,rng.randint(0,10),rng.randint(0,10)))
 ballooncases=[(k,1,1<<k) for k in range(31)]+[(30,1,1),(30,1<<30,1<<30)]
 while len(ballooncases)<999:k=rng.randint(0,30);a=rng.randint(1,1<<k);b=rng.randint(a,1<<k);ballooncases.append((k,a,b))
 tirecases=[(4,20,12,9,[1,2,3,13]),(2,10,2,10,[0,2]),(2,10,2,10,[0,9]),(1000,1000000,10000,50001,list(range(0,1000000,1000))),(1,1,1,1,[0])]
 for _ in range(80):c=rng.randint(2,1000);n=rng.randint(1,min(c,30));tirecases.append((n,c,rng.randint(1,c),rng.randint(1,c),rng.sample(range(c),n)))
 subsetcases=[([0],0),([1],0),([-1,1],0),(list(range(-20,0))+list(range(1,21)),0),([-1000000000+i for i in range(20)]+[1000000000-i for i in range(20)],0)]
 for _ in range(2):subsetcases.append((rng.sample(range(-1000000000,1000000001),40),rng.randint(-1000000000,1000000000)))
 for _ in range(50):subsetcases.append((rng.sample(range(-100,101),rng.randint(1,18)),rng.randint(-100,100)))
 return {'uva-11792-krochanska-is-here':str(len(railcases))+'\n'+''.join(f'{n} {len(lines)}\n'+''.join(' '.join(str(u+1) for u in line)+' 0\n' for line in lines) for n,lines in railcases),'uva-12319-edgetown-s-traffic-jams':''.join(str(n)+'\n'+''.join(' '.join(map(str,[u+1]+[v+1 for v in sorted(row)]))+'\n' for graph in [old,new] for u,row in enumerate(graph))+f'{a} {b}\n' for n,old,new,a,b in trafficcases)+'0\n','uva-12627-erratic-expansion':str(len(ballooncases))+'\n'+''.join(f'{k} {a} {b}\n' for k,a,b in ballooncases),'uva-12654-patches':''.join(f'{n} {c} {t1} {t2}\n'+' '.join(map(str,holes))+'\n' for n,c,t1,t2,holes in tirecases),'uva-12911-subset-sum':''.join(f'{len(values)} {target}\n'+' '.join(map(str,values))+'\n' for values,target in subsetcases),'uva-1200-a-dp-problem':equation_files()[0]}

def repair_input(slug,data,expected):
 if slug=='uva-11792-krochanska-is-here':
  a=list(map(int,data.split()));i=1;out=[str(a[0])];changed=False
  for _ in range(a[0]):
   n,s=a[i:i+2];i+=2;lines=[]
   for _ in range(s):
    line=[]
    while a[i]!=0:line.append(a[i]);i+=1
    i+=1;lines.append(line)
   keep=[line for line in lines if len(line)>1]
   if len(keep)!=len(lines):
    assert n==10000 and s==100 and len(keep)==96;changed=True;before=collections.Counter(v for line in lines for v in set(line));important={u for u,c in before.items() if c>1};assert important=={1}
    flat=[u for line in keep for u in line];assert len(flat)==n and set(flat)==set(range(1,n+1))
    original_edges={tuple(sorted(e)) for line in keep for e in zip(line,line[1:])}
    keep=[line if 1 in line else [1]+line for line in keep]
    after=collections.Counter(v for line in keep for v in set(line));assert {u for u,c in after.items() if c>1}==important
    final_edges={tuple(sorted(e)) for line in keep for e in zip(line,line[1:])};assert original_edges<=final_edges and len(final_edges-original_edges)==95
   out.append(f'{n} {len(keep)}');out.extend(' '.join(map(str,line))+' 0' for line in keep)
  assert changed and i==len(a);fixed='\n'.join(out)+'\n';assert railways(fixed).strip()==expected.strip();return fixed,'The invalid network has96 disjoint paths plus4 singleton lines. Remove the four edge-free singleton lines and prepend the original sole important station1 to the other95 paths, adding the minimum95 links needed for connectivity. Preserve all10000 stations, every original segment, the exact sole important station and original answer; this is an explicit topology repair, not merely formatting.'
 if slug=='uva-1200-a-dp-problem':
  rows=data.splitlines();changed=False
  for i in range(1,len(rows)):
   left,right=rows[i].split('=')
   if left[0] in '+-' or right[0] in '+-':
    assert left[0]=='-' and right[0] not in '+-';rows[i]='0'+rows[i];changed=True
  assert changed;fixed='\n'.join(rows)+'\n';assert equations(fixed).strip()==expected.strip();return fixed,'Replace the forbidden leading unary minus by an equivalent zero-minus binary expression; preserve the equation solution and every original answer.'
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
                    check['status']='INPUT_REQUIRES_REVIEW';repair=repair_input(p['slug'],c['input'],c['output'])
                    if repair is not None:
                        corrected,reason=repair;row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':reason})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'important railway stations vs all stations, directed traffic diameter contract, full30-level expansion, circular inclusive patches,40-element signed subset counts and negative rational floors','input':data,'output':oracle(data)})
        if p['slug']=='uva-1200-a-dp-problem':
            for data in equation_files()[1:]:
                if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'Exact floor for signed linear equations, at most10 cases per file','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
