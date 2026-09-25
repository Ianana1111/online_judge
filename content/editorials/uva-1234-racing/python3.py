import sys
data=list(map(int,sys.stdin.buffer.read().split()));at=1;out=[]
for _ in range(data[0]) if data else []:
    n,m=data[at:at+2];at+=2;edges=[]
    for _ in range(m):
        u,v,cost=data[at:at+3];at+=3;edges.append((cost,u,v))
    edges.sort(reverse=True)
    parent=list(range(n+1));size=[1]*(n+1)
    def find(x):
        while parent[x]!=x:parent[x]=parent[parent[x]];x=parent[x]
        return x
    answer=0
    for cost,u,v in edges:
        u=find(u);v=find(v)
        if u==v:answer+=cost;continue
        if size[u]<size[v]:u,v=v,u
        parent[v]=u;size[u]+=size[v]
    out.append(str(answer))
sys.stdout.write('\n'.join(out)+'\n' if out else '')
