"""Bivariate subset polynomial, residual bins, ordered boxes, flood fill and DSU threshold."""
import argparse,hashlib,json,math,random
from collections import deque
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def teams(weights):
 total=sum(weights);stride=total+1;polynomial=1
 for w in weights:polynomial|=polynomial<<(stride+w)
 row=(polynomial>>(len(weights)//2*stride))&((1<<stride)-1)
 candidates=(s for s in range(total+1) if row>>s&1);selected=min(candidates,key=lambda s:abs(total-2*s));return tuple(sorted((selected,total-selected)))

def tug(data):
 tokens=list(map(int,data.split()));tests=tokens[0];assert tests>0;i=1;out=[]
 for _ in range(tests):
  n=tokens[i];i+=1;assert 1<=n<=100;weights=tokens[i:i+n];i+=n;assert len(weights)==n and all(1<=w<=450 for w in weights);out.append(' '.join(map(str,teams(weights))))
 assert i==len(tokens);return '\n\n'.join(out)+'\n'

def can_square(sticks):
 total=sum(sticks)
 if total%4:return False
 side=total//4;sticks=tuple(sorted(sticks,reverse=True))
 if sticks[0]>side:return False
 @lru_cache(None)
 def fill(index,remaining):
  if index==len(sticks):return remaining==(0,0,0,0)
  seen=set()
  for j,capacity in enumerate(remaining):
   if capacity<sticks[index] or capacity in seen:continue
   seen.add(capacity);after=list(remaining);after[j]-=sticks[index]
   if fill(index+1,tuple(sorted(after))):return True
  return False
 return fill(0,(side,)*4)

def squares(data):
 tokens=list(map(int,data.split()));tests=tokens[0];assert tests>0;i=1;out=[]
 for _ in range(tests):
  n=tokens[i];i+=1;assert 4<=n<=20;values=tokens[i:i+n];i+=n;assert len(values)==n and all(1<=v<=10000 for v in values);out.append('yes' if can_square(values) else 'no')
 assert i==len(tokens);return '\n'.join(out)+'\n'

@lru_cache(None)
def surfaces():
 answers=[10**9]*1001
 for a in range(1,1001):
  for b in range(1,1000//a+1):
   for c in range(1,1000//a//b+1):
    n=a*b*c;answers[n]=min(answers[n],2*(a*b+b*c+c*a))
 return answers

def blocks(data):
 tokens=list(map(int,data.split()));assert tokens[0]>0 and len(tokens)==tokens[0]+1;assert all(1<=n<=1000 for n in tokens[1:]);table=surfaces();return ''.join(str(table[n])+'\n' for n in tokens[1:])

def components(n,edges):
 adjacency=[set() for _ in range(n)]
 for a,b in edges:assert 1<=a<=n and 1<=b<=n;adjacency[a-1].add(b-1);adjacency[b-1].add(a-1)
 seen=set();answer=0
 for start in range(n):
  if start in seen:continue
  answer+=1;seen.add(start);pending=[start]
  for vertex in pending:
   for neighbor in adjacency[vertex]:
    if neighbor not in seen:seen.add(neighbor);pending.append(neighbor)
 return answer

def religions(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n,m=values[i:i+2];i+=2
  if n==m==0:assert i==len(values);break
  assert 1<=n<=50000 and 0<=m<=n*(n-1)//2;edges=[]
  for _ in range(m):edges.append(tuple(values[i:i+2]));i+=2
  out.append(f'Case {len(out)+1}: {components(n,edges)}')
 return '\n'.join(out)+'\n'

def bottleneck(n,edges,start,finish):
 if start==finish:return None
 parent=list(range(n+1))
 def find(x):
  while parent[x]!=x:parent[x]=parent[parent[x]];x=parent[x]
  return x
 for a,b,seats in sorted(edges,key=lambda edge:-edge[2]):
  assert 1<=a<=n and 1<=b<=n and seats>1;parent[find(a)]=find(b)
  if find(start)==find(finish):return seats
 raise AssertionError('No finite route; statement gives no impossible-output format')

def tourists(data):
 values=list(map(int,data.split()));i=0;out=[]
 while True:
  n,r=values[i:i+2];i+=2
  if n==r==0:assert i==len(values);break
  assert 1<=n<=100 and r>=0;edges=[]
  for _ in range(r):edges.append(tuple(values[i:i+3]));i+=3
  start,finish,total=values[i:i+3];i+=3;assert 1<=start<=n and 1<=finish<=n and total>=0
  capacity=bottleneck(n,edges,start,finish);trips=0 if capacity is None else (total+capacity-2)//(capacity-1);out.append(f'Scenario #{len(out)+1}\nMinimum Number of Trips = {trips}')
 return '\n\n'.join(out)+'\n\n'
ORACLES={'uva-10032-tug-of-war':tug,'uva-10364-square':squares,'uva-10365-blocks':blocks,'uva-10583-ubiquitous-religions':religions,'uva-10099-the-tourist-guide':tourists}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(10032);weights=[[1],[450],[1,1,100],[100,90,200],[1,2,3,4,5],[450]*100,[1]*100,[1]*49+[450]*50,list(range(351,451))]
 weights += [[rng.randrange(1,451) for _ in range(rng.randrange(2,30))] for _ in range(60)]
 sticks=[[1]*4,[2,2,2,3,3,4],[1,1,1,5],[10000]*4,[10000]*20,[1]*20,[9]*16+[8,8,8,8]]
 sticks += [[rng.randrange(1,31) for _ in range(rng.randrange(4,15))] for _ in range(80)]
 groups=[(1,[]),(50000,[]),(50000,[(v,v+1) for v in range(1,50000)]),(5,[(1,2),(2,3),(1,3)]),(6,[(1,2),(3,4),(1,3)])]
 for n in [2,5,15,80]:groups.append((n,[(a,b) for a in range(1,n+1) for b in range(a+1,n+1) if rng.random()<.15]))
 routes=[(3,[(1,2,25),(2,3,30)],1,3,99),(2,[(1,2,2)],1,2,100),(4,[(1,2,10),(2,4,8),(1,3,20),(3,4,15)],1,4,29)]
 for n in [6,20,100]:
  e={(i,i+1):rng.randrange(2,101) for i in range(1,n)}
  for a in range(1,n+1):
   for b in range(a+1,n+1):
    if rng.random()<.13:e[a,b]=rng.randrange(2,1001)
  routes.append((n,[(a,b,c) for (a,b),c in e.items()],n,1,rng.randrange(1,100001)))
 return {
 'uva-10032-tug-of-war':str(len(weights))+'\n\n'+'\n\n'.join(str(len(w))+'\n'+'\n'.join(map(str,w)) for w in weights)+'\n',
 'uva-10364-square':str(len(sticks))+'\n'+''.join(str(len(v))+' '+' '.join(map(str,v))+'\n' for v in sticks),
 'uva-10365-blocks':'1000\n'+'\n'.join(map(str,range(1,1001)))+'\n',
 'uva-10583-ubiquitous-religions':''.join(f'{n} {len(edges)}\n'+''.join(f'{a} {b}\n' for a,b in edges) for n,edges in groups)+'0 0\n',
 'uva-10099-the-tourist-guide':''.join(f'{n} {len(edges)}\n'+''.join(f'{a} {b} {c}\n' for a,b,c in edges)+f'{s} {d} {t}\n' for n,edges,s,d,t in routes)+'0 0\n'}

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
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'heavier small teams, exact-size subsets, impossible equal-side partitions, all legal block volumes, max-n isolated and chained components, guide seats and partial trips','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
