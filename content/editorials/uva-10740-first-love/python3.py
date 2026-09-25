import heapq
import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n,m=data[at:at+2];at+=2
    if n==m==0:break
    source,target,k=data[at:at+3];at+=3;source-=1;target-=1
    graph=[[] for _ in range(n)]
    for _ in range(m):
        u,v,w=data[at:at+3];at+=3;graph[u-1].append((v-1,w))
    pending=[(0,source)];popped=[0]*n;answer=-1
    while pending:
        distance,u=heapq.heappop(pending)
        if popped[u]>=k:continue
        popped[u]+=1
        if u==target and popped[u]==k:answer=distance;break
        for v,w in graph[u]:heapq.heappush(pending,(distance+w,v))
    out.append(str(answer))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
