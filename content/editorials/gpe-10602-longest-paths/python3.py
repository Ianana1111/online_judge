import sys
from collections import deque
data=list(map(int,sys.stdin.buffer.read().split()));at=0;out=[]
while at<len(data):
    n=data[at];at+=1
    if n==0:break
    start=data[at];at+=1
    edges=[[] for _ in range(n+1)];degree=[0]*(n+1)
    while True:
        a,b=data[at:at+2];at+=2
        if a==0 and b==0:break
        edges[a].append(b);degree[b]+=1
    ready=deque(i for i in range(1,n+1) if degree[i]==0)
    distance=[-1000000]*(n+1);distance[start]=0
    while ready:
        u=ready.popleft()
        for v in edges[u]:
            distance[v]=max(distance[v],distance[u]+1)
            degree[v]-=1
            if degree[v]==0:ready.append(v)
    finish=min(range(1,n+1),key=lambda i:(-distance[i],i))
    out.append(f'Case {len(out)+1}: The longest path from {start} has length {distance[finish]}, finishing at {finish}.')
sys.stdout.write('\n\n'.join(out)+'\n\n' if out else '')
