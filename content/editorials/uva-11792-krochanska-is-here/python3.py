from collections import deque
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for _ in range(data[0]) if data else []:
    n,s=data[at:at+2];at+=2;graph=[[] for _ in range(n)];lines=[0]*n
    for _ in range(s):
        seen=set();previous=-1
        while data[at]:
            v=data[at]-1;at+=1
            if v not in seen:seen.add(v);lines[v]+=1
            if previous>=0:graph[previous].append(v);graph[v].append(previous)
            previous=v
        at+=1
    important=[u for u in range(n) if lines[u]>1];best=None;answer=-1
    for start in important:
        distance=[-1]*n;distance[start]=0;pending=deque([start])
        while pending:
            u=pending.popleft()
            for v in graph[u]:
                if distance[v]<0:distance[v]=distance[u]+1;pending.append(v)
        total=sum(distance[v] for v in important)
        if best is None or total<best:best=total;answer=start
    out.append(f'Krochanska is in: {answer+1}')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
