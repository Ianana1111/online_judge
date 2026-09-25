from collections import deque
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for tc in range(1,data[0]+1) if data else []:
    n=data[at];at+=1;next=[0]*n;indegree=[0]*n
    for _ in range(n):
        u,v=data[at:at+2];at+=2;next[u-1]=v-1;indegree[v-1]+=1
    pending=deque(i for i in range(n) if indegree[i]==0);removed=[];reach=[0]*n
    while pending:
        u=pending.popleft();removed.append(u);v=next[u];indegree[v]-=1
        if indegree[v]==0:pending.append(v)
    for start in range(n):
        if indegree[start]>0 and reach[start]==0:
            cycle=[];node=start
            while True:
                cycle.append(node);node=next[node]
                if node==start:break
            for u in cycle:reach[u]=len(cycle)
    for u in reversed(removed):reach[u]=reach[next[u]]+1
    best=max(range(n),key=lambda i:reach[i])
    out.append(f'Case {tc}: {best+1}')
sys.stdout.write('\n'.join(out)+'\n' if out else '')
