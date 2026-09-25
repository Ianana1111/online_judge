import re
import sys
data=list(map(int,re.findall(rb'\d+',sys.stdin.buffer.read())));at=0;out=[]
while at<len(data):
    n=data[at];at+=1;graph=[[] for _ in range(n)]
    for _ in range(n):
        u,k=data[at:at+2];at+=2
        for v in data[at:at+k]:graph[u].append(v);graph[v].append(u)
        at+=k
    parent=[-1]*n;parent[0]=0;order=[0]
    for u in order:
        for v in graph[u]:
            if v!=parent[u]:parent[v]=u;order.append(v)
    off=[0]*n;on=[1]*n
    for u in reversed(order):
        for v in graph[u]:
            if parent[v]==u:off[u]+=on[v];on[u]+=min(off[v],on[v])
    out.append(str(min(off[0],on[0])))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
