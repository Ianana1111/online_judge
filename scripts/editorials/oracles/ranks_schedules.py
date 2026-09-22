"""Independent floor DP, hour masks, deadline slots, treap ranks, persistent counts and SCCs."""
import argparse,hashlib,json,random,itertools,collections,bisect
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def skyscraper_profit(orders):
 end=max(a+b for a,b,c in orders);starts=collections.defaultdict(list)
 for a,b,c in orders:starts[a].append((a+b,c))
 best=[0]*(end+1)
 for floor in range(end-1,-1,-1):best[floor]=max([best[floor+1]]+[profit+best[finish] for finish,profit in starts.get(floor,[])])
 return best[0]
def skyscrapers(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert 1<=t<=50;out=[]
 for tc in range(1,t+1):
  n=a[i];i+=1;assert 1<=n<=30000;orders=[]
  for _ in range(n):
   start,length,profit=a[i:i+3];i+=3;assert 0<=start<=100000 and 1<=length<=100000 and 1<=profit<=1000;orders.append((start,length,profit))
  out.append(f'Case {tc}: {skyscraper_profit(orders)}')
 assert i==len(a);return '\n'.join(out)+'\n'

def meeting_count(events):
 reachable={0:0}
 for start,finish in events:
  mask=((1<<(finish-start))-1)<<start;following=reachable.copy()
  for occupied,count in reachable.items():
   if not occupied&mask:following[occupied|mask]=max(following.get(occupied|mask,0),count+1)
  reachable=following
 return max(reachable.values())
def meetings(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert 1<=t<=100;out=[]
 for _ in range(t):
  events=[]
  while a[i:i+2]!=[0,0]:
   start,finish=a[i:i+2];i+=2;assert 0<=start<finish<=10;events.append((start,finish))
  i+=2;assert len(events)<20;out.append(str(meeting_count(events)))
 assert i==len(a);return '\n'.join(out)+'\n'

def selling_profit(products):
 slots=list(range(10001))
 def available(day):
  root=day
  while slots[root]!=root:root=slots[root]
  while day!=root:previous=slots[day];slots[day]=root;day=previous
  return root
 answer=0
 for profit,deadline in sorted(products,reverse=True):
  day=available(deadline)
  if day:answer+=profit;slots[day]=available(day-1)
 return answer

def supermarket(data):
 a=list(map(int,data.split()));i=0;out=[]
 while i<len(a):
  n=a[i];i+=1;assert 0<=n<=10000;products=[]
  for _ in range(n):
   profit,deadline=a[i:i+2];i+=2;assert 1<=profit<=10000 and 1<=deadline<=10000;products.append((profit,deadline))
  out.append(str(selling_profit(products)))
 return '\n'.join(out)+'\n'

class MovieTreap:
 def __init__(self,n):
  self.left=[-1]*n;self.right=[-1]*n;self.size=[1]*n;self.keys=list(range(1,n+1));self.priority=list(range(n));random.Random(1513).shuffle(self.priority);self.root=-1;self.time=0
  for node in range(n):self.root=self.merge(self.root,node)
 def length(self,node):return 0 if node<0 else self.size[node]
 def update(self,node):self.size[node]=1+self.length(self.left[node])+self.length(self.right[node]);return node
 def merge(self,a,b):
  if a<0:return b
  if b<0:return a
  if self.priority[a]<self.priority[b]:self.right[a]=self.merge(self.right[a],b);return self.update(a)
  self.left[b]=self.merge(a,self.left[b]);return self.update(b)
 def erase(self,root,key):
  assert root>=0
  if key==self.keys[root]:return self.merge(self.left[root],self.right[root])
  if key<self.keys[root]:self.left[root]=self.erase(self.left[root],key)
  else:self.right[root]=self.erase(self.right[root],key)
  return self.update(root)
 def move(self,movie):
  node=movie-1;key=self.keys[node];cursor=self.root;rank=0
  while cursor>=0:
   if key<=self.keys[cursor]:cursor=self.left[cursor]
   else:rank+=1+self.length(self.left[cursor]);cursor=self.right[cursor]
  self.root=self.erase(self.root,key);self.left[node]=self.right[node]=-1;self.size[node]=1;self.time+=1;self.keys[node]=-self.time;self.root=self.merge(node,self.root);return rank

def movies(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert 1<=t<=100;out=[]
 for _ in range(t):
  n,m=a[i:i+2];i+=2;assert 1<=n<=100000 and 1<=m<=100000;requests=a[i:i+m];i+=m;assert len(requests)==m and all(1<=v<=n for v in requests);tree=MovieTreap(n);out.append(' '.join(str(tree.move(v)) for v in requests))
 assert i==len(a);return '\n'.join(out)+'\n'

def blackbox_answers(values,queries):
 coordinates=sorted(set(values));size=len(coordinates);left=[0];right=[0];count=[0];roots=[0]
 def add(previous,lo,hi,index):
  node=len(count);left.append(left[previous]);right.append(right[previous]);count.append(count[previous]+1)
  if hi-lo>1:
   middle=(lo+hi)//2
   if index<middle:left[node]=add(left[previous],lo,middle,index)
   else:right[node]=add(right[previous],middle,hi,index)
  return node
 for value in values:roots.append(add(roots[-1],0,size,bisect.bisect_left(coordinates,value)))
 answers=[]
 for rank,used in enumerate(queries,1):
  node=roots[used];lo=0;hi=size
  while hi-lo>1:
   middle=(lo+hi)//2
   if rank<=count[left[node]]:node=left[node];hi=middle
   else:rank-=count[left[node]];node=right[node];lo=middle
  answers.append(coordinates[lo])
 return answers

def blackboxes(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert t>=1;out=[]
 for _ in range(t):
  m,n=a[i:i+2];i+=2;assert 1<=n<=m<=30000;values=a[i:i+m];i+=m;queries=a[i:i+n];i+=n;assert len(values)==m and len(queries)==n and all(abs(v)<=2000000000 for v in values) and queries==sorted(queries) and all(rank<=used<=m for rank,used in enumerate(queries,1));out.append('\n'.join(map(str,blackbox_answers(values,queries))))
 assert i==len(a);return '\n\n'.join(out)+'\n'

def email_reach(successor):
 n=len(successor);reverse=[[] for _ in range(n)]
 for u,v in enumerate(successor):reverse[v].append(u)
 seen=[False]*n;finished=[]
 for start in range(n):
  if seen[start]:continue
  stack=[(start,False)]
  while stack:
   u,done=stack.pop()
   if done:finished.append(u);continue
   if seen[u]:continue
   seen[u]=True;stack.append((u,True));stack.append((successor[u],False))
 component=[-1]*n;sizes=[]
 for start in reversed(finished):
  if component[start]>=0:continue
  number=len(sizes);stack=[start];component[start]=number;size=0
  while stack:
   u=stack.pop();size+=1
   for v in reverse[u]:
    if component[v]<0:component[v]=number;stack.append(v)
  sizes.append(size)
 next_component=[-1]*len(sizes)
 for u,v in enumerate(successor):
  if component[u]!=component[v]:next_component[component[u]]=component[v]
 counts=[0]*len(sizes)
 for start in range(len(sizes)):
  path=[];at=start
  while at>=0 and counts[at]==0:path.append(at);at=next_component[at]
  total=0 if at<0 else counts[at]
  for v in reversed(path):total+=sizes[v];counts[v]=total
 return [counts[component[u]] for u in range(n)]
def emails(data):
 a=list(map(int,data.split()));t=a[0];i=1;assert 1<=t<=20;out=[]
 for tc in range(1,t+1):
  n=a[i];i+=1;assert 2<=n<=50000;successor=[-1]*n
  for _ in range(n):
   u,v=a[i:i+2];i+=2;assert 1<=u<=n and 1<=v<=n and u!=v and successor[u-1]<0;successor[u-1]=v-1
  reach=email_reach(successor);answer=max(range(n),key=lambda v:(reach[v],-v));out.append(f'Case {tc}: {answer+1}')
 assert i==len(a);return '\n'.join(out)+'\n'
ORACLES={'uva-11908-skyscraper':skyscrapers,'uva-12694-meeting-room-arrangement':meetings,'uva-1316-supermarket':supermarket,'uva-1513-movie-collection':movies,'uva-501-black-box':blackboxes,'uva-12442-forwarding-emails':emails}
def additions():
 rng=random.Random(501);orders=[[(0,1,1)],[(0,2,10),(2,2,10),(0,4,19)],[(100000,100000,1000)],[(i,1,1000) for i in range(30000)]]
 for _ in range(46):orders.append([(rng.randrange(100001),rng.randrange(1,100001),rng.randrange(1,1001)) for i in range(rng.randrange(1,300))])
 events=[[],[(0,10)],[(i,i+1) for i in range(10)],[(0,5),(5,10),(0,10)],[(1,2)]*19,[(0,3),(3,4),(4,7)]]
 for _ in range(94):
  rows=[]
  for j in range(rng.randrange(20)):start=rng.randrange(10);rows.append((start,rng.randrange(start+1,11)))
  events.append(rows)
 products=[[],[(1,1)],[(50,2),(10,1),(20,2),(30,1)],[(10000,10000)]*10000,[(rng.randrange(1,10001),1) for _ in range(10000)]]
 for _ in range(100):products.append([(rng.randrange(1,10001),rng.randrange(1,10001)) for _ in range(rng.randrange(1,100))])
 movie_cases=[(1,[1]*100000),(100000,list(range(100000,0,-1))),(100000,[rng.randrange(1,100001) for _ in range(100000)])]
 for _ in range(97):n=rng.randrange(1,100);movie_cases.append((n,[rng.randrange(1,n+1) for i in range(300)]))
 box_cases=[([3,1,-4,2,8,-1000,2],[1,2,6,6]),([2]*30000,list(range(1,30001))),(list(range(30000,0,-1)),[30000]*30000),([-2000000000,2000000000],[1,2])]
 for _ in range(50):
  m=rng.randrange(1,301);n=rng.randrange(1,m+1);values=[rng.randrange(-2000000000,2000000001) for _ in range(m)];queries=[];last=0
  for rank in range(1,n+1):last=rng.randrange(max(rank,last),m+1);queries.append(last)
  box_cases.append((values,queries))
 successors=[[1,0],[1,2,0],list(range(1,50000))+[49998],list(range(1,50000))+[0],[v^1 for v in range(50000)]]
 for _ in range(15):
  n=rng.randrange(2,2001);values=[]
  for u in range(n):v=rng.randrange(n-1);values.append(v+(v>=u))
  successors.append(values)
 email_rows=[]
 for values in successors:
  rows=list(enumerate(values,1));rng.shuffle(rows);email_rows.append(str(len(values))+'\n'+''.join(f'{u} {v+1}\n' for u,v in rows))
 return {'uva-11908-skyscraper':str(len(orders))+'\n'+''.join(str(len(rows))+'\n'+''.join(f'{a} {b} {c}\n' for a,b,c in rows) for rows in orders),'uva-12694-meeting-room-arrangement':str(len(events))+'\n'+''.join(''.join(f'{s} {f}\n' for s,f in rows)+'0 0\n' for rows in events),'uva-1316-supermarket':''.join(str(len(rows))+'\n'+''.join(f'{p} {d}\n' for p,d in rows) for rows in products),'uva-1513-movie-collection':str(len(movie_cases))+'\n'+''.join(f'{n} {len(requests)}\n'+' '.join(map(str,requests))+'\n' for n,requests in movie_cases),'uva-501-black-box':str(len(box_cases))+'\n\n'+'\n'.join(f'{len(values)} {len(queries)}\n'+' '.join(map(str,values))+'\n'+' '.join(map(str,queries))+'\n' for values,queries in box_cases),'uva-12442-forwarding-emails':str(len(successors))+'\n'+''.join(email_rows)}
def repair_input(slug,data,expected=None):
 if slug!='uva-11908-skyscraper':return None
 a=list(map(int,data.split()));declared=a[0];i=1;groups=0;declared_end=None
 while i<len(a):
  n=a[i];i+=1;assert 1<=n<=30000 and i+3*n<=len(a)
  for at in range(i,i+3*n,3):
   start,length,profit=a[at:at+3];assert 0<=start<=100000 and 1<=length<=100000 and 1<=profit<=1000
  i+=3*n;groups+=1
  if groups==declared:declared_end=i
 assert groups==declared+1 and groups<=50 and declared_end is not None
 prefix=' '.join(map(str,[declared]+a[1:declared_end]));assert skyscrapers(prefix).split()==expected.split()
 first,body=data.split('\n',1);return str(groups)+'\n'+body

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
                    if p['slug']=='uva-1316-supermarket' and check['status']=='WRONG_EXPECTED_OUTPUT':
                        assert answer.split()==c['output'].split()
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Restore one answer per line as explicitly required; input and every numeric output token remain unchanged.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'],c['output'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Correct the declared Skyscraper test-case count to include the complete trailing30000-order case. Preserve every original order and all earlier answers; independently compute the newly reachable last answer.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'weighted adjacent intervals, hourly disjoint masks, inclusive unit deadlines, treap move-to-front ranks, persistent prefix order statistics and functional SCC reach','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
